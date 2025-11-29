import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { logger } from "../utils/logger";
import { listActivityLogs, getEntityDetails, ActivityActions, EntityTypes } from "../services/ActivityLogService";

interface ActivityLogRequest {
  startDate?: string;
  endDate?: string;
  userId?: number;
  action?: string;
  entityType?: string;
  ip?: string;
  searchParam?: string;
  limit?: number;
  offset?: number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      startDate,
      endDate,
      userId,
      action,
      entityType,
      ip,
      searchParam,
      limit,
      offset
    } = req.query as unknown as ActivityLogRequest;

    const { logs, count } = await listActivityLogs({
      startDate,
      endDate,
      userId: userId ? Number(userId) : undefined,
      action,
      entityType,
      ip,
      searchParam,
      limit: limit ? Number(limit) : 10,
      offset: offset ? Number(offset) : 0
    });

    return res.status(200).json({
      logs,
      count,
      hasMore: count > (offset ? Number(offset) : 0) + (limit ? Number(limit) : 10)
    });
  } catch (err: any) {
    logger.error(`Erro ao listar logs de atividade: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { entityType, entityId } = req.query;

    if (!entityType || !entityId) {
      return res.status(400).json({ error: "Tipo de entidade e ID são obrigatórios" });
    }

    const details = await getEntityDetails(
      entityType as EntityTypes,
      Number(entityId)
    );

    if (!details) {
      return res.status(404).json({ error: "Detalhes da entidade não encontrados" });
    }

    return res.status(200).json(details);
  } catch (err: any) {
    logger.error(`Erro ao buscar detalhes do log: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};

export const actions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const actionTypes = Object.values(ActivityActions);
    
    return res.status(200).json(actionTypes);
  } catch (err: any) {
    logger.error(`Erro ao listar tipos de ações: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};

export const entities = async (req: Request, res: Response): Promise<Response> => {
  try {
    const entityTypes = Object.values(EntityTypes);
    
    return res.status(200).json(entityTypes);
  } catch (err: any) {
    logger.error(`Erro ao listar tipos de entidades: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};

export const stats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const ActivityLog = require("../models/ActivityLog").default;
    const User = require("../models/User").default;
    const { Op } = require("sequelize");
    const { startOfDay } = require("date-fns");

    // Total de logs
    const totalLogs = await ActivityLog.count();

    // Usuários únicos que geraram logs
    const uniqueUsers = await ActivityLog.count({
      distinct: true,
      col: 'userId'
    });

    // Ação mais comum
    const topActionResult = await ActivityLog.findAll({
      attributes: [
        'action',
        [require("sequelize").fn('COUNT', 'action'), 'count']
      ],
      group: ['action'],
      order: [[require("sequelize").literal('count'), 'DESC']],
      limit: 1
    });
    const topAction = topActionResult.length > 0 ? topActionResult[0].action : 'N/A';

    // Logs de hoje
    const todayLogs = await ActivityLog.count({
      where: {
        createdAt: {
          [Op.gte]: startOfDay(new Date())
        }
      }
    });

    return res.status(200).json({
      totalLogs,
      uniqueUsers,
      topAction,
      todayLogs
    });
  } catch (err: any) {
    logger.error(`Erro ao buscar estatísticas: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};
