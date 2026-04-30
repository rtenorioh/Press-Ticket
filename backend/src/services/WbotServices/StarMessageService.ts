import AppError from "../../errors/AppError";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";

const StarWhatsAppMessage = async (messageId: string): Promise<void> => {
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
    const wbotMessage = await GetWbotMessage(message.ticket, messageId);
    await wbotMessage.star();
    await message.update({ isStarred: true });
  } catch (err) {
    logger.error(`[STAR] Erro ao favoritar mensagem: ${err}`);
    throw new AppError("ERR_STAR_WAPP_MSG");
  }
};

const UnstarWhatsAppMessage = async (messageId: string): Promise<void> => {
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
    const wbotMessage = await GetWbotMessage(message.ticket, messageId);
    await wbotMessage.unstar();
    await message.update({ isStarred: false });
  } catch (err) {
    logger.error(`[STAR] Erro ao desfavoritar mensagem: ${err}`);
    throw new AppError("ERR_UNSTAR_WAPP_MSG");
  }
};

export { StarWhatsAppMessage, UnstarWhatsAppMessage };
