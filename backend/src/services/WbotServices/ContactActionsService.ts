import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface ContactInfo {
  id: string;
  name: string;
  pushname: string;
  number: string;
  about?: string;
  isBlocked?: boolean;
  isBusiness?: boolean;
  isEnterprise?: boolean;
  profilePicUrl?: string;
}

interface BlockedContact {
  id: string;
  name: string;
  number: string;
}

class ContactActionsService {
  async getAbout(whatsappId: number, contactId: string): Promise<string> {
    try {
      const wbot = getWbot(whatsappId);

      let formattedId = contactId;
      if (!formattedId.includes("@")) {
        formattedId = `${formattedId}@c.us`;
      }

      const contact = await wbot.getContactById(formattedId);
      const about = await contact.getAbout();

      return about || "";
    } catch (err) {
      logger.error(`[CONTACT] Erro ao obter 'sobre' do contato: ${err}`);
      throw new AppError(`Erro ao obter informações do contato: ${err}`);
    }
  }

  async getContactInfo(
    whatsappId: number,
    contactId: string
  ): Promise<ContactInfo> {
    try {
      const wbot = getWbot(whatsappId);

      let formattedId = contactId;
      if (!formattedId.includes("@")) {
        formattedId = `${formattedId}@c.us`;
      }

      const contact = await wbot.getContactById(formattedId);
      const about = await contact.getAbout();
      let profilePicUrl: string | undefined;

      try {
        profilePicUrl = await contact.getProfilePicUrl();
      } catch (_e) {
        profilePicUrl = undefined;
      }

      return {
        id: contact.id._serialized,
        name: contact.name || "",
        pushname: contact.pushname || "",
        number: contact.number,
        about: about || undefined,
        isBlocked: contact.isBlocked,
        isBusiness: contact.isBusiness,
        isEnterprise: contact.isEnterprise,
        profilePicUrl
      };
    } catch (err) {
      logger.error(`[CONTACT] Erro ao obter informações do contato: ${err}`);
      throw new AppError(`Erro ao obter informações do contato: ${err}`);
    }
  }

  async blockContact(whatsappId: number, contactId: string): Promise<boolean> {
    try {
      const wbot = getWbot(whatsappId);

      let formattedId = contactId;
      if (!formattedId.includes("@")) {
        formattedId = `${formattedId}@c.us`;
      }

      const contact = await wbot.getContactById(formattedId);
      return await contact.block();
    } catch (err) {
      logger.error(`[CONTACT] Erro ao bloquear contato: ${err}`);
      throw new AppError(`Erro ao bloquear contato: ${err}`);
    }
  }

  async unblockContact(
    whatsappId: number,
    contactId: string
  ): Promise<boolean> {
    try {
      const wbot = getWbot(whatsappId);

      let formattedId = contactId;
      if (!formattedId.includes("@")) {
        formattedId = `${formattedId}@c.us`;
      }

      const contact = await wbot.getContactById(formattedId);
      return await contact.unblock();
    } catch (err) {
      logger.error(`[CONTACT] Erro ao desbloquear contato: ${err}`);
      throw new AppError(`Erro ao desbloquear contato: ${err}`);
    }
  }

  async getBlockedContacts(whatsappId: number): Promise<BlockedContact[]> {
    try {
      const wbot = getWbot(whatsappId);
      const blocked: any[] = await wbot.getBlockedContacts();

      return blocked.map(contact => ({
        id: contact.id?._serialized || contact.id,
        name: contact.name || contact.pushname || "",
        number: contact.number || contact.id?.user || ""
      }));
    } catch (err) {
      logger.error(`[CONTACT] Erro ao listar contatos bloqueados: ${err}`);
      throw new AppError(`Erro ao listar contatos bloqueados: ${err}`);
    }
  }

  async getCommonGroups(whatsappId: number, contactId: string): Promise<any[]> {
    try {
      const wbot = getWbot(whatsappId);

      let formattedId = contactId;
      if (!formattedId.includes("@")) {
        formattedId = `${formattedId}@c.us`;
      }

      const contact = await wbot.getContactById(formattedId);
      const groups: any[] = await contact.getCommonGroups();

      return groups.map(group => ({
        id: group.id?._serialized || group.id,
        name: group.name || "",
        participantsCount: group.participants?.length || 0
      }));
    } catch (err) {
      logger.error(`[CONTACT] Erro ao buscar grupos em comum: ${err}`);
      throw new AppError(`Erro ao buscar grupos em comum: ${err}`);
    }
  }
}

export default new ContactActionsService();
