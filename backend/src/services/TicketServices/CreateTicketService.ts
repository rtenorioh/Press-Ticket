import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import ShowContactService from "../ContactServices/ShowContactService";
import EmitTicketCounterService from "./EmitTicketCounterService";

interface Request {
  contactId: number;
  status: string;
  userId: number;
  queueId ?: number;
  whatsappId?: number;
}

const CreateTicketService = async ({
  contactId,
  status,
  userId,
  queueId,
  whatsappId
}: Request): Promise<Ticket> => {
  let whatsapp;
  
  if (whatsappId) {
    whatsapp = await Whatsapp.findByPk(whatsappId);
    if (!whatsapp) {
      throw new AppError("ERR_NO_WAPP_FOUND", 404);
    }
  } else {
    whatsapp = await GetDefaultWhatsApp(userId);
  }

  await CheckContactOpenTickets(contactId, whatsapp.id);

  const { isGroup } = await ShowContactService(contactId);

  if(queueId === undefined) {
    const user = await User.findByPk(userId, { include: ["queues"]});
    queueId = user?.queues.length === 1 ? user.queues[0].id : undefined;
  }

  const { id }: Ticket = await whatsapp.$create("ticket", {
    contactId,
    status,
    isGroup,
    userId,
    queueId
  });

  const ticket = await Ticket.findByPk(id, { include: ["contact"] });

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  // Emitir atualização dos contadores de tickets para todos os usuários
  const timestamp = new Date().toISOString();
  console.log(`[BACK_CREATE_TICKET][${timestamp}] Atualizando contadores após criação de ticket: ${ticket.id}`);
  
  try {
    // Emitir atualização dos contadores para todos os usuários
    await EmitTicketCounterService();
  } catch (err) {
    console.error(`[BACK_CREATE_TICKET_ERROR][${timestamp}] Erro ao emitir contadores:`, err);
    // Não interrompe o fluxo em caso de erro na emissão dos contadores
  }

  return ticket;
};

export default CreateTicketService;