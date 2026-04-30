import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

const errStr = (e: unknown) => e instanceof Error ? e.message : JSON.stringify(e);

class ChatManagementService {
  async sendSeen(whatsappId: number, chatId: string): Promise<void> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = await wbot.getChatById(chatId);
      await chat.sendSeen();
    } catch (err) {
      logger.error(`[CHAT_MGMT] Erro ao marcar como visto: ${errStr(err)}`);
      throw new AppError(`Erro ao marcar como visto: ${errStr(err)}`);
    }
  }

  async archiveChat(whatsappId: number, chatId: string): Promise<void> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = await wbot.getChatById(chatId);
      await chat.archive();
    } catch (err) {
      logger.error(`[CHAT_MGMT] Erro ao arquivar chat: ${errStr(err)}`);
      throw new AppError(`Erro ao arquivar chat: ${errStr(err)}`);
    }
  }

  async unarchiveChat(whatsappId: number, chatId: string): Promise<void> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = await wbot.getChatById(chatId);
      await chat.unarchive();
    } catch (err) {
      logger.error(`[CHAT_MGMT] Erro ao desarquivar chat: ${errStr(err)}`);
      throw new AppError(`Erro ao desarquivar chat: ${errStr(err)}`);
    }
  }

  async pinChat(whatsappId: number, chatId: string): Promise<boolean> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = await wbot.getChatById(chatId);
      return await chat.pin();
    } catch (err) {
      logger.error(`[CHAT_MGMT] Erro ao fixar chat: ${errStr(err)}`);
      throw new AppError(`Erro ao fixar chat: ${errStr(err)}`);
    }
  }

  async unpinChat(whatsappId: number, chatId: string): Promise<boolean> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = await wbot.getChatById(chatId);
      return await chat.unpin();
    } catch (err) {
      logger.error(`[CHAT_MGMT] Erro ao desfixar chat: ${errStr(err)}`);
      throw new AppError(`Erro ao desfixar chat: ${errStr(err)}`);
    }
  }

  async muteChat(
    whatsappId: number,
    chatId: string,
    unmuteDate: Date
  ): Promise<void> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = await wbot.getChatById(chatId);
      await chat.mute(unmuteDate);
    } catch (err) {
      logger.error(`[CHAT_MGMT] Erro ao silenciar chat: ${errStr(err)}`);
      throw new AppError(`Erro ao silenciar chat: ${errStr(err)}`);
    }
  }

  async unmuteChat(whatsappId: number, chatId: string): Promise<void> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = await wbot.getChatById(chatId);
      await chat.unmute();
    } catch (err) {
      logger.error(`[CHAT_MGMT] Erro ao ativar notificações do chat: ${errStr(err)}`);
      throw new AppError(`Erro ao ativar notificações do chat: ${errStr(err)}`);
    }
  }

  async markUnread(whatsappId: number, chatId: string): Promise<void> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = await wbot.getChatById(chatId);
      await chat.markUnread();
    } catch (err) {
      logger.error(`[CHAT_MGMT] Erro ao marcar como não lido: ${errStr(err)}`);
      throw new AppError(`Erro ao marcar como não lido: ${errStr(err)}`);
    }
  }

  async fetchMessages(
    whatsappId: number,
    chatId: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = await wbot.getChatById(chatId);
      const messages = await chat.fetchMessages({ limit });

      return messages.map(msg => ({
        id: msg.id.id,
        body: msg.body,
        from: msg.from,
        to: msg.to,
        timestamp: msg.timestamp,
        fromMe: msg.fromMe,
        hasMedia: msg.hasMedia,
        type: msg.type,
        ack: msg.ack
      }));
    } catch (err) {
      logger.error(`[CHAT_MGMT] Erro ao buscar mensagens: ${errStr(err)}`);
      throw new AppError(`Erro ao buscar mensagens: ${errStr(err)}`);
    }
  }

  async clearMessages(whatsappId: number, chatId: string): Promise<boolean> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = await wbot.getChatById(chatId);
      return await chat.clearMessages();
    } catch (err) {
      logger.error(`[CHAT_MGMT] Erro ao limpar mensagens: ${errStr(err)}`);
      throw new AppError(`Erro ao limpar mensagens: ${errStr(err)}`);
    }
  }

  async getChatInfo(whatsappId: number, chatId: string): Promise<any> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = await wbot.getChatById(chatId);
      return {
        id: (chat as any).id?._serialized || (chat as any).id,
        name: chat.name,
        isGroup: chat.isGroup,
        unreadCount: chat.unreadCount,
        archived: chat.archived,
        pinned: chat.pinned,
        isMuted: chat.isMuted,
        muteExpiration: chat.muteExpiration
      };
    } catch (err) {
      logger.error(`[CHAT_MGMT] Erro ao buscar info do chat: ${errStr(err)}`);
      throw new AppError(`Erro ao buscar info do chat: ${errStr(err)}`);
    }
  }

  async getChats(whatsappId: number): Promise<any[]> {
    try {
      const wbot = getWbot(whatsappId);
      const chats = await wbot.getChats();

      return chats.map(chat => ({
        id: (chat as any).id?._serialized || (chat as any).id,
        name: chat.name,
        isGroup: chat.isGroup,
        unreadCount: chat.unreadCount,
        timestamp: chat.timestamp,
        archived: chat.archived,
        pinned: chat.pinned,
        isMuted: chat.isMuted,
        muteExpiration: chat.muteExpiration
      }));
    } catch (err) {
      logger.error(`[CHAT_MGMT] Erro ao listar chats: ${errStr(err)}`);
      throw new AppError(`Erro ao listar chats: ${errStr(err)}`);
    }
  }
}

export default new ChatManagementService();
