import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import GetTicketWbot from "../../helpers/GetTicketWbot";

interface Request {
  ticketId: string | number;
}

const MarkMessagesAsReadService = async ({
  ticketId
}: Request): Promise<void> => {
  const io = getIO();
  
  const unreadMessages = await Message.findAll({
    where: {
      ticketId,
      read: false,
      fromMe: false
    },
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      }
    ]
  });

  if (unreadMessages.length === 0) {
    return;
  }

  const ticket = await Ticket.findByPk(ticketId, { include: ["contact"] });

  if (!ticket) {
    throw new Error("Ticket não encontrado");
  }

  try {
    const wbot = await GetTicketWbot(ticket);
    
    const chat = await wbot.getChatById(`${ticket.contact.number}@c.us`);
    await chat.sendSeen();
    
    for (const message of unreadMessages) {
      await message.update({ read: true, ack: 3 });
      
      io.to(message.ticketId.toString()).emit("appMessage", {
        action: "update",
        message
      });
    }
    
  } catch (error) {
    console.error("Erro ao marcar mensagens como lidas:", error);
  }
};

export default MarkMessagesAsReadService;
