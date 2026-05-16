import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";

interface PinnedMessageInfo {
  id: string;
  body: string;
  timestamp: number;
  fromMe: boolean;
  author?: string;
  type: string;
}

const GetPinnedMessages = async (
  whatsappId: number,
  chatId: string
): Promise<PinnedMessageInfo[]> => {
  try {
    const wbot = getWbot(whatsappId);
    const chat = await wbot.getChatById(chatId);
    const pinned = await chat.getPinnedMessages();

    return pinned.map((msg: any) => ({
      id: msg.id.id || msg.id._serialized,
      body: msg.body || "",
      timestamp: msg.timestamp,
      fromMe: msg.fromMe,
      author: msg.author,
      type: msg.type
    }));
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    logger.warn(
      `[PINNED_MESSAGES] Não foi possível buscar mensagens fixadas: ${errMsg}`
    );
    return [];
  }
};

const CheckIfMessageIsPinned = async (
  whatsappId: number,
  chatId: string,
  messageId: string
): Promise<boolean> => {
  try {
    const pinnedMessages = await GetPinnedMessages(whatsappId, chatId);
    return pinnedMessages.some(msg => msg.id === messageId);
  } catch (err) {
    logger.error(
      `[PINNED_MESSAGES] Erro ao verificar se mensagem está fixada: ${err}`
    );
    return false;
  }
};

export { CheckIfMessageIsPinned, GetPinnedMessages };
