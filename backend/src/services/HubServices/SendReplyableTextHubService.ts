import { showHubToken } from "../../helpers/showHubToken";
import Contact from "../../models/Contact";
import CreateMessageService from "./CreateHubMessageService";
import { logger } from "../../utils/logger";

require("dotenv").config();
const { Client, ReplyableTextContent } = require("notificamehubsdk");

export interface HubQuickReplyButton {
  label: string;
}

export const SendReplyableTextService = async (
  text: string,
  quickReplyButtons: HubQuickReplyButton[],
  ticketId: number,
  contact: Contact,
  connection: any
): Promise<any> => {
  if (connection.type === "wwebjs") {
    throw new Error("ReplyableTextContent não é suportado em canais wwebjs.");
  }

  if (!text?.trim()) {
    throw new Error("O texto da mensagem é obrigatório.");
  }

  if (!quickReplyButtons?.length) {
    throw new Error("ReplyableTextContent requer pelo menos um botão de resposta rápida.");
  }

  const notificameHubToken = await showHubToken();
  const client = new Client(notificameHubToken);

  let channelClient;
  let contactNumber;

  if (contact.messengerId) {
    contactNumber = contact.messengerId;
    channelClient = client.setChannel("facebook");
  } else if (contact.instagramId) {
    contactNumber = contact.instagramId;
    channelClient = client.setChannel("instagram");
  } else if (contact.telegramId) {
    contactNumber = contact.telegramId;
    channelClient = client.setChannel("telegram");
  } else {
    logger.error("ReplyableTextContent: nenhum canal compatível encontrado. Requer facebook, instagram ou telegram.");
    throw new Error("ReplyableTextContent requer canal facebook, instagram ou telegram. Nenhum desses IDs foi encontrado no contato.");
  }

  const content = new ReplyableTextContent(text, quickReplyButtons);
  // SDK v0.0.27 bug: type='replyable_text' (14 chars) exceeds Hub API column limit of 11.
  // Trying 'quick_reply' (11 chars) — likely the renamed type in the current API version.
  // Keep original field name 'quickReplyButtons' since the API schema may match the SDK for this type.
  (content as any).type = "quick_reply";
  if (Array.isArray((channelClient as any).supportedContents) &&
      !(channelClient as any).supportedContents.includes("quick_reply")) {
    (channelClient as any).supportedContents.push("quick_reply");
  }

  try {
    const response = await channelClient.sendMessage(
      connection.qrcode,
      contactNumber,
      content
    );

    let data: any;
    try {
      if (typeof response === "object") {
        data = response;
      } else {
        const jsonStart = response.indexOf("{");
        const jsonResponse = response.substring(jsonStart);
        data = JSON.parse(jsonResponse);
      }
    } catch (error) {
      logger.error(`Erro ao parsear resposta Hub replyable-text: ${error} | Response: ${JSON.stringify(response)}`);
      data = response;
    }

    const newMessage = await CreateMessageService({
      id: data.id,
      contactId: contact.id,
      body: text,
      ticketId,
      fromMe: true
    });

    return newMessage;
  } catch (error: any) {
    const errBody = error?.body || error?.response?.data || error?.response?.body;
    logger.error(`Erro ao enviar replyable-text Hub: ${error?.message || String(error)}`);
    if (errBody) logger.error(`Hub API response body: ${JSON.stringify(errBody)}`);
    logger.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
};
