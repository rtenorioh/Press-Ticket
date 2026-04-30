import { showHubToken } from "../../helpers/showHubToken";
import Contact from "../../models/Contact";
import CreateMessageService from "./CreateHubMessageService";
import { logger } from "../../utils/logger";

require("dotenv").config();
const { Client, LocationContent } = require("notificamehubsdk");

export const SendLocationHubService = async (
  latitude: number,
  longitude: number,
  name: string,
  address: string,
  ticketId: number,
  contact: Contact,
  connection: any
): Promise<any> => {
  if (connection.type === "wwebjs") {
    throw new Error(
      "Para canais wwebjs, use o endpoint /wa-features/:ticketId/location."
    );
  }

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error("Latitude e longitude devem ser números válidos.");
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
  } else if (contact.webchatId) {
    contactNumber = contact.webchatId;
    channelClient = client.setChannel("webchat");
  } else {
    logger.error("LocationContent: nenhum canal Hub encontrado no contato.");
    throw new Error("Nenhum canal Hub encontrado no contato (facebook, instagram, telegram ou webchat).");
  }

  const content = new LocationContent(latitude, longitude, name, "", address);

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
      logger.error(`Erro ao parsear resposta Hub location: ${error} | Response: ${JSON.stringify(response)}`);
      data = response;
    }

    const body = name
      ? `📍 ${name}`
      : `📍 ${latitude}, ${longitude}`;

    const newMessage = await CreateMessageService({
      id: data.id,
      contactId: contact.id,
      body,
      ticketId,
      fromMe: true
    });

    return newMessage;
  } catch (error) {
    logger.error(`Erro ao enviar location Hub: ${error}`);
    throw error;
  }
};
