import { Request, Response } from "express";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import CountMessagesService from "../services/MessageServices/CountMessagesService";
import ListMessagesService from "../services/MessageServices/ListMessagesService";
import MarkMessagesAsReadService from "../services/MessageServices/MarkMessagesAsReadService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import EditWhatsAppMessage from "../services/WbotServices/EditWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import SendWhatsAppContacts from "../services/WbotServices/SendWhatsAppContacts";
import SendPollService from "../services/WbotServices/SendPollService";
import PresenceService from "../services/WbotServices/PresenceService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import GetTicketWbot from "../helpers/GetTicketWbot";
import SerializeWbotMsgId from "../helpers/SerializeWbotMsgId";
import Contact from "../models/Contact";
import MessageReaction from "../models/MessageReaction";
import ReactToWhatsAppMessage from "../services/WbotServices/ReactToWhatsAppMessage";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import GetClientIp from "../helpers/GetClientIp";

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

    const dbReactions = await MessageReaction.findAll({
      where: { messageId: message.id }
    });

    if (dbReactions.length > 0) {
      const ticket = await ShowTicketService(String(message.ticketId));
      const wbot = await GetTicketWbot(ticket);
      
      const myNumber = wbot.info?.wid?._serialized || null;
      
      const groupedReactions: any = {};
      
      for (const reaction of dbReactions) {
        if (!groupedReactions[reaction.emoji]) {
          groupedReactions[reaction.emoji] = {
            id: reaction.emoji,
            aggregateEmoji: reaction.emoji,
            hasReactionByMe: false,
            senders: []
          };
        }
        
        const isMyReaction = myNumber && reaction.senderId === myNumber;
        if (isMyReaction) {
          groupedReactions[reaction.emoji].hasReactionByMe = true;
        }
        
        let contactName = isMyReaction ? 'Você' : 'Contato';
        let profilePicUrl = null;
        let phoneNumber = null;
        
        try {
          if (reaction.senderId.includes('@lid')) {
            try {
              const contact = await (wbot as any).getContactById(reaction.senderId);
              if (contact) {
                phoneNumber = contact.number || contact.id?.user;
                if (!isMyReaction) {
                  contactName = contact.name || contact.pushname || contact.shortName || phoneNumber || 'Contato';
                }
                
                try {
                  profilePicUrl = await (wbot as any).getProfilePicUrl(reaction.senderId);
                } catch (e) {
                  console.error('[getReactions] Erro ao buscar foto do @lid:', e);
                }
              
              }
            } catch (e) {
              console.error('[getReactions] Erro ao buscar informações do @lid:', e);
            }
          } else {
            phoneNumber = reaction.senderId
              .replace('@c.us', '')
              .replace('@s.whatsapp.net', '')
              .replace('@g.us', '');
          }
          
          if (phoneNumber && !isMyReaction && contactName === 'Contato') {
            const contact = await Contact.findOne({
              where: { number: phoneNumber }
            });
            
            if (contact) {
              contactName = contact.name || contact.number;
              if (!profilePicUrl) {
                profilePicUrl = contact.profilePicUrl;
              }
            } else if (phoneNumber) {
              contactName = phoneNumber;
            }
          }
        } catch (e) {
          console.error('[getReactions] Erro ao buscar contato:', e);
        }
        
        groupedReactions[reaction.emoji].senders.push({
          id: { _serialized: reaction.senderId, user: reaction.senderId },
          contactName,
          profilePicUrl,
          profilePicThumbObj: profilePicUrl ? { img: profilePicUrl } : null,
          timestamp: reaction.createdAt,
          isMe: isMyReaction,
          fromMe: isMyReaction,
          isSenderMe: isMyReaction
        });
      }
      
      const reactions = Object.values(groupedReactions);
      return res.status(200).json({ reactions });
    }
    const ticket = await ShowTicketService(String(message.ticketId));
    const wbot = await GetTicketWbot(ticket);

    if (!wbot.pupPage) {
      throw new Error("WhatsApp page not ready");
    }

    let remoteJid: string | null = null;
    try {
      const contact = await Contact.findByPk(ticket.contactId);
      const num = contact?.number?.replace(/\D/g, "");
      if (num) {
        remoteJid = ticket.isGroup ? `${num}@g.us` : `${num}@c.us`;
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

    const reactions = await wbot.pupPage.evaluate((innerId: string, sId: string | null, altId: string | null, isGroup: boolean, remote: string | null) => {
      const logs: string[] = [];
      try {
        const Store = (window as any).Store;
        const tryIds = [sId, altId, innerId].filter(Boolean) as string[];
        
        const processReactions = (arr: any[]) => {
          return arr.map((reaction: any) => {
            const processed = { ...reaction };
            if (processed.senders && Array.isArray(processed.senders)) {
              processed.senders = processed.senders.map((sender: any) => {
                const senderId = sender?.id?._serialized || sender?.id?.user || sender?.id;
                let contactName = 'Contato';
                
                if (senderId) {
                  try {
                    const contact = Store?.Contact?.get?.(senderId);
                    if (contact) {
                      contactName = contact.name || contact.pushname || contact.verifiedName || senderId;
                    }
                  } catch (e) {}
                }
                
                return {
                  ...sender,
                  contactName
                };
              });
            }
            return processed;
          });
        };
        
        const tryGetReactionsFromMsg = (id: string) => {
          const msg = Store?.Msg?.get?.(id);
          if (!msg) {
            return null;
          }
          const col = msg?.reactions || msg?.reactionCollection;
          if (!col) {
            return null;
          }
          const arr = col.serialize ? col.serialize() : (col.getModelsArray ? col.getModelsArray() : (Array.isArray(col) ? col : []));
          if (Array.isArray(arr) && arr.length > 0) {
            return processReactions(arr);
          }
          return null;
        };
        
        for (const id of tryIds) {
          const result = tryGetReactionsFromMsg(id);
          if (result) {
            return { reactions: result, logs };
          }
        }
        
        if (remote && innerId) {
          try {
            const possibleIds = [
              `true_${remote}_${innerId}`,
              `false_${remote}_${innerId}`,
              sId,
              altId
            ].filter(Boolean);
            
            for (const fullId of possibleIds) {
              const msg = Store?.Msg?.get?.(fullId);
              if (msg) {
                const col = msg?.reactions || msg?.reactionCollection;
                if (col) {
                  const arr = col.serialize ? col.serialize() : (col.getModelsArray ? col.getModelsArray() : (Array.isArray(col) ? col : []));
                  
                  if (Array.isArray(arr) && arr.length > 0) {
                    const processed = processReactions(arr);
                    return { reactions: processed, logs };
                  }
                } else {
                  logs.push(`Mensagem encontrada mas sem reações`);
                }
              }
            }
            
            try {
              const allMsgs = Store?.Msg?.models || [];
              
              const partialMatches = allMsgs.filter((m: any) => {
                const sid = m?.id?._serialized || '';
                const iid = m?.id?.id || '';
                return sid.includes(innerId) || iid.includes(innerId);
              });
              
              if (partialMatches.length > 0) {
                
                const firstMatch = partialMatches[0];
                const col = firstMatch?.reactions || firstMatch?.reactionCollection;
                if (col) {
                  const arr = col.serialize ? col.serialize() : (col.getModelsArray ? col.getModelsArray() : (Array.isArray(col) ? col : []));
                  
                  if (Array.isArray(arr) && arr.length > 0) {
                    const processed = processReactions(arr);
                    return { reactions: processed, logs };
                  }
                }
              }
              
              if (allMsgs.length === 0 && remote) {
                const chat = Store?.Chat?.get?.(remote);
                if (chat) {
                  
                  for (const tryId of possibleIds) {
                    try {
                      
                      const msgInChat = chat.msgs?.get?.(tryId);
                      if (msgInChat) {
                        const col = msgInChat?.reactions || msgInChat?.reactionCollection;
                        if (col) {
                          const arr = col.serialize ? col.serialize() : (col.getModelsArray ? col.getModelsArray() : (Array.isArray(col) ? col : []));
                          if (Array.isArray(arr) && arr.length > 0) {
                            const processed = processReactions(arr);
                            return { reactions: processed, logs };
                          }
                        }
                      }
                    } catch (e) {
                      logs.push(`Erro ao buscar ${tryId} no chat: ${e}`);
                    }
                  }
                }
              }
            } catch (e) {
              logs.push(`Erro no debug de mensagens: ${e}`);
            }
          } catch (e) {
            logs.push(`Erro ao buscar com ID completo: ${e}`);
          }
        }
      
        return { reactions: [], logs };
      } catch (e) {
        logs.push(`Erro geral: ${e}`);
        return { reactions: [], logs };
      }
    }, messageId, serializedId, altSerializedId, ticket.isGroup, remoteJid);

    const result = reactions as { reactions: any[], logs: string[] };

    return res.status(200).json({ reactions: result.reactions });
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
  mentions?: string[];
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
  let { body, quotedMsg, mentions, sendAsDocument, compressVideo }: any = req.body;
  const medias = req.files as Express.Multer.File[];
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);

  if (mentions && typeof mentions === 'string') {
    try {
      mentions = JSON.parse(mentions);
    } catch (e) {
      console.error('[MessageController] Erro ao parsear mentions:', e);
      mentions = undefined;
    }
  }

  if (mentions) {
    console.info('[MessageController] Mentions recebidas:', mentions, 'Tipo:', typeof mentions);
  }

  const shouldSendAsDocument = sendAsDocument === 'true' || sendAsDocument === true;
  const shouldCompressVideo = compressVideo === 'true' || compressVideo === true;

  const ticket = await ShowTicketService(ticketId);

  if (ticket.status === "open") {
    await SetTicketMessagesAsRead(ticket);
  }

  let messageId: string | undefined;

  if (medias) {
    const mediaMessages = await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        const sentMessage = await SendWhatsAppMedia({ 
          media, 
          ticket, 
          body, 
          mentions,
          sendAsDocument: shouldSendAsDocument
        });
        return sentMessage;
      })
    );
    if (mediaMessages && mediaMessages.length > 0) {
      messageId = mediaMessages[0].id.id;
    }

    // LOG: Mensagem com mídia enviada
    try {
      await createActivityLog({
        userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
        action: ActivityActions.SEND,
        description: `Mensagem com ${medias.length} mídia(s) enviada no ticket #${ticketId}`,
        entityType: EntityTypes.TICKET,
        entityId: ticket.id,
        ip: clientIp,
        additionalData: {
          ticketId: parseInt(ticketId),
          messageType: 'media',
          mediaCount: medias.length,
          mediaTypes: medias.map(m => m.mimetype),
          contactId: ticket.contactId,
          sendAsDocument: shouldSendAsDocument,
          hasBody: !!body
        }
      });
    } catch (error) {
      console.error('Erro ao criar log de envio de mídia:', error);
    }
  } else {
    const sentMessage = await SendWhatsAppMessage({ body, ticket, quotedMsg, mentions });
    if (sentMessage) {
      messageId = sentMessage.id.id;
    }

    // LOG: Mensagem de texto enviada
    try {
      await createActivityLog({
        userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
        action: ActivityActions.SEND,
        description: `Mensagem enviada no ticket #${ticketId}`,
        entityType: EntityTypes.TICKET,
        entityId: ticket.id,
        ip: clientIp,
        additionalData: {
          ticketId: parseInt(ticketId),
          messageType: 'text',
          messageLength: body?.length || 0,
          hasQuote: !!quotedMsg,
          hasMentions: !!(mentions && Array.isArray(mentions) && mentions.length > 0),
          contactId: ticket.contactId
        }
      });
    } catch (error) {
      console.error('Erro ao criar log de envio de mensagem:', error);
    }
  }

  return res.json({ id: messageId });
};

