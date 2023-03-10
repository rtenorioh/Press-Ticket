import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import isQueueIdHistoryBlocked from "./isQueueIdHistoryBlocked";
import { Op } from "sequelize";

interface Request {
  ticketId: string;
  pageNumber?: string;
  userRequest?:string;
}

interface Response {
  messages: Message[];
  ticket: Ticket;
  count: number;
  hasMore: boolean;
}

const ListMessagesService = async ({
  pageNumber = "1",
  ticketId,
  userRequest
}: Request): Promise<Response> => {
  const ticket = await ShowTicketService(ticketId);

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }
  
  // await setMessagesAsRead(ticket);
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  console.log(userRequest)
  const isBlocked = await isQueueIdHistoryBlocked({userRequest});

  console.log(isBlocked)
  if (isBlocked === false) {

    const { count, rows: messages } = await Message.findAndCountAll({
      //where: { ticketId },
      //where: {contactid : ticket.contactId},
      limit,
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        },
        {
          model: Ticket,
          where: {
            contactId: ticket.contactId,
            whatsappId: ticket.whatsappId,
            queueId: {
              [Op.or]: [ticket.queueId, null],
            },
          },
          required: true,
        }
      ],
      offset,
      order: [["createdAt", "DESC"]]
    });

    const hasMore = count > offset + messages.length;
    return {
      messages: messages.reverse(),
      ticket,
      count,
      hasMore
    };
  } 
  else {


    const { count, rows: messages } = await Message.findAndCountAll({
      //where: { ticketId },
      //where: {contactid : ticket.contactId},
      limit,
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        },
        {
          model: Ticket,
          where: {
            contactId: ticket.contactId,
            whatsappId: ticket.whatsappId
          },
          required: true,
        }
      ],
      offset,
      order: [["createdAt", "DESC"]]
    });

    const hasMore = count > offset + messages.length;
    return {
      messages: messages.reverse(),
      ticket,
      count,
      hasMore
    };

  }

};

export default ListMessagesService;
