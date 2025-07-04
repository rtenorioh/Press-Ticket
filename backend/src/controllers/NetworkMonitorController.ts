import { Request, Response } from "express";
import { getNetworkStatus } from "../services/NetworkMonitorService";
import { logger } from "../utils/logger";

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const networkStatus = await getNetworkStatus();
    return res.status(200).json(networkStatus);
  } catch (err: any) {
    logger.error(`Erro ao obter status da rede: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};