export const edit = async (req: Request, res: Response): Promise<Response> => {
  const { messageId } = req.params;
  const { body }: MessageData = req.body;
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);

  // Buscar mensagem antes de editar para comparar
  const messageToEdit = await Message.findByPk(messageId);

  const message = await EditWhatsAppMessage(messageId, body);

  // LOG: Mensagem editada
  try {
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.EDIT,
      description: `Mensagem editada no ticket #${message.ticketId}`,
      entityType: EntityTypes.TICKET,
      entityId: message.ticketId,
      ip: clientIp,
      additionalData: {
        ticketId: message.ticketId,
        oldBody: messageToEdit?.body?.substring(0, 100), // Primeiros 100 caracteres
        newBody: body?.substring(0, 100),
        oldLength: messageToEdit?.body?.length || 0,
        newLength: body?.length || 0
      }
    });
  } catch (error) {
    console.error('Erro ao criar log de edição de mensagem:', error);
  }

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
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);

  // Buscar mensagem antes de deletar para log
  const messageToDelete = await Message.findByPk(messageId);

  const message = await DeleteWhatsAppMessage(messageId);

  // LOG: Mensagem excluída
  try {
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.DELETE,
      description: `Mensagem excluída do ticket #${message.ticketId}`,
      entityType: EntityTypes.TICKET,
      entityId: message.ticketId,
      ip: clientIp,
      additionalData: {
        ticketId: message.ticketId,
        messageBody: messageToDelete?.body?.substring(0, 50), // Primeiros 50 caracteres
        mediaType: messageToDelete?.mediaType,
        fromMe: messageToDelete?.fromMe
      }
    });
  } catch (error) {
    console.error('Erro ao criar log de exclusão de mensagem:', error);
  }

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
    const ticket = await ShowTicketService(ticketId);
    
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
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);

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

    // LOG: Contatos enviados
    try {
      await createActivityLog({
        userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
        action: ActivityActions.SEND,
        description: `${contacts.length} contato(s) enviado(s) no ticket #${ticketId}`,
        entityType: EntityTypes.TICKET,
        entityId: ticket.id,
        ip: clientIp,
        additionalData: {
          ticketId: parseInt(ticketId),
          messageType: 'vcard',
          contactCount: contacts.length,
          contactIds: contacts.map((c: any) => c.id)
        }
      });
    } catch (error) {
      console.error('Erro ao criar log de envio de contatos:', error);
    }

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
      const FindOrCreateTicketService = require("../services/TicketServices/FindOrCreateTicketService").default;
      const ShowContactService = require("../services/ContactServices/ShowContactService").default;
      
      const contact = await ShowContactService(contactId);
      const GetDefaultWhatsApp = require("../helpers/GetDefaultWhatsApp").default;
      const whatsapp = await GetDefaultWhatsApp();
      
      ticket = await FindOrCreateTicketService(contact, whatsapp.id, 0);
    } else {
      ticket = await ShowTicketService(ticketId);
    }

    if (ticket.status === "open") {
      await SetTicketMessagesAsRead(ticket);
    }

    for (const messageData of messages) {
      let body = messageData.body || "";
      
      if (body) {
        body = `↪ Encaminhada\n${body}`;
      } else if (messageData.mediaType) {
        body = "↪ Encaminhada";
      }

      if (messageData.mediaType && messageData.mediaUrl) {
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
    
    if (error.message === "ERR_NO_DEF_WAPP_FOUND") {
      return res.status(400).json({ 
        error: "Nenhuma conexão WhatsApp ativa encontrada. Por favor, conecte um WhatsApp antes de encaminhar mensagens." 
      });
    }
    
    return res.status(500).json({ 
      error: error.message || "Erro ao encaminhar mensagens" 
    });
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

export const sendPoll = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pollName, options, allowMultipleAnswers } = req.body;

  try {
    if (!pollName || !options || !Array.isArray(options)) {
      return res.status(400).json({ error: "Nome da enquete e opções são obrigatórios" });
    }

    const message = await SendPollService.execute({
      ticketId: Number(ticketId),
      pollName,
      options,
      allowMultipleAnswers: allowMultipleAnswers || false
    });

    return res.json(message);
  } catch (error: any) {
    console.error("Erro ao enviar enquete:", error);
    return res.status(500).json({ error: error.message || "Erro ao enviar enquete" });
  }
};

