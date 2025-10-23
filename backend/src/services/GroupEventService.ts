import GroupEvent from "../models/GroupEvent";
import { logger } from "../utils/logger";
import { getIO } from "../libs/socket";
import { Sequelize } from "sequelize";

interface CreateGroupEventData {
  whatsappId: number;
  groupId: string;
  groupName?: string;
  eventType: "join" | "leave" | "update" | "admin_changed" | "membership_request";
  participants?: string[];
  action?: string;
  metadata?: any;
}

interface ListGroupEventsParams {
  whatsappId?: number;
  groupId?: string;
  eventType?: string;
  limit?: number;
  offset?: number;
}

class GroupEventService {
  async createEvent(data: CreateGroupEventData): Promise<GroupEvent> {
    try {
      const event = await GroupEvent.create({
        whatsappId: data.whatsappId,
        groupId: data.groupId,
        groupName: data.groupName,
        eventType: data.eventType,
        participants: data.participants || [],
        action: data.action,
        metadata: data.metadata
      });

      logger.info(`[GROUP_EVENT] Evento criado: ${data.eventType} - Grupo: ${data.groupId}`);

      const io = getIO();
      io.emit("groupEvent", {
        action: "create",
        event
      });

      return event;
    } catch (err) {
      logger.error(`[GROUP_EVENT] Erro ao criar evento: ${err}`);
      throw err;
    }
  }

  async listEvents(params: ListGroupEventsParams): Promise<{ events: GroupEvent[]; count: number }> {
    const {
      whatsappId,
      groupId,
      eventType,
      limit = 50,
      offset = 0
    } = params;

    const where: any = {};

    if (whatsappId) {
      where.whatsappId = whatsappId;
    }

    if (groupId) {
      where.groupId = groupId;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    const { count, rows: events } = await GroupEvent.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: ["whatsapp"]
    });

    return { events, count };
  }

  async getEventById(eventId: number): Promise<GroupEvent | null> {
    const event = await GroupEvent.findByPk(eventId, {
      include: ["whatsapp"]
    });

    return event;
  }

  async deleteEvent(eventId: number): Promise<void> {
    const event = await GroupEvent.findByPk(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    await event.destroy();

    logger.info(`[GROUP_EVENT] Evento deletado: ${eventId}`);

    const io = getIO();
    io.emit("groupEvent", {
      action: "delete",
      eventId
    });
  }

  async deleteOldEvents(days: number = 30): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const deleted = await GroupEvent.destroy({
      where: {
        createdAt: {
          $lt: date
        }
      }
    });

    logger.info(`[GROUP_EVENT] ${deleted} eventos antigos deletados (>${days} dias)`);

    return deleted;
  }

  async getStatsByGroup(groupId: string): Promise<any> {
    const events = await GroupEvent.findAll({
      where: { groupId },
      attributes: [
        "eventType",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]
      ],
      group: ["eventType"]
    });

    return events;
  }

  async getStatsByWhatsapp(whatsappId: number): Promise<any> {
    const events = await GroupEvent.findAll({
      where: { whatsappId },
      attributes: [
        "eventType",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]
      ],
      group: ["eventType"]
    });

    return events;
  }
}

export default new GroupEventService();
