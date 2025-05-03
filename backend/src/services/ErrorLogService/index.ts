import ErrorLog from "../../models/ErrorLog";
import { Op } from "sequelize";

interface ErrorLogData {
  source: string;
  message: string;
  stack?: string;
  userId?: number;
  username?: string;
  url?: string;
  userAgent?: string;
  component?: string;
  severity?: string;
}

class ErrorLogService {
  public async create(data: ErrorLogData): Promise<ErrorLog> {
    const errorLog = await ErrorLog.create({
      source: data.source,
      message: data.message,
      stack: data.stack || "",
      userId: data.userId,
      username: data.username,
      url: data.url || "",
      userAgent: data.userAgent || "",
      component: data.component || "",
      severity: data.severity || "error"
    });

    return errorLog;
  }

  public async findAll(
    searchParams: { 
      source?: string; 
      startDate?: Date; 
      endDate?: Date;
      severity?: string;
    } = {},
    limit = 5,
    offset = 0,
    order: any = [["id", "DESC"]]
  ): Promise<{ rows: ErrorLog[]; count: number }> {
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
  }

  public async findById(id: number): Promise<ErrorLog> {
    const errorLog = await ErrorLog.findByPk(id);
    if (!errorLog) {
      throw new Error("Log de erro não encontrado");
    }
    return errorLog;
  }

  public async deleteOld(daysToKeep = 30): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - daysToKeep);

    const { count } = await ErrorLog.findAndCountAll({
      where: {
        createdAt: {
          [Op.lt]: date
        }
      }
    });

    await ErrorLog.destroy({
      where: {
        createdAt: {
          [Op.lt]: date
        }
      }
    });

    return count;
  }
}

export default new ErrorLogService();
