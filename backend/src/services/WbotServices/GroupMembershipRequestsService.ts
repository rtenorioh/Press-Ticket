import { GroupChat } from "whatsapp-web.js";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

// wwebjs missing type definition for group membership request methods
interface MembershipRequestEntry {
  id?: { _serialized?: string } | string;
  addedBy?: { _serialized?: string } | string;
  parentGroupId?: { _serialized?: string } | string;
  requestMethod?: string;
  t?: number;
}

interface MembershipRequestResult {
  requesterId?: { _serialized?: string } | string;
  error?: number;
  message?: string;
}

type GroupChatWithMembership = GroupChat & {
  getGroupMembershipRequests(): Promise<MembershipRequestEntry[]>;
  approveGroupMembershipRequests(opts: {
    requesterIds?: string[];
  }): Promise<MembershipRequestResult[]>;
  rejectGroupMembershipRequests(opts: {
    requesterIds?: string[];
  }): Promise<MembershipRequestResult[]>;
};

interface MembershipRequest {
  id: string;
  addedBy: string;
  parentGroupId?: string;
  requestMethod: string;
  timestamp: number;
}

interface MembershipRequestActionResult {
  requesterId: string;
  error?: number;
  message?: string;
}

class GroupMembershipRequestsService {
  async getRequests(
    whatsappId: number,
    groupId: string
  ): Promise<MembershipRequest[]> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = (await wbot.getChatById(
        groupId
      )) as unknown as GroupChatWithMembership;

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      const requests = await chat.getGroupMembershipRequests();

      return requests.map(req => ({
        id:
          (typeof req.id === "object"
            ? (req.id as { _serialized?: string })?._serialized
            : req.id) || "",
        addedBy:
          (typeof req.addedBy === "object"
            ? (req.addedBy as { _serialized?: string })?._serialized
            : req.addedBy) || "",
        parentGroupId:
          typeof req.parentGroupId === "object"
            ? (req.parentGroupId as { _serialized?: string })?._serialized
            : req.parentGroupId,
        requestMethod: req.requestMethod || "",
        timestamp: req.t || 0
      }));
    } catch (err) {
      logger.error(`[GROUP_MEMBERSHIP] Erro ao listar solicitações: ${err}`);
      throw new AppError(`Erro ao listar solicitações: ${err}`);
    }
  }

  async approveRequests(
    whatsappId: number,
    groupId: string,
    requesterIds: string[]
  ): Promise<MembershipRequestActionResult[]> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = (await wbot.getChatById(
        groupId
      )) as unknown as GroupChatWithMembership;

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      const options: { requesterIds?: string[] } = {};
      if (requesterIds && requesterIds.length > 0) {
        options.requesterIds = requesterIds;
      }

      const results = await chat.approveGroupMembershipRequests(options);

      return results.map(r => ({
        requesterId:
          (typeof r.requesterId === "object"
            ? (r.requesterId as { _serialized?: string })?._serialized
            : r.requesterId) || "",
        error: r.error,
        message: r.message
      }));
    } catch (err) {
      logger.error(`[GROUP_MEMBERSHIP] Erro ao aprovar solicitações: ${err}`);
      throw new AppError(`Erro ao aprovar solicitações: ${err}`);
    }
  }

  async rejectRequests(
    whatsappId: number,
    groupId: string,
    requesterIds: string[]
  ): Promise<MembershipRequestActionResult[]> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = (await wbot.getChatById(
        groupId
      )) as unknown as GroupChatWithMembership;

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      const options: { requesterIds?: string[] } = {};
      if (requesterIds && requesterIds.length > 0) {
        options.requesterIds = requesterIds;
      }

      const results = await chat.rejectGroupMembershipRequests(options);

      return results.map(r => ({
        requesterId:
          (typeof r.requesterId === "object"
            ? (r.requesterId as { _serialized?: string })?._serialized
            : r.requesterId) || "",
        error: r.error,
        message: r.message
      }));
    } catch (err) {
      logger.error(`[GROUP_MEMBERSHIP] Erro ao rejeitar solicitações: ${err}`);
      throw new AppError(`Erro ao rejeitar solicitações: ${err}`);
    }
  }
}

export default new GroupMembershipRequestsService();
