import { Op } from "sequelize";
import type { WhereOptions } from "sequelize";

type DynWhere = Record<PropertyKey, unknown>;
import Ticket from "../../models/Ticket";
import ListSettingsServiceOne from "../SettingServices/ListSettingsServiceOne";
import { logger } from "../../utils/logger";

interface CountTicketsParams {
  queueIds?: number[];
  showAll?: boolean;
  userId?: number | null;
}

interface TicketCounts {
  open: number;
  pending: number;
  closed: number;
  openGroups: number;
}

const CountTicketsService = async ({
  queueIds = [],
  showAll = true,
  userId = null
}: CountTicketsParams = {}): Promise<TicketCounts> => {
  try {
    const allTickets = await ListSettingsServiceOne({ key: "allTicket" });
    const allTicketsEnabled = allTickets?.value === "enabled";

    const openConditions: DynWhere = {
      status: "open",
      "$contact.isGroup$": { [Op.or]: [false, null] }
    };

    const openGroupsConditions: DynWhere = {
      status: "open",
      "$contact.isGroup$": true
    };

    const pendingConditions: DynWhere = {
      status: "pending"
    };

    const closedConditions: DynWhere = {
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

    if (!showAll && userId) {
      if (allTicketsEnabled) {
        openGroupsConditions[Op.or] = [
          { userId },
          { queueId: { [Op.in]: queueIds } },
          { queueId: null }
        ];
      } else {
        openGroupsConditions[Op.or] = [
          { userId },
          { queueId: { [Op.in]: queueIds } }
        ];
      }
    } else if (queueIds && queueIds.length > 0) {
      openGroupsConditions.queueId = { [Op.in]: queueIds };
    }

    const [openCount, pendingCount, closedCount, openGroupsCount] =
      await Promise.all([
        Ticket.count({
          where: openConditions as WhereOptions,
          include: [
            {
              model: require("../../models/Contact").default,
              as: "contact",
              attributes: []
            }
          ]
        }),
        Ticket.count({ where: pendingConditions as WhereOptions }),
        Ticket.count({ where: closedConditions as WhereOptions }),
        Ticket.count({
          where: openGroupsConditions as WhereOptions,
          include: [
            {
              model: require("../../models/Contact").default,
              as: "contact",
              attributes: []
            }
          ]
        })
      ]);

    return {
      open: openCount,
      pending: pendingCount,
      closed: closedCount,
      openGroups: openGroupsCount
    };
  } catch (error) {
    logger.error(`Erro ao contar tickets: ${error}`);
    throw error;
  }
};

export default CountTicketsService;
