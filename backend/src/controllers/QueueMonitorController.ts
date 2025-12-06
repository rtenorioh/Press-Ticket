import { Request, Response } from "express";
import { getQueueMonitorData } from "../services/QueueMonitorService";
import { logger } from "../utils/logger";

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const queueMonitorData = await getQueueMonitorData();
    return res.status(200).json(queueMonitorData);
  } catch (err: any) {
    logger.error(`Erro ao obter dados de monitoramento de setores: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};
