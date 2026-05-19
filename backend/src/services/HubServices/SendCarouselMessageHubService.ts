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
import { HubCardButton } from "./SendCardMessageHubService";
import { logger } from "../../utils/logger";

require("dotenv").config();

export interface HubCarouselCard {
  title: string;
  media?: string;
  text?: string;
  buttons?: HubCardButton[];
  quickReplyButtons?: HubCardButton[];
}

export const SendCarouselMessageService = async (
  cards: HubCarouselCard[],
  cardWidth: string,
  quickReplyButtons: HubCardButton[],
  ticketId: number,
  contact: Contact,
  connection: Whatsapp
): Promise<Message | undefined> => {
  if (connection.type === "wwebjs") {
    throw new Error("Envio de carrossel não suportado neste canal.");
  }

  if (!Array.isArray(cards) || cards.length < 2) {
    throw new Error("O carrossel requer pelo menos 2 cards.");
  }

  const missingTitle = cards.findIndex(c => !c.title?.trim());
  if (missingTitle !== -1) {
    throw new Error(
      `Card ${missingTitle + 1} está sem título. Todos os cards precisam de título.`
    );
  }

  const channel = resolveChannel(contact);
  if (!channel || channel === "webchat") {
    logger.error(
      "SendCarouselMessageService: canal incompatível para envio de carrossel."
    );
    throw new Error("Envio de carrossel não suportado neste canal.");
  }

  const contactId = resolveContactId(contact, channel);
  if (!contactId) {
    throw new Error(
      `SendCarouselMessageService: ID do destinatário não encontrado para canal ${channel}`
    );
  }

  const elements = cards.map(card => ({
    title: card.title,
    image_url: card.media || undefined,
    subtitle: card.text || undefined,
    buttons: [
      ...(card.buttons ?? []).map(b => ({
        type: "web_url",
        url: b.url || "#",
        title: b.label
      })),
      ...(card.quickReplyButtons ?? []).map(b => ({
        type: "web_url",
        url: b.url || "#",
        title: b.label
      }))
    ]
  }));

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
          elements
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
      body: `[Carrossel] ${cards[0].title}`,
      ticketId,
      fromMe: true
    });

    return newMessage;
  } catch (error) {
    logger.error(
      `SendCarouselMessageService: erro ao enviar carousel Hub: ${error}`
    );
    throw error;
  }
};
