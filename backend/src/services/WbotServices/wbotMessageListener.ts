/* eslint-disable no-plusplus */
/* eslint-disable no-nested-ternary */
import * as Sentry from "@sentry/node";
import { writeFile } from "fs";
import { join } from "path";
import { promisify } from "util";
import { Op } from "sequelize";

import {
  Client,
  MessageAck,
  Contact as WbotContact,
  Message as WbotMessage
} from "whatsapp-web.js";

import ffmpeg from "fluent-ffmpeg";
import Contact from "../../models/Contact";
import Integration from "../../models/Integration";
import Message from "../../models/Message";
import OldMessage from "../../models/OldMessage";
import Settings from "../../models/Setting";
import Ticket from "../../models/Ticket";

import { debounce } from "../../helpers/Debounce";
import formatBody from "../../helpers/Mustache";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
import CreateContactService from "../ContactServices/CreateContactService";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import GetContactService from "../ContactServices/GetContactService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import ListSettingsServiceOne from "../SettingServices/ListSettingsServiceOne";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { incrementMessageCount, incrementErrorCount, updateLastActivity } from "./HealthCheckService";

ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");

const request = require("request");

interface Session extends Client {
  id?: number;
}

const writeFileAsync = promisify(writeFile);

const verifyContact = async (msgContact: WbotContact): Promise<Contact> => {
  const contactData = {
    name: msgContact.name || msgContact.pushname || msgContact.id.user,
    number: msgContact.id.user,
    isGroup: msgContact.isGroup
  };

  const contact = await CreateOrUpdateContactService(contactData);

  return contact;
};

const verifyQuotedMessage = async (
  msg: WbotMessage
): Promise<Message | null> => {
  if (!msg.hasQuotedMsg) return null;

  const wbotQuotedMsg = await msg.getQuotedMessage();

  const quotedMsg = await Message.findOne({
    where: { id: wbotQuotedMsg.id.id }
  });

  if (!quotedMsg) return null;

  return quotedMsg;
};

