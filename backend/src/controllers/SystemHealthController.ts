import { Request, Response } from "express";
import { getSystemHealth } from "../services/SystemHealthService";
import { logger } from "../utils/logger";

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const systemHealth = await getSystemHealth();
    return res.status(200).json(systemHealth);
  } catch (err: any) {
    logger.error(`Erro ao obter saúde do sistema: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};
