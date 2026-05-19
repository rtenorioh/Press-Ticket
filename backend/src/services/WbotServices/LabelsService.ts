import { Client } from "whatsapp-web.js";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

// wwebjs missing type definition for label-related methods
interface WbotLabel {
  id: string;
  name: string;
  hexColor?: string;
}

interface WbotChat {
  id?: { _serialized?: string } | string;
  name?: string;
  isGroup?: boolean;
  unreadCount?: number;
  timestamp?: number;
  changeLabels(labelIds: string[]): Promise<void>;
}

type ClientWithLabels = Client & {
  getLabels(): Promise<WbotLabel[]>;
  getLabelById(labelId: string): Promise<WbotLabel | null>;
  getChatLabels(chatId: string): Promise<WbotLabel[]>;
  getChatsByLabelId(labelId: string): Promise<WbotChat[]>;
};

const errStr = (e: unknown) =>
  e instanceof Error ? e.message : JSON.stringify(e);

interface LabelData {
  id: string;
  name: string;
  hexColor: string;
}

class LabelsService {
  async getLabels(whatsappId: number): Promise<LabelData[]> {
    try {
      const wbot = getWbot(whatsappId) as unknown as ClientWithLabels;
      const labels = await wbot.getLabels();

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
      const wbot = getWbot(whatsappId) as unknown as ClientWithLabels;
      const label = await wbot.getLabelById(labelId);

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

  async getChatLabels(
    whatsappId: number,
    chatId: string
  ): Promise<LabelData[]> {
    try {
      const wbot = getWbot(whatsappId) as unknown as ClientWithLabels;
      const labels = await wbot.getChatLabels(chatId);

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

  async getChatsByLabelId(whatsappId: number, labelId: string): Promise<{ id: string; name: string | undefined; isGroup: boolean | undefined; unreadCount: number | undefined; timestamp: number | undefined }[]> {
    try {
      const wbot = getWbot(whatsappId) as unknown as ClientWithLabels;
      const chats = await wbot.getChatsByLabelId(labelId);

      return chats.map(chat => {
        const rawId = chat.id;
        const resolvedId = (typeof rawId === "object" ? rawId?._serialized : rawId) || "";
        return {
          id: resolvedId,
          name: chat.name,
          isGroup: chat.isGroup,
          unreadCount: chat.unreadCount,
          timestamp: chat.timestamp
        };
      });
    } catch (err) {
      logger.error(
        `[LABELS] Erro ao buscar chats por etiqueta: ${errStr(err)}`
      );
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
      await (chat as unknown as WbotChat).changeLabels(labelIds);
    } catch (err) {
      logger.error(
        `[LABELS] Erro ao alterar etiquetas do chat: ${errStr(err)}`
      );
      throw new AppError(`Erro ao alterar etiquetas do chat: ${errStr(err)}`);
    }
  }
}

export default new LabelsService();
