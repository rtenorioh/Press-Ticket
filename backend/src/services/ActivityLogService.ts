import { Op } from "sequelize";
import ActivityLog from "../models/ActivityLog";
import User from "../models/User";
import Ticket from "../models/Ticket";
import Contact from "../models/Contact";
import Whatsapp from "../models/Whatsapp";
import Queue from "../models/Queue";
import Tag from "../models/Tag";
import Message from "../models/Message";

export enum ActivityActions {
  LOGIN = "login",
  LOGOUT = "logout",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  TRANSFER = "transfer",
  ACCEPT = "accept",
  CLOSE = "close",
  REOPEN = "reopen",
  SEND = "send",
  EDIT = "edit",
  VIEW = "view",
  IMPORT = "import",
  EXPORT = "export",
  START = "start",
  STOP = "stop",
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  PROMOTE = "promote",
  DEMOTE = "demote",
  JOIN = "join",
  LEAVE = "leave",
  REVOKE = "revoke",
  REACT = "react",
  BLOCK = "block",
  UNBLOCK = "unblock",
  SYSTEM = "system"
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
  INTEGRATION = "integration",
  MESSAGE = "message",
  GROUP = "group",
  API_TOKEN = "api_token",
  CLIENT_STATUS = "client_status"
}

interface LogRequest {
  userId: number;
  action: ActivityActions | string;
  description: string;
  entityType?: EntityTypes | string;
  entityId?: number;
  additionalData?: object;
  ip?: string;
}

interface ListRequest {
  startDate?: string;
  endDate?: string;
  userId?: number;
  action?: string;
  entityType?: string;
  ip?: string;
  searchParam?: string;
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
  additionalData,
  ip
}: LogRequest): Promise<ActivityLog> => {
  try {
    const log = await ActivityLog.create({
      userId,
      action,
      description,
      entityType,
      entityId,
      additionalData: additionalData ? JSON.parse(JSON.stringify(additionalData)) : null,
      ip: ip || null,
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
  action,
  entityType,
  ip,
  searchParam
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

  if (entityType && entityType !== "") {
    where.entityType = entityType;
  }

  if (ip && ip !== "") {
    where.ip = { [Op.like]: `%${ip}%` };
  }

  if (searchParam && searchParam !== "") {
    where[Op.or] = [
      { description: { [Op.like]: `%${searchParam}%` } },
      { action: { [Op.like]: `%${searchParam}%` } },
      { ip: { [Op.like]: `%${searchParam}%` } }
    ];
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
        attributes: ["id", "status", "unreadMessages", "queueId", "userId", "contactId"],
        include: [
          {
            model: Contact,
            as: "contact",
            attributes: ["id", "name", "number", "email"]
          }
        ]
      });
      if (entityDetails) {
        const plainTicket = entityDetails.get({ plain: true }) as any;
        entityDetails = {
          id: plainTicket.id,
          status: plainTicket.status,
          unreadMessages: plainTicket.unreadMessages,
          queueId: plainTicket.queueId,
          userId: plainTicket.userId,
          contactId: plainTicket.contactId,
          contact: plainTicket.contact ? {
            id: plainTicket.contact.id,
            name: plainTicket.contact.name,
            number: plainTicket.contact.number,
            email: plainTicket.contact.email
          } : null
        };
      }
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
    case EntityTypes.MESSAGE:
    case "message":
      entityDetails = await Message.findByPk(entityId, {
        attributes: ["id", "body", "mediaType", "mediaUrl", "fromMe", "isDeleted", "createdAt"],
        include: [
          {
            model: Ticket,
            attributes: ["id", "status"],
            include: [
              {
                model: Contact,
                attributes: ["id", "name", "number"]
              }
            ]
          }
        ]
      });
      if (entityDetails) {
        const plainMessage = entityDetails.get({ plain: true }) as any;
        entityDetails = {
          ...plainMessage,
          bodyPreview: plainMessage.body ? plainMessage.body.substring(0, 100) : null,
          ticket: plainMessage.ticket ? {
            id: plainMessage.ticket.id,
            status: plainMessage.ticket.status,
            contact: plainMessage.ticket.contact
          } : null
        };
      }
      break;
    default:
      entityDetails = { message: "Entity details not available" };
  }

  return entityDetails || { message: "Entity not found" };
};
