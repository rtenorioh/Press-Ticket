import fs from "fs/promises";
import path from "path";
import qrCode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";
import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";
import GroupEventsService from "../services/WbotServices/GroupEventsService";
import {
  initializeHealthTracking,
  updateLastActivity
} from "../services/WbotServices/HealthCheckService";
import SyncLabelsService from "../services/WbotServices/SyncLabelsService";
import { handleMessage } from "../services/WbotServices/wbotMessageListener";
import { logger } from "../utils/logger";
import { getIO } from "./socket";

interface Session extends Client {
  id?: number;
}

type SessionWithExtras = Session & {
  requestPairingCode: (...args: unknown[]) => Promise<unknown>;
  setDeviceName?: (name: string, browser: string) => Promise<void>;
};

interface WbotReaction {
  msgId?: { id?: string; _serialized?: string };
  id?: { id?: string; _serialized?: string; participant?: string };
  senderId?: string;
  author?: string;
  participant?: string;
  from?: string;
  reaction?: string;
}

interface WbotPollVote {
  voter: string;
  parentMsgKey?: { id?: string };
  parentMessage?: { id?: { id?: string } };
  selectedOptions: { localId: number; name: string }[];
  interractedAtTs: number;
}

interface WbotCallEvent {
  from: string;
  peerJid?: string;
  id: string;
  isVideo: boolean;
  reject(): Promise<void>;
}

interface WbotUnreadCountEvent {
  id?: { _serialized?: string };
  unreadCount?: number;
}

interface WbotGroupMembershipRequest {
  chatId?: string;
  author?: string;
}

const sessions: Session[] = [];
const keepAliveIntervals: Map<number, NodeJS.Timeout> = new Map();

const syncUnreadMessages = async (wbot: Session) => {
  const maxRetries = 3;

  if (!wbot || !wbot.pupPage) {
    return;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));

      const state = await wbot.getState();
      if (state !== "CONNECTED") {
        return;
      }

      const chats = await wbot.getChats();

      if (!chats || !Array.isArray(chats)) {
        continue;
      }

      for (const chat of chats) {
        try {
          if (!chat) continue;
          if (chat.unreadCount > 0) {
            const unreadMessages = await chat.fetchMessages({
              limit: Math.min(chat.unreadCount, 50)
            });

            for (const msg of unreadMessages) {
              try {
                await handleMessage(msg, wbot);
              } catch (msgError) {
                logger.error(
                  `Erro ao processar mensagem não lida: ${msgError}`
                );
              }
            }

            await chat.sendSeen();
          }
        } catch (chatError) {
          logger.error(`Erro ao processar chat: ${chatError}`);
        }
      }
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        logger.warn(
          `syncUnreadMessages: falha após ${maxRetries} tentativas: ${error.message || error}`
        );
      }
    }
  }
};

export const listActiveWbotIds = (): number[] => {
  try {
    return sessions
      .map(s => s.id as number)
      .filter(id => typeof id === "number");
  } catch {
    return [];
  }
};

