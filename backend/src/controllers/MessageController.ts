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
import SendWhatsAppContacts from "../services/WbotServices/SendWhatsAppContacts";
import ReactToWhatsAppMessage from "../services/WbotServices/ReactToWhatsAppMessage";
import GetTicketWbot from "../helpers/GetTicketWbot";
import SerializeWbotMsgId from "../helpers/SerializeWbotMsgId";
import Contact from "../models/Contact";

type IndexQuery = {
  pageNumber: string;
};

export const reactMessage = async (req: Request, res: Response): Promise<Response> => {
  const { messageId } = req.params;
  const { emoji, removeEmoji } = req.body as { emoji: string, removeEmoji?: string };

  if (typeof emoji !== "string") {
    return res.status(400).json({ error: "Campo 'emoji' é obrigatório" });
  }

  try {
    const { ticketId } = await ReactToWhatsAppMessage({ messageId, emoji });

    const io = getIO();
    const action = emoji ? "update" : "remove";
    io.to(ticketId.toString()).emit("messageReaction", {
      action,
      messageId,
      emoji: action === "remove" ? (removeEmoji || "") : emoji
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Erro ao reagir à mensagem:", error);
    return res.status(500).json({ error: "Erro ao reagir à mensagem" });
  }
};

export const getReactions = async (req: Request, res: Response): Promise<Response> => {
  const { messageId } = req.params;

  try {
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: "Mensagem não encontrada" });
    }

    const ticket = await ShowTicketService(String(message.ticketId));
    const wbot = await GetTicketWbot(ticket);

    if (!wbot.pupPage) {
      throw new Error("WhatsApp page not ready");
    }

    let remoteJid: string | null = null;
    try {
      if (!ticket.isGroup) {
        const contact = await Contact.findByPk(ticket.contactId);
        const num = contact?.number?.replace(/\D/g, "");
        if (num) remoteJid = `${num}@c.us`;
      }
    } catch {}

    const serializedId = (() => {
      try { return SerializeWbotMsgId(ticket as any, message as any); } catch { return null; }
    })();

    const altSerializedId = (() => {
      try {
        if (!remoteJid) return null;
        const from = message.fromMe ? 'true' : 'false';
        return `${from}_${remoteJid}_${message.id}`;
      } catch { return null; }
    })();

    // Primeiro, tentar via API oficial do whatsapp-web.js (Node context)
    const tryGetReactionsNode = async (id?: string | null) => {
      if (!id) return null;
      try {
        const msg: any = await (wbot as any).getMessageById?.(id);
        if (msg && typeof msg.getReactions === "function") {
          const r = await msg.getReactions();
          if (Array.isArray(r)) return r;
        }
      } catch {}
      return null;
    };

    let nodeReactions = await tryGetReactionsNode(serializedId);
    if (!nodeReactions) nodeReactions = await tryGetReactionsNode(altSerializedId);
    if (!nodeReactions) nodeReactions = await tryGetReactionsNode(messageId);
    if (Array.isArray(nodeReactions) && nodeReactions.length > 0) {
      return res.status(200).json({ reactions: nodeReactions });
    }

    const reactions = await wbot.pupPage.evaluate((innerId: string, sId: string | null, altId: string | null) => {
      try {
        const Store = (window as any).Store;
        const tryIds = [sId, altId, innerId].filter(Boolean) as string[];
        const findForId = (id: string) => {
          try {
            const mod = Store?.Reactions;
            if (!mod || typeof mod.find !== 'function') return Promise.resolve(null);
            return Promise.resolve(mod.find(id)).then((r: any) => r).catch(() => null);
          } catch { return Promise.resolve(null); }
        };
        const chain = async () => {
          for (const id of tryIds) {
            const r = await findForId(id);
            if (r && r.reactions) {
              const arr = r.reactions.serialize ? r.reactions.serialize() : (Array.isArray(r.reactions) ? r.reactions : []);
              if (Array.isArray(arr) && arr.length > 0) return arr;
            }
            // tentativa alternativa: localizar a Msg e extrair reactions diretamente
            try {
              const msg = Store?.Msg?.get?.(id);
              const col = msg?.reactions || msg?.reactionCollection || msg?.collection;
              if (col) {
                const arr2 = col.serialize ? col.serialize() : (col.getModelsArray ? col.getModelsArray() : (Array.isArray(col) ? col : []));
                if (Array.isArray(arr2) && arr2.length > 0) return arr2;
              }
            } catch {}
          }
          return [];
        };
        return chain();
      } catch (e) {
        return [];
      }
    }, messageId, serializedId, altSerializedId);

    return res.status(200).json({ reactions });
  } catch (error: any) {
    console.error("Erro ao listar reações:", error);
    return res.status(500).json({ error: "Erro ao listar reações" });
  }
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
    // Verificar o status do ticket antes de marcar como lida
    const ticket = await ShowTicketService(ticketId);
    
    // Só marca mensagens como lidas se o ticket estiver aceito (status "open")
    if (ticket.status === "open") {
      await MarkMessagesAsReadService({ ticketId });
      return res.status(200).json({ message: "Mensagens marcadas como lidas com sucesso" });
    } else {
      return res.status(400).json({ 
        error: "Não é possível marcar mensagens como lidas. Ticket deve estar aceito (status 'open')",
        currentStatus: ticket.status
      });
    }
  } catch (error) {
    console.error("Erro ao marcar mensagens como lidas:", error);
    return res.status(500).json({ error: "Erro ao marcar mensagens como lidas" });
  }
};

