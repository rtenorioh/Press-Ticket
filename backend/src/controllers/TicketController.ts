import { Request, Response } from "express";
import { Op } from "sequelize";
import formatBody from "../helpers/Mustache";
import { getIO } from "../libs/socket";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import CheckOpenTicketsService from "../services/TicketServices/CheckOpenTicketsService";
import CloseTicketsService from "../services/TicketServices/CloseTicketsService";
import CreateTicketService from "../services/TicketServices/CreateTicketService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import ListTicketsService from "../services/TicketServices/ListTicketsService";
import ShowQueueService from "../services/QueueService/ShowQueueService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import CountTicketsService from "../services/TicketServices/CountTicketsService";
import GetClientIp from "../helpers/GetClientIp";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    profile: string;
  };
}

interface TicketData {
  contactId: number;
  status: string;
  queueId: number;
  userId: number;
  transf: boolean;
  whatsappId?: number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const pageNumber = req.query.pageNumber as string;
    const status = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const searchParam = req.query.searchParam as string;
    const showAll = req.query.showAll as string;
    const queueIdsStringified = req.query.queueIds as string;
    const channelIdsStringified = req.query.channelIds as string;
    const withUnreadMessages = req.query.withUnreadMessages as string;
    const all = req.query.all as string;
    const isGroup = req.query.isGroup as string;

    let userId = "0";
    let isAdmin = false;

    const isApiRequest = req.path.startsWith('/v1/');
    if (isApiRequest || 'apiToken' in req) {
      isAdmin = true;
    } 

    else if (req.user) {
      userId = req.user.id.toString();
      isAdmin = req.user.profile === "admin" || req.user.profile === "masteradmin";
    } 

    else {
      return res.status(401).json({ error: "Não autorizado" });
    }

    let queueIds: number[] = [];
    let channelIds: number[] = [];

    if (queueIdsStringified) {
      try {
        queueIds = Array.isArray(queueIdsStringified)
          ? queueIdsStringified.map(Number)
          : JSON.parse(queueIdsStringified);
      } catch (error) {
        console.error("Erro ao fazer JSON.parse:", error.message);
        return res.status(400).json({ error: "Formato JSON inválido para queueIds" });
      }
    }

    if (channelIdsStringified) {
      try {
        channelIds = Array.isArray(channelIdsStringified)
          ? channelIdsStringified.map(Number)
          : JSON.parse(channelIdsStringified);
      } catch (error) {
        console.error("Erro ao fazer JSON.parse:", error.message);
        return res.status(400).json({ error: "Formato JSON inválido para channelIds" });
      }
    }

    if ((startDate && !endDate) || (!startDate && endDate)) {
      return res.status(400).json({ error: "Ambas as datas de início e fim devem ser fornecidas" });
    }