export const initWbot = async (
  whatsapp: Whatsapp,
  options?: { method?: "pairing"; phoneNumber?: string }
): Promise<Session> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Garantir que sessão anterior está destruída antes de iniciar nova
      const existingIndex = sessions.findIndex(s => s.id === whatsapp.id);
      if (existingIndex !== -1) {
        try {
          await sessions[existingIndex].destroy();
        } catch (e: unknown) {
          logger.warn(
            `[WBOT] Falha ao destruir sessão existente ${whatsapp.id}: ${e instanceof Error ? e.message : String(e)}`
          );
        }
        sessions.splice(existingIndex, 1);
      }

      logger.level = "trace";
      const io = getIO();
      const sessionName = whatsapp.name;

      const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, "_");
      let clientSession = `${sanitize(process.env.COMPANY_NAME || "")}_${whatsapp.id}`;
      if (!process.env.COMPANY_NAME) {
        clientSession = `${sanitize(whatsapp.name)}_${whatsapp.id}`;
      }

      const wbot: Session = new Client({
        authStrategy: new LocalAuth({ clientId: clientSession }),
        browserName: "Chrome",
        deviceName: process.env.DEVICE_NAME || "Press Ticket®",
        puppeteer: {
          executablePath: process.env.CHROME_BIN || undefined,
          browserWSEndpoint: process.env.CHROME_WS || undefined,
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-software-rasterizer",
            "--disable-extensions",
            "--disable-default-apps",
            "--disable-background-networking",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-breakpad",
            "--disable-client-side-phishing-detection",
            "--disable-component-update",
            "--disable-domain-reliability",
            "--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process",
            "--disable-hang-monitor",
            "--disable-ipc-flooding-protection",
            "--disable-notifications",
            "--disable-offer-store-unmasked-wallet-cards",
            "--disable-popup-blocking",
            "--disable-print-preview",
            "--disable-prompt-on-repost",
            "--disable-renderer-backgrounding",
            "--disable-setuid-sandbox",
            "--disable-speech-api",
            "--disable-sync",
            "--disable-web-security",
            "--enable-features=NetworkService,NetworkServiceInProcess",
            "--hide-scrollbars",
            "--ignore-gpu-blacklist",
            "--metrics-recording-only",
            "--mute-audio",
            "--no-default-browser-check",
            "--no-first-run",
            "--no-pings",
            "--no-zygote",
            "--password-store=basic",
            "--use-angle=swiftshader",
            "--use-mock-keychain",
            "--log-level=3"
          ]
        },
        ...(process.env.WEB_VERSION_URL
          ? {
              webVersionCache: {
                type: "remote" as const,
                remotePath: process.env.WEB_VERSION_URL
              }
            }
          : {}),
        ...(options?.method === "pairing" && options.phoneNumber
          ? {
              pairWithPhoneNumber: { phoneNumber: options.phoneNumber }
            }
          : {})
      });

      let isResolved = false;
      const isPairingMode = !!options?.phoneNumber;

      // whatsapp-web.js calls requestPairingCode internally without await/catch,
      // causing unhandledRejection when WhatsApp web rejects the number.
      // Override the method on this instance to surface the error via socket.
      if (isPairingMode) {
        type PairingFn = (...args: unknown[]) => Promise<unknown>;
        type WbotPairing = { requestPairingCode: PairingFn };
        const wbotP = wbot as unknown as WbotPairing;
        const origRequestPairingCode = wbotP.requestPairingCode.bind(wbot);
        wbotP.requestPairingCode = async (...args: unknown[]) => {
          try {
            return await origRequestPairingCode(...args);
          } catch (err: unknown) {
            logger.error(
              `[WBOT] Pairing code failed for ${sessionName}: ${err instanceof Error ? err.message : String(err)}`
            );
            io.emit("whatsappSession", {
              action: "update",
              session: {
                id: whatsapp.id,
                pairingCodeError:
                  "Erro ao gerar código. Verifique o número e tente novamente."
              }
            });
            // Do not re-throw — prevents unhandledRejection propagation
          }
        };
      }

      // Workaround: whatsapp-web.js tem uma race condition onde o evento
      // 'change:hasSynced' pode disparar ANTES do listener ser registrado
      // na função inject(). Isso faz o evento 'ready' nunca disparar.
      // Este polling verifica se o WhatsApp Web já sincronizou e dispara
      // o evento manualmente se necessário.
      const syncCheckInterval = setInterval(async () => {
        if (isResolved) {
          clearInterval(syncCheckInterval);
          return;
        }
        try {
          if (wbot.pupPage && !wbot.pupPage.isClosed()) {
            const syncState = await wbot.pupPage.evaluate(() => {
              try {
                type WAWin = {
                  require: (m: string) => {
                    Socket: { state: string; hasSynced: boolean };
                  };
                  onAppStateHasSyncedEvent?: () => void;
                };
                const wa = window as unknown as WAWin;
                const Socket = wa.require("WAWebSocketModel").Socket;
                return {
                  state: Socket.state,
                  hasSynced: Socket.hasSynced,
                  hasEventHandler:
                    typeof wa.onAppStateHasSyncedEvent === "function"
                };
              } catch {
                return null;
              }
            });
            if (
              syncState &&
              syncState.state === "CONNECTED" &&
              syncState.hasSynced
            ) {
              if (syncState.hasEventHandler) {
                logger.info(
                  `[WBOT] Sessão ${sessionName}: sync já completou mas ready não disparou. Forçando via onAppStateHasSyncedEvent...`
                );
                await wbot.pupPage.evaluate(() => {
                  (
                    window as unknown as {
                      onAppStateHasSyncedEvent?: () => void;
                    }
                  ).onAppStateHasSyncedEvent?.();
                });
              } else {
                logger.info(
                  `[WBOT] Sessão ${sessionName}: sync completo mas handler não registrado. Aguardando...`
                );
              }
            }
          }
        } catch (_err) {
          // silenciar - pode falhar se a página ainda está carregando
        }
      }, 3000);

      wbot.initialize().catch((err: unknown) => {
        clearInterval(syncCheckInterval);
        logger.error(
          `[WBOT] Erro ao inicializar sessão ${sessionName}: ${err}`
        );
        reject(err);
      });

      if (!isPairingMode) {
        wbot.on("qr", async qr => {
          logger.info(`Session: ${sessionName} QR_CODE`);
          clearInterval(syncCheckInterval);
          qrCode.generate(qr, { small: true });
          await whatsapp.update({
            qrcode: qr,
            status: "qrcode",
            retries: 0,
            type: "wwebjs"
          });

          const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
          if (sessionIndex === -1) {
            wbot.id = whatsapp.id;
            sessions.push(wbot);
          }

          io.emit("whatsappSession", {
            action: "update",
            session: whatsapp,
            number: ""
          });
        });
      }

      if (isPairingMode) {
        wbot.on("code", async (code: string) => {
          logger.info(`Session: ${sessionName} PAIRING_CODE`);
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
          await whatsapp.update({
            pairingCode: code,
            pairingCodeExpiresAt: expiresAt,
            status: "qrcode",
            retries: 0
          });

          const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
          if (sessionIndex === -1) {
            wbot.id = whatsapp.id;
            sessions.push(wbot);
          }

          io.emit("whatsappSession", {
            action: "update",
            session: whatsapp
          });
        });
      }

      wbot.on("loading_screen", (percent, message) => {
        logger.info(
          `Session: ${sessionName} LOADING - ${percent}% - ${message}`
        );

        io.emit("whatsappSession", {
          action: "update",
          session: {
            id: whatsapp.id,
            name: whatsapp.name,
            status: "OPENING",
            loadingProgress: percent,
            loadingMessage: message
          }
        });
      });

      wbot.on("remote_session_saved", () => {
        logger.info(`Session: ${sessionName} REMOTE_SESSION_SAVED`);
      });

      wbot.on("authenticated", async () => {
        logger.info(`Session: ${sessionName} AUTHENTICATED`);

        await whatsapp.update({
          status: "AUTHENTICATED",
          type: "wwebjs"
        });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });
      });

      wbot.on("auth_failure", async msg => {
        clearInterval(syncCheckInterval);
        logger.error(
          `Session: ${sessionName} AUTHENTICATION FAILURE! Reason: ${msg}`
        );

        if (whatsapp.retries > 1) {
          await whatsapp.update({ session: "", retries: 0 });
        }

        const retry = whatsapp.retries;
        await whatsapp.update({
          status: "DISCONNECTED",
          retries: retry + 1,
          number: ""
        });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        reject(new Error("Error starting whatsapp session."));
      });

      wbot.on("ready", async () => {
        logger.info(`Session: ${sessionName} READY`);
        isResolved = true;
        clearInterval(syncCheckInterval);

        initializeHealthTracking(whatsapp.id);
        updateLastActivity(whatsapp.id);

        // Reaplicar deviceName após ready para garantir que persiste
        const deviceName = process.env.DEVICE_NAME || "Press Ticket®";
        const browserName = "Chrome";
        try {
          await (wbot as unknown as SessionWithExtras).setDeviceName?.(
            deviceName,
            browserName
          );
          logger.info(
            `Session: ${sessionName} deviceName="${deviceName}" aplicado`
          );
        } catch (dnErr: unknown) {
          logger.warn(
            `[WBOT] Falha ao definir deviceName: ${dnErr instanceof Error ? dnErr.message : String(dnErr)}`
          );
        }

        const platform = wbot.info?.platform || "";
        const isBusiness = ["smba", "smbi"].includes(platform);
        logger.info(
          `Session: ${sessionName} platform=${platform} isBusiness=${isBusiness}`
        );

        // Ignorar ready prematuro quando wbot.info ainda não carregou
        if (!wbot.info || !wbot.info.wid) {
          logger.warn(
            `[WBOT] Sessão ${sessionName}: ready disparou mas wbot.info ainda não disponível, ignorando`
          );
          return;
        }

        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          pairingCode: "",
          pairingCodeExpiresAt: undefined,
          retries: 0,
          number: wbot.info.wid._serialized.split("@")[0],
          type: "wwebjs",
          isBusiness
        });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        wbot.sendPresenceAvailable();

        // Sincronizar labels se for conta Business
        if (isBusiness) {
          setTimeout(async () => {
            try {
              await SyncLabelsService(whatsapp.id);
            } catch (syncErr: unknown) {
              logger.warn(
                `[WBOT] Falha ao sincronizar labels: ${syncErr instanceof Error ? syncErr.message : String(syncErr)}`
              );
            }
          }, 5000);
        }

        // Keepalive periódico para evitar timeout de sessão
        const existingInterval = keepAliveIntervals.get(whatsapp.id);
        if (existingInterval) clearInterval(existingInterval);

        const keepAlive = setInterval(
          async () => {
            try {
              if (wbot.pupPage && !wbot.pupPage.isClosed()) {
                await wbot.sendPresenceAvailable();
              } else {
                clearInterval(keepAlive);
                keepAliveIntervals.delete(whatsapp.id);
              }
            } catch (err) {
              logger.warn(
                `[KEEPALIVE] Falha no keepalive da sessão ${sessionName}: ${err}`
              );
              clearInterval(keepAlive);
              keepAliveIntervals.delete(whatsapp.id);
            }
          },
          5 * 60 * 1000
        ); // 5 minutos

        keepAliveIntervals.set(whatsapp.id, keepAlive);

        void syncUnreadMessages(wbot);

        GroupEventsService.setupGroupListeners(wbot, whatsapp.id);

        resolve(wbot);
      });

      wbot.on("message_reaction", async (reaction: WbotReaction) => {
        try {
          const parentId =
            reaction?.msgId?.id ||
            reaction?.msgId?._serialized ||
            reaction?.id?.id ||
            reaction?.id?._serialized;
          if (!parentId) return;

          const MessageModel = (await import("../models/Message")).default;
          const msg = await MessageModel.findByPk(parentId);
          if (!msg) return;

          const io = getIO();
          const sender =
            reaction?.senderId ||
            reaction?.author ||
            reaction?.participant ||
            reaction?.from ||
            reaction?.id?.participant ||
            "";
          const emoji = reaction?.reaction || "";
          const action = emoji ? "update" : "remove";

          try {
            const MessageReaction = (await import("../models/MessageReaction"))
              .default;
            if (action === "update" && emoji) {
              await MessageReaction.destroy({
                where: { messageId: parentId, senderId: sender }
              });
              await MessageReaction.create({
                messageId: parentId,
                senderId: sender,
                emoji
              });
            } else {
              await MessageReaction.destroy({
                where: { messageId: parentId, senderId: sender }
              });
            }
          } catch (_dbErr) {
            logger.warn("Persist reaction skipped (table might be missing)");
          }

          try {
            const TicketModel = (await import("../models/Ticket")).default;
            const ticket = await TicketModel.findByPk(msg.ticketId);
            if (ticket && action === "update" && emoji) {
              const myNumber = wbot.info?.wid?._serialized || null;
              const isMyReaction = myNumber && sender === myNumber;

              const reactionText = isMyReaction
                ? `Você reagiu com ${emoji} a: "${msg.body || "mídia"}"`
                : `Reagiu com ${emoji} a: "${msg.body || "mídia"}"`;

              await ticket.update({ lastMessage: reactionText });

              const ticketData = {
                id: ticket.id,
                lastMessage: reactionText,
                updatedAt: new Date()
              };

              io.to(ticket.id.toString()).emit("ticket", {
                action: "update",
                ticket: ticketData
              });

              io.to(ticket.status).emit("ticket", {
                action: "update",
                ticket: ticketData
              });

              io.emit("appMessage", {
                action: "update",
                ticket: ticketData
              });
            }
          } catch (ticketErr) {
            logger.warn("Erro ao atualizar lastMessage do ticket:", ticketErr);
          }

          io.to(msg.ticketId.toString()).emit("messageReaction", {
            action,
            messageId: parentId,
            emoji,
            senderId: sender
          });
        } catch (err) {
          logger.warn("Erro ao processar evento message_reaction:", err);
        }
      });

      wbot.on("change_state", state => {
        logger.info(`Session: ${sessionName} STATE_CHANGED - ${state}`);
        updateLastActivity(whatsapp.id);
      });

      wbot.on(
        "contact_changed",
        async (_message: unknown, oldId: string, newId: string) => {
          try {
            logger.info(
              `Session: ${sessionName} CONTACT_CHANGED - ${oldId} -> ${newId}`
            );
            const Contact = (await import("../models/Contact")).default;
            const oldNumber = oldId.split("@")[0];
            const newNumber = newId.split("@")[0];
            const contact = await Contact.findOne({
              where: { number: oldNumber }
            });
            if (contact) {
              await contact.update({ number: newNumber });
              io.emit("contact", { action: "update", contact });
              logger.info(
                `[CONTACT_CHANGED] Contato ${oldNumber} atualizado para ${newNumber}`
              );
            }
          } catch (err) {
            logger.error(
              `[CONTACT_CHANGED] Erro ao processar mudança de contato: ${err}`
            );
          }
        }
      );

      wbot.on("unread_count", async (chat: WbotUnreadCountEvent) => {
        try {
          io.emit("unreadCount", {
            whatsappId: whatsapp.id,
            chatId: chat.id?._serialized || chat.id,
            unreadCount: chat.unreadCount || 0
          });
        } catch (err) {
          logger.error(
            `[UNREAD_COUNT] Erro ao processar contagem de não lidos: ${err}`
          );
        }
      });

      wbot.on(
        "group_membership_request",
        async (notification: WbotGroupMembershipRequest) => {
          try {
            logger.info(
              `Session: ${sessionName} GROUP_MEMBERSHIP_REQUEST - Group: ${notification.chatId}`
            );
            io.emit("groupMembershipRequest", {
              whatsappId: whatsapp.id,
              groupId: notification.chatId,
              requesterId: notification.author,
              timestamp: new Date()
            });
          } catch (err) {
            logger.error(`[GROUP_MEMBERSHIP_REQUEST] Erro: ${err}`);
          }
        }
      );

      wbot.on("vote_update", async (vote: WbotPollVote) => {
        try {
          const PollVoteService = (await import("../services/PollVoteService"))
            .default;

          let voterName = vote.voter;
          try {
            const contact = await wbot.getContactById(vote.voter);
            voterName = contact.name || contact.pushname || vote.voter;
          } catch (err) {
            logger.warn(`[POLL_VOTE] Erro ao buscar nome do votante: ${err}`);
          }

          const pollMessageId =
            (vote.parentMsgKey?.id || vote.parentMessage?.id?.id) ?? "";
          await PollVoteService.createOrUpdate({
            pollMessageId,
            voterId: vote.voter,
            voterName,
            selectedOptions: vote.selectedOptions,
            timestamp: new Date(vote.interractedAtTs)
          });
        } catch (error) {
          logger.error(`[POLL_VOTE] Erro ao processar voto: ${error}`);
        }
      });

      wbot.on("call", async (call: WbotCallEvent) => {
        try {
          let realPhoneNumber = call.from;

          if (call.from.includes("@lid")) {
            try {
              const contact = await wbot.getContactById(call.from);
              const phoneNumber = contact.id.user || contact.number;
              realPhoneNumber = `${phoneNumber}@c.us`;
            } catch (err) {
              logger.warn(
                `[CALL] Erro ao converter LID, usando original: ${err}`
              );
              realPhoneNumber = call.from;
            }
          }

          const Setting = (await import("../models/Setting")).default;

          const autoRejectCallsSetting = await Setting.findOne({
            where: { key: "autoRejectCalls" }
          });

          const callSetting = await Setting.findOne({
            where: { key: "call" }
          });

          if (
            autoRejectCallsSetting &&
            autoRejectCallsSetting.value === "enabled"
          ) {
            try {
              const pupPage = await wbot.pupPage;

              if (pupPage) {
                const rejected = await pupPage.evaluate((callId: string) => {
                  try {
                    const results: string[] = [];

                    results.push("Método 1: Tentando tecla ESC...");
                    try {
                      const escEvent = new KeyboardEvent("keydown", {
                        key: "Escape",
                        code: "Escape",
                        keyCode: 27,
                        which: 27,
                        bubbles: true,
                        cancelable: true
                      });
                      document.dispatchEvent(escEvent);
                      results.push("✅ Tecla ESC enviada");
                    } catch (err) {
                      results.push(
                        `❌ Tecla ESC falhou: ${(err as Error).message}`
                      );
                    }

                    results.push("Método 2: Procurando botão vermelho...");
                    try {
                      const allButtons = Array.from(
                        document.querySelectorAll('button, div[role="button"]')
                      );
                      const redButton = allButtons.find(btn => {
                        const style = window.getComputedStyle(btn);
                        const bgColor = style.backgroundColor;
                        return (
                          bgColor.includes("234, 67, 53") ||
                          bgColor.includes("244, 67, 54") ||
                          bgColor.includes("255, 0, 0") ||
                          bgColor.includes("220, 53, 69")
                        );
                      });

                      if (redButton) {
                        (redButton as HTMLElement).click();
                        results.push("✅ Botão vermelho clicado");
                        return {
                          success: true,
                          method: "Red Button Click",
                          results
                        };
                      } else {
                        results.push(
                          `❌ Botão vermelho não encontrado (${allButtons.length} botões verificados)`
                        );
                      }
                    } catch (err) {
                      results.push(
                        `❌ Busca por botão vermelho falhou: ${(err as Error).message}`
                      );
                    }

                    results.push("Método 3: Procurando ícone call-end...");
                    try {
                      const callEndIcon = document.querySelector(
                        '[data-icon="call-end"]'
                      );
                      if (callEndIcon) {
                        const button =
                          callEndIcon.closest("button") ||
                          callEndIcon.closest('[role="button"]');
                        if (button) {
                          (button as HTMLElement).click();
                          results.push("✅ Ícone call-end clicado");
                          return {
                            success: true,
                            method: "Call End Icon",
                            results
                          };
                        }
                      }
                      results.push("❌ Ícone call-end não encontrado");
                    } catch (err) {
                      results.push(
                        `❌ Busca por ícone call-end falhou: ${(err as Error).message}`
                      );
                    }

                    results.push("Método 4: Tentando WWebJS.rejectCall...");
                    try {
                      const WWebJS = (
                        window as unknown as {
                          WWebJS?: { rejectCall?: (id: string) => void };
                        }
                      ).WWebJS;
                      if (WWebJS && typeof WWebJS.rejectCall === "function") {
                        WWebJS.rejectCall(callId);
                        results.push("✅ WWebJS.rejectCall executado");
                        return {
                          success: true,
                          method: "WWebJS.rejectCall",
                          results
                        };
                      } else {
                        results.push("❌ WWebJS.rejectCall não disponível");
                      }
                    } catch (err) {
                      results.push(
                        `❌ WWebJS.rejectCall falhou: ${(err as Error).message}`
                      );
                    }

                    return {
                      success: false,
                      error: "Todos os métodos falharam",
                      results
                    };
                  } catch (err) {
                    return {
                      success: false,
                      error: (err as Error).message,
                      stack: (err as Error).stack,
                      results: []
                    };
                  }
                }, call.id);

                if (!rejected.success) {
                  logger.warn(
                    `[CALL] Falha ao rejeitar via Puppeteer: ${rejected.error}`
                  );
                  if (rejected.stack) {
                    logger.warn(`[CALL] Stack trace: ${rejected.stack}`);
                  }

                  try {
                    const originalCallFrom = call.from;
                    const originalPeerJid = call.peerJid;

                    if (originalCallFrom.includes("@lid")) {
                      call.from = realPhoneNumber;
                      if (call.peerJid) {
                        call.peerJid = realPhoneNumber;
                      }
                    }

                    await call.reject();

                    call.from = originalCallFrom;
                    if (originalPeerJid) {
                      call.peerJid = originalPeerJid;
                    }
                  } catch (rejectError) {
                    logger.error(
                      `[CALL] Erro ao executar call.reject(): ${rejectError}`
                    );
                    logger.error(
                      `[CALL] Stack: ${(rejectError as Error).stack}`
                    );
                  }
                }
              } else {
                logger.warn(
                  `[CALL] pupPage não disponível, usando método padrão`
                );
                await call.reject();
              }
            } catch (rejectErr) {
              logger.error(`[CALL] Erro ao rejeitar chamada: ${rejectErr}`);
              logger.error(`[CALL] Stack trace: ${(rejectErr as Error).stack}`);
            }

            const autoRejectMessageSetting = await Setting.findOne({
              where: { key: "autoRejectCallsMessage" }
            });

            if (autoRejectMessageSetting && autoRejectMessageSetting.value) {
              try {
                await wbot.sendMessage(
                  realPhoneNumber,
                  autoRejectMessageSetting.value
                );
              } catch (msgErr) {
                logger.warn(
                  `[CALL] Erro ao enviar mensagem automática: ${msgErr}`
                );
              }
            }

            io.emit("callRejected", {
              whatsappId: whatsapp.id,
              from: call.from,
              isVideo: call.isVideo,
              timestamp: new Date(),
              reason: "autoReject"
            });
          } else if (callSetting && callSetting.value === "enabled") {
            try {
              await wbot.sendMessage(
                realPhoneNumber,
                "*Mensagem Automática:*\nAs chamadas de voz e vídeo estão desabilitadas para esse WhatsApp, favor enviar uma mensagem de texto. Obrigado"
              );
            } catch (msgErr) {
              logger.warn(
                `[CALL] Erro ao enviar mensagem de não aceitação: ${msgErr}`
              );
            }

            io.emit("callRejected", {
              whatsappId: whatsapp.id,
              from: call.from,
              isVideo: call.isVideo,
              timestamp: new Date(),
              reason: "notAccepted"
            });
          } else {
          }
        } catch (err) {
          logger.error(`[CALL] Erro ao processar chamada: ${err}`);
        }
      });
    } catch (err: unknown) {
      logger.error(
        `[WBOT] ${err instanceof Error ? err.message : String(err)}`
      );
    }
  });
};

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

