import { Request, Response, NextFunction } from "express";
import ErrorLogService from "../services/ErrorLogService";
import { logger } from "../utils/logger";

const errorLogger = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errorData: any = {
      source: "backend",
      message: err.message || "Erro desconhecido",
      stack: err.stack || "",
      component: req.path,
      url: req.originalUrl,
      userAgent: req.headers["user-agent"] || "",
      severity: "error"
    };

    if (req.user) {
      errorData.userId = req.user.id;
      errorData.username = req.user.profile || "";
    }

    await ErrorLogService.create(errorData);
  } catch (logError) {
    logger.error(`Erro ao registrar log de erro: ${logError}`);
  }

  next(err);
};

export default errorLogger;
