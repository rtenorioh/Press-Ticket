import { Request, Response } from "express";
import { Op } from "sequelize";
import formatBody from "../helpers/Mustache";
import { getIO } from "../libs/socket";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import ShowQueueService from "../services/QueueService/ShowQueueService";
import CheckOpenTicketsService from "../services/TicketServices/CheckOpenTicketsService";
import CloseTicketsService from "../services/TicketServices/CloseTicketsService";
import CreateTicketService from "../services/TicketServices/CreateTicketService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import ListTicketsService from "../services/TicketServices/ListTicketsService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  status: string;
  startDate?: string;
  endDate?: string;
  showAll: string;
  withUnreadMessages: string;
  queueIds: string;
  all?: string;
};

interface TicketData {
  contactId: number;
  status: string;
  queueId: number;
  userId: number;
  transf: boolean;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    startDate,
    endDate,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    withUnreadMessages,
    all
  } = req.query as IndexQuery;

  const userId = req.user.id;
  const isAdmin = req.user.profile === "admin";

  let queueIds: number[] = [];

  if (queueIdsStringified) {
    try {
      // Verifica se já é um array
      if (Array.isArray(queueIdsStringified)) {
        queueIds = queueIdsStringified.map(Number);
      } 
      // Verifica se é uma string com valores separados por vírgula
      else if (typeof queueIdsStringified === 'string' && queueIdsStringified.includes(',')) {
        queueIds = queueIdsStringified.split(',').map(id => Number(id.trim()));
      }
      // Tenta fazer o parse como JSON
      else {
        const parsed = JSON.parse(queueIdsStringified);
        queueIds = Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
      }
    } catch (err) {
      // Se houver erro no parse, tenta converter diretamente para número
      const queueId = Number(queueIdsStringified);
      if (!isNaN(queueId)) {
        queueIds = [queueId];
      }
    }
  }

  // Filtra valores inválidos
  queueIds = queueIds.filter(id => !isNaN(id) && id > 0);

  const { tickets, count, hasMore } = await ListTicketsService({
    searchParam,
    pageNumber,
    status,
    startDate,
    endDate,
    showAll,
    isAdmin,
    userId,
    queueIds,
    withUnreadMessages,
    all
  });

  return res.status(200).json({ tickets, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, status, userId, queueId }: TicketData = req.body;

  const ticket = await CreateTicketService({
    contactId,
    status,
    userId,
    queueId
  });

  const io = getIO();
  io.to(ticket.status).emit("ticket", {
    action: "update",
    ticket
  });

  return res.status(200).json(ticket);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;

  const contact = await ShowTicketService(ticketId);

  return res.status(200).json(contact);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const ticketData: TicketData = req.body;

  const { ticket } = await UpdateTicketService({
    ticketData,
    ticketId
  });

  if (ticketData.transf) {
    const { greetingMessage } = await ShowQueueService(ticketData.queueId);
    if (greetingMessage) {
      const msgtxt = formatBody(`\u200e${greetingMessage}`);
      await SendWhatsAppMessage({ body: msgtxt, ticket });
    }
  }

  if (ticket.status === "closed" && ticket.isGroup === false) {
    const whatsapp = await ShowWhatsAppService(ticket.whatsappId);

    const { farewellMessage } = whatsapp;

    if (farewellMessage) {
      await SendWhatsAppMessage({
        body: formatBody(`\u200e${farewellMessage}`, ticket),
        ticket
      });
    }
  }

  return res.status(200).json(ticket);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;

  const ticket = await DeleteTicketService(ticketId);

  const io = getIO();
  io.to(ticket.status).to(ticketId).to("notification").emit("ticket", {
    action: "delete",
    ticketId: +ticketId
  });

  return res.status(200).json({ message: "ticket deleted" });
};

export const checkOpenTickets = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;

  try {
    const contactIdNumber = parseInt(contactId, 10);

    if (Number.isNaN(contactIdNumber)) {
      return res.status(400).json({ error: "Invalid contactId" });
    }

    const openTicket = await CheckOpenTicketsService(contactIdNumber);

    if (openTicket) {
      return res.status(200).json({
        hasOpenTicket: true,
        ticket: {
          id: openTicket.id,
          status: openTicket.status,
          user: openTicket.user
            ? {
                id: openTicket.user.id,
                name: openTicket.user.name
              }
            : null
        }
      });
    }

    return res.status(200).json({ hasOpenTicket: false });
  } catch (err) {
    console.error("Erro ao verificar tickets abertos:", err.message);
    return res
      .status(500)
      .json({ error: "Erro ao verificar tickets abertos." });
  }
};

export const closeTickets = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { status } = req.query;
  const userId = parseInt(req.user.id);

  try {
    let whereCondition = {};

    if (status === "open") {
      whereCondition = { status: "open" };
    } else if (status === "pending") {
      whereCondition = { status: "pending" };
    } else if (status === "all") {
      whereCondition = {
        status: {
          [Op.or]: ["open", "pending"]
        }
      };
    }

    const tickets = await Ticket.findAll({
      where: whereCondition,
      include: [
        {
          model: Contact,
          as: "contact"
        }
      ]
    });

    if (!tickets.length) {
      return res.status(400).json({ error: "No tickets found to close" });
    }

    await CloseTicketsService({
      status: "closed",
      userId,
      tickets
    });

    const io = getIO();
    io.emit("ticket:update", {
      action: "update",
      tickets: tickets.map(ticket => ticket.id)
    });

    return res.status(200).json({
      message: "Tickets closed successfully",
      count: tickets.length
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
