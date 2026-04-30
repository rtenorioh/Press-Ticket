import { Location, Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";

interface SendLocationData {
  ticket: Ticket;
  latitude: number;
  longitude: number;
  description?: string;
  address?: string;
}

const SendLocationService = async ({
  ticket,
  latitude,
  longitude,
  description,
  address
}: SendLocationData): Promise<WbotMessage> => {
  if (!latitude || !longitude) {
    throw new AppError("Latitude e longitude são obrigatórios");
  }

  if (latitude < -90 || latitude > 90) {
    throw new AppError("Latitude inválida (deve estar entre -90 e 90)");
  }

  if (longitude < -180 || longitude > 180) {
    throw new AppError("Longitude inválida (deve estar entre -180 e 180)");
  }

  try {
    const wbot = await GetTicketWbot(ticket);

    let chatId = ticket.contact.number!;
    if (!chatId.includes("@")) {
      chatId = `${chatId}@${ticket.isGroup ? "g" : "c"}.us`;
    }

    const location = new Location(latitude, longitude, {
      name: description || undefined,
      address: address || undefined
    });

    const chat = await wbot.getChatById(chatId);
    await chat.sendStateTyping();
    await new Promise(resolve => setTimeout(resolve, 400));

    const sentMessage = await wbot.sendMessage(chatId, location);

    await ticket.update({
      lastMessage: `📍 Localização: ${description || `${latitude}, ${longitude}`}`
    });
    await ticket.reload();

    return sentMessage;
  } catch (err) {
    logger.error(`[LOCATION] Erro ao enviar localização: ${err}`);
    throw new AppError("ERR_SENDING_LOCATION");
  }
};

export default SendLocationService;
