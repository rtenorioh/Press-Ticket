import { Op } from "sequelize";
import ActivityLog from "../models/ActivityLog";
import User from "../models/User";
import Ticket from "../models/Ticket";
import Contact from "../models/Contact";
import Whatsapp from "../models/Whatsapp";
import Queue from "../models/Queue";
import Tag from "../models/Tag";

export enum ActivityActions {
  LOGIN = "login",
  LOGOUT = "logout",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  TRANSFER = "transfer",
  ACCEPT = "accept",
  CLOSE = "close",
  REOPEN = "reopen"
}

export enum EntityTypes {
  TICKET = "ticket",
  CONTACT = "contact",
  USER = "user",
  WHATSAPP = "whatsapp",
  QUEUE = "queue",
  TAG = "tag",
  QUICKANSWER = "quickanswer",
  BACKUP = "backup",
  APITOKEN = "apitoken",
  SETTING = "setting",
  INTEGRATION = "integration"
}

interface LogRequest {
  userId: number;
  action: ActivityActions | string;
  description: string;
  entityType?: EntityTypes | string;
  entityId?: number;
  additionalData?: object;
}

interface ListRequest {
  startDate?: string;
  endDate?: string;
  userId?: number;
  action?: string;
  limit: number;
  offset: number;
}

interface ListResponse {
  logs: ActivityLog[];
  count: number;
}

export const createActivityLog = async ({
  userId,
  action,
  description,
  entityType,
  entityId,
  additionalData
}: LogRequest): Promise<ActivityLog> => {
  try {
    const log = await ActivityLog.create({
      userId,
      action,
      description,
      entityType,
      entityId,
      additionalData: additionalData ? JSON.parse(JSON.stringify(additionalData)) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return log;
  } catch (error) {
    throw error;
  }
};

export const listActivityLogs = async ({
  limit,
  offset,
  startDate,
  endDate,
  userId,
  action
}: ListRequest): Promise<ListResponse> => {
  const where: any = {};

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [
        new Date(`${startDate}T00:00:00`),
        new Date(`${endDate}T23:59:59`)
      ]
    };
  } else if (startDate) {
    where.createdAt = {
      [Op.gte]: new Date(`${startDate}T00:00:00`)
    };
  } else if (endDate) {
    where.createdAt = {
      [Op.lte]: new Date(`${endDate}T23:59:59`)
    };
  }

  if (userId) {
    where.userId = userId;
  }

  if (action && action !== "") {
    where.action = action;
  }

  const { count, rows: logs } = await ActivityLog.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["id", "name"]
      }
    ]
  });

  const formattedLogs = logs.map(log => {
    const plainLog = log.get({ plain: true }) as any;
    return {
      ...plainLog,
      username: plainLog.user ? plainLog.user.name : "Sistema"
    };
  });

  return {
    logs: formattedLogs,
    count
  };
};

export const getEntityDetails = async (
  entityType: EntityTypes | string,
  entityId: number
): Promise<any> => {
  let entityDetails = null;

  switch (entityType.toLowerCase()) {
    case EntityTypes.TICKET:
      entityDetails = await Ticket.findByPk(entityId, {
        attributes: ["id", "status", "unreadMessages", "queueId", "userId"],
        include: [
          {
            model: Contact,
            attributes: ["id", "name", "number"]
          }
        ]
      });
      break;
    case EntityTypes.CONTACT:
      entityDetails = await Contact.findByPk(entityId, {
        attributes: ["id", "name", "number", "email"]
      });
      break;
    case EntityTypes.USER:
      entityDetails = await User.findByPk(entityId, {
        attributes: ["id", "name", "email", "profile"]
      });
      break;
    case EntityTypes.WHATSAPP:
      entityDetails = await Whatsapp.findByPk(entityId, {
        attributes: ["id", "name", "status", "isDefault"]
      });
      break;
    case EntityTypes.QUEUE:
      entityDetails = await Queue.findByPk(entityId, {
        attributes: ["id", "name", "color"]
      });
      break;
    case EntityTypes.TAG:
      entityDetails = await Tag.findByPk(entityId, {
        attributes: ["id", "name", "color"]
      });
      break;
    default:
      entityDetails = { message: "Entity details not available" };
  }

  return entityDetails || { message: "Entity not found" };
};
