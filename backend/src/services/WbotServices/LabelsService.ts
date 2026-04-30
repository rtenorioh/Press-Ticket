import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

const errStr = (e: unknown) => e instanceof Error ? e.message : JSON.stringify(e);

interface LabelData {
  id: string;
  name: string;
  hexColor: string;
}

class LabelsService {
  async getLabels(whatsappId: number): Promise<LabelData[]> {
    try {
      const wbot = getWbot(whatsappId);
      const labels: any[] = await wbot.getLabels();

      return labels.map(label => ({
        id: label.id,
        name: label.name,
        hexColor: label.hexColor || ""
      }));
    } catch (err) {
      logger.error(`[LABELS] Erro ao listar etiquetas: ${errStr(err)}`);
      throw new AppError(`Erro ao listar etiquetas: ${errStr(err)}`);
    }
  }

  async getLabelById(whatsappId: number, labelId: string): Promise<LabelData> {
    try {
      const wbot = getWbot(whatsappId);
      const label: any = await wbot.getLabelById(labelId);

      if (!label) {
        throw new AppError("Etiqueta não encontrada");
      }

      return {
        id: label.id,
        name: label.name,
        hexColor: label.hexColor || ""
      };
    } catch (err) {
      logger.error(`[LABELS] Erro ao buscar etiqueta: ${errStr(err)}`);
      throw new AppError(`Erro ao buscar etiqueta: ${errStr(err)}`);
    }
  }

  async getChatLabels(whatsappId: number, chatId: string): Promise<LabelData[]> {
    try {
      const wbot = getWbot(whatsappId);
      const labels: any[] = await wbot.getChatLabels(chatId);

      return labels.map(label => ({
        id: label.id,
        name: label.name,
        hexColor: label.hexColor || ""
      }));
    } catch (err) {
      logger.error(`[LABELS] Erro ao buscar etiquetas do chat: ${errStr(err)}`);
      throw new AppError(`Erro ao buscar etiquetas do chat: ${errStr(err)}`);
    }
  }

  async getChatsByLabelId(whatsappId: number, labelId: string): Promise<any[]> {
    try {
      const wbot = getWbot(whatsappId);
      const chats: any[] = await wbot.getChatsByLabelId(labelId);

      return chats.map(chat => ({
        id: chat.id?._serialized || chat.id,
        name: chat.name,
        isGroup: chat.isGroup,
        unreadCount: chat.unreadCount,
        timestamp: chat.timestamp
      }));
    } catch (err) {
      logger.error(`[LABELS] Erro ao buscar chats por etiqueta: ${errStr(err)}`);
      throw new AppError(`Erro ao buscar chats por etiqueta: ${errStr(err)}`);
    }
  }

  async addOrRemoveChatLabels(
    whatsappId: number,
    chatId: string,
    labelIds: string[]
  ): Promise<void> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = await wbot.getChatById(chatId);
      await (chat as any).changeLabels(labelIds);
    } catch (err) {
      logger.error(`[LABELS] Erro ao alterar etiquetas do chat: ${errStr(err)}`);
      throw new AppError(`Erro ao alterar etiquetas do chat: ${errStr(err)}`);
    }
  }
}

export default new LabelsService();
