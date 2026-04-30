import { Op } from "sequelize";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import AppError from "../../errors/AppError";

interface Request {
  ticketId: string;
  query: string;
  pageNumber?: string;
}

interface SearchResultMessage {
  id: string;
  body: string;
  fromMe: boolean;
  createdAt: Date;
  contactName: string | null;
}

interface Response {
  messages: SearchResultMessage[];
  totalCount: number;
  hasMore: boolean;
}

const SearchMessagesInTicketService = async ({
  ticketId,
  query,
  pageNumber = "1"
}: Request): Promise<Response> => {
  if (!query || query.trim().length < 2) {
    throw new AppError("A consulta deve ter pelo menos 2 caracteres");
  }

  const ticket = await ShowTicketService(ticketId);

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const limit = 10;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: messages } = await Message.findAndCountAll({
    where: {
      body: { [Op.like]: `%${query}%` }
    },
    include: [
      "contact",
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
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });

  return {
    messages: messages.map(msg => ({
      id: msg.id,
      body: msg.body,
      fromMe: msg.fromMe,
      createdAt: msg.createdAt,
      contactName: (msg as any).contact?.name || null
    })),
    totalCount: count,
    hasMore: count > offset + messages.length
  };
};

export default SearchMessagesInTicketService;
