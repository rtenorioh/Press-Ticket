import { Op } from "sequelize";
import ActivityLog from "../../models/ActivityLog";
import User from "../../models/User";

interface Request {
  limit: number;
  offset: number;
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: string;
}

interface Response {
  logs: ActivityLog[];
  count: number;
  hasMore: boolean;
}

const ListActivityLogsService = async ({
  limit,
  offset,
  startDate,
  endDate,
  userId,
  action
}: Request): Promise<Response> => {
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

  if (userId && userId !== "") {
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

  const hasMore = count > offset + logs.length;

  return {
    logs,
    count,
    hasMore
  };
};

export default ListActivityLogsService;
