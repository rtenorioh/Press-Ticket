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
    // wwebjs missing type definition for getInfo return type
    interface MessageInfoEntry {
      id?: { _serialized?: string } | string;
      t?: number;
    }
    interface MessageInfoData {
      delivery?: MessageInfoEntry[];
      read?: MessageInfoEntry[];
      played?: MessageInfoEntry[];
    }
    const info =
      (await wbotMessage.getInfo()) as unknown as MessageInfoData | null;

    if (!info) {
      return { delivery: [], read: [], played: [] };
    }

    const mapEntry = (e: MessageInfoEntry) => ({
      id:
        (typeof e.id === "object"
          ? (e.id as { _serialized?: string })?._serialized
          : e.id) || "",
      timestamp: e.t || 0
    });

    return {
      delivery: (info.delivery || []).map(mapEntry),
      read: (info.read || []).map(mapEntry),
      played: (info.played || []).map(mapEntry)
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
    // wwebjs missing type definition for getReactions return type
    interface ReactionSender {
      id?: string;
      senderId?: { _serialized?: string } | string;
      timestamp?: number;
    }
    interface ReactionGroup {
      aggregateEmoji?: string;
      senders?: ReactionSender[];
    }
    const reactions =
      (await wbotMessage.getReactions()) as unknown as ReactionGroup[];

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
            senderId:
              (typeof sender.senderId === "object"
                ? (sender.senderId as { _serialized?: string })?._serialized
                : sender.senderId) || "",
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
    // wwebjs missing type definition for getPollVotes return type
    interface PollVoteOption {
      name?: string;
      localId?: number;
    }
    interface PollVoteEntry {
      voter?: { _serialized?: string } | string;
      selectedOptions?: PollVoteOption[];
      interactedAtTs?: number;
    }
    const votes =
      (await wbotMessage.getPollVotes()) as unknown as PollVoteEntry[];

    if (!votes || votes.length === 0) {
      return [];
    }

    return votes.map(vote => ({
      voter:
        (typeof vote.voter === "object"
          ? (vote.voter as { _serialized?: string })?._serialized
          : vote.voter) || "",
      selectedOptions: (vote.selectedOptions || []).map(opt => ({
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
