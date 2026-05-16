import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface SearchMessagesData {
  whatsappId: number;
  query: string;
  chatId?: string;
  page?: number;
  limit?: number;
}

interface SearchResult {
  messages: Array<{
    id: string;
    body: string;
    from: string;
    to: string;
    timestamp: number;
    fromMe: boolean;
    hasMedia: boolean;
    type: string;
    chatName?: string;
  }>;
  totalCount: number;
}

const SearchMessagesService = async ({
  whatsappId,
  query,
  chatId,
  page = 1,
  limit = 50
}: SearchMessagesData): Promise<SearchResult> => {
  if (!query || query.trim().length < 2) {
    throw new AppError("A consulta deve ter pelo menos 2 caracteres");
  }

  try {
    const wbot = getWbot(whatsappId);

    logger.info(
      `[SEARCH] Buscando mensagens: query="${query}", chatId=${chatId || "global"}, page=${page}, limit=${limit}`
    );

    const results: any = await wbot.searchMessages(query, {
      page,
      limit,
      chatId: chatId || undefined
    });

    if (!results || (Array.isArray(results) && results.length === 0)) {
      return { messages: [], totalCount: 0 };
    }

    const messageList = Array.isArray(results)
      ? results
      : results.messages || [];

    return {
      messages: messageList.map((msg: any) => ({
        id: msg.id?.id || msg.id?._serialized || msg.id,
        body: msg.body,
        from: msg.from,
        to: msg.to,
        timestamp: msg.timestamp,
        fromMe: msg.fromMe,
        hasMedia: msg.hasMedia,
        type: msg.type,
        chatName: msg.chat?.name
      })),
      totalCount: Array.isArray(results)
        ? results.length
        : results.totalCount || messageList.length
    };
  } catch (err: any) {
    logger.error(
      `[SEARCH] Erro ao buscar mensagens: ${err?.message || JSON.stringify(err)}`
    );
    throw new AppError(
      `Erro ao buscar mensagens: ${err?.message || "Erro desconhecido"}`
    );
  }
};

export default SearchMessagesService;
