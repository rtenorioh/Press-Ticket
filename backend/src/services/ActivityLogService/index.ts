import { Op } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import User from "../../models/User";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import Queue from "../../models/Queue";
import { logger } from "../../utils/logger";

interface ActivityLogFilters {
  startDate?: string;
  endDate?: string;
  userId?: number;
  action?: string;
  limit?: number;
  offset?: number;
}

interface ActivityLog {
  id: number;
  userId: number;
  username: string;
  action: string;
  description: string;
  ip: string;
  timestamp: Date;
  entityId?: number;
  entityType?: string;
  details?: string;
}

class ActivityLogModel {
  id: number;
  userId: number;
  action: string;
  description: string;
  ip: string;
  timestamp: Date;
  entityId?: number;
  entityType?: string;
  details?: string;

  constructor(data: Partial<ActivityLogModel>) {
    this.id = data.id || 0;
    this.userId = data.userId || 0;
    this.action = data.action || "";
    this.description = data.description || "";
    this.ip = data.ip || "";
    this.timestamp = data.timestamp || new Date();
    this.entityId = data.entityId;
    this.entityType = data.entityType;
    this.details = data.details;
  }
}

export enum ActivityActions {
  LOGIN = "login",
  LOGOUT = "logout",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  TRANSFER = "transfer",
  CLOSE = "close",
  REOPEN = "reopen",
  ACCEPT = "accept",
  SYSTEM = "system",
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
  UNBLOCK = "unblock"
}

export enum EntityTypes {
  USER = "user",
  TICKET = "ticket",
  WHATSAPP = "whatsapp",
  QUEUE = "queue",
  CONTACT = "contact",
  MESSAGE = "message",
  QUICKANSWER = "quickAnswer",
  SETTING = "setting",
  TAG = "tag",
  SYSTEM = "system",
  GROUP = "group",
  API_TOKEN = "api_token",
  BACKUP = "backup",
  INTEGRATION = "integration",
  CLIENT_STATUS = "client_status"
}

export const logActivity = async (
  userId: number,
  action: ActivityActions,
  description: string,
  ip: string,
  entityId?: number,
  entityType?: EntityTypes,
  details?: string
): Promise<ActivityLogModel> => {
  try {
    
    const log = new ActivityLogModel({
      id: Date.now(), 
      userId,
      action,
      description,
      ip,
      timestamp: new Date(),
      entityId,
      entityType,
      details
    });
    
    logger.info(`Log de atividade: ${userId} - ${action} - ${description}`);
    
    return log;
  } catch (error: any) {
    logger.error(`Erro ao registrar log de atividade: ${error.message}`);
    throw new Error(`Não foi possível registrar o log de atividade: ${error.message}`);
  }
};

export const listActivityLogs = async (
  filters: ActivityLogFilters
): Promise<{ logs: ActivityLog[]; count: number }> => {
  try {
    
    const { startDate, endDate, userId, action, limit = 10, offset = 0 } = filters;
    
    const mockLogs: ActivityLog[] = [
      {
        id: 1,
        userId: 1,
        username: "admin",
        action: ActivityActions.LOGIN,
        description: "Login no sistema",
        ip: "192.168.1.1",
        timestamp: new Date(),
        entityType: EntityTypes.USER,
        entityId: 1
      },
      {
        id: 2,
        userId: 1,
        username: "admin",
        action: ActivityActions.CREATE,
        description: "Criou um novo ticket",
        ip: "192.168.1.1",
        timestamp: new Date(),
        entityType: EntityTypes.TICKET,
        entityId: 123,
        details: JSON.stringify({ protocol: "ABC123" })
      },
      {
        id: 3,
        userId: 2,
        username: "atendente",
        action: ActivityActions.TRANSFER,
        description: "Transferiu ticket para outro setor",
        ip: "192.168.1.2",
        timestamp: new Date(),
        entityType: EntityTypes.TICKET,
        entityId: 123,
        details: JSON.stringify({ from: "Suporte", to: "Vendas" })
      }
    ];
    
    let filteredLogs = [...mockLogs];
    
    if (startDate && endDate) {
      const start = startOfDay(parseISO(startDate));
      const end = endOfDay(parseISO(endDate));
      filteredLogs = filteredLogs.filter(log => 
        log.timestamp >= start && log.timestamp <= end
      );
    }
    
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }
    
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }
    
    const count = filteredLogs.length;
    
    filteredLogs = filteredLogs.slice(offset, offset + limit);
    
    return {
      logs: filteredLogs,
      count
    };
  } catch (error: any) {
    logger.error(`Erro ao listar logs de atividade: ${error.message}`);
    throw new Error(`Não foi possível listar os logs de atividade: ${error.message}`);
  }
};

export const getEntityDetails = async (
  entityType: EntityTypes,
  entityId: number
): Promise<any> => {
  try {
    switch (entityType) {
      case EntityTypes.USER:
        return await User.findByPk(entityId, {
          attributes: ["id", "name", "email", "profile"]
        });
        
      case EntityTypes.TICKET:
        return await Ticket.findByPk(entityId, {
          attributes: ["id", "status", "userId", "contactId", "queueId"],
          include: [
            { model: User, attributes: ["id", "name"] },
            { model: Queue, attributes: ["id", "name"] }
          ]
        });
        
      case EntityTypes.WHATSAPP:
        return await Whatsapp.findByPk(entityId, {
          attributes: ["id", "name", "status", "queueId"]
        });
        
      case EntityTypes.QUEUE:
        return await Queue.findByPk(entityId, {
          attributes: ["id", "name", "color"]
        });
        
      default:
        return null;
    }
  } catch (error: any) {
    logger.error(`Erro ao buscar detalhes da entidade: ${error.message}`);
    return null;
  }
};
