import axios from "axios";
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
  connection: Whatsapp
): Promise<Message | undefined> => {
  if (connection.type === "wwebjs") {
    throw new Error("Envio de card não suportado neste canal.");
  }

  const channel = resolveChannel(contact);
  if (!channel || channel === "webchat") {
    logger.error(
      "SendCardMessageService: canal incompatível para envio de card."
    );
    throw new Error("Envio de card não suportado neste canal.");
  }

  const contactId = resolveContactId(contact, channel);
  if (!contactId) {
    throw new Error(
      `SendCardMessageService: ID do destinatário não encontrado para canal ${channel}`
    );
  }

  const mapButton = (b: HubCardButton) =>
    b.url && b.url !== "#"
      ? { type: "web_url", url: b.url, title: b.label }
      : { type: "postback", payload: b.label, title: b.label };

  const allButtons = [
    ...buttons.map(mapButton),
    ...quickReplyButtons.map(mapButton)
  ];

  const hubToken = await showHubToken();
  const client = createNotificameClient(hubToken);

  const payload: NotificameMessagePayload = {
    from: connection.qrcode,
    to: contactId,
    contents: [
      {
        type: "template",
        template: {
          template_type: "generic",
          elements: [
            {
              title,
              image_url: media || undefined,
              subtitle: text || undefined,
              buttons: allButtons
            }
          ]
        }
      }
    ]
  };

  try {
    const response = await client.post(
      `/v1/channels/${channel}/messages`,
      payload
    );
    const data = response.data;

    const newMessage = await CreateMessageService({
      id: data.id,
      contactId: contact.id,
      body: title,
      ticketId,
      fromMe: true
    });

    return newMessage;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errBody = axios.isAxiosError(error)
      ? (error.response?.data ?? error.response?.headers)
      : undefined;
    logger.error(`SendCardMessageService: erro ao enviar card Hub: ${errMsg}`);
    if (errBody)
      logger.error(`Hub API response body: ${JSON.stringify(errBody)}`);
    throw error;
  }
};