export const sendContacts = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { contacts } = req.body;

  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ error: "Contatos são obrigatórios" });
  }

  const ticket = await ShowTicketService(ticketId);

  if (ticket.status === "open") {
    await SetTicketMessagesAsRead(ticket);
  }

  try {
    const sentMessage = await SendWhatsAppContacts({ contacts, ticket });
    const messageId = sentMessage?.id?.id;

    return res.json({ id: messageId });
  } catch (error) {
    console.error("Erro ao enviar contatos:", error);
    return res.status(500).json({ error: "Erro ao enviar contatos" });
  }
};

export const forwardMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { messages, contactId } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  try {
    let ticket;
    
    if (contactId) {
      // Se contactId foi fornecido, buscar ou criar ticket para esse contato
      const FindOrCreateTicketService = require("../services/TicketServices/FindOrCreateTicketService").default;
      const ShowContactService = require("../services/ContactServices/ShowContactService").default;
      
      const contact = await ShowContactService(contactId);
      const GetDefaultWhatsApp = require("../helpers/GetDefaultWhatsApp").default;
      const whatsapp = await GetDefaultWhatsApp();
      
      ticket = await FindOrCreateTicketService(contact, whatsapp.id, 0);
    } else {
      // Usar ticket fornecido
      ticket = await ShowTicketService(ticketId);
    }

    if (ticket.status === "open") {
      await SetTicketMessagesAsRead(ticket);
    }

    // Encaminhar cada mensagem
    for (const messageData of messages) {
      let body = messageData.body || "";
      
      // Adicionar indicador de encaminhamento
      if (body) {
        body = `↪ Encaminhada\n${body}`;
      } else if (messageData.mediaType) {
        body = "↪ Encaminhada";
      }

      // Enviar mensagem encaminhada
      if (messageData.mediaType && messageData.mediaUrl) {
        // Mensagem com mídia - criar objeto media simulado
        const mediaObject = {
          fieldname: 'medias',
          originalname: 'forwarded_media',
          encoding: '7bit',
          mimetype: messageData.mediaType,
          buffer: Buffer.from(''),
          size: 0,
          filename: 'forwarded_media',
          path: messageData.mediaUrl
        } as Express.Multer.File;

        await SendWhatsAppMedia({ 
          media: mediaObject, 
          ticket, 
          body: body 
        });
      } else {
        // Mensagem de texto
        await SendWhatsAppMessage({
          body: body,
          ticket,
          quotedMsg: messageData.quotedMsg
        });
      }
    }

    return res.status(200).json({ 
      message: "Messages forwarded successfully",
      ticketId: ticket.id
    });
  } catch (error) {
    console.error("Erro ao encaminhar mensagens:", error);
    return res.status(500).json({ error: "Erro ao encaminhar mensagens" });
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
