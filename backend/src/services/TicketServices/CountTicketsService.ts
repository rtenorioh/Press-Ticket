import { Op } from "sequelize";
import Ticket from "../../models/Ticket";

interface CountTicketsParams {
  queueIds?: number[];
  showAll?: boolean;
  userId?: number | null;
}

interface TicketCounts {
  open: number;
  pending: number;
  closed: number;
}

const CountTicketsService = async ({
  queueIds = [],
  showAll = true,
  userId = null
}: CountTicketsParams = {}): Promise<TicketCounts> => {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[BACK_COUNT_TICKETS][${timestamp}] Iniciando contagem de tickets`);
    
    // Condições base para todos os status
    const baseConditions: any = {};
    
    // Removida verificação de companyId que não existe no sistema
    
    // Condições específicas para cada status
    const openConditions: any = {
      ...baseConditions,
      status: "open"
    };
    
    const pendingConditions: any = {
      ...baseConditions,
      status: "pending"
    };
    
    const closedConditions: any = {
      ...baseConditions,
      status: "closed"
    };
    
    // Filtrar por filas (setores) se especificado
    if (queueIds && queueIds.length > 0) {
      openConditions.queueId = { [Op.in]: queueIds };
      pendingConditions.queueId = { [Op.in]: queueIds };
      closedConditions.queueId = { [Op.in]: queueIds };
    }
    
    // Filtrar por usuário se não for admin e showAll for false
    if (!showAll && userId) {
      openConditions.userId = userId;
      closedConditions.userId = userId;
      // Não filtramos tickets pendentes por usuário, pois eles não têm usuário atribuído
    }
    
    // Contar tickets para cada status
    const [openCount, pendingCount, closedCount] = await Promise.all([
      Ticket.count({ where: openConditions }),
      Ticket.count({ where: pendingConditions }),
      Ticket.count({ where: closedConditions })
    ]);
    
    console.log(`[BACK_COUNT_RESULT][${timestamp}] Contagem: open=${openCount}, pending=${pendingCount}, closed=${closedCount}`);
    
    return {
      open: openCount,
      pending: pendingCount,
      closed: closedCount
    };
  } catch (error) {
    console.error(`[BACK_COUNT_ERROR] Erro ao contar tickets:`, error);
    throw error;
  }
};

export default CountTicketsService;
