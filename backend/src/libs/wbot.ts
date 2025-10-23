import fs from "fs/promises";
import { Configuration, CreateImageRequestSizeEnum, OpenAIApi } from "openai";
import path from "path";
import qrCode from "qrcode-terminal";
import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import AppError from "../errors/AppError";
import { getIO } from "./socket";
import { logger } from "../utils/logger";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import { initializeHealthTracking, updateLastActivity } from "../services/WbotServices/HealthCheckService";
import Whatsapp from "../models/Whatsapp";
import Integration from "../models/Integration";
import { handleMessage } from "../services/WbotServices/wbotMessageListener";

interface Session extends Client {
  id?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CreateImageRequest {
  prompt: string;
  n?: number;
  size?: CreateImageRequestSizeEnum;
}

async function findIntegrationValue(key: string): Promise<string | null> {
  const integration = await Integration.findOne({
    where: { key }
  });

  if (integration) {
    return integration.value;
  }

  return null as string | null;
}

let openai: OpenAIApi;

(async () => {
  const organizationDB: string | null = await findIntegrationValue(
    "organization"
  );
  const apiKeyDB: string | null = await findIntegrationValue("apikey");

  const configuration = new Configuration({
    organization: organizationDB ?? "",
    apiKey: apiKeyDB ?? ""
  });

  openai = new OpenAIApi(configuration);
})();

const getDavinciResponse = async (clientText: string): Promise<string> => {
  const options = {
    model: "text-davinci-003",
    prompt: clientText,
    temperature: 1,
    max_tokens: 4000
  };

  try {
    const response = await openai.createCompletion(options);
    let botResponse = "";
    response.data.choices.forEach(({ text }) => {
      botResponse += text;
    });
    return `Chat GPT 🤖\n\n ${botResponse.trim()}`;
  } catch (e) {
    return `❌ OpenAI Response Error: ${e.response.data.error.message}`;
  }
};

const getDalleResponse = async (
  clientText: string
): Promise<string | undefined> => {
  const options: CreateImageRequest = {
    prompt: clientText,
    n: 1,
    // eslint-disable-next-line no-underscore-dangle
    size: CreateImageRequestSizeEnum._1024x1024
  };

  try {
    const response = await openai.createImage(options);
    return response.data.data[0].url;
  } catch (e) {
    return `❌ OpenAI Response Error: ${e.response.data.error.message}`;
  }
};

const sessions: Session[] = [];

const syncUnreadMessages = async (wbot: Session) => {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      const chats = await wbot.getChats();

      /* eslint-disable no-restricted-syntax */
      /* eslint-disable no-await-in-loop */
      for (const chat of chats) {
        if (chat.unreadCount > 0) {
          const unreadMessages = await chat.fetchMessages({
            limit: chat.unreadCount
          });

          for (const msg of unreadMessages) {
            await handleMessage(msg, wbot);
          }

          await chat.sendSeen();
        }
      }
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        console.warn(`syncUnreadMessages: falha ao carregar chats após ${maxRetries} tentativas. Detalhe:`, error);
      }
    }
  }
};

