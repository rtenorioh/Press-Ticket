import { Client as Session } from "whatsapp-web.js";
import { getWbot } from "../libs/wbot";
import GetDefaultWhatsApp from "./GetDefaultWhatsApp";
import Ticket from "../models/Ticket";
import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";

const GetTicketWbot = async (ticket: Ticket): Promise<Session> => {
  if (!ticket.whatsappId) {
    const defaultWhatsapp = await GetDefaultWhatsApp(ticket.user.id);

    await ticket.$set("whatsapp", defaultWhatsapp);
  }

  const whatsapp = await Whatsapp.findByPk(ticket.whatsappId);
  if (!whatsapp) {
    throw new AppError("ERR_WAPP_NOT_FOUND");
  }

  if (whatsapp.type !== "wwebjs") {
    throw new AppError("ERR_WAPP_NOT_WWEBJS");
  }

  const wbot = getWbot(ticket.whatsappId);

  return wbot;
};

export default GetTicketWbot;