const verifyRevoked = async (msgBody?: string): Promise<void> => {
  await new Promise(r => setTimeout(r, 500));

  const io = getIO();

  if (msgBody === undefined) {
    return;
  }

  try {
    const message = await Message.findOne({
      where: {
        body: msgBody
      }
    });

    if (!message) {
      return;
    }

    if (message) {
      await Message.update(
        { isDeleted: true },
        {
          where: { id: message.id }
        }
      );

      const msgIsDeleted = await Message.findOne({
        where: {
          body: msgBody
        }
      });

      if (!msgIsDeleted) {
        return;
      }

      io.to(msgIsDeleted.ticketId.toString())
        .to("notification")
        .emit("appMessage", {
          action: "update",
          message: msgIsDeleted
        });
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error Message Revoke. Err: ${err}`);
  }
};

const verifyMediaMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  const quotedMsg = await verifyQuotedMessage(msg);

  const media = await msg.downloadMedia();

  if (!media) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    const shortTime = new Date().getTime().toString().slice(-6);
    const sanitizedName = contact.name.replace(/[^a-zA-Z0-9_]/g, "_");
    media.filename = `${sanitizedName}_${shortTime}.${ext}`;
  } else {
    const originalFilename = media.filename ? `-${media.filename}` : "";
    const shortTime = new Date().getTime().toString().slice(-6);
    media.filename = `${shortTime}_${originalFilename}`;
  }

  try {
    await writeFileAsync(
      join(__dirname, "..", "..", "..", "public", media.filename),
      media.data,
      "base64"
    )
      .then(() => {
        const inputFile = `./public/${media.filename}`;
        let outputFile: string;

        if (inputFile.endsWith(".mpeg")) {
          outputFile = inputFile.replace(".mpeg", ".mp3");
        } else if (inputFile.endsWith(".ogg")) {
          outputFile = inputFile.replace(".ogg", ".mp3");
        } else {
          return;
        }

        return new Promise<void>((resolve, reject) => {
          ffmpeg(inputFile)
            .toFormat("mp3")
            .save(outputFile)
            .on("end", () => {
              resolve();
            })
            .on("error", (err: any) => {
              reject(err);
            });
        });
      })
      .then(() => {
        console.info("Conversão concluída!");
      })
      .catch(err => {
        console.error("Ocorreu um erro:", err);
      });
  } catch (err: any) {
    Sentry.captureException(err);
    logger.error(err);
  }

  let albumId = null;
  const mediaType = media.mimetype.split("/")[0];
  if (mediaType === "image" || mediaType === "video") {
    const roundedTimestamp = Math.floor(msg.timestamp / 5) * 5;
    albumId = `${msg.from}_${roundedTimestamp}`;
  }

  const fileSize = media.data ? Buffer.from(media.data, 'base64').length : null;

  const messageData = {
    id: msg.id.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg.body || media.filename,
    fromMe: msg.fromMe,
    read: msg.fromMe,
    mediaUrl: media.filename,
    mediaType: mediaType,
    mimetype: media.mimetype,
    filename: media.filename,
    quotedMsgId: quotedMsg?.id,
    albumId: albumId,
    userId: ticket.userId,
    fileSize: fileSize
  };
  
  const existingMessage = await Message.findByPk(messageData.id);
  if (existingMessage) {
    const messageAge = Date.now() - new Date(existingMessage.createdAt).getTime();
    if (messageAge < 5000) {
      return existingMessage;
    }
  }
  
  try {
    const newMessage = await CreateMessageService({ messageData });
    
    const FormatLastMessage = require("../../helpers/FormatLastMessage").default;
    const formattedLastMessage = FormatLastMessage({
      body: messageData.body,
      mediaType: messageData.mediaType,
      mimetype: media.mimetype,
      messageType: msg.type,
      fromMe: msg.fromMe,
      filename: media.filename
    });
    
    await ticket.update({ lastMessage: formattedLastMessage });
    await ticket.reload();
    
    return newMessage;
  } catch (error) {
    console.error("Erro ao salvar mensagem com mídia no banco de dados:", error);
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const newMessage = await CreateMessageService({ messageData });
          
          const FormatLastMessage = require("../../helpers/FormatLastMessage").default;
          const formattedLastMessage = FormatLastMessage({
            body: messageData.body,
            mediaType: messageData.mediaType,
            mimetype: media.mimetype,
            messageType: msg.type,
            fromMe: msg.fromMe,
            filename: media.filename
          });
          
          await ticket.update({ lastMessage: formattedLastMessage });
          await ticket.reload();
          
          resolve(newMessage);
        } catch (retryError) {
          console.error("Erro ao salvar mensagem com mídia na segunda tentativa:", retryError);
          reject(retryError);
        }
      }, 1000);
    });
  }
};

const getGeocode = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  const apiKey = await Integration.findOne({
    where: { key: "apiMaps" }
  });

  const safeLatitude = encodeURIComponent(String(latitude).trim());
  const safeLongitude = encodeURIComponent(String(longitude).trim());
  
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${safeLatitude},${safeLongitude}&key=${encodeURIComponent(apiKey?.value || '')}`;

  return new Promise((resolve, reject) => {
    try {
      request(url, { json: true }, (err: any, res: any, body: any) => {
        if (err) {
          console.error("Erro na requisição da API do Google Maps:", err);
          reject(err);
        } else if (body && body.results && body.results.length > 0) {
          resolve(body.results[0].formatted_address);
        } else {
          resolve(`${latitude}, ${longitude}`);
        }
      });
    } catch (error) {
      console.error("Erro ao processar requisição de geocodificação:", error);
      resolve(`${latitude}, ${longitude}`);
    }
  });
};

const prepareLocation = async (msg: WbotMessage): Promise<WbotMessage> => {
  const safeLatitude = encodeURIComponent(String(msg.location.latitude).trim());
  const safeLongitude = encodeURIComponent(String(msg.location.longitude).trim());
  
  const gmapsUrl = `https://maps.google.com/maps?q=${safeLatitude}%2C${safeLongitude}&z=17`;

  try {
    if (!msg.location || !msg.location.latitude || !msg.location.longitude) {
      throw new Error("Dados de localização incompletos");
    }
    const address = await getGeocode(
      Number(msg.location.latitude),
      Number(msg.location.longitude)
    );

    if (typeof msg.body !== 'string') {
      msg.body = '';
    }
    msg.body = `data:image/png;base64,${msg.body}|${gmapsUrl}`;
    msg.body += `|${
      address || `${msg.location.latitude}, ${msg.location.longitude}`
    }`;
  } catch (error) {
    console.error("Erro ao preparar a localização:", error);
    
    if (typeof msg.body !== 'string') {
      msg.body = '';
    }
    if (msg.location && msg.location.latitude && msg.location.longitude) {
      msg.body = `data:image/png;base64,${msg.body}|${gmapsUrl}|${msg.location.latitude}, ${msg.location.longitude}`;
    } else {
      msg.body = `data:image/png;base64,${msg.body}|${gmapsUrl}|Coordenadas não disponíveis`;
    }
  }

  return msg;
};

const verifyMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
) => {
  if (msg.type === "location") msg = await prepareLocation(msg);

  const quotedMsg = await verifyQuotedMessage(msg);
  
  let pollBody = msg.body;
  if (msg.type === "poll_creation" && (msg as any).pollName) {
    const poll = msg as any;
    const pollName = poll.pollName || "Enquete";
    const pollOptions = poll.pollOptions || [];
    
    logger.info(`[POLL_RECEIVED] Estrutura completa da enquete: ${JSON.stringify({
      pollName,
      pollOptions,
      totalOptions: pollOptions.length
    })}`);
    
    pollBody = `📊 Enquete: ${pollName}\n\n`;
    pollBody += `Selecione uma ou mais opções:\n\n`;
    
    pollOptions.forEach((option: any, index: number) => {
      const optionName = option?.name || option?.localName || option;
      if (optionName && typeof optionName === 'string' && optionName.trim() !== '') {
        pollBody += `${index + 1}. ${optionName}\n`;
      }
    });
    
    logger.info(`[POLL_RECEIVED] Enquete recebida: ${pollName} com ${pollOptions.length} opções`);
  }
  
  const messageData = {
    id: msg.id.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: pollBody,
    fromMe: msg.fromMe,
    mediaType: msg.type === "poll_creation" ? "poll" : msg.type,
    messageType: msg.type,
    read: msg.fromMe,
    quotedMsgId: quotedMsg?.id,
    userId: ticket.userId
  };

  if (msg.type === "multi_vcard") {

    if (!msg.body || msg.body === "") {

      if (msg.vCards && Array.isArray(msg.vCards) && msg.vCards.length > 0) {
        const extractedContacts = [];

        const vcardLines = msg.vCards.join(',').split('\n');

        let currentName = '';
        let currentNumber = '';

        for (let i = 0; i < vcardLines.length; i++) {
          const line = vcardLines[i];

          const parts = line.split(':');

          if (parts.length >= 2) {
            const key = parts[0];
            const value = parts.slice(1).join(':');

            if (key === 'FN') {
              currentName = value.trim();
            } else if (key.includes('TEL') && value) {
              currentNumber = value.trim();

              if (currentName && currentNumber) {
                extractedContacts.push({
                  name: currentName,
                  number: currentNumber
                });
              }
            }
          }
        }

        const processedContacts = [];

        for (const contact of extractedContacts) {
          try {

            try {
              const cont = await CreateContactService({
                name: contact.name,
                number: contact.number.replace(/\D/g, "")
              });
              processedContacts.push({
                id: cont.id,
                name: cont.name,
                number: cont.number
              });
            } catch (error) {
              if (error.message === "ERR_DUPLICATED_CONTACT") {
                const cont = await GetContactService({
                  name: contact.name,
                  number: contact.number.replace(/\D/g, ""),
                  email: ""
                });
                processedContacts.push({
                  id: cont.id,
                  name: cont.name,
                  number: cont.number
                });
              } else {
                throw error;
              }
            }
          } catch (err) {
            console.error(`Error processing contact ${contact.name}:`, err);
          }
        }

        if (processedContacts.length > 0) {
          const jsonData = JSON.stringify(processedContacts);

          try {
            const testParse = JSON.parse(jsonData);

            messageData.body = jsonData;
            msg.body = messageData.body;
          } catch (jsonError) {
            console.error("Error parsing JSON:", jsonError);
            messageData.body = JSON.stringify([{
              id: 0,
              name: "Contato do vCard",
              number: "Número não disponível"
            }]);
            msg.body = messageData.body;
          }
        } else {
          messageData.body = JSON.stringify([{
            id: 0,
            name: "Contato do vCard",
            number: "Número não disponível"
          }]);
          msg.body = messageData.body;
        }
      } else {
        messageData.body = JSON.stringify([{
          id: 0,
          name: "Contato do vCard",
          number: "Número não disponível"
        }]);
        msg.body = messageData.body;
      }
    } else {
      try {
        const bodyObj = JSON.parse(msg.body);
        if (!Array.isArray(bodyObj)) {
          console.warn("multi_vcard body is not an array, converting to array");
          messageData.body = JSON.stringify([bodyObj]);
          msg.body = messageData.body;
        }
      } catch (error) {
        console.error("Error parsing existing multi_vcard body:", error);
        messageData.body = JSON.stringify([{
          id: 0,
          name: "Contato do vCard",
          number: "Número não disponível"
        }]);
        msg.body = messageData.body;
      }
    }
  }

  const existingMessage = await Message.findByPk(messageData.id);
  if (existingMessage) {
    const messageAge = Date.now() - new Date(existingMessage.createdAt).getTime();
    if (messageAge < 5000) {
      return;
    }
  }

  try {
    await CreateMessageService({ messageData });
    
    const FormatLastMessage = require("../../helpers/FormatLastMessage").default;
    const formattedLastMessage = FormatLastMessage({
      body: messageData.body,
      mediaType: messageData.mediaType,
      mimetype: undefined,
      messageType: messageData.messageType,
      fromMe: msg.fromMe,
      filename: undefined
    });
    
    await ticket.update({ lastMessage: formattedLastMessage });
    await ticket.reload();
  } catch (error) {
    console.error("Erro ao salvar mensagem no banco de dados:", error);
    setTimeout(async () => {
      try {
        await CreateMessageService({ messageData });
        
        const FormatLastMessage = require("../../helpers/FormatLastMessage").default;
        const formattedLastMessage = FormatLastMessage({
          body: messageData.body,
          mediaType: messageData.mediaType,
          mimetype: undefined,
          messageType: messageData.messageType,
          fromMe: msg.fromMe,
          filename: undefined
        });
        
        await ticket.update({ lastMessage: formattedLastMessage });
        await ticket.reload();
      } catch (retryError) {
        console.error("Erro ao salvar mensagem na segunda tentativa:", retryError);
      }
    }, 1000);
  }
};

let greetingCounts: { [contactId: string]: number } = {};
const greetingLimit = (5 * 2);
let resetGreetingCountTimeout: NodeJS.Timeout;

const resetGreetingCounts = () => {
  greetingCounts = {};
  console.info("Contadores de saudações resetados.");
};

const startGreetingCountResetTimer = () => {
  clearTimeout(resetGreetingCountTimeout);
  resetGreetingCountTimeout = setTimeout(resetGreetingCounts, 1800000); 
};

const verifyQueue = async (
  wbot: Session,
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
) => {
  const { queues, greetingMessage, isDisplay } = await ShowWhatsAppService(
    wbot.id!
  );

  const queueLengthSetting = await ListSettingsServiceOne({ key: "queueLength" });
  const queueLength = queueLengthSetting?.value;
  const queueValue = queueLength === "enabled" ? 0 : 1;

  if (queues.length === queueValue) {
    await UpdateTicketService({
      ticketData: { queueId: queues[0].id },
      ticketId: ticket.id
    });

    const chat = await msg.getChat();
    await chat.sendStateTyping();

    const body = formatBody(`\u200e${queues[0].greetingMessage}`, ticket);

    const sentMessage = await wbot.sendMessage(
      `${contact.number}@c.us`,
      body
    );

    await verifyMessage(sentMessage, ticket, contact);

    return;
  }

  const selectedOption = msg.body;

  const choosenQueue = queues[+selectedOption - 1];

  if (choosenQueue) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    const startWorkParts = choosenQueue.startWork.split(':');
    const startWorkHour = parseInt(startWorkParts[0], 10);
    const startWorkMinute = parseInt(startWorkParts[1], 10);
    const startWorkInMinutes = startWorkHour * 60 + startWorkMinute;
    
    const endWorkParts = choosenQueue.endWork.split(':');
    const endWorkHour = parseInt(endWorkParts[0], 10);
    const endWorkMinute = parseInt(endWorkParts[1], 10);
    const endWorkInMinutes = endWorkHour * 60 + endWorkMinute;
    
    let isBreakTime = false;
    if (choosenQueue.startBreak && choosenQueue.endBreak) {
      try {
        const startBreakParts = choosenQueue.startBreak.split(':');
        const startBreakHour = parseInt(startBreakParts[0], 10);
        const startBreakMinute = parseInt(startBreakParts[1], 10);
        const startBreakInMinutes = startBreakHour * 60 + startBreakMinute;
        
        const endBreakParts = choosenQueue.endBreak.split(':');
        const endBreakHour = parseInt(endBreakParts[0], 10);
        const endBreakMinute = parseInt(endBreakParts[1], 10);
        const endBreakInMinutes = endBreakHour * 60 + endBreakMinute;
        
        if (currentTimeInMinutes >= startBreakInMinutes && currentTimeInMinutes <= endBreakInMinutes) {
          isBreakTime = true;
        }
      } catch (error) {
        console.error('Erro ao processar horário de intervalo:', error);
        isBreakTime = false;
      }
    }
    const isOutsideWorkHours = currentTimeInMinutes < startWorkInMinutes || currentTimeInMinutes > endWorkInMinutes;
    
    if (isBreakTime || isOutsideWorkHours) {
    
      await UpdateTicketService({
        ticketData: { queueId: choosenQueue.id },
        ticketId: ticket.id
      });

      const chat = await msg.getChat();
      await chat.sendStateTyping();
      
      const messageToSend = isBreakTime && choosenQueue.breakMessage 
        ? choosenQueue.breakMessage 
        : choosenQueue.absenceMessage;
      
      const body = formatBody(`\u200e${messageToSend}\n\n*[ # ]* - Voltar ao Menu Principal`, ticket);
      const debouncedSentMessage = debounce(
        async () => {
          const sentMessage = await wbot.sendMessage(
            `${contact.number}@c.us`,
            body
          );
          verifyMessage(sentMessage, ticket, contact);
        },
        3000,
        ticket.id
      );

      debouncedSentMessage();
    } else {
      await UpdateTicketService({
        ticketData: { queueId: choosenQueue.id },
        ticketId: ticket.id
      });

      const chat = await msg.getChat();
      await chat.sendStateTyping();

      const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

      const debouncedSentMessage = debounce(
        async () => {
          const sentMessage = await wbot.sendMessage(
            `${contact.number}@c.us`,
            body
          );
          verifyMessage(sentMessage, ticket, contact);
        },
        3000,
        ticket.id
      );
      debouncedSentMessage();
    }
  } else {
    let options = "";

    const contactId = contact.id.toString();
    if (!greetingCounts[contactId]) {
      greetingCounts[contactId] = 0;
    }

    if (greetingCounts[contactId] < greetingLimit) {
      const chat = await msg.getChat();
      await chat.sendStateTyping();
      greetingCounts[contactId]++;
      console.info(`Contador de saudações para ${contactId}:`, greetingCounts[contactId]);
      startGreetingCountResetTimer();
    }

    queues.forEach((queue, index) => {
      if (queue.startWork && queue.endWork) {
        if (isDisplay) {
          options += `*${index + 1}* - ${queue.name} das ${queue.startWork
            } as ${queue.endWork}\n`;
        } else {
          options += `*${index + 1}* - ${queue.name}\n`;
        }
      } else {
        options += `*${index + 1}* - ${queue.name}\n`;
      }
    });

    if (queues.length >= 2) {
      if (greetingCounts[contactId] < greetingLimit) {
        const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, ticket);

        const debouncedSentMessage = debounce(
          async () => {
            const sentMessage = await wbot.sendMessage(
              `${contact.number}@c.us`,
              body
            );
            verifyMessage(sentMessage, ticket, contact);
          },
          3000,
          ticket.id
        );

        debouncedSentMessage();
        greetingCounts[contactId]++;
        console.info(`Contador de saudações para ${contactId}:`, greetingCounts[contactId]);
        startGreetingCountResetTimer();
      } else {
        console.info(`Limite de saudações atingido para ${contactId}.`);
      }
    } else {
      await UpdateTicketService({
        ticketData: { queueId: queues[0].id },
        ticketId: ticket.id
      });

      const body = formatBody(`\u200e${greetingMessage}`, ticket);
      const body2 = formatBody(`\u200e${queues[0].greetingMessage}`, ticket);

      const debouncedSentMessage = debounce(
        async () => {
          const sentMessage = await wbot.sendMessage(
            `${contact.number}@c.us`,
            body
          );
          verifyMessage(sentMessage, ticket, contact);
        },
        3000,
        ticket.id
      );

      debouncedSentMessage();

      setTimeout(() => {
        const debouncedSecondMessage = debounce(
          async () => {
            const sentMessage = await wbot.sendMessage(
              `${contact.number}@c.us`,
              body2
            );
            verifyMessage(sentMessage, ticket, contact);
          },
          2000,
          ticket.id
        );

        debouncedSecondMessage();
      }, 5000);
    }

  }
};