    if (startDate && endDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ error: "Formato de data inválido. Use YYYY-MM-DD" });
      }
    }

    try {
      const apiUserId = isApiRequest ? undefined : userId;
      
      const { tickets, count, hasMore } = await ListTicketsService({
        searchParam,
        pageNumber,
        status,
        startDate,
        endDate,
        showAll,
        isAdmin,
        userId: apiUserId,
        queueIds,
        channelIds,
        withUnreadMessages,
        all,
        isGroup
      });

      return res.status(200).json({ tickets, count, hasMore });
    } catch (serviceError) {
      console.error("Erro no serviço de listagem de tickets:", serviceError);
      return res.status(500).json({ error: "Erro ao processar a listagem de tickets" });
    }
  } catch (error) {
    console.error("Erro ao listar tickets:", error);
    return res.status(500).json({ error: "Erro interno ao listar tickets" });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, status, userId, queueId, whatsappId }: TicketData = req.body;

  const ticket = await CreateTicketService({
    contactId,
    status,
    userId,
    queueId,
    whatsappId
  });

  const logUserId = req.user?.id || 1;
  const contact = await Contact.findByPk(contactId);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.CREATE,
    description: `Ticket #${ticket.id} criado para o contato ${contact?.name || contactId}`,
    entityType: EntityTypes.TICKET,
    entityId: ticket.id,
    additionalData: { status, queueId, whatsappId }
  });

  const io = getIO();
  io.to(ticket.status)
    .to("notification")
    .to(ticket.id.toString())
    .emit("ticket", {
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
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);

  // Buscar ticket antes da atualização para comparar
  const ticketBefore = await Ticket.findByPk(ticketId, {
    include: [{ association: "queue" }, { association: "user" }]
  });

  const { ticket } = await UpdateTicketService({
    ticketData,
    ticketId
  });

  // LOG: Aceitar ticket (pending → open)
  if (ticketBefore && ticketBefore.status === 'pending' && ticketData.status === 'open') {
    try {
      await createActivityLog({
        userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
        action: ActivityActions.ACCEPT,
        description: `Ticket #${ticketId} aceito`,
        entityType: EntityTypes.TICKET,
        entityId: parseInt(ticketId),
        ip: clientIp,
        additionalData: {
          previousUserId: ticketBefore.userId,
          newUserId: ticketData.userId || logUserId,
          contactId: ticket.contactId
        }
      });
    } catch (error) {
      console.error('Erro ao criar log de aceitar ticket:', error);
    }
  }

  // LOG: Transferência de usuário
  if (ticketBefore && ticketBefore.userId && ticketData.userId && 
      ticketBefore.userId !== ticketData.userId) {
    try {
      const User = require("../models/User").default;
      const oldUser = await User.findByPk(ticketBefore.userId);
      const newUser = await User.findByPk(ticketData.userId);
      
      await createActivityLog({
        userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
        action: ActivityActions.TRANSFER,
        description: `Ticket #${ticketId} transferido de ${oldUser?.name || 'N/A'} para ${newUser?.name || 'N/A'}`,
        entityType: EntityTypes.TICKET,
        entityId: parseInt(ticketId),
        ip: clientIp,
        additionalData: {
          fromUserId: ticketBefore.userId,
          toUserId: ticketData.userId,
          fromUserName: oldUser?.name,
          toUserName: newUser?.name,
          contactId: ticket.contactId
        }
      });
    } catch (error) {
      console.error('Erro ao criar log de transferência de usuário:', error);
    }
  }

  // LOG: Transferência de setor
  if (ticketBefore && ticketBefore.queueId !== undefined && 
      ticketData.queueId !== undefined && ticketBefore.queueId !== ticketData.queueId) {
    try {
      const oldQueue = ticketBefore.queueId ? await ShowQueueService(ticketBefore.queueId) : null;
      const newQueue = ticketData.queueId ? await ShowQueueService(ticketData.queueId) : null;
      
      await createActivityLog({
        userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
        action: ActivityActions.TRANSFER,
        description: `Ticket #${ticketId} transferido de ${oldQueue?.name || 'Sem setor'} para ${newQueue?.name || 'Sem setor'}`,
        entityType: EntityTypes.TICKET,
        entityId: parseInt(ticketId),
        ip: clientIp,
        additionalData: {
          fromQueueId: ticketBefore.queueId,
          toQueueId: ticketData.queueId,
          fromQueueName: oldQueue?.name,
          toQueueName: newQueue?.name,
          contactId: ticket.contactId
        }
      });
    } catch (error) {
      console.error('Erro ao criar log de transferência de setor:', error);
    }
  }

  // LOG: Mover para aguardando
  if (ticketBefore && ticketBefore.status !== 'pending' && ticketData.status === 'pending') {
    try {
      await createActivityLog({
        userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
        action: ActivityActions.UPDATE,
        description: `Ticket #${ticketId} movido para aguardando`,
        entityType: EntityTypes.TICKET,
        entityId: parseInt(ticketId),
        ip: clientIp,
        additionalData: {
          previousStatus: ticketBefore.status,
          previousUserId: ticketBefore.userId,
          contactId: ticket.contactId
        }
      });
    } catch (error) {
      console.error('Erro ao criar log de mover para aguardando:', error);
    }
  }

  // LOG: Fechar ticket
  if (ticket.status === "closed" && (!ticketBefore || ticketBefore.status !== "closed")) {
    try {
      await createActivityLog({
        userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
        action: ActivityActions.CLOSE,
        description: `Ticket #${ticketId} fechado`,
        entityType: EntityTypes.TICKET,
        entityId: parseInt(ticketId),
        ip: clientIp,
        additionalData: {
          previousStatus: ticketBefore?.status,
          contactId: ticket.contactId
        }
      });
    } catch (error) {
      console.error('Erro ao criar log de fechar ticket:', error);
    }
  }

  // LOG: Reabrir ticket
  if (ticketBefore && ticketBefore.status === "closed" && ticketData.status === "open") {
    try {
      await createActivityLog({
        userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
        action: ActivityActions.REOPEN,
        description: `Ticket #${ticketId} reaberto`,
        entityType: EntityTypes.TICKET,
        entityId: parseInt(ticketId),
        ip: clientIp,
        additionalData: {
          contactId: ticket.contactId
        }
      });
    } catch (error) {
      console.error('Erro ao criar log de reabrir ticket:', error);
    }
  }

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

  const ticketToDelete = await ShowTicketService(ticketId);
  
  const ticket = await DeleteTicketService(ticketId);
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.DELETE,
    description: `Ticket #${ticketId} excluído`,
    entityType: EntityTypes.TICKET,
    entityId: parseInt(ticketId),
    ip: clientIp,
    additionalData: {
      contactId: ticketToDelete.contactId,
      status: ticketToDelete.status,
      lastMessage: ticketToDelete.lastMessage
    }
  });

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
          createdAt: openTicket.createdAt,
          user: openTicket.user
            ? {
                id: openTicket.user.id,
                name: openTicket.user.name
              }
            : null,
          whatsapp: openTicket.whatsapp
            ? {
                id: openTicket.whatsapp.id,
                name: openTicket.whatsapp.name
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
  const { status, groupsOnly } = req.query;
  
  let userId: number;
  
  const isApiRequest = req.path.startsWith('/v1/');
  if (isApiRequest || 'apiToken' in req) {
    userId = 1;
  } 
  else if (req.user) {
    userId = parseInt(req.user.id);
  } 
  else {
    return res.status(401).json({ error: "Não autorizado" });
  }

  try {
    let whereCondition: any = {};

    if (status === "open") {
      whereCondition = { status: "open" };
    } else if (status === "pending") {
      whereCondition = { status: "pending" };
    } else {
      whereCondition = {
        status: {
          [Op.or]: ["open", "pending"]
        }
      };
    }

    if (groupsOnly === "true") {
      whereCondition.isGroup = true;
    } else if (groupsOnly === "false") {
      whereCondition.isGroup = false;
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

    if (!tickets || !tickets.length) {
      return res.status(404).json({ 
        error: "ERR_NO_TICKET_FOUND",
        message: `Nenhum ticket ${status ? `com status ${status}` : ''} encontrado para fechar` 
      });
    }

    await CloseTicketsService({
      status: "closed",
      userId,
      tickets
    });

    // LOG: Fechar múltiplos tickets
    const clientIp = GetClientIp(req);
    try {
      await createActivityLog({
        userId,
        action: ActivityActions.CLOSE,
        description: `${tickets.length} ticket(s) fechado(s) em massa`,
        entityType: EntityTypes.TICKET,
        entityId: 0,
        ip: clientIp,
        additionalData: {
          ticketCount: tickets.length,
          statusFilter: status || 'all',
          ticketIds: tickets.slice(0, 10).map(t => t.id)
        }
      });
    } catch (error) {
      console.error('Erro ao criar log de fechar tickets em massa:', error);
    }

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
    console.error("Erro ao fechar tickets:", err);
    return res.status(500).json({ error: "Error closing tickets" });
  }
};

export const count = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { queueIds, showAll } = req.query;
    
    let userId: number | null = null;
    let isAdmin = false;
    
    const isApiRequest = req.path.startsWith('/v1/');
    if (isApiRequest || 'apiToken' in req) {
      isAdmin = true;
    } else {
      userId = parseInt(req.user.id);
      isAdmin = req.user.profile === "admin" || req.user.profile === "masteradmin";
    }
    
    let queueIdsArray: number[] = [];
    if (queueIds) {
      if (typeof queueIds === 'string') {
        queueIdsArray = queueIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      } else if (Array.isArray(queueIds)) {
        queueIdsArray = queueIds.map(id => parseInt(id as string)).filter(id => !isNaN(id));
      }
    }
    
    const showAllTickets = showAll === "true" || isAdmin;
    
    
    const counts = await CountTicketsService({
      queueIds: queueIdsArray,
      showAll: showAllTickets,
      userId
    });
    
    return res.status(200).json(counts);
  } catch (err: any) {
    console.error(`[BACK_COUNT_ERROR] Erro ao contar tickets:`, err);
    return res.status(500).json({ error: err.message });
  }
};