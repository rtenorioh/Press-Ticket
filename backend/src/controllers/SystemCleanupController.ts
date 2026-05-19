import { Request, Response } from "express";
import {
  cleanupSystem,
  getCleanupSettings,
  saveCleanupSettings
} from "../services/SystemCleanupService";
import { logger } from "../utils/logger";
import { getIO } from "../libs/socket";

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const settings = await getCleanupSettings();
    return res.status(200).json(settings);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    logger.error(`Erro ao obter configurações de limpeza: ${message}`);
    return res.status(500).json({ error: message });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      autoCleanup,
      scheduleTime,
      olderThan,
      cleanTemp,
      cleanLogs,
      cleanMedia,
      cleanClosedTickets
    } = req.body;

    await saveCleanupSettings({
      autoCleanup,
      scheduleTime,
      olderThan,
      cleanTemp,
      cleanLogs,
      cleanMedia,
      cleanClosedTickets
    });

    const io = getIO();
    io.emit("settings", {
      action: "update",
      setting: "cleanup"
    });

    return res
      .status(200)
      .json({ message: "Configurações de limpeza salvas com sucesso" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    logger.error(`Erro ao salvar configurações de limpeza: ${message}`);
    return res.status(500).json({ error: message });
  }
};

export const execute = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      olderThan,
      messageTypes,
      queueIds,
      status,
      cleanLogs,
      cleanTemp,
      cleanMedia,
      cleanClosedTickets
    } = req.body;

    const result = await cleanupSystem({
      olderThan,
      messageTypes,
      queueIds,
      status,
      cleanLogs,
      cleanTemp,
      cleanMedia,
      cleanClosedTickets
    });

    const io = getIO();
    io.emit("systemCleanup", {
      action: "complete",
      result
    });

    return res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    logger.error(`Erro ao executar limpeza do sistema: ${message}`);
    return res.status(500).json({ error: message });
  }
};
