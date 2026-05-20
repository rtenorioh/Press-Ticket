import AppError from "../../errors/AppError";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";

interface ForwardMessageData {
  messageId: string;
  targetChatId: string;
  ticket: Ticket;
}

const ForwardWhatsAppMessage = async ({
  messageId,
  targetChatId,
  ticket: _ticket
}: ForwardMessageData): Promise<void> => {
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
    throw new AppError("No message found with this ID.");
  }

  let formattedChatId = targetChatId;
  if (!formattedChatId.includes("@")) {
    formattedChatId = `${formattedChatId}@c.us`;
  }

  try {
    const wbotMessage = await GetWbotMessage(message.ticket, messageId);
    await wbotMessage.forward(formattedChatId);
  } catch (err) {
    logger.error(
      `[FORWARD] Erro ao encaminhar mensagem via API nativa: ${err}`
    );
    throw new AppError("ERR_FORWARD_WAPP_MSG");
  }
};

export default ForwardWhatsAppMessage;
