import { Request, Response } from "express";
import { getHealthCheckService, getAllHealthChecks } from "../services/WbotServices/HealthCheckService";

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  try {
    const healthCheck = await getHealthCheckService(parseInt(whatsappId));
    return res.json(healthCheck);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const healthChecks = await getAllHealthChecks();
    return res.json(healthChecks);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
