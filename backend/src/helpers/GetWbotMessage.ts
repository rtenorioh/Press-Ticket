import { Message as WbotMessage, Chat } from "whatsapp-web.js";
import AppError from "../errors/AppError";
import Ticket from "../models/Ticket";
import GetTicketWbot from "./GetTicketWbot";
import { logger } from "../utils/logger";

export const GetWbotMessage = async (
  ticket: Ticket,
  messageId: string
): Promise<WbotMessage> => {
  const wbot = await GetTicketWbot(ticket);

  if (!ticket.contact.number) {
    logger.error(`Número do contato não encontrado no ticket: ${ticket.id}`);
    throw new AppError("ERR_INVALID_CONTACT_NUMBER");
  }

  let chatId = ticket.contact.number;
  if (!chatId.includes("@")) {
    chatId = `${chatId}@${ticket.isGroup ? "g" : "c"}.us`;
  }

  let wbotChat: Chat;
  try {
    wbotChat = await wbot.getChatById(chatId);

    if (!wbotChat) {
      logger.error(`Chat não encontrado: ${chatId}`);
      throw new Error("Chat não encontrado");
    }
  } catch (getChatError: any) {
    logger.error(`Erro ao buscar chat ${chatId}: ${getChatError.message}`);

    try {
      const directMessage = await wbot.getMessageById(messageId);

      if (directMessage) {
        return directMessage;
      }
    } catch (directError: any) {
      logger.error(
        `Falha ao buscar mensagem diretamente: ${directError.message}`
      );
    }

    throw new AppError("ERR_CHAT_NOT_FOUND");
  }

  let limit = ticket.isGroup ? 50 : 20;
  const maxLimit = ticket.isGroup ? 300 : 100;

  const fetchWbotMessagesGradually = async (): Promise<void | WbotMessage> => {
    try {
      const chatMessages = await wbotChat.fetchMessages({ limit });

      const msgFound = chatMessages.find(
        (msg: WbotMessage) => msg.id.id === messageId
      );

      if (!msgFound && limit < maxLimit) {
        limit += ticket.isGroup ? 50 : 20;
        return fetchWbotMessagesGradually();
      }

      return msgFound;
    } catch (fetchError) {
      logger.warn(
        `[GetWbotMessage] fetchMessages indisponível, usando fallback: ${fetchError}`
      );
      return undefined;
    }
  };

  try {
    let msgFound = await fetchWbotMessagesGradually();

    if (!msgFound) {
      // Fallback: tenta buscar a mensagem diretamente pelo ID serializado
      for (const fromMe of [false, true]) {
        try {
          const serializedId = `${fromMe}_${chatId}_${messageId}`;
          const directMsg = await wbot.getMessageById(serializedId);
          if (directMsg) {
            msgFound = directMsg;
            break;
          }
        } catch {
          // ignora falhas no fallback
        }
      }
    }

    if (!msgFound) {
      const errorMsg = ticket.isGroup
        ? `Não foi possível encontrar a mensagem nas últimas ${maxLimit} mensagens do grupo`
        : `Não foi possível encontrar a mensagem nas últimas ${maxLimit} mensagens`;

      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    return msgFound;
  } catch (err) {
    logger.error(`GetWbotMessage erro: ${err}`);
    throw new AppError("ERR_FETCH_WAPP_MSG");
  }
};

export default GetWbotMessage;
