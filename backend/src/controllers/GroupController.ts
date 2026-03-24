import { Request, Response } from "express";
import isAuth from "../middleware/isAuth"; 
import AppError from "../errors/AppError";
import { getWbotByGroupId } from "../libs/wbot";
import { MessageMedia } from "whatsapp-web.js";
import fs from "fs";
import { getIO } from "../libs/socket";
import groupEventsService from "../services/WbotServices/GroupEventsService";

async function getGroupChatOrFail(groupId: string) {
  const wbot = await getWbotByGroupId(groupId);
  if (!wbot) throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  const chat: any = await wbot.getChatById(groupId);
  if (!chat || !chat.isGroup) throw new AppError("ERR_GROUP_NOT_FOUND");
  return { wbot, chat };
}

export const getInfo = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { chat } = await getGroupChatOrFail(groupId);
  return res.json({
    name: chat.name || chat.subject || "",
    description: chat.groupMetadata?.desc || chat.description || ""
  });
};

export const addParticipants = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { participantIds, options } = req.body;

  if (!participantIds || !Array.isArray(participantIds) || !participantIds.length) {
    throw new AppError("ERR_NO_PARTICIPANTS");
  }

  const { chat } = await getGroupChatOrFail(groupId);
  const result = await chat.addParticipants(participantIds, options || {});

  if (typeof result === "string") {
    console.error("addParticipants retornou erro:", result);
    throw new AppError(result, 400);
  }

  const summary: any[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const [pId, data] of Object.entries(result as Record<string, any>)) {
    const code = data?.code;
    const ok = code === 200;
    if (ok) successCount++;
    else failCount++;
    summary.push({
      id: pId,
      code,
      message: data?.message || "",
      isInviteV4Sent: data?.isInviteV4Sent || false,
      success: ok
    });
  }

  return res.json({ summary, successCount, failCount });
};

export const removeParticipants = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { participantIds } = req.body;
  const { wbot, chat } = await getGroupChatOrFail(groupId);
  const result = await chat.removeParticipants(participantIds);

  const whatsappId = wbot.id as number;
  for (const pId of participantIds) {
    let pName = pId;
    try { const c = await wbot.getContactById(pId); pName = c?.name || c?.pushname || pId; } catch (_) {}
    groupEventsService.registerEvent({
      whatsappId, groupId, eventType: "PARTICIPANT_REMOVED",
      participantId: pId, participantName: pName
    }).catch(() => {});
  }

  return res.json(result);
};

export const promoteParticipants = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { participantIds } = req.body;
  const { wbot, chat } = await getGroupChatOrFail(groupId);
  const result = await chat.promoteParticipants(participantIds);

  const whatsappId = wbot.id as number;
  for (const pId of participantIds) {
    let pName = pId;
    try { const c = await wbot.getContactById(pId); pName = c?.name || c?.pushname || pId; } catch (_) {}
    groupEventsService.registerEvent({
      whatsappId, groupId, eventType: "PARTICIPANT_PROMOTED",
      participantId: pId, participantName: pName
    }).catch(() => {});
  }

  return res.json(result);
};

export const demoteParticipants = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { participantIds } = req.body;
  const { wbot, chat } = await getGroupChatOrFail(groupId);
  const result = await chat.demoteParticipants(participantIds);

  const whatsappId = wbot.id as number;
  for (const pId of participantIds) {
    let pName = pId;
    try { const c = await wbot.getContactById(pId); pName = c?.name || c?.pushname || pId; } catch (_) {}
    groupEventsService.registerEvent({
      whatsappId, groupId, eventType: "PARTICIPANT_DEMOTED",
      participantId: pId, participantName: pName
    }).catch(() => {});
  }

  return res.json(result);
};

export const getInvite = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { chat } = await getGroupChatOrFail(groupId);
  const code = await chat.getInviteCode();
  return res.json({ code, link: code ? `https://chat.whatsapp.com/${code}` : null });
};

export const revokeInvite = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { chat } = await getGroupChatOrFail(groupId);
  const code = await chat.revokeInvite();
  return res.json({ code, link: `https://chat.whatsapp.com/${code}` });
};

export const setMemberAddMode = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { adminsOnly } = req.body;
  const { chat } = await getGroupChatOrFail(groupId);
  const ok = await chat.setAddMembersAdminsOnly(Boolean(adminsOnly));
  return res.json({ success: !!ok });
};

export const setAnnouncement = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { adminsOnly } = req.body;
  const { chat } = await getGroupChatOrFail(groupId);
  const ok = await chat.setMessagesAdminsOnly(Boolean(adminsOnly));
  return res.json({ success: !!ok });
};

export const setRestrict = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { adminsOnly } = req.body;
  const { chat } = await getGroupChatOrFail(groupId);
  const ok = await chat.setInfoAdminsOnly(Boolean(adminsOnly));
  return res.json({ success: !!ok });
};

