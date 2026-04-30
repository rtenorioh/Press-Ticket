import { showHubToken } from "../../helpers/showHubToken";
import Contact from "../../models/Contact";
import CreateMessageService from "./CreateHubMessageService";
import { logger } from "../../utils/logger";
import { HubCardButton } from "./SendCardMessageHubService";

require("dotenv").config();
const { Client, CardContent, CarouselContent } = require("notificamehubsdk");

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
  connection: any
): Promise<any> => {
  if (connection.type === "wwebjs") {
    throw new Error("CarouselContent não é suportado em canais wwebjs.");
  }

  if (!Array.isArray(cards) || cards.length < 2) {
    throw new Error("CarouselContent requer pelo menos 2 cards.");
  }

  const missingTitle = cards.findIndex(c => !c.title?.trim());
  if (missingTitle !== -1) {
    throw new Error(`Card ${missingTitle + 1} está sem título. Todos os cards precisam de título.`);
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
    logger.error("CarouselContent: nenhum canal compatível encontrado. Requer facebook, instagram ou telegram.");
    throw new Error("CarouselContent requer canal facebook, instagram ou telegram. Nenhum desses IDs foi encontrado no contato.");
  }

  const cardInstances = cards.map(card =>
    new CardContent(
      card.title,
      card.media ?? "",
      card.text ?? "",
      card.buttons ?? [],
      card.quickReplyButtons ?? []
    )
  );

  const content = new CarouselContent(cardInstances, cardWidth, quickReplyButtons);

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
      logger.error(`Erro ao parsear resposta Hub carousel: ${error} | Response: ${JSON.stringify(response)}`);
      data = response;
    }

    const newMessage = await CreateMessageService({
      id: data.id,
      contactId: contact.id,
      body: `[Carrossel] ${cards[0].title}`,
      ticketId,
      fromMe: true
    });

    return newMessage;
  } catch (error) {
    logger.error(`Erro ao enviar carousel Hub: ${error}`);
    throw error;
  }
};
