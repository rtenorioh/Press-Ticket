import { Client } from "whatsapp-web.js";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

// wwebjs missing type definition for searchMessages
type ClientWithSearch = Client & {
  searchMessages(query: string, opts: { page: number; limit: number; chatId?: string }): Promise<
    | SearchMsgEntry[]
    | { messages?: SearchMsgEntry[]; totalCount?: number }
  >;
};

interface SearchMsgEntry {
  id?: { id?: string; _serialized?: string } | string;
  body?: string;
  from?: string;
  to?: string;
  timestamp?: number;
  fromMe?: boolean;
  hasMedia?: boolean;
  type?: string;
  chat?: { name?: string };
}

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
    const wbot = getWbot(whatsappId) as unknown as ClientWithSearch;

    logger.info(
      `[SEARCH] Buscando mensagens: query="${query}", chatId=${chatId || "global"}, page=${page}, limit=${limit}`
    );

    const results = await wbot.searchMessages(query, {
      page,
      limit,
      chatId: chatId || undefined
    });

    if (!results || (Array.isArray(results) && results.length === 0)) {
      return { messages: [], totalCount: 0 };
    }

    const messageList: SearchMsgEntry[] = Array.isArray(results)
      ? results
      : (results as { messages?: SearchMsgEntry[] }).messages || [];

    return {
      messages: messageList.map(msg => {
        const rawId = msg.id;
        const resolvedId = typeof rawId === "object"
          ? (rawId as { id?: string; _serialized?: string })?.id || (rawId as { _serialized?: string })?._serialized || ""
          : String(rawId || "");
        return {
          id: resolvedId,
          body: msg.body || "",
          from: msg.from || "",
          to: msg.to || "",
          timestamp: msg.timestamp || 0,
          fromMe: msg.fromMe || false,
          hasMedia: msg.hasMedia || false,
          type: msg.type || "",
          chatName: msg.chat?.name
        };
      }),
      totalCount: Array.isArray(results)
        ? results.length
        : (results as { totalCount?: number; messages?: SearchMsgEntry[] }).totalCount || messageList.length
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    logger.error(`[SEARCH] Erro ao buscar mensagens: ${errMsg}`);
    throw new AppError(`Erro ao buscar mensagens: ${errMsg || "Erro desconhecido"}`);
  }
};

export default SearchMessagesService;
