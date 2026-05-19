import { Request, Response } from "express";
import {
  getHealthCheckService,
  getAllHealthChecks
} from "../services/WbotServices/HealthCheckService";

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  try {
    const healthCheck = await getHealthCheckService(parseInt(whatsappId));
    return res.json(healthCheck);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return res.status(400).json({ error: message });
  }
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const healthChecks = await getAllHealthChecks();
    return res.json(healthChecks);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return res.status(400).json({ error: message });
  }
};
