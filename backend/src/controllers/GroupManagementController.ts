import { Request, Response } from "express";
import GroupManagementService from "../services/WbotServices/GroupManagementService";
import GroupEventsService from "../services/WbotServices/GroupEventsService";
import AppError from "../errors/AppError";
import { getWbot } from "../libs/wbot";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import GetClientIp from "../helpers/GetClientIp";

export const createGroup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { name, participants } = req.body;
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);

  if (!name || !participants || !Array.isArray(participants)) {
    throw new AppError("Nome e participantes são obrigatórios");
  }

  const group = await GroupManagementService.createGroup({
    whatsappId: Number(whatsappId),
    name,
    participants
  });

  // LOG: Grupo criado
  try {
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.CREATE,
      description: `Grupo "${name}" criado`,
      entityType: EntityTypes.GROUP,
      entityId: Number(whatsappId),
      ip: clientIp,
      additionalData: {
        groupName: name,
        participantCount: participants.length,
        whatsappId: Number(whatsappId)
      }
    });
  } catch (error) {
    console.error('Erro ao criar log de criar grupo:', error);
  }

  return res.json(group);
};

export const getGroupInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, groupId } = req.params;

  const groupInfo = await GroupManagementService.getGroupInfo(
    Number(whatsappId),
    groupId
  );

  return res.json(groupInfo);
};

export const updateGroupName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, groupId } = req.params;
  const { name } = req.body;

  await GroupManagementService.updateGroupName({
    whatsappId: Number(whatsappId),
    groupId,
    name
  });

  return res.json({ message: "Nome do grupo atualizado com sucesso" });
};

export const updateGroupDescription = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, groupId } = req.params;
  const { description } = req.body;

  await GroupManagementService.updateGroupDescription({
    whatsappId: Number(whatsappId),
    groupId,
    description
  });

  return res.json({ message: "Descrição do grupo atualizada com sucesso" });
};

export const addParticipants = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, groupId } = req.params;
  const { participants } = req.body;
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);

  if (!participants || !Array.isArray(participants)) {
    throw new AppError("Participantes devem ser um array");
  }

  const result = await GroupManagementService.addParticipants({
    whatsappId: Number(whatsappId),
    groupId,
    participants
  });

  const wbot = getWbot(Number(whatsappId));
  for (const participantId of participants) {
    try {
      const contact = await wbot.getContactById(participantId.includes('@') ? participantId : `${participantId}@c.us`);
      await GroupEventsService.registerEvent({
        whatsappId: Number(whatsappId),
        groupId,
        eventType: "PARTICIPANT_ADDED",
        participantId: contact.id._serialized,
        participantName: contact.name || contact.pushname || participantId,
        performedBy: wbot.info.wid._serialized,
        performedByName: "Você"
      });
    } catch (err) {
      console.error(`Erro ao registrar evento de adição: ${err}`);
    }
  }

  // LOG: Participantes adicionados
  try {
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.JOIN,
      description: `${participants.length} participante(s) adicionado(s) ao grupo ${groupId}`,
      entityType: EntityTypes.GROUP,
      entityId: Number(whatsappId),
      ip: clientIp,
      additionalData: {
        groupId,
        participantCount: participants.length,
        whatsappId: Number(whatsappId)
      }
    });
  } catch (error) {
    console.error('Erro ao criar log de adicionar participantes:', error);
  }

  return res.json({ 
    message: "Participantes adicionados com sucesso",
    result 
  });
};

export const removeParticipants = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, groupId } = req.params;
  const { participants } = req.body;
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);

  if (!participants || !Array.isArray(participants)) {
    throw new AppError("Participantes devem ser um array");
  }

  await GroupManagementService.removeParticipants({
    whatsappId: Number(whatsappId),
    groupId,
    participants
  });

  const wbot = getWbot(Number(whatsappId));
  for (const participantId of participants) {
    try {
      const contact = await wbot.getContactById(participantId.includes('@') ? participantId : `${participantId}@c.us`);
      await GroupEventsService.registerEvent({
        whatsappId: Number(whatsappId),
        groupId,
        eventType: "PARTICIPANT_REMOVED",
        participantId: contact.id._serialized,
        participantName: contact.name || contact.pushname || participantId,
        performedBy: wbot.info.wid._serialized,
        performedByName: "Você"
      });
    } catch (err) {
      console.error(`Erro ao registrar evento de remoção: ${err}`);
    }
  }

  // LOG: Participantes removidos
  try {
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.LEAVE,
      description: `${participants.length} participante(s) removido(s) do grupo ${groupId}`,
      entityType: EntityTypes.GROUP,
      entityId: Number(whatsappId),
      ip: clientIp,
      additionalData: {
        groupId,
        participantCount: participants.length,
        whatsappId: Number(whatsappId)
      }
    });
  } catch (error) {
    console.error('Erro ao criar log de remover participantes:', error);
  }

  return res.json({ message: "Participantes removidos com sucesso" });
};

