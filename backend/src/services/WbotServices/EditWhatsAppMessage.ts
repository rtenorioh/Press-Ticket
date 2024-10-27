import AppError from "../../errors/AppError";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

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

  // const hasBody = newBody
  //   ? formatBody(newBody as string, message.ticket)
  //   : undefined;

  // if (!hasBody) {
  //   throw new AppError("No message found with this newBody.");
  // }
  const { ticket } = message;

  const messageToEdit = await GetWbotMessage(ticket, messageId);

  try {
    const res = await messageToEdit.edit(newBody);
    if (res === null) throw new Error("Can't edit");
  } catch (err) {
    throw new AppError("ERR_EDITING_WAPP_MSG");
  }

  // const mostRecentMessage = await Message.findOne({
  //   where: { ticketId: ticket.id },
  //   order: [["updatedAt", "DESC"]]
  // });

  // if (mostRecentMessage && mostRecentMessage.id === messageId) {
  //   await ticket.update({ lastMessage: newBody });
  // }

  return message;
};

export default EditWhatsAppMessage;