export const removeWbot = async (whatsappId: number): Promise<void> => {
  try {
    const interval = keepAliveIntervals.get(whatsappId);
    if (interval) {
      clearInterval(interval);
      keepAliveIntervals.delete(whatsappId);
    }

    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      try {
        await sessions[sessionIndex].destroy();
      } catch (destroyErr: unknown) {
        logger.warn(
          `[WBOT] Erro ao destruir sessão ${whatsappId}: ${destroyErr instanceof Error ? destroyErr.message : String(destroyErr)}`
        );
      }
      sessions.splice(sessionIndex, 1);
    }
  } catch (err: unknown) {
    logger.error(`[WBOT] ${err instanceof Error ? err.message : String(err)}`);
  }
};

export const restartWbot = async (whatsappId: number): Promise<Session> => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
  if (sessionIndex !== -1) {
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    if (!whatsapp) {
      throw new AppError("WhatsApp not found.");
    }
    try {
      await sessions[sessionIndex].destroy();
    } catch (destroyErr: unknown) {
      logger.warn(
        `[WBOT] Erro ao destruir sessão ${whatsappId} no restart: ${destroyErr instanceof Error ? destroyErr.message : String(destroyErr)}`
      );
    }
    sessions.splice(sessionIndex, 1);

    const newSession = await initWbot(whatsapp);
    return newSession;
  }
  throw new AppError("WhatsApp session not initialized.");
};

