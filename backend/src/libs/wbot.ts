import fs from "fs/promises";
import { Configuration, CreateImageRequestSizeEnum, OpenAIApi } from "openai";
import path from "path";
import qrCode from "qrcode-terminal";
import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import AppError from "../errors/AppError";
import Integration from "../models/Integration";
import Whatsapp from "../models/Whatsapp";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import { handleMessage } from "../services/WbotServices/wbotMessageListener";
import { logger } from "../utils/logger";
import { getIO } from "./socket";

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
  try {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const chats = await wbot.getChats();
    console.log(`Total de chats carregados: ${chats.length}`);

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
  } catch (error) {
    console.error("Erro ao carregar os chats:", error);
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
          args: [
            "--no-sandbox", // Desativa a sandbox de segurança
            "--disable-setuid-sandbox", // Desativa setuid
            "--disable-dev-shm-usage", // Usa disco em vez de /dev/shm
            // "--single-process", // Força um único processo
            "--log-level=3", // Reduz a verbosidade dos logs
            "--no-default-browser-check",
            "--disable-site-isolation-trials",
            "--no-experiments",
            "--no-first-run",
            "--no-zygote",
            "--ignore-gpu-blacklist",
            "--ignore-certificate-errors",
            "--ignore-certificate-errors-spki-list",
            "--disable-gpu", // Desativa a GPU (não necessária em headless)
            "--disable-extensions",
            "--disable-default-apps",
            "--enable-features=NetworkService",
            "--disable-webgl",
            "--disable-threaded-animation",
            "--disable-threaded-scrolling",
            "--disable-in-process-stack-traces",
            "--disable-histogram-customizer",
            "--disable-gl-extensions",
            "--disable-composited-antialiasing",
            "--disable-canvas-aa",
            "--disable-3d-apis",
            "--disable-accelerated-2d-canvas",
            "--disable-accelerated-jpeg-decoding",
            "--disable-accelerated-mjpeg-decode",
            "--disable-app-list-dismiss-on-blur",
            "--disable-accelerated-video-decode",
            "--disable-background-timer-throttling", // Reduz o uso de timers em segundo plano
            "--disable-features=IsolateOrigins,site-per-process", // Otimiza o isolamento de sites
            // "--renderer-process-limit=2", // Limita o número de processos de renderização
          ]
        },
      });

      wbot.initialize();

      wbot.on("qr", async qr => {
        logger.info("Session:", sessionName);
        qrCode.generate(qr, { small: true });
        await whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });

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

      wbot.on('code', (code) => {
        console.log('Pairing code:', code);
      });

      wbot.on("authenticated", async session => {
        logger.info(`Session: ${sessionName} AUTHENTICATED`);
        
        // Salvar a sessão no banco de dados
        await whatsapp.update({
          session: JSON.stringify(session),
          status: "AUTHENTICATED"
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

        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          retries: 0,
          number: wbot.info.wid._serialized.split("@")[0]
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
        await syncUnreadMessages(wbot);

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
    console.log(`Desligando sessão para WhatsApp ID: ${whatsappIDNumber}`);
    await sessions[sessionIndex].destroy();
    console.log(`Sessão com ID ${whatsappIDNumber} desligada com sucesso.`);

    console.log(`Removendo arquivos da sessão: ${sessionPath}`);
    await fs.rm(sessionPath, { recursive: true, force: true });
    console.log(`Arquivos da sessão removidos com sucesso: ${sessionPath}`);

    sessions.splice(sessionIndex, 1);
    console.log(
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

    // Removido StartWhatsAppSession para evitar reconexão automática após shutdown
    
  } catch (error) {
    console.error(
      `Erro ao desligar ou limpar a sessão com ID ${whatsappIDNumber}:`,
      error
    );
    throw new AppError("Failed to destroy WhatsApp session.");
  }
};
