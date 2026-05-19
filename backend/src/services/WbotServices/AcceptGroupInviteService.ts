import { Client } from "whatsapp-web.js";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

// wwebjs missing type definition for getInviteInfo return type
interface InviteInfoRaw {
  id?: { _serialized?: string } | string;
  inviteCodeExpiration?: string;
  subject?: string;
  name?: string;
  descId?: string;
  desc?: string;
  size?: number;
  creation?: number;
  owner?: { _serialized?: string } | string;
  subjectTime?: number;
}

interface ClientWithInviteInfo extends Client {
  getInviteInfo(code: string): Promise<InviteInfoRaw>;
}

interface AcceptInviteData {
  whatsappId: number;
  inviteCode: string;
}

interface InviteInfoData {
  whatsappId: number;
  inviteCode: string;
}

interface InviteInfo {
  groupId: string;
  inviteCode: string;
  inviteCodeExpiration?: string;
  groupName: string;
  descriptionId?: string;
  description?: string;
  size: number;
  creation: number;
  owner?: string;
  subject: string;
  subjectTime?: number;
}

const AcceptGroupInvite = async ({
  whatsappId,
  inviteCode
}: AcceptInviteData): Promise<string> => {
  if (!inviteCode) {
    throw new AppError("Código de convite é obrigatório");
  }

  const cleanCode = inviteCode.replace("https://chat.whatsapp.com/", "").trim();

  try {
    const wbot = getWbot(whatsappId);
    const groupId = await wbot.acceptInvite(cleanCode);
    return groupId;
  } catch (err) {
    logger.error(`[INVITE] Erro ao aceitar convite: ${err}`);
    throw new AppError(`Erro ao aceitar convite: ${err}`);
  }
};

const GetGroupInviteInfo = async ({
  whatsappId,
  inviteCode
}: InviteInfoData): Promise<InviteInfo> => {
  if (!inviteCode) {
    throw new AppError("Código de convite é obrigatório");
  }

  const cleanCode = inviteCode.replace("https://chat.whatsapp.com/", "").trim();

  try {
    const wbot = getWbot(whatsappId) as unknown as ClientWithInviteInfo;
    const info = await wbot.getInviteInfo(cleanCode);

    const rawId = info.id;
    const resolvedId = (typeof rawId === "object" ? rawId?._serialized : rawId) || "";
    const rawOwner = info.owner;
    const resolvedOwner = (typeof rawOwner === "object" ? rawOwner?._serialized : rawOwner) || undefined;

    return {
      groupId: resolvedId,
      inviteCode: cleanCode,
      inviteCodeExpiration: info.inviteCodeExpiration,
      groupName: info.subject || info.name || "",
      descriptionId: info.descId,
      description: info.desc || "",
      size: info.size || 0,
      creation: info.creation || 0,
      owner: resolvedOwner,
      subject: info.subject || "",
      subjectTime: info.subjectTime
    };
  } catch (err) {
    logger.error(`[INVITE] Erro ao obter informações do convite: ${err}`);
    throw new AppError(`Erro ao obter informações do convite: ${err}`);
  }
};

export { AcceptGroupInvite, GetGroupInviteInfo };
