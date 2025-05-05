import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { getMemoryUsageInfo } from "../services/MemoryUsageService";

export const getMemoryUsage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const memoryInfo = await getMemoryUsageInfo();
    return res.status(200).json(memoryInfo);
  } catch (error) {
    logger.error(`Erro ao obter informações de uso de memória: ${error}`);
    return res.status(500).json({ 
      error: "Erro ao obter informações de uso de memória" 
    });
  }
};
