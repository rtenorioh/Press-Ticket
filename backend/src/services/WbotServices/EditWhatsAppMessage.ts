import AppError from "../../errors/AppError";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import OldMessage from "../../models/OldMessage";
import { logger } from "../../utils/logger";

const EditWhatsAppMessage = async (
  messageId: string,
  newBody: string
): Promise<Message> => {
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

  if (!newBody || newBody.trim() === "") {
    throw new AppError("O novo texto da mensagem não pode estar vazio.");
  }

  const { ticket } = message;

  const oldBody = message.body;

  let messageToEdit;
  try {
    messageToEdit = await GetWbotMessage(ticket, messageId);
  } catch (getMessageError: any) {
    logger.error(`Erro ao buscar mensagem para edição: ${getMessageError}`);
    throw new AppError("ERR_FETCH_WAPP_MSG_TO_EDIT");
  }

  try {
    const res = await messageToEdit.edit(newBody);

    if (res === null) {
      throw new Error("Não foi possível editar a mensagem. Ela pode ser muito antiga (mais de 15 minutos) ou não ser editável.");
    }

  } catch (err: any) {
    throw new AppError("ERR_EDITING_WAPP_MSG");
  }


  if (typeof oldBody === "string" && oldBody !== newBody) {

    const existingHistory = await OldMessage.findOne({
      where: {
        messageId: message.id,
        body: oldBody
      }
    });

    if (!existingHistory) {
      const newHistory = await OldMessage.create({
        messageId: message.id,
        body: oldBody
      });

    } else {
    }
  } else {
  }

  await message.update({
    body: newBody,
    isEdited: true,
    updatedAt: new Date()
  });

  const mostRecentMessage = await Message.findOne({
    where: { ticketId: ticket.id },
    order: [["updatedAt", "DESC"]]
  });

  if (mostRecentMessage && mostRecentMessage.id === messageId) {
    await ticket.update({ lastMessage: newBody });
    await ticket.reload();
  }

  await message.reload({
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      },
      {
        model: OldMessage,
        as: "oldMessages",
        separate: true,
        order: [["createdAt", "DESC"]]
      }
    ]
  });


  return message;
};

export default EditWhatsAppMessage;