export const setSubject = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { subject } = req.body;
  if (!subject) throw new AppError("ERR_SUBJECT_REQUIRED");
  const { chat } = await getGroupChatOrFail(groupId);
  const ok = await chat.setSubject(subject);
  return res.json({ success: !!ok });
};

export const setDescription = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { description } = req.body;
  if (description == null) throw new AppError("ERR_DESCRIPTION_REQUIRED");
  
  const { wbot, chat } = await getGroupChatOrFail(groupId);
  
  try {
    const chatId = JSON.stringify(chat.id._serialized);
    const desc = JSON.stringify(description);
    const success = await (wbot as any).pupPage.evaluate(`
      (async () => {
        var chatWid = window.Store.WidFactory.createWid(${chatId});
        var metadataStore = window.Store.GroupMetadata || window.Store.WAWebGroupMetadataCollection;
        await metadataStore.update(chatWid);
        var metadata = metadataStore.get(chatWid);
        var descId = metadata ? metadata.descId : undefined;
        var newId = await window.Store.MsgKey.newId();
        try {
          await window.Store.GroupUtils.setGroupDescription(chatWid, ${desc}, newId, descId);
          return true;
        } catch (err) {
          if (err.name === 'ServerStatusCodeError') return false;
          throw err;
        }
      })()
    `);

    if (success) {
      chat.groupMetadata = chat.groupMetadata || {};
      chat.groupMetadata.desc = description;
    }

    return res.json({ success: !!success });
  } catch (error: any) {
    console.error("Erro ao alterar descrição do grupo:", error);
    throw new AppError(
      "Erro ao alterar descrição. Tente novamente ou reinicie a conexão WhatsApp.",
      500
    );
  }
};

export const setPicture = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const file = req.file as Express.Multer.File;
  
  if (!file) throw new AppError("ERR_FILE_REQUIRED");
  
  try {
    const { chat } = await getGroupChatOrFail(groupId);
    
    const base64 = fs.readFileSync(file.path, { encoding: "base64" });
    const media = new MessageMedia(file.mimetype, base64, file.filename);
    
    const ok = await chat.setPicture(media);
    
    fs.unlinkSync(file.path);
    
    const io = getIO();
    io.emit("group", {
      action: "update",
      groupId
    });
    
    return res.json({ success: !!ok });
  } catch (error) {
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    throw error;
  }
};

export const deletePicture = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { chat } = await getGroupChatOrFail(groupId);
  const ok = await chat.deletePicture();
  
  const io = getIO();
  io.emit("group", {
    action: "update",
    groupId
  });
  
  return res.json({ success: !!ok });
};

export const listMembershipRequests = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { wbot } = await getGroupChatOrFail(groupId);
  const list = await wbot.getGroupMembershipRequests(groupId);
  return res.json(list || []);
};

export const approveMembershipRequests = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { options } = req.body;
  const { wbot } = await getGroupChatOrFail(groupId);
  const result = await wbot.approveGroupMembershipRequests(groupId, options || {});
  return res.json(result || []);
};

export const rejectMembershipRequests = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { options } = req.body;
  const { wbot } = await getGroupChatOrFail(groupId);
  const result = await wbot.rejectGroupMembershipRequests(groupId, options || {});
  return res.json(result || []);
};

export const leaveGroup = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { chat } = await getGroupChatOrFail(groupId);
  await chat.leave();
  return res.json({ success: true });
};

export const listParticipants = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { wbot, chat } = await getGroupChatOrFail(groupId);
  let participants: any[] = Array.isArray((chat as any).participants) ? (chat as any).participants : [];
  try {
    if (!participants.length) {
      if (typeof (chat as any).getParticipants === 'function') {
        participants = await (chat as any).getParticipants();
      } else if (typeof (chat as any).fetchParticipants === 'function') {
        participants = await (chat as any).fetchParticipants();
      }
    }
  } catch (_) {
  }

  const result = await Promise.all(
    participants.map(async (p: any) => {
      const serialized = p?.id?._serialized || `${p?.id?.user || p?.id}@c.us`;
      try {
        const c = await wbot.getContactById(serialized);
        let avatar: string | null = null;
        try { avatar = await wbot.getProfilePicUrl(serialized); } catch { avatar = null; }
        let about: string | null = null;
        try { about = typeof c.getAbout === 'function' ? await c.getAbout() : null; } catch { about = null; }

        return {
          id: serialized,
          number: c?.number || c?.id?.user,
          name: c?.name || c?.pushname || c?.shortName || c?.id?.user,
          avatar,
          about,
          isAdmin: !!p?.isAdmin,
          isSuperAdmin: !!p?.isSuperAdmin,
        };
      } catch {
        return {
          id: serialized,
          number: p?.id?.user,
          name: p?.id?.user,
          avatar: null,
          about: null,
          isAdmin: !!p?.isAdmin,
          isSuperAdmin: !!p?.isSuperAdmin,
        };
      }
    })
  );

  return res.json({ count: result.length, participants: result });
};
