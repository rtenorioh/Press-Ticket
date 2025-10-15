import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";
import EmitTicketCounterService from "./EmitTicketCounterService";

const DeleteTicketService = async (id: string): Promise<Ticket> => {
  const ticket = await Ticket.findOne({
    where: { id }
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  await ticket.destroy();

  const timestamp = new Date().toISOString();
  
  try {
    await EmitTicketCounterService();
  } catch (err) {
    console.error(`[BACK_DELETE_TICKET_ERROR][${timestamp}] Erro ao emitir contadores:`, err);
  }

  return ticket;
};

export default DeleteTicketService;
