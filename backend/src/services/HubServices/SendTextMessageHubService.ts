import { createNotificameClient, resolveChannel, resolveContactId, NotificameMessagePayload } from "../../libs/notificameClient";
import Contact from "../../models/Contact";
import CreateMessageService from "./CreateHubMessageService";
import { showHubToken } from "../../helpers/showHubToken";
import { logger } from "../../utils/logger";

require("dotenv").config();

export const SendTextMessageService = async (
  message: string,
  ticketId: number,
  contact: Contact,
  connection: any
) => {
  const channel = resolveChannel(contact);
  if (!channel) {
    logger.error("SendTextMessageService: nenhum canal disponível para este contato.");
    throw new Error("Nenhum canal disponível para este contato.");
  }

  const contactId = resolveContactId(contact, channel);
  if (!contactId) {
    throw new Error(`SendTextMessageService: ID do destinatário não encontrado para canal ${channel}`);
  }

  message = message.replace(/\n/g, " ");

  const hubToken = await showHubToken();
  const client = createNotificameClient(hubToken);

  const payload: NotificameMessagePayload = {
    from: connection.qrcode,
    to: contactId,
    contents: [{ type: 'text', text: message }]
  };

  try {
    const response = await client.post(`/v1/channels/${channel}/messages`, payload);
    const data = response.data;

    const newMessage = await CreateMessageService({
      id: data.id,
      contactId: contact.id,
      body: message,
      ticketId,
      fromMe: true
    });

    return newMessage;
  } catch (error) {
    logger.error(`SendTextMessageService: erro ao enviar mensagem Hub: ${error}`);
    throw error;
  }
};
