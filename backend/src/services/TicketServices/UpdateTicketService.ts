import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import ShowTicketService from "./ShowTicketService";
import EmitTicketCounterService from "./EmitTicketCounterService";
import { NotifyQueueUsersService } from "../WbotServices/NotifyQueueUsersService";
import { logger } from "../../utils/logger";

interface TicketData {
  status?: string;
  userId?: number;
  queueId?: number | null;
  whatsappId?: number;
}

interface Request {
  ticketData: TicketData;
  ticketId: string | number;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId
}: Request): Promise<Response> => {
  const { status, userId, queueId, whatsappId } = ticketData;

  const ticket = await ShowTicketService(ticketId);
  if (ticket.status === "open") {
    await SetTicketMessagesAsRead(ticket);
  }

  if (whatsappId && ticket.whatsappId !== whatsappId) {
    await CheckContactOpenTickets(ticket.contactId, whatsappId);
  }

  const oldStatus = ticket.status;
  const oldUserId = ticket.user?.id;
  const oldQueueId = ticket.queueId;

  if (oldStatus === "closed") {
    await CheckContactOpenTickets(ticket.contact.id, ticket.whatsappId);
  }

  await ticket.update({
    status,
    queueId,
    userId
  });

  if (whatsappId) {
    await ticket.update({
      whatsappId
    });
  }

  await ticket.reload();

  const io = getIO();

  if (ticket.status !== oldStatus || ticket.user?.id !== oldUserId) {
    io.to(oldStatus).emit("ticket", {
      action: "delete",
      ticketId: ticket.id
    });
  }

  io.to(ticket.status)
    .to("notification")
    .to(ticketId.toString())
    .emit("ticket", {
      action: "update",
      ticket
    });

  const timestamp = new Date().toISOString();

  try {
    await EmitTicketCounterService();
  } catch (err) {
    logger.error(`Erro ao emitir contadores após atualizar ticket: ${err}`);
  }

  // Notificar usuários do setor quando queueId é atribuído/alterado
  if (ticket.queueId && ticket.queueId !== oldQueueId && ticket.whatsappId) {
    NotifyQueueUsersService(ticket).catch((err: any) => {
      logger.error(`Erro ao notificar usuários do setor: ${err}`);
    });
  }

  return { ticket, oldStatus, oldUserId };
};

export default UpdateTicketService;
