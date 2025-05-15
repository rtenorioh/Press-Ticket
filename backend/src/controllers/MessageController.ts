import { Request, Response } from "express";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import CountMessagesService from "../services/MessageServices/CountMessagesService";
import ListMessagesService from "../services/MessageServices/ListMessagesService";
import MarkMessagesAsReadService from "../services/MessageServices/MarkMessagesAsReadService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import EditWhatsAppMessage from "../services/WbotServices/EditWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

type IndexQuery = {
  pageNumber: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId
  });

  if (ticket.status === "open") {
    await SetTicketMessagesAsRead(ticket);
  }

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  const ticket = await ShowTicketService(ticketId);

  if (ticket.status === "open") {
    await SetTicketMessagesAsRead(ticket);
  }

  let messageId: string | undefined;

  if (medias) {
    const mediaMessages = await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        const sentMessage = await SendWhatsAppMedia({ media, ticket, body });
        return sentMessage;
      })
    );
    if (mediaMessages && mediaMessages.length > 0) {
      messageId = mediaMessages[0].id.id;
    }
  } else {
    const sentMessage = await SendWhatsAppMessage({ body, ticket, quotedMsg });
    if (sentMessage) {
      messageId = sentMessage.id.id;
    }
  }

  return res.json({ id: messageId });
};

export const edit = async (req: Request, res: Response): Promise<Response> => {
  const { messageId } = req.params;
  const { body }: MessageData = req.body;

  const message = await EditWhatsAppMessage(messageId, body);

  const io = getIO();
  io.to(message.ticketId.toString()).emit("appMessage", {
    action: "update",
    message
  });

  return res.send();
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const message = await DeleteWhatsAppMessage(messageId);

  const io = getIO();
  io.to(message.ticketId.toString()).emit("appMessage", {
    action: "delete",
    message
  });

  return res.send();
};

export const markAsRead = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;

  try {
    await MarkMessagesAsReadService({ ticketId });
    return res.status(200).json({ message: "Mensagens marcadas como lidas com sucesso" });
  } catch (error) {
    console.error("Erro ao marcar mensagens como lidas:", error);
    return res.status(500).json({ error: "Erro ao marcar mensagens como lidas" });
  }
};

export const count = async (req: Request, res: Response): Promise<Response> => {
  const { userId, all, startDate, endDate } = req.query;

  const counter = await CountMessagesService({
    userId: userId ? Number(userId) : undefined,
    all: all as string,
    startDate: startDate as string,
    endDate: endDate as string
  });
  return res.json(counter);
};
