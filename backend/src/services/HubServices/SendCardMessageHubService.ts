import { createNotificameClient, resolveChannel, resolveContactId, NotificameMessagePayload } from "../../libs/notificameClient";
import Contact from "../../models/Contact";
import CreateMessageService from "./CreateHubMessageService";
import { showHubToken } from "../../helpers/showHubToken";
import { logger } from "../../utils/logger";

require("dotenv").config();

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

  const channel = resolveChannel(contact);
  if (!channel || channel === "webchat") {
    logger.error("SendCardMessageService: CardContent requer canal facebook, instagram ou telegram.");
    throw new Error("CardContent requer canal facebook, instagram ou telegram. Nenhum desses IDs foi encontrado no contato.");
  }

  const contactId = resolveContactId(contact, channel);
  if (!contactId) {
    throw new Error(`SendCardMessageService: ID do destinatário não encontrado para canal ${channel}`);
  }

  const allButtons = [
    ...buttons.map(b => ({ type: 'web_url', url: b.url || '#', title: b.label })),
    ...quickReplyButtons.map(b => ({ type: 'web_url', url: b.url || '#', title: b.label }))
  ];

  const hubToken = await showHubToken();
  const client = createNotificameClient(hubToken);

  const payload: NotificameMessagePayload = {
    from: connection.qrcode,
    to: contactId,
    contents: [{
      type: 'template',
      template: {
        template_type: 'generic',
        elements: [{
          title,
          image_url: media || undefined,
          subtitle: text || undefined,
          buttons: allButtons
        }]
      }
    }]
  };

  try {
    const response = await client.post(`/v1/channels/${channel}/messages`, payload);
    const data = response.data;

    const newMessage = await CreateMessageService({
      id: data.id,
      contactId: contact.id,
      body: title,
      ticketId,
      fromMe: true
    });

    return newMessage;
  } catch (error: any) {
    const errBody = error?.response?.data || error?.response?.body;
    logger.error(`SendCardMessageService: erro ao enviar card Hub: ${error?.message || String(error)}`);
    if (errBody) logger.error(`Hub API response body: ${JSON.stringify(errBody)}`);
    throw error;
  }
};
