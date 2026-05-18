import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { validateId } from "../helpers/validateId";

import Ticket from "../models/Ticket";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import {
  AcceptGroupInvite,
  GetGroupInviteInfo
} from "../services/WbotServices/AcceptGroupInviteService";
import ChatManagementService from "../services/WbotServices/ChatManagementService";
import ContactActionsService from "../services/WbotServices/ContactActionsService";
import ForwardWhatsAppMessage from "../services/WbotServices/ForwardWhatsAppMessage";
import GroupMembershipRequestsService from "../services/WbotServices/GroupMembershipRequestsService";
import LabelsService from "../services/WbotServices/LabelsService";
import {
  GetMessageInfo,
  GetMessageReactions,
  GetPollVotes
} from "../services/WbotServices/MessageInfoService";
import {
  PinWhatsAppMessage,
  UnpinWhatsAppMessage
} from "../services/WbotServices/PinMessageService";
import ProfileManagementService from "../services/WbotServices/ProfileManagementService";
import SearchMessagesService from "../services/WbotServices/SearchMessagesService";
import SendLocationService from "../services/WbotServices/SendLocationService";
import {
  StarWhatsAppMessage,
  UnstarWhatsAppMessage
} from "../services/WbotServices/StarMessageService";

// ===================== FORWARD =====================
export const forwardNative = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId, targetChatId, ticketId } = req.body;

  try {
    const ticket = await ShowTicketService(ticketId);
    const result = await ForwardWhatsAppMessage({
      messageId,
      targetChatId,
      ticket
    });
    return res
      .status(200)
      .json({ message: "Mensagem encaminhada com sucesso", result });
  } catch (error: any) {
    logger.error(`[FEATURES] Erro ao encaminhar mensagem: ${error}`);
    return res
      .status(500)
      .json({ error: error.message || "Erro ao encaminhar mensagem" });
  }
};

// ===================== SEARCH =====================
export const searchMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, query, chatId, page, limit } = req.query;

  logger.info(
    `[SEARCH] Params: whatsappId=${whatsappId}, query=${query}, chatId=${chatId}, page=${page}, limit=${limit}`
  );

  try {
    const result = await SearchMessagesService({
      whatsappId: validateId(whatsappId, "whatsappId"),
      query: query as string,
      chatId: chatId as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50
    });
    return res.status(200).json(result);
  } catch (error: any) {
    logger.error(
      `[FEATURES] Erro ao buscar mensagens: ${error?.message || JSON.stringify(error)}`
    );
    return res
      .status(500)
      .json({ error: error.message || "Erro ao buscar mensagens" });
  }
};

// ===================== INVITE =====================
export const acceptInvite = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, inviteCode } = req.body;

  try {
    const groupId = await AcceptGroupInvite({
      whatsappId: validateId(whatsappId, "whatsappId"),
      inviteCode
    });
    return res
      .status(200)
      .json({ message: "Convite aceito com sucesso", groupId });
  } catch (error: any) {
    logger.error(`[FEATURES] Erro ao aceitar convite: ${error}`);
    return res
      .status(500)
      .json({ error: error.message || "Erro ao aceitar convite" });
  }
};

export const getInviteInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, inviteCode } = req.query;

  try {
    const info = await GetGroupInviteInfo({
      whatsappId: validateId(whatsappId, "whatsappId"),
      inviteCode: inviteCode as string
    });
    return res.status(200).json(info);
  } catch (error: any) {
    logger.error(`[FEATURES] Erro ao obter info do convite: ${error}`);
    return res
      .status(500)
      .json({ error: error.message || "Erro ao obter informações do convite" });
  }
};

// ===================== LOCATION =====================
export const sendLocation = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { latitude, longitude, description, address } = req.body;

  try {
    const ticket = await ShowTicketService(ticketId);
    const sentMessage = await SendLocationService({
      ticket,
      latitude: Number(latitude),
      longitude: Number(longitude),
      description,
      address
    });
    return res
      .status(200)
      .json({ message: "Localização enviada", id: sentMessage.id.id });
  } catch (error: any) {
    logger.error(`[FEATURES] Erro ao enviar localização: ${error}`);
    return res
      .status(500)
      .json({ error: error.message || "Erro ao enviar localização" });
  }
};

