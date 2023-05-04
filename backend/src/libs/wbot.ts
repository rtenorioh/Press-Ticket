import qrCode from "qrcode-terminal";
import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import { Configuration, CreateImageRequestSizeEnum, OpenAIApi } from "openai";
import { getIO } from "./socket";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import { handleMessage } from "../services/WbotServices/wbotMessageListener";
import Integration from "../models/Integration";

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
  // Encontre a instância de integração com base na chave fornecida
  const integration = await Integration.findOne({
    where: { key }
  });

  // Se a instância for encontrada, retorne o valor
  if (integration) {
    return integration.value;
  }

  // Caso contrário, retorne null
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

// gera resposta em texto
const getDavinciResponse = async (clientText: string): Promise<string> => {
  const options = {
    model: "text-davinci-003", // Modelo GPT a ser usado
    prompt: clientText, // Texto enviado pelo usuário
    temperature: 1, // Nível de variação das respostas geradas, 1 é o máximo
    max_tokens: 4000 // Quantidade de tokens (palavras) a serem retornadas pelo bot, 4000 é o máximo
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

// gera a url da imagem
const getDalleResponse = async (
  clientText: string
): Promise<string | undefined> => {
  const options: CreateImageRequest = {
    prompt: clientText, // Descrição da imagem
    n: 1, // Número de imagens a serem geradas
    // eslint-disable-next-line no-underscore-dangle
    size: CreateImageRequestSizeEnum._1024x1024 // Tamanho da imagem
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

      const wbot: Session = new Client({
        session: sessionCfg,
        authStrategy: new LocalAuth({ clientId: `bd_${whatsapp.id}` }),
        puppeteer: {
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--log-level=3",
            "--no-default-browser-check",
            "--disable-site-isolation-trials",
            "--no-experiments",
            "--ignore-gpu-blacklist",
            "--ignore-certificate-errors",
            "--ignore-certificate-errors-spki-list",
            "--disable-gpu",
            "--disable-extensions",
            "--disable-default-apps",
            "--enable-features=NetworkService",
            "--disable-setuid-sandbox",
            "--no-sandbox",
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
            "--disable-accelerated-video-decode"
          ],
          executablePath: process.env.CHROME_BIN || undefined
        }
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
          session: whatsapp
        });
      });

      wbot.on("authenticated", async session => {
        logger.info(`Session: ${sessionName} AUTHENTICATED`);
        //        await whatsapp.update({
        //          session: JSON.stringify(session)
        //        });
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
          retries: retry + 1
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

      wbot.on("message", async msg => {
        const msgChatGPT: string = msg.body;
        // mensagem de texto
        if (msgChatGPT.includes("/gpt ")) {
          const index = msgChatGPT.indexOf(" ");
          const question = msgChatGPT.substring(index + 1);
          getDavinciResponse(question).then((response: string) => {
            wbot.sendMessage(msg.from, response);
          });
        }
        // imagem
        if (msgChatGPT.includes("/gptM ")) {
          const index = msgChatGPT.indexOf(" ");
          const imgDescription = msgChatGPT.substring(index + 1);
          const imgUrl = await getDalleResponse(imgDescription);
          if (imgUrl) {
            const media = await MessageMedia.fromUrl(imgUrl);
            wbot.sendMessage(msg.from, media, { caption: imgDescription });
          } else {
            wbot.sendMessage(msg.from, "❌ Não foi possível gerar a imagem.");
          }
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
