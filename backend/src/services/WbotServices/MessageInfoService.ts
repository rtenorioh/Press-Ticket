import AppError from "../../errors/AppError";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";

interface MessageInfoResult {
  delivery: Array<{ id: string; timestamp: number }>;
  read: Array<{ id: string; timestamp: number }>;
  played: Array<{ id: string; timestamp: number }>;
}

interface ReactionResult {
  id: string;
  msgId: string;
  senderId: string;
  reaction: string;
  timestamp: number;
}

interface PollVoteResult {
  voter: string;
  selectedOptions: Array<{ name: string; localId: number }>;
  timestamp: number;
}

const GetMessageInfo = async (
  messageId: string
): Promise<MessageInfoResult> => {
  const message = await Message.findByPk(messageId, {
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new AppError("Mensagem não encontrada");
  }

  try {
    const wbotMessage = await GetWbotMessage(message.ticket, messageId);
    const info: any = await wbotMessage.getInfo();

    if (!info) {
      return { delivery: [], read: [], played: [] };
    }

    return {
      delivery: (info.delivery || []).map((d: any) => ({
        id: d.id?._serialized || d.id || "",
        timestamp: d.t || 0
      })),
      read: (info.read || []).map((r: any) => ({
        id: r.id?._serialized || r.id || "",
        timestamp: r.t || 0
      })),
      played: (info.played || []).map((p: any) => ({
        id: p.id?._serialized || p.id || "",
        timestamp: p.t || 0
      }))
    };
  } catch (err) {
    logger.error(`[MSG_INFO] Erro ao obter informações da mensagem: ${err}`);
    throw new AppError("ERR_GET_MSG_INFO");
  }
};

const GetMessageReactions = async (
  messageId: string
): Promise<ReactionResult[]> => {
  const message = await Message.findByPk(messageId, {
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new AppError("Mensagem não encontrada");
  }

  try {
    const wbotMessage = await GetWbotMessage(message.ticket, messageId);
    const reactions: any[] = await wbotMessage.getReactions();

    if (!reactions || reactions.length === 0) {
      return [];
    }

    const result: ReactionResult[] = [];

    for (const reactionGroup of reactions) {
      if (reactionGroup.aggregateEmoji) {
        for (const sender of reactionGroup.senders || []) {
          result.push({
            id: sender.id || "",
            msgId: messageId,
            senderId: sender.senderId?._serialized || sender.senderId || "",
            reaction: reactionGroup.aggregateEmoji,
            timestamp: sender.timestamp || 0
          });
        }
      }
    }

    return result;
  } catch (err) {
    logger.error(`[MSG_INFO] Erro ao obter reações da mensagem: ${err}`);
    throw new AppError("ERR_GET_MSG_REACTIONS");
  }
};

const GetPollVotes = async (messageId: string): Promise<PollVoteResult[]> => {
  const message = await Message.findByPk(messageId, {
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new AppError("Mensagem não encontrada");
  }

  try {
    const wbotMessage = await GetWbotMessage(message.ticket, messageId);
    const votes: any[] = await wbotMessage.getPollVotes();

    if (!votes || votes.length === 0) {
      return [];
    }

    return votes.map((vote: any) => ({
      voter: vote.voter?._serialized || vote.voter || "",
      selectedOptions: (vote.selectedOptions || []).map((opt: any) => ({
        name: opt.name || "",
        localId: opt.localId || 0
      })),
      timestamp: vote.interactedAtTs || 0
    }));
  } catch (err) {
    logger.error(`[MSG_INFO] Erro ao obter votos da enquete: ${err}`);
    throw new AppError("ERR_GET_POLL_VOTES");
  }
};

export { GetMessageInfo, GetMessageReactions, GetPollVotes };
