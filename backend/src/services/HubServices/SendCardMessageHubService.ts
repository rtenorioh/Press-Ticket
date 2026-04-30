import { showHubToken } from "../../helpers/showHubToken";
import Contact from "../../models/Contact";
import CreateMessageService from "./CreateHubMessageService";
import { logger } from "../../utils/logger";

require("dotenv").config();
const { Client, CardContent } = require("notificamehubsdk");

export interface HubCardButton {
  label: string;
  url?: string;
}

export const SendCardMessageService = async (
  title: string,
  media: string,
  text: string,
  buttons: HubCardButton[],
  quickReplyButtons: HubCardButton[],
  ticketId: number,
  contact: Contact,
  connection: any
): Promise<any> => {
  if (connection.type === "wwebjs") {
    throw new Error("CardContent não é suportado em canais wwebjs.");
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
    logger.error("CardContent: nenhum canal compatível encontrado no contato. Requer facebook, instagram ou telegram.");
    throw new Error("CardContent requer canal facebook, instagram ou telegram. Nenhum desses IDs foi encontrado no contato.");
  }

  const content = new CardContent(title, media, text, buttons, quickReplyButtons);

  try {
    channelClient.contentSupportValidation(content);

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
      logger.error(`Erro ao parsear resposta Hub card: ${error} | Response: ${JSON.stringify(response)}`);
      data = response;
    }

    const newMessage = await CreateMessageService({
      id: data.id,
      contactId: contact.id,
      body: title,
      ticketId,
      fromMe: true
    });

    return newMessage;
  } catch (error) {
    logger.error(`Erro ao enviar card Hub: ${error}`);
    throw error;
  }
};
