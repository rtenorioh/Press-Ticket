import { Op } from "sequelize";
import Ticket from "../models/Ticket";
import { logger } from "../utils/logger";

interface Request {
  userId?: string | number;
  isAdmin?: boolean;
  queueIds?: number[];
}

interface TicketCount {
  open: number;
  pending: number;
  closed: number;
}

const CountTicketsService = {
  async execute({ userId, isAdmin, queueIds }: Request): Promise<TicketCount> {
    try {
      const timestamp = new Date().toISOString();
      logger.info(`[BACK_COUNT_SERVICE][${timestamp}] Iniciando contagem de tickets`);
      
      const openCondition: any = { status: "open" };
      const pendingCondition: any = { status: "pending" };
      const closedCondition: any = { status: "closed" };
      
      if (!isAdmin && userId) {
        openCondition.userId = userId;
        pendingCondition.userId = userId;
        closedCondition.userId = userId;
      }
      
      if (queueIds && queueIds.length > 0) {
        openCondition.queueId = { [Op.in]: queueIds };
        pendingCondition.queueId = { [Op.in]: queueIds };
        closedCondition.queueId = { [Op.in]: queueIds };
      }
      
      const [openCount, pendingCount, closedCount] = await Promise.all([
        Ticket.count({ where: openCondition }),
        Ticket.count({ where: pendingCondition }),
        Ticket.count({ where: closedCondition })
      ]);
      
      const result = {
        open: openCount,
        pending: pendingCount,
        closed: closedCount
      };
      
      logger.info(`[BACK_COUNT_RESULT][${timestamp}] Contagem finalizada:`, result);
      
      return result;
    } catch (err) {
      logger.error("Erro ao contar tickets", {
        error: err.message,
        stack: err.stack
      });
      
      return {
        open: 0,
        pending: 0,
        closed: 0
      };
    }
  }
};

export default CountTicketsService;
