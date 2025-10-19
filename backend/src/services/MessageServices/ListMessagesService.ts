import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import OldMessage from "../../models/OldMessage";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import MessageReaction from "../../models/MessageReaction";

interface Request {
  ticketId: string;
  pageNumber?: string;
}

interface Response {
  messages: Message[];
  ticket: Ticket;
  count: number;
  hasMore: boolean;
}

const ListMessagesService = async ({
  pageNumber = "1",
  ticketId
}: Request): Promise<Response> => {
  const ticket = await ShowTicketService(ticketId);

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: messages } = await Message.findAndCountAll({
    limit,
    include: [
      "contact",
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      },
      {
        model: OldMessage,
        as: "oldMessages",
        separate: true,
        order: [["createdAt", "DESC"]]
      },
      {
        model: Ticket,
        where: {
          contactId: ticket.contactId,
          whatsappId: ticket.whatsappId,
          queueId: {
            [Op.or]: [ticket.queueId, null]
          }
        },
        required: true
      }
    ],
    offset,
    order: [["createdAt", "DESC"]]
  });

  const hasMore = count > offset + messages.length;

  try {
    const ids = messages.map(m => m.id);
    if (ids.length > 0) {
      const allReacts = await MessageReaction.findAll({
        where: { messageId: ids }
      });

      const countsMap: Record<string, Record<string, number>> = {};
      const sendersMap: Record<string, Record<string, string[]>> = {};

      for (const r of allReacts) {
        const mid = (r as any).messageId as string;
        const emoji = (r as any).emoji as string;
        const senderId = (r as any).senderId as string;
        if (!countsMap[mid]) countsMap[mid] = {};
        if (!sendersMap[mid]) sendersMap[mid] = {};
        if (!countsMap[mid][emoji]) countsMap[mid][emoji] = 0;
        if (!sendersMap[mid][emoji]) sendersMap[mid][emoji] = [];
        countsMap[mid][emoji] += 1;
        sendersMap[mid][emoji].push(senderId);
      }

      for (const m of messages) {
        const mid = m.id;
        const counts = countsMap[mid] || {};
        const senders = sendersMap[mid] || {};
        (m as any).setDataValue("reactions", counts);
        (m as any).setDataValue("reactionSenders", senders);
      }
    }
  } catch (err) {
  }

  return {
    messages: messages.reverse(),
    ticket,
    count,
    hasMore
  };
};

export default ListMessagesService;
