import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface CreateGroupData {
  whatsappId: number;
  name: string;
  participants: string[];
}

interface UpdateGroupData {
  whatsappId: number;
  groupId: string;
  name?: string;
  description?: string;
}

interface ManageParticipantsData {
  whatsappId: number;
  groupId: string;
  participants: string[];
}

interface PromoteParticipantsData {
  whatsappId: number;
  groupId: string;
  participants: string[];
}

interface GroupInfo {
  id: string;
  name: string;
  description: string;
  participants: any[];
  admins: string[];
  owner: string;
  createdAt: Date;
  size: number;
}

class GroupManagementService {
  async createGroup(data: CreateGroupData): Promise<any> {
    const { whatsappId, name, participants } = data;

    try {
      const wbot = getWbot(whatsappId);

      if (participants.length < 1) {
        throw new AppError(
          "É necessário pelo menos 1 participante para criar um grupo"
        );
      }

      const formattedParticipants = participants.map(p => {
        if (!p.includes("@")) {
          return `${p}@c.us`;
        }
        return p;
      });

      const group: any = await wbot.createGroup(name, formattedParticipants);

      return {
        id: group.gid._serialized,
        name: name,
        participants: formattedParticipants
      };
    } catch (err) {
      logger.error(`[GROUP_MANAGEMENT] Erro ao criar grupo: ${err}`);
      throw new AppError(`Erro ao criar grupo: ${err}`);
    }
  }

  async getGroupInfo(whatsappId: number, groupId: string): Promise<GroupInfo> {
    try {
      const wbot = getWbot(whatsappId);
      const chat = await wbot.getChatById(groupId);

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      const groupChat = chat as any;
      const participants = groupChat.participants || [];
      const admins = participants
        .filter((p: any) => p.isAdmin || p.isSuperAdmin)
        .map((p: any) => p.id._serialized);

      const owner =
        participants.find((p: any) => p.isSuperAdmin)?.id._serialized || "";

      return {
        id: groupChat.id._serialized,
        name: groupChat.name,
        description: groupChat.description || "",
        participants: participants,
        admins: admins,
        owner: owner,
        createdAt: new Date(groupChat.createdAt * 1000),
        size: participants.length
      };
    } catch (err) {
      logger.error(
        `[GROUP_MANAGEMENT] Erro ao obter informações do grupo: ${err}`
      );
      throw new AppError(`Erro ao obter informações do grupo: ${err}`);
    }
  }

  async updateGroupName(data: UpdateGroupData): Promise<void> {
    const { whatsappId, groupId, name } = data;

    if (!name) {
      throw new AppError("Nome do grupo é obrigatório");
    }

    try {
      const wbot = getWbot(whatsappId);
      const chat: any = await wbot.getChatById(groupId);

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      await chat.setSubject(name);
    } catch (err) {
      logger.error(
        `[GROUP_MANAGEMENT] Erro ao atualizar nome do grupo: ${err}`
      );
      throw new AppError(`Erro ao atualizar nome do grupo: ${err}`);
    }
  }

  async updateGroupDescription(data: UpdateGroupData): Promise<void> {
    const { whatsappId, groupId, description } = data;

    if (!description) {
      throw new AppError("Descrição do grupo é obrigatória");
    }

    try {
      const wbot = getWbot(whatsappId);
      const chat: any = await wbot.getChatById(groupId);

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      await chat.setDescription(description);
    } catch (err) {
      logger.error(
        `[GROUP_MANAGEMENT] Erro ao atualizar descrição do grupo: ${err}`
      );
      throw new AppError(`Erro ao atualizar descrição do grupo: ${err}`);
    }
  }

  async addParticipants(data: ManageParticipantsData): Promise<any> {
    const { whatsappId, groupId, participants } = data;

    try {
      const wbot = getWbot(whatsappId);
      const chat: any = await wbot.getChatById(groupId);

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      const formattedParticipants = participants.map(p => {
        if (!p.includes("@")) {
          return `${p}@c.us`;
        }
        return p;
      });

      const result = await chat.addParticipants(formattedParticipants);

      return result;
    } catch (err) {
      logger.error(
        `[GROUP_MANAGEMENT] Erro ao adicionar participantes: ${err}`
      );
      throw new AppError(`Erro ao adicionar participantes: ${err}`);
    }
  }

  async removeParticipants(data: ManageParticipantsData): Promise<void> {
    const { whatsappId, groupId, participants } = data;

    try {
      const wbot = getWbot(whatsappId);
      const chat: any = await wbot.getChatById(groupId);

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      const formattedParticipants = participants.map(p => {
        if (!p.includes("@")) {
          return `${p}@c.us`;
        }
        return p;
      });

      await chat.removeParticipants(formattedParticipants);
    } catch (err) {
      logger.error(`[GROUP_MANAGEMENT] Erro ao remover participantes: ${err}`);
      throw new AppError(`Erro ao remover participantes: ${err}`);
    }
  }

  async promoteParticipants(data: PromoteParticipantsData): Promise<void> {
    const { whatsappId, groupId, participants } = data;

    try {
      const wbot = getWbot(whatsappId);
      const chat: any = await wbot.getChatById(groupId);

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      const formattedParticipants = participants.map(p => {
        if (!p.includes("@")) {
          return `${p}@c.us`;
        }
        return p;
      });

      await chat.promoteParticipants(formattedParticipants);
    } catch (err) {
      logger.error(`[GROUP_MANAGEMENT] Erro ao promover participantes: ${err}`);
      throw new AppError(`Erro ao promover participantes: ${err}`);
    }
  }

