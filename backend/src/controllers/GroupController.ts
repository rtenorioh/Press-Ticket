import { Request, Response } from "express";
import isAuth from "../middleware/isAuth"; 
import AppError from "../errors/AppError";
import { getWbotByGroupId } from "../libs/wbot";
import { MessageMedia } from "whatsapp-web.js";

async function getGroupChatOrFail(groupId: string) {
  const wbot = await getWbotByGroupId(groupId);
  if (!wbot) throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  const chat: any = await wbot.getChatById(groupId);
  if (!chat || !chat.isGroup) throw new AppError("ERR_GROUP_NOT_FOUND");
  return { wbot, chat };
}

export const addParticipants = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { participantIds, options } = req.body;
  const { chat } = await getGroupChatOrFail(groupId);
  const result = await chat.addParticipants(participantIds, options || {});
  return res.json(result);
};

export const removeParticipants = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { participantIds } = req.body;
  const { chat } = await getGroupChatOrFail(groupId);
  const result = await chat.removeParticipants(participantIds);
  return res.json(result);
};

export const promoteParticipants = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { participantIds } = req.body;
  const { chat } = await getGroupChatOrFail(groupId);
  const result = await chat.promoteParticipants(participantIds);
  return res.json(result);
};

export const demoteParticipants = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { participantIds } = req.body;
  const { chat } = await getGroupChatOrFail(groupId);
  const result = await chat.demoteParticipants(participantIds);
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
  const { chat } = await getGroupChatOrFail(groupId);
  const ok = await chat.setDescription(description);
  return res.json({ success: !!ok });
};

export const setPicture = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { data, mimetype, filename } = req.body;
  if (!data || !mimetype) throw new AppError("ERR_MEDIA_REQUIRED");
  const { chat } = await getGroupChatOrFail(groupId);
  const media = new MessageMedia(mimetype, data, filename || "group.jpg");
  const ok = await chat.setPicture(media);
  return res.json({ success: !!ok });
};

export const deletePicture = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { chat } = await getGroupChatOrFail(groupId);
  const ok = await chat.deletePicture();
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
