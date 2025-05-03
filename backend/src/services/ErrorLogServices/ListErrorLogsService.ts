import ErrorLog from "../../models/ErrorLog";
import { Op } from "sequelize";

interface SearchParams {
  source?: string;
  startDate?: Date;
  endDate?: Date;
  severity?: string;
}

interface Request {
  searchParams?: SearchParams;
  limit?: number;
  offset?: number;
  order?: any;
}

interface Response {
  rows: ErrorLog[];
  count: number;
}

const ListErrorLogsService = async ({
  searchParams = {},
  limit = 5,
  offset = 0,
  order = [["id", "DESC"]]
}: Request): Promise<Response> => {
  const { source, startDate, endDate, severity } = searchParams;
  
  const where: any = {};
  
  if (source) {
    where.source = source;
  }
  
  if (severity) {
    where.severity = severity;
  }
  
  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate]
    };
  } else if (startDate) {
    where.createdAt = {
      [Op.gte]: startDate
    };
  } else if (endDate) {
    where.createdAt = {
      [Op.lte]: endDate
    };
  }

  const { count, rows } = await ErrorLog.findAndCountAll({
    where,
    limit,
    offset,
    order
  });

  return { rows, count };
};

export default ListErrorLogsService;
