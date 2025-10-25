import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import Contact from "../../models/Contact";

interface Request {
  whatsappId?: number;
}

interface BlockedContact {
  id: string;
  name: string;
  number: string;
  profilePicUrl?: string;
  isRegisteredInSystem: boolean;
  systemContactId?: number;
}

interface Response {
  blockedContacts: BlockedContact[];
  total: number;
  whatsappId: number;
}

const ListBlockedContactsService = async ({
  whatsappId
}: Request): Promise<Response> => {
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
  
  const allContacts = await wbot.getContacts();
  // Filtrar apenas contatos bloqueados com @c.us (excluir @lid)
  const blockedContacts = allContacts.filter((contact: any) => 
    contact.isBlocked && contact.id._serialized.includes('@c.us')
  );

  const blockedContactsInfo: BlockedContact[] = [];

  for (const wContact of blockedContacts) {
    const number = wContact.id.user;
    
    let profilePicUrl: string | undefined;
    try {
      profilePicUrl = await wbot.getProfilePicUrl(wContact.id._serialized);
    } catch (error) {
      profilePicUrl = undefined;
    }

    const systemContact = await Contact.findOne({
      where: { number }
    });

    blockedContactsInfo.push({
      id: wContact.id._serialized,
      name: wContact.name || wContact.pushname || number,
      number,
      profilePicUrl,
      isRegisteredInSystem: !!systemContact,
      systemContactId: systemContact?.id
    });
  }

  return {
    blockedContacts: blockedContactsInfo,
    total: blockedContactsInfo.length,
    whatsappId: sessionId
  };
};

export default ListBlockedContactsService;
