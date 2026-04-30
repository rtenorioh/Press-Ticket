import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

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

  const cleanCode = inviteCode
    .replace("https://chat.whatsapp.com/", "")
    .trim();

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

  const cleanCode = inviteCode
    .replace("https://chat.whatsapp.com/", "")
    .trim();

  try {
    const wbot = getWbot(whatsappId);
    const info: any = await wbot.getInviteInfo(cleanCode);

    return {
      groupId: info.id?._serialized || info.id,
      inviteCode: cleanCode,
      inviteCodeExpiration: info.inviteCodeExpiration,
      groupName: info.subject || info.name || "",
      descriptionId: info.descId,
      description: info.desc || "",
      size: info.size || 0,
      creation: info.creation || 0,
      owner: info.owner?._serialized || info.owner,
      subject: info.subject || "",
      subjectTime: info.subjectTime
    };
  } catch (err) {
    logger.error(`[INVITE] Erro ao obter informações do convite: ${err}`);
    throw new AppError(`Erro ao obter informações do convite: ${err}`);
  }
};

export { AcceptGroupInvite, GetGroupInviteInfo };
