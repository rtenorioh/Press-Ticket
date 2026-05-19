import { Request, Response } from "express";
import {
  checkForUpdates,
  downloadAndInstallUpdate,
  getUpdateStatus,
  listBackups,
  restoreBackup
} from "../services/SystemUpdateService";
import { logger } from "../utils/logger";

export const checkUpdates = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const updateInfo = await checkForUpdates();
    return res.status(200).json(updateInfo);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    logger.error(`Erro ao verificar atualizações: ${message}`);
    return res.status(500).json({ error: message });
  }
};

export const installUpdate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const updateInfo = await checkForUpdates();

    if (!updateInfo.needsUpdate) {
      return res
        .status(400)
        .json({ error: "O sistema já está na versão mais recente." });
    }

    downloadAndInstallUpdate(updateInfo).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Erro interno";
      logger.error(
        `Erro durante o processo de atualização em segundo plano: ${message}`
      );
    });

    return res.status(200).json({
      success: true,
      message:
        "Processo de atualização completa iniciado com sucesso. A atualização inclui backend, frontend e reinício dos serviços. Acompanhe o progresso pela rota /system-update/status."
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    logger.error(`Erro ao iniciar atualização: ${message}`);
    return res.status(500).json({ error: message });
  }
};

export const getStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const status = await getUpdateStatus();
    return res.status(200).json(status);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    logger.error(`Erro ao obter status de atualização: ${message}`);
    return res.status(500).json({ error: message });
  }
};

export const getBackups = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const backups = await listBackups();
    return res.status(200).json({ backups });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    logger.error(`Erro ao listar backups: ${message}`);
    return res.status(500).json({ error: message });
  }
};

export const restoreFromBackup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { backupFileName } = req.params;

    if (!backupFileName) {
      return res
        .status(400)
        .json({ error: "Nome do arquivo de backup não fornecido." });
    }

    const result = await restoreBackup(backupFileName);
    return res.status(200).json({
      success: result,
      message: "Processo de restauração iniciado com sucesso."
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    logger.error(`Erro ao restaurar backup: ${message}`);
    return res.status(500).json({ error: message });
  }
};
