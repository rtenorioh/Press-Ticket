import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import CreateHubTicketService from "../services/HubServices/CreateHubTicketService";
import { SendCardMessageService } from "../services/HubServices/SendCardMessageHubService";
import { SendMediaMessageService } from "../services/HubServices/SendMediaMessageHubService";
import { SendTextMessageService } from "../services/HubServices/SendTextMessageHubService";
import { logger } from "../utils/logger";

interface TicketData {
  contactId: number;
  status: string;
  queueId: number;
  userId: number;
  channel: string;
}

export const send = async (req: Request, res: Response): Promise<Response> => {
  const { body: message } = req.body;
  const { ticketId } = req.params;
  const medias = req.files as Express.Multer.File[];

  const ticket = await Ticket.findByPk(ticketId, {
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: [
          "number",
          "email",
          "messengerId",
          "instagramId",
          "telegramId",
          "webchatId"
        ]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["qrcode", "type"]
      }
    ]
  });

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (ticket.whatsapp?.type === "wwebjs") {
    return res.status(400).json({ 
      error: "Este ticket é do tipo wwebjs. Use o endpoint /messages/:ticketId"
    });
  }

  try {
    if (medias) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          await SendMediaMessageService(
            media,
            message,
            ticket.id,
            ticket.contact,
            ticket.whatsapp
          );
        })
      );
    } else {
      await SendTextMessageService(
        message,
        ticket.id,
        ticket.contact,
        ticket.whatsapp
      );
    }

    return res.status(200).json({ message: "Message sent" });
  } catch (error) {
    logger.error(`Erro: ${error}`);

    return res.status(400).json({ message: error });
  }
};

export const sendCard = async (req: Request, res: Response): Promise<Response> => {
  const { title, media = "", text = "", buttons = [], quickReplyButtons = [] } = req.body;
  const { ticketId } = req.params;

  if (!title) {
    return res.status(400).json({ error: "O campo 'title' é obrigatório." });
  }

  const ticket = await Ticket.findByPk(ticketId, {
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["number", "email", "messengerId", "instagramId", "telegramId", "webchatId"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["qrcode", "type"]
      }
    ]
  });

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (ticket.whatsapp?.type === "wwebjs") {
    return res.status(400).json({
      error: "Este ticket é do tipo wwebjs. CardContent não é suportado."
    });
  }

  try {
    const newMessage = await SendCardMessageService(
      title,
      media,
      text,
      buttons,
      quickReplyButtons,
      ticket.id,
      ticket.contact,
      ticket.whatsapp
    );

    return res.status(200).json(newMessage);
  } catch (error) {
    logger.error(`Erro ao enviar card Hub: ${error}`);
    return res.status(400).json({ message: String(error) });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, status, userId, channel }: TicketData = req.body;

  const ticket = await CreateHubTicketService({
    contactId,
    status,
    userId,
    channel
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