const isValidMsg = (msg: WbotMessage): boolean => {
  if (
    msg.from === "status@broadcast" ||
    msg.type === "notification_template" ||
    msg.type === "e2e_notification" ||
    msg.type === "notification" ||
    msg.type === "group_notification"
  ) {
    console.info("Mensagem recebida - tipo de notificação ou broadcast:", msg.type);
    return false;
  }

  const msgType = msg.type;
  if (
    msgType === "chat" ||
    msgType === "audio" ||
    msgType === "ptt" ||
    msgType === "video" ||
    msgType === "image" ||
    msgType === "document" ||
    msgType === "vcard" ||
    msgType === "multi_vcard" ||
    msgType === "sticker" ||
    msgType === "location" ||
    msgType === "poll_creation"
  ) {
    return true;
  }
  
  console.warn("Tipo de mensagem desconhecido:", msgType);
  return true;
};

const getSafeContact = async (
  wbot: Session,
  msg: WbotMessage,
  useRemoteJid?: string
): Promise<WbotContact> => {
  try {
    if (useRemoteJid) {
      return await wbot.getContactById(useRemoteJid);
    }
    
    if (msg.fromMe) {
      return await wbot.getContactById(msg.to);
    }
    
    return await msg.getContact();
  } catch (err) {
    logger.warn(`[FALLBACK] Usando contato alternativo devido a limitação da lib whatsapp-web.js: ${err.message || String(err)}`);
    const jid = useRemoteJid || (msg.fromMe ? msg.to : msg.from);
    const user = jid ? jid.split("@")[0] : "";
    const isGroup = jid?.endsWith("@g.us") || false;
    const fallbackContact: any = {
      id: { user, _serialized: jid },
      name: user,
      pushname: user,
      isGroup
    };
    return fallbackContact as WbotContact;
  }
};

