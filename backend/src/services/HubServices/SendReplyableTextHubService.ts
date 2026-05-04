import { createNotificameClient, resolveChannel, resolveContactId, NotificameMessagePayload } from "../../libs/notificameClient";
import Contact from "../../models/Contact";
import CreateMessageService from "./CreateHubMessageService";
import { showHubToken } from "../../helpers/showHubToken";
import { logger } from "../../utils/logger";

require("dotenv").config();

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

  const channel = resolveChannel(contact);
  if (!channel || channel === "webchat") {
    logger.error("SendReplyableTextService: requer canal facebook, instagram ou telegram.");
    throw new Error("ReplyableTextContent requer canal facebook, instagram ou telegram. Nenhum desses IDs foi encontrado no contato.");
  }

  const contactId = resolveContactId(contact, channel);
  if (!contactId) {
    throw new Error(`SendReplyableTextService: ID do destinatário não encontrado para canal ${channel}`);
  }

  const hubToken = await showHubToken();
  const client = createNotificameClient(hubToken);

  const payload: NotificameMessagePayload = {
    from: connection.qrcode,
    to: contactId,
    contents: [{
      type: 'template',
      template: {
        template_type: 'button',
        text,
        buttons: quickReplyButtons.map(b => ({
          type: 'web_url',
          url: '#',
          title: b.label
        }))
      }
    }]
  };

  try {
    const response = await client.post(`/v1/channels/${channel}/messages`, payload);
    const data = response.data;

    const newMessage = await CreateMessageService({
      id: data.id,
      contactId: contact.id,
      body: text,
      ticketId,
      fromMe: true
    });

    return newMessage;
  } catch (error: any) {
    const errBody = error?.response?.data || error?.response?.body;
    logger.error(`SendReplyableTextService: erro ao enviar replyable-text Hub: ${error?.message || String(error)}`);
    if (errBody) logger.error(`Hub API response body: ${JSON.stringify(errBody)}`);
    throw error;
  }
};
