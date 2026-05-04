import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import CreateHubTicketService from "../services/HubServices/CreateHubTicketService";
import { SendCardMessageService } from "../services/HubServices/SendCardMessageHubService";
import { SendCarouselMessageService } from "../services/HubServices/SendCarouselMessageHubService";
import { SendLocationHubService } from "../services/HubServices/SendLocationHubService";
import { SendMediaMessageService } from "../services/HubServices/SendMediaMessageHubService";
import { SendReplyableTextService } from "../services/HubServices/SendReplyableTextHubService";
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

export const sendHubLocation = async (req: Request, res: Response): Promise<Response> => {
  const { latitude, longitude, name = "", address = "" } = req.body;
  const { ticketId } = req.params;

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: "Latitude e longitude devem ser números válidos." });
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
      error: "Para canais wwebjs, use o endpoint /wa-features/:ticketId/location."
    });
  }

  try {
    const newMessage = await SendLocationHubService(
      lat,
      lng,
      name,
      address,
      ticket.id,
      ticket.contact,
      ticket.whatsapp
    );

    return res.status(200).json(newMessage);
  } catch (error) {
    logger.error(`Erro ao enviar location Hub: ${error}`);
    return res.status(400).json({ message: String(error) });
  }
};

export const sendReplyableText = async (req: Request, res: Response): Promise<Response> => {
  const { text, quickReplyButtons = [] } = req.body;
  const { ticketId } = req.params;

  if (!text?.trim()) {
    return res.status(400).json({ error: "O campo 'text' é obrigatório." });
  }

  if (!Array.isArray(quickReplyButtons) || quickReplyButtons.length === 0) {
    return res.status(400).json({ error: "Pelo menos um botão de resposta rápida é obrigatório." });
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
      error: "Respostas rápidas não são suportadas em canais WhatsApp (wwebjs)."
    });
  }

  try {
    const newMessage = await SendReplyableTextService(
      text,
      quickReplyButtons,
      ticket.id,
      ticket.contact,
      ticket.whatsapp
    );

    return res.status(200).json(newMessage);
  } catch (error) {
    logger.error(`Erro ao enviar replyable-text Hub: ${error}`);
    return res.status(400).json({ message: String(error) });
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
      error: "Envio de cards não é suportado em canais WhatsApp (wwebjs)."
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

export const sendCarousel = async (req: Request, res: Response): Promise<Response> => {
  const { cards = [], cardWidth = "medium", quickReplyButtons = [] } = req.body;
  const { ticketId } = req.params;

  if (!Array.isArray(cards) || cards.length < 2) {
    return res.status(400).json({ error: "O carrossel requer pelo menos 2 cards." });
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
      error: "Envio de carrossel não é suportado em canais WhatsApp (wwebjs)."
    });
  }

  try {
    const newMessage = await SendCarouselMessageService(
      cards,
      cardWidth,
      quickReplyButtons,
      ticket.id,
      ticket.contact,
      ticket.whatsapp
    );

    return res.status(200).json(newMessage);
  } catch (error) {
    logger.error(`Erro ao enviar carousel Hub: ${error}`);
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
