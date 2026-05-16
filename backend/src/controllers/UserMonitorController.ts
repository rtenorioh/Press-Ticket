import { Request, Response } from "express";
import UserMonitorService from "../services/UserServices/UserMonitorService";
import { logger } from "../utils/logger";

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.query;

    const data = await UserMonitorService(
      userId ? parseInt(userId as string) : undefined
    );

    return res.status(200).json(data);
  } catch (error: any) {
    logger.error(`[USER_MONITOR_CONTROLLER] Erro: ${error}`);
    return res.status(500).json({ error: error.message });
  }
};