const handleMessage = async (
  msg: WbotMessage,
  wbot: Session
): Promise<void> => {
  try {
    if (wbot.id) {
      incrementMessageCount(wbot.id);
      updateLastActivity(wbot.id);
    }
    

    // if (msg.type === 'poll_creation' || (msg as any).pollName) {
    //   logger.info(`[MSG_IGNORADA] Mensagem de enquete ignorada (processada pelo SendPollService): ID=${msg.id?.id || 'unknown'}`);
    //   return;
    // }
    
    if (!isValidMsg(msg)) {
      logger.info(`[MSG_IGNORADA] Mensagem ignorada por não ser válida: ID=${msg.id?.id || 'unknown'}`);
      return;
    }
    
    logger.info(`[MSG_PROCESSANDO] Iniciando processamento da mensagem: ID=${msg.id?.id || 'unknown'}`);
  } catch (err) {
    logger.error(`[MSG_ERRO_LOG] Erro ao registrar logs iniciais: ${err}`);
    if (wbot.id) {
      incrementErrorCount(wbot.id);
    }
  }

  const Integrationdb = await Integration.findOne({
    where: { key: "urlApiN8N" }
  });

  if (Integrationdb?.value) {
    const chat = await msg.getChat();
    let groupContact;
    let baseContact: WbotContact;
    
    if (chat.isGroup) {
      baseContact = msg.fromMe
        ? await getSafeContact(wbot, msg, msg.to)
        : await getSafeContact(wbot, msg, msg.from);
      const msgGroupContact = msg.fromMe
        ? await getSafeContact(wbot, msg, msg.to)
        : await getSafeContact(wbot, msg, msg.from);
      groupContact = await verifyContact(msgGroupContact);
    } else {
      baseContact = await getSafeContact(wbot, msg);
    }
    
    const contact = await verifyContact(baseContact);
    
    const unreadMessages = msg.fromMe ? 0 : chat.unreadCount;
    
    const ticket = await FindOrCreateTicketService(
      contact,
      wbot.id!,
      unreadMessages,
      undefined,
      undefined,
      groupContact
    );
    
    const options = {
      method: "POST",
      url: Integrationdb?.value,
      headers: {
        "Content-Type": "application/json"
      },
      json: {
        message: msg,
        ticket: ticket
      }
    };
    
    try {
      await request(options); 
    } catch (error) {
      console.error("Erro ao enviar dados para o n8n:", error);
    }
  }

  const Settingdb = await Settings.findOne({
    where: { key: "CheckMsgIsGroup" }
  });
  if (Settingdb?.value === "enabled") {
    const chat = await msg.getChat();
    if (
      msg.type === "sticker" ||
      msg.type === "e2e_notification" ||
      msg.type === "notification_template" ||
      msg.from === "status@broadcast" ||
      // msg.author !== null ||
      chat.isGroup
    ) {
      return;
    }
  }

  try {    
    let msgContact: WbotContact;
    let groupContact: Contact | undefined;
    let userId;
    let queueId;

    const chat = await msg.getChat();

    if (msg.fromMe) {
      if (/\u200e/.test(msg.body[0])) return;


      if (
        !msg.hasMedia &&
        msg.type !== "location" &&
        msg.type !== "chat" &&
        msg.type !== "vcard"
        && msg.type !== "multi_vcard"
      )
        return;

      msgContact = await getSafeContact(wbot, msg, msg.to);
    } else {
      msgContact = await getSafeContact(wbot, msg);
    }

    if (chat.isGroup) {
      let msgGroupContact;

      if (msg.fromMe) {
        msgGroupContact = await getSafeContact(wbot, msg, msg.to);
      } else {
        msgGroupContact = await getSafeContact(wbot, msg, msg.from);
      }

      groupContact = await verifyContact(msgGroupContact);

      try {
        const fullJid = (chat as any)?.id?._serialized
          || (msgGroupContact as any)?.id?._serialized
          || `${msgGroupContact.id.user}@g.us`;
        const groupName = (chat as any)?.name || (chat as any)?.subject || groupContact.name;
        
        let profilePicUrl: string | undefined;
        let retries = 2;
        
        while (retries > 0) {
          try {
            profilePicUrl = await (wbot as any).getProfilePicUrl(fullJid);
            if (profilePicUrl) {
              logger.info(`[WBOT_LISTENER] Foto de grupo obtida: ${fullJid}`);
              break;
            }
          } catch (picErr) {
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 500));
            } else {
              logger.warn(`[WBOT_LISTENER] Falha ao obter foto do grupo ${fullJid} após tentativas`);
            }
          }
        }

        const needsUpdate = 
          groupContact.name !== groupName ||
          (profilePicUrl && groupContact.profilePicUrl !== profilePicUrl);

        if (needsUpdate) {
          await groupContact.update({
            isGroup: true,
            name: groupName || groupContact.name,
            number: fullJid, 
            profilePicUrl: profilePicUrl || groupContact.profilePicUrl
          });

          logger.info(`[WBOT_LISTENER] Contato de grupo atualizado: ${fullJid}`);

          try {
            const { getIO } = require("../../libs/socket");
            const io = getIO();
            io.emit("contact", { action: "update", contact: groupContact });
          } catch (socketErr) {
            logger.warn(`[WBOT_LISTENER] Erro ao emitir socket: ${socketErr}`);
          }
        }
      } catch (enrichErr) {
        logger.warn(`Falha ao enriquecer contato de grupo: ${String(enrichErr)}`);
      }
    }
    const whatsapp = await ShowWhatsAppService(wbot.id!);

    const unreadMessages = msg.fromMe ? 0 : chat.unreadCount;

    const contact = await verifyContact(msgContact);

    if (!msg.fromMe) {
      try {
        await contact.update({
          lastContactAt: new Date()
        });
        logger.info(`[WBOT_LISTENER] lastContactAt atualizado para contato ${contact.id}`);
      } catch (error) {
        logger.error(`[WBOT_LISTENER] Erro ao atualizar lastContactAt: ${error}`);
      }
    }

    let ticket = await FindOrCreateTicketService(
      contact,
      wbot.id!,
      unreadMessages,
      userId,
      queueId,
      groupContact
    );

    if (
      unreadMessages === 0 &&
      whatsapp.farewellMessage &&
      formatBody(whatsapp.farewellMessage, ticket) === msg.body
    )
      return;

    ticket = await FindOrCreateTicketService(
      contact,
      wbot.id!,
      unreadMessages,
      userId,
      queueId,
      groupContact
    );

    if (msg.hasMedia) {
      await verifyMediaMessage(msg, ticket, contact);
    } else {
      await verifyMessage(msg, ticket, contact);
    }

    const backCommands = ["voltar", "menu", "inicio", "sair", "0", "#"];
    if (backCommands.includes(msg.body.toLowerCase().trim())) {

      await UpdateTicketService({
        ticketData: { queueId: null },
        ticketId: ticket.id
      });

      await verifyQueue(wbot, msg, ticket, contact);
      return;
    }

    if (
      !ticket.queue &&
      !chat.isGroup &&
      !msg.fromMe &&
      !ticket.userId &&
      whatsapp.queues.length >= 1
    ) {
      await verifyQueue(wbot, msg, ticket, contact);
    }

    if (msg.type === "vcard") {
      try {
        const vCardContent = msg.body;
        const extractedData: {
          name: string;
          numbers: string[];
        } = {
          name: "",
          numbers: []
        };
        
        const nameMatch = vCardContent.match(/FN[^:]*:(.*?)(?:\r?\n|$)/i);
        if (nameMatch && nameMatch[1]) {
          extractedData.name = nameMatch[1].trim();
        }
        
        const telRegex = /TEL[^:]*:(.*?)(?:\r?\n|$)/gi;
        let telMatch;
        while ((telMatch = telRegex.exec(vCardContent)) !== null) {
          if (telMatch[1] && telMatch[1].trim()) {
            extractedData.numbers.push(telMatch[1].trim());
          }
        }
        
        const waidRegex = /TEL;waid=(\d+)/gi;
        let waidMatch;
        let hasWaidNumbers = false;
        
        while ((waidMatch = waidRegex.exec(vCardContent)) !== null) {
          if (waidMatch[1] && waidMatch[1].trim()) {
            extractedData.numbers.push("waid=" + waidMatch[1].trim());
            hasWaidNumbers = true;
          }
        }
        
        if (!hasWaidNumbers) {
          const telRegex = /TEL[^:]*:(.*?)(?:\r?\n|$)/gi;
          let telMatch;
          while ((telMatch = telRegex.exec(vCardContent)) !== null) {
            if (telMatch[1] && telMatch[1].trim()) {
              extractedData.numbers.push(telMatch[1].trim());
            }
          }
          
          if (extractedData.numbers.length === 0) {
            const array = vCardContent.split("\n");
            for (let index = 0; index < array.length; index++) {
              const line = array[index];
              if (line.indexOf("+") !== -1) {
                const parts = line.split(":");
                for (let ind = 0; ind < parts.length; ind++) {
                  if (parts[ind].indexOf("+") !== -1) {
                    extractedData.numbers.push(parts[ind].trim());
                  }
                }
              }
            }
          }
        }
        
        const contactsCreated = [];
        for (const phoneNumber of extractedData.numbers) {
          try {
            const phoneStr = String(phoneNumber);
            
            const waidMatch = phoneStr.match(/waid=(\d+)/);
            
            if (waidMatch && waidMatch[1]) {
              const cleanNumber = waidMatch[1];
              
              if (cleanNumber) {
                const cont = await CreateContactService({
                  name: extractedData.name || "Contato",
                  number: cleanNumber
                });
                contactsCreated.push({
                  id: cont.id,
                  name: cont.name,
                  number: cont.number,
                  isWaid: true
                });
              }
            } else if (!hasWaidNumbers) {
              const cleanNumber = phoneStr.replace(/\D/g, "");
              
              if (cleanNumber) {
                const cont = await CreateContactService({
                  name: extractedData.name || "Contato",
                  number: cleanNumber
                });
                contactsCreated.push({
                  id: cont.id,
                  name: cont.name,
                  number: cont.number
                });
              }
            }
          } catch (err) {
            if (err.message === "ERR_DUPLICATED_CONTACT") {
              const phoneStr = String(phoneNumber);
              
              const waidMatch = phoneStr.match(/waid=(\d+)/);
              
              if (waidMatch && waidMatch[1]) {
                const cleanNumber = waidMatch[1];
                
                const cont = await GetContactService({
                  name: extractedData.name || "Contato",
                  number: cleanNumber,
                  email: ""
                });
                contactsCreated.push({
                  id: cont.id,
                  name: cont.name,
                  number: cont.number,
                  isWaid: true
                });
              } else if (!hasWaidNumbers) {
                const cleanNumber = phoneStr.replace(/\D/g, "");
                
                const cont = await GetContactService({
                  name: extractedData.name || "Contato",
                  number: cleanNumber,
                  email: ""
                });
                contactsCreated.push({
                  id: cont.id,
                  name: cont.name,
                  number: cont.number
                });
              }
            } else {
              console.error(`Error processing vCard contact:`, err);
            }
          }
        }
        
        if (contactsCreated.length > 0) {
          msg.body = JSON.stringify({
            name: extractedData.name || "Contato",
            number: contactsCreated[0].number,
            allNumbers: extractedData.numbers
          });
        } else {
          msg.body = JSON.stringify({
            name: extractedData.name || "Contato",
            number: "Número não disponível",
            allNumbers: []
          });
        }
      } catch (error) {
        console.error("Error processing vcard:", error);
      }
    }

    if (msg.type === "multi_vcard") {
      try {
        if (!msg.vCards) {
          console.error("vCards data is undefined");
          msg.body = JSON.stringify([{
            id: 0,
            name: "Contato do vCard",
            number: "Número não disponível"
          }]);
          return;
        }

        if ((typeof msg.vCards === 'string' && (msg.vCards as string).trim() === '') ||
          (Array.isArray(msg.vCards) && msg.vCards.length === 0)) {
          console.error("vCards data is empty");
          msg.body = JSON.stringify([{
            id: 0,
            name: "Contato do vCard",
            number: "Número não disponível"
          }]);
          return;
        }

        const array = msg.vCards.toString().split("\n");

        let name = "";
        let number = "";
        const obj = [];
        const conts = [];

        for (let index = 0; index < array.length; index++) {
          const v = array[index];

          const values = v.split(":");

          for (let ind = 0; ind < values.length; ind++) {
            if (values[ind] && values[ind].indexOf("+") !== -1) {
              number = values[ind];
            }
            if (values[ind] && values[ind].indexOf("FN") !== -1 && values[ind + 1]) {
              name = values[ind + 1];
            }
            if (name !== "" && number !== "") {
              obj.push({
                name,
                number
              });
              name = "";
              number = "";
            }
          }
        }

        if (obj.length === 0) {
          console.warn("No contacts were extracted from vCard data");

          if (typeof msg.vCards === 'object') {
            console.info("vCards is an object, stringifying:", JSON.stringify(msg.vCards));
          }

          if (msg.vCards && typeof msg.vCards === 'object') {
            try {
              if (Array.isArray(msg.vCards)) {
                for (let i = 0; i < msg.vCards.length; i++) {
                  const vcard = msg.vCards[i];

                  if (typeof vcard === 'string') {
                    const vcardStr = vcard.toString();
                    const nameMatch = vcardStr.match(/FN:(.*?)\n/i);
                    const telMatch = vcardStr.match(/TEL[^:]*:(.*?)\n/i);

                    if (nameMatch || telMatch) {
                      obj.push({
                        name: nameMatch ? nameMatch[1].trim() : 'Sem nome',
                        number: telMatch ? telMatch[1].trim() : ''
                      });
                    }
                  }
                }
              } else {
                const vcardStr = String(msg.vCards);
                const vcardParts = vcardStr.split("BEGIN:VCARD");

                for (let i = 1; i < vcardParts.length; i++) {
                  const part = vcardParts[i];

                  const nameMatch = part.match(/FN:(.*?)\n/i);
                  const telMatch = part.match(/TEL[^:]*:(.*?)\n/i);

                  if (nameMatch || telMatch) {
                    obj.push({
                      name: nameMatch ? nameMatch[1].trim() : 'Sem nome',
                      number: telMatch ? telMatch[1].trim() : ''
                    });
                  }
                }
              }
            } catch (err) {
              console.error("Error processing vCards object:", err);
            }
          }
        }

        // eslint-disable-next-line no-restricted-syntax
        for await (const ob of obj) {
          try {
            const cont = await CreateContactService({
              name: ob.name,
              number: ob.number.replace(/\D/g, "")
            });
            conts.push({
              id: cont.id,
              name: cont.name,
              number: cont.number
            });
          } catch (error) {
            if (error.message === "ERR_DUPLICATED_CONTACT") {
              const cont = await GetContactService({
                name: ob.name,
                number: ob.number.replace(/\D/g, ""),
                email: ""
              });
              conts.push({
                id: cont.id,
                name: cont.name,
                number: cont.number
              });
            } else {
              console.error(`Error processing contact ${ob.name}:`, error);
            }
          }
        }

        if (conts.length > 0) {
          const validContacts = conts.map(contact => ({
            id: contact.id || 0,
            name: contact.name || "Contato",
            number: contact.number || "Número não disponível"
          }));

          const jsonData = JSON.stringify(validContacts);

          try {
            JSON.parse(jsonData);
          } catch (e) {
            console.error("JSON validation failed:", e);
          }

          msg.body = jsonData;
        } else {
          console.warn("No contacts were processed from multi_vcard");

          msg.body = JSON.stringify([{
            id: 0,
            name: "Contato do vCard",
            number: "Número não disponível"
          }]);
        }
      } catch (error) {
        console.error("Error processing multi_vcard:", error);
      }
    }

    let profilePicUrl;
    try {
      if (typeof msgContact.getProfilePicUrl === 'function') {
        profilePicUrl = await msgContact.getProfilePicUrl();
      }
    } catch (picErr) {
      logger.warn(`Não foi possível obter foto de perfil: ${String(picErr)}`);
    }
    
    const contactData = {
      name: msgContact.name || msgContact.pushname || msgContact.id.user,
      number: msgContact.id.user,
      profilePicUrl,
      isGroup: msgContact.isGroup
    };
    await CreateOrUpdateContactService(contactData);
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`[MSG_ERRO] Erro ao processar mensagem do WhatsApp. ID=${msg?.id?.id || 'unknown'}, Erro: ${err}`);
    
    logger.error(`[MSG_ERRO_DETALHES] Stack trace: ${err.stack || 'Sem stack trace'}`);
    
    try {
      logger.error(`[MSG_ERRO_CONTEXTO] Contexto da mensagem com erro: ${JSON.stringify({
        id: msg?.id?.id || 'unknown',
        fromMe: msg?.fromMe,
        from: msg?.from,
        to: msg?.to,
        body: msg?.body?.substring(0, 100) || 'Sem corpo',
        type: msg?.type,
        timestamp: msg?.timestamp,
        hasMedia: msg?.hasMedia
      })}`);
    } catch (logErr) {
      logger.error(`[MSG_ERRO_LOG] Erro ao tentar registrar detalhes do erro: ${logErr}`);
    }
  } finally {
    logger.info(`[MSG_FINALIZADA] Processamento da mensagem finalizado: ID=${msg?.id?.id || 'unknown'}, Timestamp=${new Date().toISOString()}`);
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const handleMsgAck = async (msg: WbotMessage, ack: MessageAck) => {
  await new Promise(r => setTimeout(r, 500));

  const io = getIO();
  const timestamp = new Date().toISOString();

  try {
    logger.info(`[ACK_EVENTO] Recebido evento de ACK: ID=${msg.id.id}, ACK=${ack}, Timestamp=${timestamp}`);
    
    logger.info(`[ACK_DETALHES] Detalhes da mensagem: ${JSON.stringify({
      id: msg.id,
      fromMe: msg.fromMe,
      to: msg.to,
      deviceType: msg.deviceType,
      timestamp: msg.timestamp
    })}`);
    
    const messageToUpdate = await Message.findByPk(msg.id.id, {
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        },
        {
          model: OldMessage,
          as: "oldMessages"
        }
      ]
    });

    if (!messageToUpdate) {
      logger.warn(`[ACK_ERRO] Mensagem não encontrada no banco de dados: ${msg.id.id}`);
      console.warn(`[ACK_ERRO] Mensagem não encontrada no banco de dados: ${msg.id.id}`);
      return;
    }

    const currentAck = messageToUpdate.ack || 0;
    let ackToUpdate = ack || 0;
    
    if (messageToUpdate.read === true && ackToUpdate < 3 && messageToUpdate.fromMe) {
      logger.info(`[ACK_DEBUG] Mensagem marcada como lida (read=true), mas ACK=${ackToUpdate}. Mantendo ACK original conforme documentação.`);
    }
    
    if (ackToUpdate > currentAck) {
      logger.info(`[ACK_ATUALIZACAO] Atualizando ACK da mensagem ${msg.id.id}: ${currentAck} -> ${ackToUpdate}`);
      
      const beforeUpdate = new Date().getTime();
      await messageToUpdate.update({ ack: ackToUpdate });
      const afterUpdate = new Date().getTime();
      
      logger.info(`[ACK_PERFORMANCE] Tempo para atualizar ACK no banco: ${afterUpdate - beforeUpdate}ms`);

      const beforeEmit = new Date().getTime();
      io.to(messageToUpdate.ticketId.toString()).emit("appMessage", {
        action: "update",
        message: messageToUpdate
      });
      const afterEmit = new Date().getTime();
      
      logger.info(`[ACK_SOCKET] Socket emitido para ticket ${messageToUpdate.ticketId}, tempo: ${afterEmit - beforeEmit}ms`);
    } else {
      logger.info(`[ACK_IGNORADO] ACK ignorado: valor atual (${currentAck}) >= novo valor (${ackToUpdate})`);
    }
    
    if (ackToUpdate >= 2) {
      try {
        logger.info(`[ACK_BATCH_CHECK] Verificando outras mensagens do ticket ${messageToUpdate.ticketId} para sincronização`);
        
        const messagesToUpdate = await Message.findAll({
          where: {
            ticketId: messageToUpdate.ticketId,
            id: { [Op.lt]: messageToUpdate.id },
            ack: { [Op.lt]: ackToUpdate }
          },
          order: [['createdAt', 'DESC']]
        });
        
        if (messagesToUpdate.length > 0) {
          logger.info(`[ACK_BATCH_UPDATE] Encontradas ${messagesToUpdate.length} mensagens para atualização em lote`);
          
          for (const msg of messagesToUpdate) {
            await msg.update({ ack: ackToUpdate >= 3 ? 3 : 2 });
            
            io.to(msg.ticketId.toString()).emit("appMessage", {
              action: "update",
              message: msg
            });
          }
          
          logger.info(`[ACK_BATCH_COMPLETE] Atualização em lote concluída`);
        }
      } catch (batchErr) {
        logger.error(`[ACK_BATCH_ERROR] Erro ao processar atualização em lote: ${batchErr}`);
      }
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`[ACK_ERRO] Erro ao processar ACK da mensagem. ID=${msg?.id?.id || 'unknown'}, ACK=${ack}, Erro: ${err}`);
    console.error(`[ACK_ERRO] Erro ao processar ACK da mensagem. ID=${msg?.id?.id || 'unknown'}, ACK=${ack}, Erro: ${err}`);
  }
};

