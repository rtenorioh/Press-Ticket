import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { logger } from "../../utils/logger";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const execAsync = promisify(exec);

const BACKUP_DIR = process.env.BACKUP_DIR || "./backups";
const DB_CONFIG = require("../../config/database");

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

interface BackupInfo {
  filename: string;
  path: string;
  size: string;
  date: string;
  timestamp: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

export const listBackups = async (): Promise<BackupInfo[]> => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      return [];
    }
    
    const files = fs.readdirSync(BACKUP_DIR).filter(file => 
      file.endsWith('.sql') || file.endsWith('.sql.gz')
    );
    
    const backups = files.map(filename => {
      const filePath = path.join(BACKUP_DIR, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        path: filePath,
        size: formatBytes(stats.size),
        date: format(stats.mtime, "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: pt }),
        timestamp: stats.mtime.getTime()
      };
    });
    
    return backups.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error: any) {
    logger.error(`Erro ao listar backups: ${error.message}`);
    throw new Error(`Não foi possível listar os backups: ${error.message}`);
  }
};

export const createBackup = async (customName?: string): Promise<BackupInfo> => {
  try {
    const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
    const filename = customName 
      ? `${customName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${timestamp}.sql.gz` 
      : `backup_${timestamp}.sql.gz`;
    
    const filePath = path.join(BACKUP_DIR, filename);
    
    const command = `mysqldump --host=${DB_CONFIG.host} --port=${DB_CONFIG.port} --user=${DB_CONFIG.username} --password=${DB_CONFIG.password} ${DB_CONFIG.database} | gzip > ${filePath}`;
    
    logger.info(`Iniciando backup do banco de dados para ${filePath}`);
    await execAsync(command);
    
    if (!fs.existsSync(filePath)) {
      throw new Error("Backup falhou: arquivo não foi criado");
    }
    
    const stats = fs.statSync(filePath);
    
    logger.info(`Backup concluído com sucesso: ${filePath} (${formatBytes(stats.size)})`);
    
    return {
      filename,
      path: filePath,
      size: formatBytes(stats.size),
      date: format(stats.mtime, "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: pt }),
      timestamp: stats.mtime.getTime()
    };
  } catch (error: any) {
    logger.error(`Erro ao criar backup: ${error.message}`);
    throw new Error(`Não foi possível criar o backup: ${error.message}`);
  }
};

export const restoreBackup = async (filename: string): Promise<{ success: boolean; message: string }> => {
  try {
    const filePath = path.join(BACKUP_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo de backup não encontrado: ${filename}`);
    }
    
    logger.info(`Iniciando restauração do backup: ${filePath}`);
    
    let command;
    if (filename.endsWith('.sql.gz')) {
      command = `gunzip < ${filePath} | mysql --host=${DB_CONFIG.host} --port=${DB_CONFIG.port} --user=${DB_CONFIG.username} --password=${DB_CONFIG.password} ${DB_CONFIG.database}`;
    } else {
      command = `mysql --host=${DB_CONFIG.host} --port=${DB_CONFIG.port} --user=${DB_CONFIG.username} --password=${DB_CONFIG.password} ${DB_CONFIG.database} < ${filePath}`;
    }
    
    await execAsync(command);
    
    logger.info(`Restauração do backup concluída com sucesso: ${filePath}`);
    
    return {
      success: true,
      message: `Backup restaurado com sucesso: ${filename}`
    };
  } catch (error: any) {
    logger.error(`Erro ao restaurar backup: ${error.message}`);
    throw new Error(`Não foi possível restaurar o backup: ${error.message}`);
  }
};

export const deleteBackup = async (filename: string): Promise<{ success: boolean; message: string }> => {
  try {
    const filePath = path.join(BACKUP_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo de backup não encontrado: ${filename}`);
    }
    
    fs.unlinkSync(filePath);
    
    logger.info(`Backup excluído com sucesso: ${filePath}`);
    
    return {
      success: true,
      message: `Backup excluído com sucesso: ${filename}`
    };
  } catch (error: any) {
    logger.error(`Erro ao excluir backup: ${error.message}`);
    throw new Error(`Não foi possível excluir o backup: ${error.message}`);
  }
};