// ===================== CHAT MANAGEMENT =====================
export const sendSeen = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId } = req.body;

  try {
    await ChatManagementService.sendSeen(validateId(whatsappId, "whatsappId"), chatId);
    return res.status(200).json({ message: "Chat marcado como visto" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const archiveChat = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId } = req.body;

  try {
    await ChatManagementService.archiveChat(validateId(whatsappId, "whatsappId"), chatId);
    return res.status(200).json({ message: "Chat arquivado" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const unarchiveChat = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId } = req.body;

  try {
    await ChatManagementService.unarchiveChat(validateId(whatsappId, "whatsappId"), chatId);
    return res.status(200).json({ message: "Chat desarquivado" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const pinChat = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId, ticketId } = req.body;

  try {
    const result = await ChatManagementService.pinChat(
      validateId(whatsappId, "whatsappId"),
      chatId
    );
    if (ticketId) {
      await Ticket.update({ pinnedChat: true }, { where: { id: ticketId } });
    }
    return res.status(200).json({ message: "Chat fixado", success: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const unpinChat = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId, ticketId } = req.body;

  try {
    const result = await ChatManagementService.unpinChat(
      validateId(whatsappId, "whatsappId"),
      chatId
    );
    if (ticketId) {
      await Ticket.update({ pinnedChat: false }, { where: { id: ticketId } });
    }
    return res.status(200).json({ message: "Chat desfixado", success: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const muteChat = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId, unmuteDate, ticketId } = req.body;

  try {
    await ChatManagementService.muteChat(
      validateId(whatsappId, "whatsappId"),
      chatId,
      new Date(unmuteDate)
    );
    if (ticketId) {
      await Ticket.update({ mutedChat: true }, { where: { id: ticketId } });
    }
    return res.status(200).json({ message: "Chat silenciado" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const unmuteChat = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId, ticketId } = req.body;

  try {
    await ChatManagementService.unmuteChat(validateId(whatsappId, "whatsappId"), chatId);
    if (ticketId) {
      await Ticket.update({ mutedChat: false }, { where: { id: ticketId } });
    }
    return res.status(200).json({ message: "Notificações do chat ativadas" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const markUnread = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId } = req.body;

  try {
    await ChatManagementService.markUnread(validateId(whatsappId, "whatsappId"), chatId);
    return res.status(200).json({ message: "Chat marcado como não lido" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const fetchMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId, limit } = req.query;

  try {
    const messages = await ChatManagementService.fetchMessages(
      validateId(whatsappId, "whatsappId"),
      chatId as string,
      limit ? Number(limit) : 50
    );
    return res.status(200).json(messages);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const clearMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId } = req.body;

  try {
    const result = await ChatManagementService.clearMessages(
      validateId(whatsappId, "whatsappId"),
      chatId
    );
    return res
      .status(200)
      .json({ message: "Mensagens limpas", success: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getChatInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId, ticketId } = req.query;

  try {
    const info = await ChatManagementService.getChatInfo(
      validateId(whatsappId, "whatsappId"),
      chatId as string
    );
    if (ticketId) {
      await Ticket.update(
        { pinnedChat: !!info.pinned, mutedChat: !!info.isMuted },
        { where: { id: Number(ticketId) } }
      );
    }
    return res.status(200).json(info);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getChats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.query;

  try {
    const chats = await ChatManagementService.getChats(validateId(whatsappId, "whatsappId"));
    return res.status(200).json(chats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ===================== LABELS =====================
export const getLabels = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.query;

  try {
    const labels = await LabelsService.getLabels(validateId(whatsappId, "whatsappId"));
    return res.status(200).json(labels);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getLabelById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, labelId } = req.query;

  try {
    const label = await LabelsService.getLabelById(
      validateId(whatsappId, "whatsappId"),
      labelId as string
    );
    return res.status(200).json(label);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getChatLabels = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId } = req.query;

  try {
    const labels = await LabelsService.getChatLabels(
      validateId(whatsappId, "whatsappId"),
      chatId as string
    );
    return res.status(200).json(labels);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getChatsByLabel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, labelId } = req.query;

  try {
    const chats = await LabelsService.getChatsByLabelId(
      validateId(whatsappId, "whatsappId"),
      labelId as string
    );
    return res.status(200).json(chats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const changeChatLabels = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId, labelIds } = req.body;

  try {
    await LabelsService.addOrRemoveChatLabels(
      validateId(whatsappId, "whatsappId"),
      chatId,
      labelIds
    );
    return res.status(200).json({ message: "Etiquetas atualizadas" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ===================== PROFILE =====================
export const setStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, status } = req.body;

  try {
    await ProfileManagementService.setStatus(validateId(whatsappId, "whatsappId"), status);
    return res.status(200).json({ message: "Status atualizado" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const setDisplayName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, name } = req.body;

  try {
    const result = await ProfileManagementService.setDisplayName(
      validateId(whatsappId, "whatsappId"),
      name
    );
    return res
      .status(200)
      .json({ message: "Nome atualizado", success: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const setProfilePicture = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, mediaPath } = req.body;

  try {
    const result = await ProfileManagementService.setProfilePicture(
      validateId(whatsappId, "whatsappId"),
      mediaPath
    );
    return res
      .status(200)
      .json({ message: "Foto de perfil atualizada", success: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const removeProfilePicture = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.body;

  try {
    const result = await ProfileManagementService.removeProfilePicture(
      validateId(whatsappId, "whatsappId")
    );
    return res
      .status(200)
      .json({ message: "Foto de perfil removida", success: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getWWebVersion = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.query;

  try {
    const version = await ProfileManagementService.getWWebVersion(
      validateId(whatsappId, "whatsappId")
    );
    return res.status(200).json({ version });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const setPresenceUnavailable = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.body;

  try {
    await ProfileManagementService.sendPresenceUnavailable(validateId(whatsappId, "whatsappId"));
    return res
      .status(200)
      .json({ message: "Presença definida como indisponível" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const setPresenceAvailable = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.body;

  try {
    await ProfileManagementService.sendPresenceAvailable(validateId(whatsappId, "whatsappId"));
    return res
      .status(200)
      .json({ message: "Presença definida como disponível" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ===================== CONTACT ACTIONS =====================
export const getContactAbout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, contactId } = req.query;

  try {
    const about = await ContactActionsService.getAbout(
      validateId(whatsappId, "whatsappId"),
      contactId as string
    );
    return res.status(200).json({ about });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getContactInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, contactId } = req.query;

  try {
    const info = await ContactActionsService.getContactInfo(
      validateId(whatsappId, "whatsappId"),
      contactId as string
    );
    return res.status(200).json(info);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const blockContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, contactId } = req.body;

  try {
    const result = await ContactActionsService.blockContact(
      validateId(whatsappId, "whatsappId"),
      contactId
    );
    return res
      .status(200)
      .json({ message: "Contato bloqueado", success: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const unblockContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, contactId } = req.body;

  try {
    const result = await ContactActionsService.unblockContact(
      validateId(whatsappId, "whatsappId"),
      contactId
    );
    return res
      .status(200)
      .json({ message: "Contato desbloqueado", success: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBlockedContacts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.query;

  try {
    const contacts = await ContactActionsService.getBlockedContacts(
      validateId(whatsappId, "whatsappId")
    );
    return res.status(200).json(contacts);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCommonGroups = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, contactId } = req.query;

  try {
    const groups = await ContactActionsService.getCommonGroups(
      validateId(whatsappId, "whatsappId"),
      contactId as string
    );
    return res.status(200).json(groups);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ===================== GROUP MEMBERSHIP REQUESTS =====================
export const getGroupMembershipRequests = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, groupId } = req.query;

  try {
    const requests = await GroupMembershipRequestsService.getRequests(
      validateId(whatsappId, "whatsappId"),
      groupId as string
    );
    return res.status(200).json(requests);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const approveGroupMembershipRequests = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, groupId, requesterIds } = req.body;

  try {
    const results = await GroupMembershipRequestsService.approveRequests(
      validateId(whatsappId, "whatsappId"),
      groupId,
      requesterIds
    );
    return res.status(200).json({ message: "Solicitações aprovadas", results });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const rejectGroupMembershipRequests = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, groupId, requesterIds } = req.body;

  try {
    const results = await GroupMembershipRequestsService.rejectRequests(
      validateId(whatsappId, "whatsappId"),
      groupId,
      requesterIds
    );
    return res
      .status(200)
      .json({ message: "Solicitações rejeitadas", results });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ===================== PIN/UNPIN MESSAGES =====================
export const pinMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId, duration } = req.body;

  try {
    const result = await PinWhatsAppMessage({
      messageId,
      duration: duration || 604800
    });
    return res
      .status(200)
      .json({ message: "Mensagem fixada", success: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const unpinMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.body;

  try {
    const result = await UnpinWhatsAppMessage(messageId);
    return res
      .status(200)
      .json({ message: "Mensagem desfixada", success: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ===================== MESSAGE INFO =====================
export const getMessageInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  try {
    const info = await GetMessageInfo(messageId);
    return res.status(200).json(info);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getMessageReactions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  try {
    const reactions = await GetMessageReactions(messageId);
    return res.status(200).json(reactions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getPollVotes = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  try {
    const votes = await GetPollVotes(messageId);
    return res.status(200).json(votes);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ===================== STAR/UNSTAR =====================
export const starMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.body;

  try {
    await StarWhatsAppMessage(messageId);
    return res.status(200).json({ message: "Mensagem favoritada" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const unstarMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.body;

  try {
    await UnstarWhatsAppMessage(messageId);
    return res.status(200).json({ message: "Mensagem desfavoritada" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ===================== PINNED MESSAGES =====================
export const getPinnedMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId } = req.query;

  try {
    const { GetPinnedMessages } =
      await import("../services/WbotServices/GetPinnedMessagesService");
    const pinnedMessages = await GetPinnedMessages(
      validateId(whatsappId, "whatsappId"),
      chatId as string
    );
    return res.status(200).json(pinnedMessages);
  } catch (error: any) {
    logger.error(`[FEATURES] Erro ao buscar mensagens fixadas: ${error}`);
    return res.status(500).json({ error: error.message });
  }
};

export const checkMessagePinned = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, chatId, messageId } = req.query;

  try {
    const { CheckIfMessageIsPinned } =
      await import("../services/WbotServices/GetPinnedMessagesService");
    const isPinned = await CheckIfMessageIsPinned(
      validateId(whatsappId, "whatsappId"),
      chatId as string,
      messageId as string
    );
    return res.status(200).json({ isPinned });
  } catch (error: any) {
    logger.error(
      `[FEATURES] Erro ao verificar se mensagem está fixada: ${error}`
    );
    return res.status(500).json({ error: error.message, isPinned: false });
  }
};
