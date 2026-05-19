import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";

interface Request {
  contactId: string;
  whatsappId?: number;
}

interface GroupInfo {
  id: string;
  name: string;
  participantsCount: number;
  profilePicUrl?: string;
}

interface Response {
  contactId: number;
  contactName: string;
  contactNumber: string;
  commonGroups: GroupInfo[];
  totalGroups: number;
}

const GetCommonGroupsService = async ({
  contactId,
  whatsappId
}: Request): Promise<Response> => {
  const contact = await Contact.findByPk(contactId);

  if (!contact) {
    throw new AppError("ERR_CONTACT_NOT_FOUND", 404);
  }

  if (contact.isGroup) {
    throw new AppError("ERR_COMMON_GROUPS_NOT_SUPPORTED_FOR_GROUP", 400);
  }

  let sessionId: number | null = whatsappId || null;

  if (!sessionId) {
    const connected = await Whatsapp.findOne({
      where: { status: "CONNECTED", type: "wwebjs" }
    });
    sessionId = connected?.id || null;
  }

  if (!sessionId) {
    throw new AppError("ERR_NO_WHATSAPP_SESSION", 400);
  }

  const wbot = await getWbot(sessionId);

  const numberId = await wbot.getNumberId(contact.number!);
  if (!numberId) {
    throw new AppError("ERR_NUMBER_NOT_REGISTERED", 404);
  }

  let commonGroups: Array<{ _serialized?: string; user?: string }> = [];
  try {
    const wContact = await wbot.getContactById(numberId._serialized);
    const wContactExtended = wContact as unknown as {
      getCommonGroups?: () => Promise<
        Array<{ _serialized?: string; user?: string }>
      >;
    };
    commonGroups = wContactExtended.getCommonGroups
      ? await wContactExtended.getCommonGroups()
      : [];
  } catch (error: unknown) {
    const err = error as { message?: string };
    logger.warn(
      `[FALLBACK] Erro ao obter contato/grupos comuns do WhatsApp: ${err.message || error}`
    );
    commonGroups = [];
  }

  const groupsInfo: GroupInfo[] = [];

  for (const group of commonGroups) {
    const groupId = group._serialized || `${group.user}@g.us`;

    try {
      const groupChat = await wbot.getChatById(groupId);

      let profilePicUrl: string | undefined;
      try {
        profilePicUrl = await wbot.getProfilePicUrl(groupId);
      } catch (_picError) {
        profilePicUrl = undefined;
      }

      const groupChatExtended = groupChat as unknown as {
        participants?: unknown[];
      };
      groupsInfo.push({
        id: groupId,
        name: groupChat.name || "Sem nome",
        participantsCount: groupChatExtended.participants?.length || 0,
        profilePicUrl
      });
    } catch (_error) {
      groupsInfo.push({
        id: groupId,
        name: "Grupo (erro ao carregar)",
        participantsCount: 0
      });
    }
  }

  return {
    contactId: contact.id,
    contactName: contact.name,
    contactNumber: contact.number!,
    commonGroups: groupsInfo,
    totalGroups: groupsInfo.length
  };
};

export default GetCommonGroupsService;
