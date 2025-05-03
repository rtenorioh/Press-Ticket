import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import { logger } from "../utils/logger";
import GetTicketWbot from "./GetTicketWbot";

const SetTicketMessagesAsRead = async (ticket: Ticket): Promise<void> => {
  const unreadMessages = await Message.findAll({
    where: {
      ticketId: ticket.id,
      read: false,
      fromMe: false
    }
  });

  await Message.update(
    { read: true, ack: 3 },
    {
      where: {
        ticketId: ticket.id,
        read: false,
        fromMe: false
      }
    }
  );

  await ticket.update({ unreadMessages: 0 });
  
  if (unreadMessages.length > 0) {
    
    const io = getIO();
    
    unreadMessages.forEach(message => {
      io.to(ticket.id.toString()).emit("appMessage", {
        action: "update",
        message: {
          ...message.toJSON(),
          read: true,
          ack: 3
        }
      });
    });
  }

  try {
    const wbot = await GetTicketWbot(ticket);
    await wbot.sendSeen(
      `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`
    );
  } catch (err) {
    logger.warn(
      `Could not mark messages as read. Maybe whatsapp session disconnected? Err: ${err}`
    );
  }

  const io = getIO();
  io.to(ticket.status).to("notification").emit("ticket", {
    action: "updateUnread",
    ticketId: ticket.id
  });
};

export default SetTicketMessagesAsRead;
