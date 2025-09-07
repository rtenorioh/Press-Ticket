import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import ListSettingsServiceOne from "../SettingServices/ListSettingsServiceOne";

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
    
    const allTickets = await ListSettingsServiceOne({ key: "allTicket" });
    const allTicketsEnabled = allTickets?.value === "enabled";
    
    const baseConditions: any = {};
    
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
    
    if (!showAll && userId) {
      if (allTicketsEnabled) {
        openConditions[Op.or] = [
          { userId },
          { queueId: { [Op.in]: queueIds } },
          { queueId: null }
        ];
        
        closedConditions[Op.or] = [
          { userId },
          { queueId: { [Op.in]: queueIds } },
          { queueId: null }
        ];
        
        pendingConditions[Op.or] = [
          { queueId: { [Op.in]: queueIds } },
          { queueId: null }
        ];
      } else {
        openConditions[Op.or] = [
          { userId },
          { queueId: { [Op.in]: queueIds } }
        ];
        
        closedConditions[Op.or] = [
          { userId },
          { queueId: { [Op.in]: queueIds } }
        ];
        
        if (queueIds && queueIds.length > 0) {
          pendingConditions.queueId = { [Op.in]: queueIds };
        }
      }
    } else if (queueIds && queueIds.length > 0) {
      openConditions.queueId = { [Op.in]: queueIds };
      pendingConditions.queueId = { [Op.in]: queueIds };
      closedConditions.queueId = { [Op.in]: queueIds };
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
