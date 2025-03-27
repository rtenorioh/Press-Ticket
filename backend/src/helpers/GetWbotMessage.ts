import { Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../errors/AppError";
import Ticket from "../models/Ticket";
import GetTicketWbot from "./GetTicketWbot";

export const GetWbotMessage = async (
  ticket: Ticket,
  messageId: string
): Promise<WbotMessage> => {
  const wbot = await GetTicketWbot(ticket);

  const wbotChat = await wbot.getChatById(
    `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`
  );

  let limit = ticket.isGroup ? 50 : 20;
  const maxLimit = ticket.isGroup ? 300 : 100;

  const fetchWbotMessagesGradually = async (): Promise<void | WbotMessage> => {
    try {
      const chatMessages = await wbotChat.fetchMessages({ limit });

      const msgFound = chatMessages.find(msg => msg.id.id === messageId);

      if (!msgFound && limit < maxLimit) {
        limit += ticket.isGroup ? 50 : 20;
        return fetchWbotMessagesGradually();
      }

      return msgFound;
    } catch (fetchError) {
      console.error("Error fetching messages:", fetchError);
      return undefined;
    }
  };

  try {
    const msgFound = await fetchWbotMessagesGradually();

    if (!msgFound) {
      const errorMsg = ticket.isGroup
        ? `Não foi possível encontrar a mensagem nas últimas ${maxLimit} mensagens do grupo`
        : `Não foi possível encontrar a mensagem nas últimas ${maxLimit} mensagens`;

      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    return msgFound;
  } catch (err) {
    console.error("Error in GetWbotMessage:", err);
    throw new AppError("ERR_FETCH_WAPP_MSG");
  }
};

export default GetWbotMessage;