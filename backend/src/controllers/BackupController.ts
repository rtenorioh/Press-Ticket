import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { logger } from "../utils/logger";
import { createBackup, listBackups, restoreBackup, deleteBackup, uploadBackup } from "../services/BackupService";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import GetClientIp from "../helpers/GetClientIp";

interface BackupRequest {
  name?: string;
  path?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const backups = await listBackups();
    return res.status(200).json(backups);
  } catch (err: any) {
    logger.error(`Erro ao listar backups: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name } = req.body as BackupRequest;
    
    const backupInfo = await createBackup(name);
    
    const logUserId = req.user?.id || 1;
    
    const clientIp = GetClientIp(req);
    
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.CREATE,
      description: `Backup "${backupInfo.filename}" criado`,
      entityType: EntityTypes.BACKUP,
      entityId: 0,
      additionalData: {
        filename: backupInfo.filename,
        size: backupInfo.size
      }
    });
    
    const io = getIO();
    io.emit("backup", {
      action: "create",
      backup: backupInfo
    });
    
    return res.status(200).json(backupInfo);
  } catch (err: any) {
    logger.error(`Erro ao criar backup: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};

export const show = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    
    const BACKUP_DIR = process.env.BACKUP_DIR || "./backups";
    const filePath = `${BACKUP_DIR}/${filename}`;
    
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      logger.error(`Arquivo de backup não encontrado: ${filePath}`);
      res.status(404).json({ error: `Arquivo de backup não encontrado: ${filename}` });
      return;
    }
    
    res.download(filePath);
  } catch (err: any) {
    logger.error(`Erro ao baixar backup: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { filename } = req.params;
    const backupInfo = await restoreBackup(filename);
    
    const logUserId = req.user?.id || 1;
    
    const clientIp = GetClientIp(req);
    
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.UPDATE,
      description: `Backup "${filename}" restaurado`,
      entityType: EntityTypes.BACKUP,
      entityId: 0,
      additionalData: {
        filename,
        success: backupInfo.success,
        message: backupInfo.message
      }
    });
    
    const io = getIO();
    io.emit("backup", {
      action: "restore",
      backup: backupInfo
    });
    
    return res.status(200).json(backupInfo);
  } catch (err: any) {
    logger.error(`Erro ao restaurar backup: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};

export const upload = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo foi enviado" });
    }

    const backupInfo = await uploadBackup(req.file);
    
    const logUserId = req.user?.id || 1;
    
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.CREATE,
      description: `Backup "${backupInfo.filename}" importado`,
      entityType: EntityTypes.BACKUP,
      entityId: 0,
      additionalData: {
        filename: backupInfo.filename,
        size: backupInfo.size
      }
    });
    
    const io = getIO();
    io.emit("backup", {
      action: "upload",
      backup: backupInfo
    });
    
    return res.status(200).json(backupInfo);
  } catch (err: any) {
    logger.error(`Erro ao importar backup: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { filename } = req.params;
    const result = await deleteBackup(filename);
    
    const logUserId = req.user?.id || 1;
    
    const clientIp = GetClientIp(req);
    
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.DELETE,
      description: `Backup "${filename}" excluído`,
      entityType: EntityTypes.BACKUP,
      entityId: 0,
      additionalData: {
        filename,
        success: result.success,
        message: result.message
      }
    });
    
    const io = getIO();
    io.emit("backup", {
      action: "delete",
      filename
    });
    
    return res.status(200).json(result);
  } catch (err: any) {
    logger.error(`Erro ao excluir backup: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};