export const promoteParticipants = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, groupId } = req.params;
  const { participants } = req.body;
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);

  if (!participants || !Array.isArray(participants)) {
    throw new AppError("Participantes devem ser um array");
  }

  await GroupManagementService.promoteParticipants({
    whatsappId: Number(whatsappId),
    groupId,
    participants
  });

  const wbot = getWbot(Number(whatsappId));
  for (const participantId of participants) {
    try {
      const contact = await wbot.getContactById(participantId.includes('@') ? participantId : `${participantId}@c.us`);
      await GroupEventsService.registerEvent({
        whatsappId: Number(whatsappId),
        groupId,
        eventType: "PARTICIPANT_PROMOTED",
        participantId: contact.id._serialized,
        participantName: contact.name || contact.pushname || participantId,
        performedBy: wbot.info.wid._serialized,
        performedByName: "Você"
      });
    } catch (err) {
      console.error(`Erro ao registrar evento de promoção: ${err}`);
    }
  }

  // LOG: Participantes promovidos
  try {
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.PROMOTE,
      description: `${participants.length} participante(s) promovido(s) a admin no grupo ${groupId}`,
      entityType: EntityTypes.GROUP,
      entityId: Number(whatsappId),
      ip: clientIp,
      additionalData: {
        groupId,
        participantCount: participants.length,
        whatsappId: Number(whatsappId)
      }
    });
  } catch (error) {
    console.error('Erro ao criar log de promover participantes:', error);
  }

  return res.json({ message: "Participantes promovidos a admin com sucesso" });
};

export const demoteParticipants = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, groupId } = req.params;
  const { participants } = req.body;
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);

  if (!participants || !Array.isArray(participants)) {
    throw new AppError("Participantes devem ser um array");
  }

  await GroupManagementService.demoteParticipants({
    whatsappId: Number(whatsappId),
    groupId,
    participants
  });

  const wbot = getWbot(Number(whatsappId));
  for (const participantId of participants) {
    try {
      const contact = await wbot.getContactById(participantId.includes('@') ? participantId : `${participantId}@c.us`);
      await GroupEventsService.registerEvent({
        whatsappId: Number(whatsappId),
        groupId,
        eventType: "PARTICIPANT_DEMOTED",
        participantId: contact.id._serialized,
        participantName: contact.name || contact.pushname || participantId,
        performedBy: wbot.info.wid._serialized,
        performedByName: "Você"
      });
    } catch (err) {
      console.error(`Erro ao registrar evento de rebaixamento: ${err}`);
    }
  }

  // LOG: Participantes rebaixados
  try {
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.DEMOTE,
      description: `${participants.length} participante(s) rebaixado(s) no grupo ${groupId}`,
      entityType: EntityTypes.GROUP,
      entityId: Number(whatsappId),
      ip: clientIp,
      additionalData: {
        groupId,
        participantCount: participants.length,
        whatsappId: Number(whatsappId)
      }
    });
  } catch (error) {
    console.error('Erro ao criar log de rebaixar participantes:', error);
  }

  return res.json({ message: "Participantes rebaixados com sucesso" });
};

export const leaveGroup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, groupId } = req.params;

  await GroupManagementService.leaveGroup(Number(whatsappId), groupId);

  return res.json({ message: "Saiu do grupo com sucesso" });
};

export const getGroupInviteLink = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, groupId } = req.params;

  const inviteLink = await GroupManagementService.getGroupInviteLink(
    Number(whatsappId),
    groupId
  );

  return res.json({ inviteLink });
};

export const revokeGroupInviteLink = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, groupId } = req.params;
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);

  const newInviteLink = await GroupManagementService.revokeGroupInviteLink(
    Number(whatsappId),
    groupId
  );

  // LOG: Link de convite revogado
  try {
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.REVOKE,
      description: `Link de convite do grupo ${groupId} revogado`,
      entityType: EntityTypes.GROUP,
      entityId: Number(whatsappId),
      ip: clientIp,
      additionalData: {
        groupId,
        whatsappId: Number(whatsappId)
      }
    });
  } catch (error) {
    console.error('Erro ao criar log de revogar link:', error);
  }

  return res.json({ inviteLink: newInviteLink });
};

export const listGroups = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;

  const groups = await GroupManagementService.listGroups(Number(whatsappId));

  return res.json(groups);
};

export const updateGroupSettings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, groupId } = req.params;
  const { messagesAdminsOnly, editGroupInfoAdminsOnly } = req.body;

  await GroupManagementService.updateGroupSettings(
    Number(whatsappId),
    groupId,
    {
      messagesAdminsOnly,
      editGroupInfoAdminsOnly
    }
  );

  return res.json({ message: "Configurações do grupo atualizadas com sucesso" });
};