export const sendTypingIndicator = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { duration } = req.body;

  try {
    const ticket = await ShowTicketService(Number(ticketId));
    const chatId = `${ticket.contact.number}@c.us`;

    await PresenceService.simulateTyping(
      ticket.whatsappId,
      chatId,
      duration || 3000
    );

    return res.json({ success: true, message: "Indicador de digitação enviado" });
  } catch (error: any) {
    console.error("Erro ao enviar indicador de digitação:", error);
    return res.status(500).json({ error: error.message || "Erro ao enviar indicador de digitação" });
  }
};

export const sendRecordingIndicator = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { duration } = req.body;

  try {
    const ticket = await ShowTicketService(Number(ticketId));
    const chatId = `${ticket.contact.number}@c.us`;

    await PresenceService.simulateRecording(
      ticket.whatsappId,
      chatId,
      duration || 5000
    );

    return res.json({ success: true, message: "Indicador de gravação enviado" });
  } catch (error: any) {
    console.error("Erro ao enviar indicador de gravação:", error);
    return res.status(500).json({ error: error.message || "Erro ao enviar indicador de gravação" });
  }
};

export const setAvailablePresence = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;

  try {
    const ticket = await ShowTicketService(Number(ticketId));
    const chatId = `${ticket.contact.number}@c.us`;

    await PresenceService.setAvailable(
      ticket.whatsappId,
      chatId
    );

    return res.json({ success: true, message: "Presença definida como disponível" });
  } catch (error: any) {
    console.error("Erro ao definir presença:", error);
    return res.status(500).json({ error: error.message || "Erro ao definir presença" });
  }
};
