import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import ShowContactService from "../ContactServices/ShowContactService";

interface Request {
  contactId: number;
  status: string;
  userId: number;
  queueId?: number;
  channel: string;
}

const CreateTicketService = async ({
  contactId,
  status,
  userId,
  queueId,
  channel
}: Request): Promise<Ticket> => {
  let connectionType: string;

  if (channel === "instagram" || channel === "facebook") {
    connectionType = "facebook";
  } else if (channel === "telegram") {
    connectionType = "telegram";
  } else if (channel === "whatsapp") {
    connectionType = "whatsapp";
  } else if (channel === "sms") {
    connectionType = "sms";
  } else if (channel === "email") {
    connectionType = "email";
  } else if (channel === "webchat") {
    connectionType = "webchat";
  }

  const connection = await Whatsapp.findOne({
    where: { type: connectionType! }
  });

  if (!connection) {
    throw new Error("Connection id not found");
  }

  await CheckContactOpenTickets(contactId, connection.id);

  const { isGroup } = await ShowContactService(contactId);

  if (queueId === undefined) {
    const user = await User.findByPk(userId, { include: ["queues"] });
    queueId = user?.queues.length === 1 ? user.queues[0].id : undefined;
  }

  const newTicket = await Ticket.create({
    status,
    contactId,
    isGroup,
    whatsappId: connection.id,
    userId,
    queueId
  });

  const ticket = await Ticket.findByPk(newTicket.id, { include: ["contact"] });

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  return ticket;
};

export default CreateTicketService;