export const listActiveWbotIds = (): number[] => {
  try {
    return sessions.map(s => s.id as number).filter(id => typeof id === 'number');
  } catch {
    return [];
  }
};

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.level = "trace";
      const io = getIO();
      const sessionName = whatsapp.name;
      let sessionCfg;

      if (whatsapp && whatsapp.session) {
        sessionCfg = JSON.parse(whatsapp.session);
      }

      let clientSession = `${process.env.COMPANY_NAME}_${whatsapp.id}`;
      if (!process.env.COMPANY_NAME) {
        clientSession = `${whatsapp.name}_${whatsapp.id}`;
      }

      const wbot: Session = new Client({
        session: sessionCfg,
        authStrategy: new LocalAuth({ clientId: clientSession }),
        browserName: 'Chrome',
        deviceName: process.env.DEVICE_NAME || 'Press Ticket®',
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
            "--use-gl=swiftshader",
            "--use-mock-keychain",
            "--log-level=3"
          ]
        },
      });

      wbot.initialize();

      wbot.on("qr", async qr => {
        logger.info("Session:", sessionName);
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

      wbot.on("loading_screen", (percent, message) => {
        logger.info(`Session: ${sessionName} LOADING - ${percent}% - ${message}`);
        
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

      wbot.on("authenticated", async session => {
        logger.info(`Session: ${sessionName} AUTHENTICATED`);
        
        await whatsapp.update({
          session: JSON.stringify(session),
          status: "AUTHENTICATED",
          type: "wwebjs"
        });
        
        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });
      });

      wbot.on("auth_failure", async msg => {
        console.error(
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

        initializeHealthTracking(whatsapp.id);
        updateLastActivity(whatsapp.id);

        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          retries: 0,
          number: wbot.info.wid._serialized.split("@")[0],
          type: "wwebjs"
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
        void syncUnreadMessages(wbot);

        resolve(wbot);
      });

      wbot.on("message_reaction", async (reaction: any) => {
        try {
          const parentId = reaction?.msgId?.id || reaction?.msgId?._serialized || reaction?.msgId || reaction?.id?.id || reaction?.id?._serialized;
          if (!parentId) return;

          const MessageModel = (await import("../models/Message")).default;
          const msg = await MessageModel.findByPk(parentId);
          if (!msg) return;

          const io = getIO();
          const sender = reaction?.senderId || reaction?.author || reaction?.participant || reaction?.from || reaction?.id?.participant || "";
          const emoji = reaction?.reaction || "";
          const action = emoji ? "update" : "remove";

          try {
            const MessageReaction = (await import("../models/MessageReaction")).default;
            if (action === "update" && emoji) {
              await MessageReaction.destroy({ where: { messageId: parentId, senderId: sender } });
              await MessageReaction.create({ messageId: parentId, senderId: sender, emoji });
            } else {
              await MessageReaction.destroy({ where: { messageId: parentId, senderId: sender } });
            }
          } catch (dbErr) {
            logger.warn("Persist reaction skipped (table might be missing)");
          }

          try {
            const TicketModel = (await import("../models/Ticket")).default;
            const ticket = await TicketModel.findByPk(msg.ticketId);
            if (ticket && action === "update" && emoji) {
              const myNumber = wbot.info?.wid?._serialized || null;
              const isMyReaction = myNumber && sender === myNumber;
              
              const reactionText = isMyReaction 
                ? `Você reagiu com ${emoji} a: "${msg.body || 'mídia'}"`
                : `Reagiu com ${emoji} a: "${msg.body || 'mídia'}"`;
              
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

      wbot.on("change_state", (state) => {
        logger.info(`Session: ${sessionName} STATE_CHANGED - ${state}`);
        updateLastActivity(whatsapp.id);
      });

      wbot.on("call", async (call: any) => {
        try {          
          const originalFrom = call.from;
          let realPhoneNumber = call.from;
          
          if (call.from.includes('@lid')) {
            try {
              const contact = await wbot.getContactById(call.from);
              const phoneNumber = contact.id.user || contact.number;
              realPhoneNumber = `${phoneNumber}@c.us`;
            } catch (err) {
              logger.warn(`[CALL] Erro ao converter LID, usando original: ${err}`);
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
          
          if (autoRejectCallsSetting && autoRejectCallsSetting.value === "enabled") {
            try {
              const pupPage = await wbot.pupPage;
              
              if (pupPage) {
                const rejected = await pupPage.evaluate((callId: string) => {
                  try {
                    const results: string[] = [];
                    
                    results.push('Método 1: Tentando tecla ESC...');
                    try {
                      const escEvent = new KeyboardEvent('keydown', {
                        key: 'Escape',
                        code: 'Escape',
                        keyCode: 27,
                        which: 27,
                        bubbles: true,
                        cancelable: true
                      });
                      document.dispatchEvent(escEvent);
                      results.push('✅ Tecla ESC enviada');
                    } catch (err: any) {
                      results.push(`❌ Tecla ESC falhou: ${err.message}`);
                    }
                    
                    results.push('Método 2: Procurando botão vermelho...');
                    try {
                      const allButtons = Array.from(document.querySelectorAll('button, div[role="button"]'));
                      const redButton = allButtons.find((btn: any) => {
                        const style = window.getComputedStyle(btn);
                        const bgColor = style.backgroundColor;
                        return bgColor.includes('234, 67, 53') || 
                               bgColor.includes('244, 67, 54') ||
                               bgColor.includes('255, 0, 0') ||
                               bgColor.includes('220, 53, 69');
                      });
                      
                      if (redButton) {
                        (redButton as HTMLElement).click();
                        results.push('✅ Botão vermelho clicado');
                        return { success: true, method: 'Red Button Click', results };
                      } else {
                        results.push(`❌ Botão vermelho não encontrado (${allButtons.length} botões verificados)`);
                      }
                    } catch (err: any) {
                      results.push(`❌ Busca por botão vermelho falhou: ${err.message}`);
                    }
                    
                    results.push('Método 3: Procurando ícone call-end...');
                    try {
                      const callEndIcon = document.querySelector('[data-icon="call-end"]');
                      if (callEndIcon) {
                        const button = callEndIcon.closest('button') || callEndIcon.closest('[role="button"]');
                        if (button) {
                          (button as HTMLElement).click();
                          results.push('✅ Ícone call-end clicado');
                          return { success: true, method: 'Call End Icon', results };
                        }
                      }
                      results.push('❌ Ícone call-end não encontrado');
                    } catch (err: any) {
                      results.push(`❌ Busca por ícone call-end falhou: ${err.message}`);
                    }
                    
                    results.push('Método 4: Tentando WWebJS.rejectCall...');
                    try {
                      const WWebJS = (window as any).WWebJS;
                      if (WWebJS && typeof WWebJS.rejectCall === 'function') {
                        WWebJS.rejectCall(callId);
                        results.push('✅ WWebJS.rejectCall executado');
                        return { success: true, method: 'WWebJS.rejectCall', results };
                      } else {
                        results.push('❌ WWebJS.rejectCall não disponível');
                      }
                    } catch (err: any) {
                      results.push(`❌ WWebJS.rejectCall falhou: ${err.message}`);
                    }
                    
                    return { success: false, error: 'Todos os métodos falharam', results };
                  } catch (err: any) {
                    return { success: false, error: err.message, stack: err.stack, results: [] };
                  }
                }, call.id);
                
                if (rejected.results && rejected.results.length > 0) {
                  logger.info(`[CALL] Resultados das tentativas:\n${rejected.results.join('\n')}`);
                }
                
                if (rejected.success) {
                  logger.info(`[CALL] ✅ Chamada rejeitada via Puppeteer (método: ${rejected.method})`);
                } else {
                  logger.warn(`[CALL] ❌ Falha ao rejeitar via Puppeteer: ${rejected.error}`);
                  if (rejected.stack) {
                    logger.warn(`[CALL] Stack trace: ${rejected.stack}`);
                  }
                  
                  logger.info(`[CALL] Tentando rejeitar via call.reject() - call.from: ${call.from}, call.id: ${call.id}`);
                  try {
                    const originalCallFrom = call.from;
                    const originalPeerJid = call.peerJid;
                    
                    if (originalCallFrom.includes('@lid')) {
                      call.from = realPhoneNumber;
                      if (call.peerJid) {
                        call.peerJid = realPhoneNumber;
                      }
                    }
                    
                    const rejectResult = await call.reject();
                    
                    call.from = originalCallFrom;
                    if (originalPeerJid) {
                      call.peerJid = originalPeerJid;
                    }
                  } catch (rejectError) {
                    logger.error(`[CALL] Erro ao executar call.reject(): ${rejectError}`);
                    logger.error(`[CALL] Stack: ${(rejectError as Error).stack}`);
                  }
                }
              } else {
                logger.warn(`[CALL] pupPage não disponível, usando método padrão`);
                await call.reject();
                logger.info(`[CALL] Chamada rejeitada via método padrão`);
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
                await wbot.sendMessage(realPhoneNumber, autoRejectMessageSetting.value);
                logger.info(`[CALL] Mensagem automática enviada para ${realPhoneNumber}`);
              } catch (msgErr) {
                logger.warn(`[CALL] Erro ao enviar mensagem automática: ${msgErr}`);
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
            logger.info(`[CALL] Chamada de ${realPhoneNumber} não será aceita (call setting enabled)`);
            
            try {
              await wbot.sendMessage(
                realPhoneNumber,
                "*Mensagem Automática:*\nAs chamadas de voz e vídeo estão desabilitadas para esse WhatsApp, favor enviar uma mensagem de texto. Obrigado"
              );
              logger.info(`[CALL] Mensagem de não aceitação enviada para ${realPhoneNumber}`);
            } catch (msgErr) {
              logger.warn(`[CALL] Erro ao enviar mensagem de não aceitação: ${msgErr}`);
            }
            
            io.emit("callRejected", {
              whatsappId: whatsapp.id,
              from: call.from,
              isVideo: call.isVideo,
              timestamp: new Date(),
              reason: "notAccepted"
            });
          } else {
            logger.info(`[CALL] Chamadas habilitadas - Chamada de ${call.from} permitida`);
          }
        } catch (err) {
          logger.error(`[CALL] Erro ao processar chamada: ${err}`);
        }
      });

    } catch (err: any) {
      logger.error(err);
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

export const removeWbot = (whatsappId: number): void => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].destroy();
      sessions.splice(sessionIndex, 1);
    }
  } catch (err: any) {
    logger.error(err);
  }
};

export const restartWbot = async (whatsappId: number): Promise<Session> => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
  if (sessionIndex !== -1) {
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    if (!whatsapp) {
      throw new AppError("WhatsApp not found.");
    }
    sessions[sessionIndex].destroy();
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
    console.warn(`Sessão com ID ${whatsappIDNumber} não foi encontrada.`);
    throw new AppError("WhatsApp session not initialized.");
  }

  const sessionPath = path.resolve(
    __dirname,
    `../../.wwebjs_auth/session-bd_${whatsappIDNumber}`
  );

  try {
    await sessions[sessionIndex].destroy();
    
    await fs.rm(sessionPath, { recursive: true, force: true });

    sessions.splice(sessionIndex, 1);
    console.info(
      `Sessão com ID ${whatsappIDNumber} removida da lista de sessões.`
    );
    const retry = whatsapp.retries;
    await whatsapp.update({
      status: "DISCONNECTED",
      qrcode: "",
      session: "",
      retries: retry + 1,
      number: ""
    });

  } catch (error) {
    console.error(
      `Erro ao desligar ou limpar a sessão com ID ${whatsappIDNumber}:`,
      error
    );
    throw new AppError("Failed to destroy WhatsApp session.");
  }
};

export const getWbotByGroupId = async (groupId: string): Promise<Session | null> => {
  try {
    for (const s of [...sessions]) {
      try {
        const chat = await s.getChatById(groupId);
        if (chat && (chat as any).isGroup) {
          return s;
        }
      } catch (_) {
      }
    }
    return null;
  } catch (err) {
    logger.warn(`getWbotByGroupId: erro ao procurar sessão para groupId ${groupId}: ${String(err)}`);
    return null;
  }
};
