import {
  createNotificameClient,
  resolveChannel,
  resolveContactId,
  NotificameMessagePayload
} from "../../libs/notificameClient";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Whatsapp from "../../models/Whatsapp";
import CreateMessageService from "./CreateHubMessageService";
import { showHubToken } from "../../helpers/showHubToken";
import { logger } from "../../utils/logger";

require("dotenv").config();

export const SendLocationHubService = async (
  latitude: number,
  longitude: number,
  name: string,
  address: string,
  ticketId: number,
  contact: Contact,
  connection: Whatsapp
): Promise<Message | undefined> => {
  if (connection.type === "wwebjs") {
    throw new Error(
      "Para canais wwebjs, use o endpoint /wa-features/:ticketId/location."
    );
  }

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error("Latitude e longitude devem ser números válidos.");
  }

  const channel = resolveChannel(contact);
  if (!channel) {
    logger.error(
      "SendLocationHubService: nenhum canal Hub encontrado no contato."
    );
    throw new Error(
      "Nenhum canal Hub encontrado no contato (facebook, instagram, telegram ou webchat)."
    );
  }

  const contactId = resolveContactId(contact, channel);
  if (!contactId) {
    throw new Error(
      `SendLocationHubService: ID do destinatário não encontrado para canal ${channel}`
    );
  }

  const hubToken = await showHubToken();
  const client = createNotificameClient(hubToken);

  const payload: NotificameMessagePayload = {
    from: connection.qrcode,
    to: contactId,
    contents: [
      {
        type: "location",
        latitude,
        longitude,
        name: name || undefined,
        address: address || undefined
      }
    ]
  };

  const body = name ? `📍 ${name}` : `📍 ${latitude}, ${longitude}`;

  try {
    const response = await client.post(
      `/v1/channels/${channel}/messages`,
      payload
    );
    const data = response.data;

    const newMessage = await CreateMessageService({
      id: data.id,
      contactId: contact.id,
      body,
      ticketId,
      fromMe: true
    });

    return newMessage;
  } catch (error) {
    logger.error(
      `SendLocationHubService: erro ao enviar location Hub: ${error}`
    );
    throw error;
  }
};
