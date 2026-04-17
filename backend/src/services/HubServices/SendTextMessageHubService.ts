import { showHubToken } from "../../helpers/showHubToken";
import Contact from "../../models/Contact";
import CreateMessageService from "./CreateHubMessageService";
import { logger } from "../../utils/logger";

require("dotenv").config();
const { Client, TextContent } = require("notificamehubsdk");

export const SendTextMessageService = async (
  message: string,
  ticketId: number,
  contact: Contact,
  connection: any
) => {
  const notificameHubToken = await showHubToken();

  const client = new Client(notificameHubToken);

  let channelClient;

  message = message.replace(/\n/g, " ");

  const content = new TextContent(message);

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
  } else if (contact.webchatId) {
    contactNumber = contact.webchatId;
    channelClient = client.setChannel("webchat");
  } else {
    logger.error("Nenhum canal disponível para este contato.");
  }

  try {


    let response = await channelClient.sendMessage(
      connection.qrcode,
      contactNumber,
      content
    );

    let data: any;

    try {
      const jsonStart = response.indexOf("{");
      const jsonResponse = response.substring(jsonStart);
      data = JSON.parse(jsonResponse);
    } catch (error) {
      data = response;
    }

    const newMessage = await CreateMessageService({
      id: data.id,
      contactId: contact.id,
      body: message,
      ticketId,
      fromMe: true
    });

    return newMessage;
  } catch (error) {
    logger.error(`Erro ao enviar mensagem Hub: ${error}`);
  }
};