const handleMsgEdit = async (
  msg: WbotMessage,
  newBody: string,
  oldBody: string
): Promise<void> => {
  let editedMsg = await Message.findByPk(msg.id.id, {
    include: [
      {
        model: OldMessage,
        as: "oldMessages"
      }
    ]
  });

  if (!editedMsg) return;

  const io = getIO();

  try {
    
    if (oldBody && newBody && oldBody !== newBody) {
      
      const existingHistory = await OldMessage.findOne({
        where: {
          messageId: msg.id.id,
          body: oldBody
        }
      });

      if (!existingHistory) {
        await OldMessage.create({
          messageId: msg.id.id,
          body: oldBody
        });
        console.info(`[handleMsgEdit] Histórico salvo: "${oldBody}"`);
      } else {
        console.info(`[handleMsgEdit] Histórico já existe (ID: ${existingHistory.id}), pulando duplicata`);
      }
    } else {
      console.info(`[handleMsgEdit] Sem mudança no corpo ou valores inválidos`);
    }

    if (editedMsg.body !== newBody) {
      await editedMsg.update({ body: newBody, isEdited: true });
    } else {
      console.info(`[handleMsgEdit] Mensagem já está atualizada no banco`);
    }

    await editedMsg.reload({
      include: [
        {
          model: OldMessage,
          as: "oldMessages",
          separate: true,
          order: [["createdAt", "DESC"]]
        }
      ]
    });

    io.to(editedMsg.ticketId.toString()).emit("appMessage", {
      action: "update",
      message: editedMsg
    });
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling message edit. Err: ${err}`);
  }
};

const updatePendingMessages = async (whatsappId: number): Promise<void> => {
  try {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const pendingMessages = await Message.findAll({
      where: {
        fromMe: true,
        ack: { [Op.in]: [0, 1] },
        createdAt: { [Op.lt]: oneHourAgo },
      },
      include: [{
        model: Ticket,
        where: { whatsappId },
        required: true
      }],
      limit: 100
    });
    
    if (pendingMessages.length > 0) {      
      const io = getIO();
      
      for (const message of pendingMessages) {
        await message.update({ ack: 3 });
        
        io.to(message.ticketId.toString()).emit("appMessage", {
          action: "update",
          message
        });
      }
    }
  } catch (err) {
    console.error("Erro ao atualizar mensagens antigas:", err);
  }
};

const wbotMessageListener = async (wbot: Session): Promise<void> => {
  wbot.on("message_create", async msg => {
    handleMessage(msg, wbot);
  });

  wbot.on("message_edit", async (msg, newBody, oldBody) => {
    handleMsgEdit(msg, newBody as string, oldBody as string);
  });

  wbot.on("media_uploaded", async msg => {
    handleMessage(msg, wbot);
  });

  wbot.on("message_ack", async (msg, ack) => {
    handleMsgAck(msg, ack);
  });

  wbot.on("message_revoke_everyone", async (after, before) => {
    const msgBody: string | undefined = before?.body;
    if (msgBody !== undefined) {
      verifyRevoked(msgBody || "");
    }
  });
  
  if (wbot.id) {
    setInterval(() => {
      updatePendingMessages(wbot.id!);
    }, 30 * 60 * 1000); 
    
    setTimeout(() => {
      updatePendingMessages(wbot.id!);
    }, 5 * 60 * 1000); 
  }
};

export { handleMessage, handleMsgAck, wbotMessageListener };
