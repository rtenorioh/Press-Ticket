import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";

interface PinMessageData {
  messageId: string;
  duration: number;
}

const resolveWbotMessage = async (message: Message) => {
  const ticket = message.ticket;
  const wbot = await GetTicketWbot(ticket);

  const contactNumber = ticket.contact.number;
  const chatId = `${contactNumber}@${ticket.isGroup ? "g" : "c"}.us`;

  for (const fromMe of [message.fromMe, !message.fromMe]) {
    try {
      const serializedId = `${fromMe}_${chatId}_${message.id}`;
      const wbotMsg = await wbot.getMessageById(serializedId);
      if (wbotMsg) return wbotMsg;
    } catch {
      // tenta próximo formato
    }
  }

  throw new AppError("ERR_FETCH_WAPP_MSG");
};

const PinWhatsAppMessage = async ({
  messageId,
  duration
}: PinMessageData): Promise<boolean> => {
  const message = await Message.findByPk(messageId, {
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new AppError("Mensagem não encontrada");
  }

  try {
    const wbotMessage = await resolveWbotMessage(message);
    const result = await wbotMessage.pin(duration);
    await message.update({ isPinned: true });
    return result;
  } catch (err) {
    logger.error(`[PIN] Erro ao fixar mensagem: ${err}`);
    throw new AppError("ERR_PIN_WAPP_MSG");
  }
};

const UnpinWhatsAppMessage = async (messageId: string): Promise<boolean> => {
  const message = await Message.findByPk(messageId, {
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new AppError("Mensagem não encontrada");
  }

  try {
    const wbotMessage = await resolveWbotMessage(message);
    const result = await wbotMessage.unpin();
    await message.update({ isPinned: false });
    return result;
  } catch (err) {
    logger.error(`[PIN] Erro ao desfixar mensagem: ${err}`);
    throw new AppError("ERR_UNPIN_WAPP_MSG");
  }
};

export { PinWhatsAppMessage, UnpinWhatsAppMessage };