  async demoteParticipants(data: PromoteParticipantsData): Promise<void> {
    const { whatsappId, groupId, participants } = data;

    try {
      const wbot = getWbot(whatsappId);
      const chat: any = await wbot.getChatById(groupId);

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      const formattedParticipants = participants.map(p => {
        if (!p.includes("@")) {
          return `${p}@c.us`;
        }
        return p;
      });

      await chat.demoteParticipants(formattedParticipants);
    } catch (err) {
      logger.error(`[GROUP_MANAGEMENT] Erro ao rebaixar participantes: ${err}`);
      throw new AppError(`Erro ao rebaixar participantes: ${err}`);
    }
  }

  async leaveGroup(whatsappId: number, groupId: string): Promise<void> {
    try {
      const wbot = getWbot(whatsappId);
      const chat: any = await wbot.getChatById(groupId);

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      await chat.leave();
    } catch (err) {
      logger.error(`[GROUP_MANAGEMENT] Erro ao sair do grupo: ${err}`);
      throw new AppError(`Erro ao sair do grupo: ${err}`);
    }
  }

  async getGroupInviteLink(
    whatsappId: number,
    groupId: string
  ): Promise<string> {
    try {
      const wbot = getWbot(whatsappId);
      const chat: any = await wbot.getChatById(groupId);

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      const inviteCode = await chat.getInviteCode();
      const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

      return inviteLink;
    } catch (err) {
      logger.error(`[GROUP_MANAGEMENT] Erro ao obter link de convite: ${err}`);
      throw new AppError(`Erro ao obter link de convite: ${err}`);
    }
  }

  async revokeGroupInviteLink(
    whatsappId: number,
    groupId: string
  ): Promise<string> {
    try {
      const wbot = getWbot(whatsappId);
      const chat: any = await wbot.getChatById(groupId);

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      const newInviteCode = await chat.revokeInvite();
      const newInviteLink = `https://chat.whatsapp.com/${newInviteCode}`;

      return newInviteLink;
    } catch (err) {
      logger.error(
        `[GROUP_MANAGEMENT] Erro ao revogar link de convite: ${err}`
      );
      throw new AppError(`Erro ao revogar link de convite: ${err}`);
    }
  }

  async listGroups(whatsappId: number): Promise<any[]> {
    try {
      const wbot = getWbot(whatsappId);
      const chats = await wbot.getChats();

      const groups = [];

      for (const chat of chats) {
        try {
          if (chat.isGroup) {
            const groupChat = chat as any;

            const groupData = {
              id: groupChat.id?._serialized || groupChat.id,
              name: groupChat.name || "Sem nome",
              participantsCount: 0,
              unreadCount: 0,
              timestamp: null as number | null
            };

            try {
              if (groupChat.participants) {
                groupData.participantsCount = Array.isArray(
                  groupChat.participants
                )
                  ? groupChat.participants.length
                  : 0;
              }
            } catch (_e) {
              logger.warn(
                `[GROUP_MANAGEMENT] Erro ao obter participantes do grupo ${groupData.id}`
              );
            }

            try {
              groupData.unreadCount = groupChat.unreadCount || 0;
            } catch (_e) {
              logger.warn(
                `[GROUP_MANAGEMENT] Erro ao obter unreadCount do grupo ${groupData.id}`
              );
            }

            try {
              groupData.timestamp = groupChat.timestamp || null;
            } catch (_e) {
              logger.warn(
                `[GROUP_MANAGEMENT] Erro ao obter timestamp do grupo ${groupData.id}`
              );
            }

            groups.push(groupData);
          }
        } catch (chatErr) {
          logger.warn(
            `[GROUP_MANAGEMENT] Erro ao processar chat individual: ${chatErr}`
          );
          continue;
        }
      }

      return groups;
    } catch (err) {
      logger.error(`[GROUP_MANAGEMENT] Erro ao listar grupos: ${err}`);
      throw new AppError(`Erro ao listar grupos: ${err}`);
    }
  }

  async updateGroupSettings(
    whatsappId: number,
    groupId: string,
    settings: {
      messagesAdminsOnly?: boolean;
      editGroupInfoAdminsOnly?: boolean;
    }
  ): Promise<void> {
    try {
      const wbot = getWbot(whatsappId);
      const chat: any = await wbot.getChatById(groupId);

      if (!chat.isGroup) {
        throw new AppError("O ID fornecido não é de um grupo");
      }

      if (settings.messagesAdminsOnly !== undefined) {
        await chat.setMessagesAdminsOnly(settings.messagesAdminsOnly);
      }

      if (settings.editGroupInfoAdminsOnly !== undefined) {
        await chat.setInfoAdminsOnly(settings.editGroupInfoAdminsOnly);
      }
    } catch (err) {
      logger.error(
        `[GROUP_MANAGEMENT] Erro ao atualizar configurações do grupo: ${err}`
      );
      throw new AppError(`Erro ao atualizar configurações do grupo: ${err}`);
    }
  }
}

export default new GroupManagementService();
