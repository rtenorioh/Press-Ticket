import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

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
      const chat: any = await wbot.getChatById(groupId);

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      const requests = await chat.getGroupMembershipRequests();

      return requests.map((req: any) => ({
        id: req.id?._serialized || req.id,
        addedBy: req.addedBy?._serialized || req.addedBy || "",
        parentGroupId: req.parentGroupId || undefined,
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
      const chat: any = await wbot.getChatById(groupId);

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      const options: any = {};
      if (requesterIds && requesterIds.length > 0) {
        options.requesterIds = requesterIds;
      }

      const results = await chat.approveGroupMembershipRequests(options);

      return results.map((r: any) => ({
        requesterId: r.requesterId?._serialized || r.requesterId || "",
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
      const chat: any = await wbot.getChatById(groupId);

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      const options: any = {};
      if (requesterIds && requesterIds.length > 0) {
        options.requesterIds = requesterIds;
      }

      const results = await chat.rejectGroupMembershipRequests(options);

      return results.map((r: any) => ({
        requesterId: r.requesterId?._serialized || r.requesterId || "",
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
