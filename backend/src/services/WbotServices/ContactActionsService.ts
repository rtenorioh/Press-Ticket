import { Client } from "whatsapp-web.js";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

// wwebjs missing type definition for getBlockedContacts and getCommonGroups
interface BlockedContactEntry {
  id?: { _serialized?: string } | string;
  name?: string;
  pushname?: string;
  number?: string;
}

interface CommonGroupEntry {
  id?: { _serialized?: string } | string;
  name?: string;
  participants?: unknown[];
}

type ClientWithBlocked = Client & {
  getBlockedContacts(): Promise<BlockedContactEntry[]>;
};

interface ContactWithGroups {
  getCommonGroups(): Promise<CommonGroupEntry[]>;
  getAbout(): Promise<string | null>;
  id: { _serialized: string };
  name: string;
  pushname: string;
  number: string;
  isBlocked: boolean;
  isBusiness: boolean;
  isEnterprise: boolean;
  block(): Promise<boolean>;
  unblock(): Promise<boolean>;
  getProfilePicUrl(): Promise<string>;
}

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
      const blocked = await (
        wbot as unknown as ClientWithBlocked
      ).getBlockedContacts();

      return blocked.map(contact => {
        const rawId = contact.id;
        const resolvedId =
          (typeof rawId === "object" ? rawId?._serialized : rawId) || "";
        return {
          id: resolvedId,
          name: contact.name || contact.pushname || "",
          number: contact.number || ""
        };
      });
    } catch (err) {
      logger.error(`[CONTACT] Erro ao listar contatos bloqueados: ${err}`);
      throw new AppError(`Erro ao listar contatos bloqueados: ${err}`);
    }
  }

  async getCommonGroups(
    whatsappId: number,
    contactId: string
  ): Promise<{ id: string; name: string; participantsCount: number }[]> {
    try {
      const wbot = getWbot(whatsappId);

      let formattedId = contactId;
      if (!formattedId.includes("@")) {
        formattedId = `${formattedId}@c.us`;
      }

      const contact = await wbot.getContactById(formattedId);
      const groups = await (
        contact as unknown as ContactWithGroups
      ).getCommonGroups();

      return groups.map(group => {
        const rawId = group.id;
        const resolvedId =
          (typeof rawId === "object" ? rawId?._serialized : rawId) || "";
        return {
          id: resolvedId,
          name: group.name || "",
          participantsCount: group.participants?.length || 0
        };
      });
    } catch (err) {
      logger.error(`[CONTACT] Erro ao buscar grupos em comum: ${err}`);
      throw new AppError(`Erro ao buscar grupos em comum: ${err}`);
    }
  }
}

export default new ContactActionsService();