export const shutdownWbot = async (whatsappId: string): Promise<void> => {
  const whatsappIDNumber: number = parseInt(whatsappId, 10);

  if (Number.isNaN(whatsappIDNumber)) {
    throw new AppError("Invalid WhatsApp ID format.");
  }

  const whatsapp = await Whatsapp.findByPk(whatsappIDNumber);
  if (!whatsapp) {
    throw new AppError("WhatsApp not found.");
  }

  const sessionIndex = sessions.findIndex(s => s.id === whatsappIDNumber);
  if (sessionIndex === -1) {
    throw new AppError("WhatsApp session not initialized.");
  }

  const sessionPath = path.resolve(
    __dirname,
    `../../.wwebjs_auth/session-bd_${whatsappIDNumber}`
  );

  try {
    const interval = keepAliveIntervals.get(whatsappIDNumber);
    if (interval) {
      clearInterval(interval);
      keepAliveIntervals.delete(whatsappIDNumber);
    }

    await sessions[sessionIndex].destroy();

    await fs.rm(sessionPath, { recursive: true, force: true });

    sessions.splice(sessionIndex, 1);
    const retry = whatsapp.retries;
    await whatsapp.update({
      status: "DISCONNECTED",
      qrcode: "",
      session: "",
      retries: retry + 1,
      number: ""
    });
  } catch (error) {
    logger.error(`Erro ao desligar sessão ${whatsappIDNumber}: ${error}`);
    throw new AppError("Failed to destroy WhatsApp session.");
  }
};

export const getWbotByGroupId = async (
  groupId: string
): Promise<Session | null> => {
  try {
    for (const s of [...sessions]) {
      try {
        const chat = await s.getChatById(groupId);
        if (chat && chat.isGroup) {
          return s;
        }
      } catch (__) {}
    }
    return null;
  } catch (err) {
    logger.warn(
      `getWbotByGroupId: erro ao procurar sessão para groupId ${groupId}: ${String(err)}`
    );
    return null;
  }
};
