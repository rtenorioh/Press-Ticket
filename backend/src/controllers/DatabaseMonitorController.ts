import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { getDatabaseInfo } from "../services/DatabaseMonitorService";

export const getDatabaseStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const databaseInfo = await getDatabaseInfo();
    return res.status(200).json(databaseInfo);
  } catch (error) {
    logger.error(`Erro ao obter informações do banco de dados: ${error}`);
    return res.status(500).json({ 
      error: "Erro ao obter informações do banco de dados" 
    });
  }
};
