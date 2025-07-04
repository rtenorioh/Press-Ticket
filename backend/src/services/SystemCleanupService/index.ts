import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { logger } from "../../utils/logger";
import { Op } from "sequelize";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import Setting from "../../models/Setting";

const execPromise = promisify(exec);

interface CleanupOptions {
  olderThan?: number; // dias
  messageTypes?: string[]; // tipos de mensagem para limpar (texto, mídia, etc)
  queueIds?: number[]; // IDs dos setores para limpar
  status?: string; // status dos tickets para limpar (closed, open, pending)
  cleanLogs?: boolean; // limpar logs do sistema
  cleanTemp?: boolean; // limpar arquivos temporários
  cleanMedia?: boolean; // limpar arquivos de mídia
  cleanClosedTickets?: boolean; // limpar tickets fechados
}

interface CleanupResult {
  success: boolean;
  messagesRemoved: number;
  ticketsRemoved: number;
  diskSpaceFreed: string;
  logsRemoved: number;
  tempFilesRemoved: number;
  mediaFilesRemoved: number;
  errors: string[];
}

// Função para obter o tamanho de um diretório em bytes
const getDirSize = async (dirPath: string): Promise<number> => {
  try {
    const { stdout } = await execPromise(`du -sb "${dirPath}" | cut -f1`);
    return parseInt(stdout.trim(), 10);
  } catch (error) {
    logger.error(`Erro ao obter tamanho do diretório ${dirPath}:`, error);
    return 0;
  }
};

// Função para formatar bytes em unidades legíveis
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Função para limpar arquivos temporários
const cleanTempFiles = async (): Promise<{ count: number; size: number }> => {
  try {
    // Diretório temporário do sistema
    const tempDir = path.join(process.cwd(), "public", "temp");
    
    // Verificar se o diretório existe
    if (!fs.existsSync(tempDir)) {
      return { count: 0, size: 0 };
    }
    
    // Obter tamanho antes da limpeza
    const sizeBefore = await getDirSize(tempDir);
    
    // Listar arquivos no diretório temporário
    const files = fs.readdirSync(tempDir);
    
    // Filtrar apenas arquivos (não diretórios)
    const filesToRemove = files.filter(file => {
      const filePath = path.join(tempDir, file);
      return fs.statSync(filePath).isFile();
    });
    
    // Remover arquivos
    let removedCount = 0;
    for (const file of filesToRemove) {
      const filePath = path.join(tempDir, file);
      fs.unlinkSync(filePath);
      removedCount++;
    }
    
    // Obter tamanho após a limpeza
    const sizeAfter = await getDirSize(tempDir);
    const freedSize = sizeBefore - sizeAfter;
    
    return { count: removedCount, size: freedSize };
  } catch (error) {
    logger.error("Erro ao limpar arquivos temporários:", error);
    return { count: 0, size: 0 };
  }
};

// Função para limpar arquivos de log
const cleanLogFiles = async (): Promise<{ count: number; size: number }> => {
  try {
    // Diretório de logs do sistema
    const logDir = path.join(process.cwd(), "logs");
    
    // Verificar se o diretório existe
    if (!fs.existsSync(logDir)) {
      return { count: 0, size: 0 };
    }
    
    // Obter tamanho antes da limpeza
    const sizeBefore = await getDirSize(logDir);
    
    // Listar arquivos no diretório de logs
    const files = fs.readdirSync(logDir);
    
    // Filtrar arquivos de log mais antigos que 7 dias
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    
    const filesToRemove = files.filter(file => {
      const filePath = path.join(logDir, file);
      const stats = fs.statSync(filePath);
      return stats.isFile() && (now - stats.mtimeMs > sevenDaysMs);
    });
    
    // Remover arquivos
    let removedCount = 0;
    for (const file of filesToRemove) {
      const filePath = path.join(logDir, file);
      fs.unlinkSync(filePath);
      removedCount++;
    }
    
    // Obter tamanho após a limpeza
    const sizeAfter = await getDirSize(logDir);
    const freedSize = sizeBefore - sizeAfter;
    
    return { count: removedCount, size: freedSize };
  } catch (error) {
    logger.error("Erro ao limpar arquivos de log:", error);
    return { count: 0, size: 0 };
  }
};

// Função para limpar arquivos de mídia
const cleanMediaFiles = async (olderThan = 30): Promise<{ count: number; size: number }> => {
  try {
    // Diretório de mídia do sistema
    const mediaDir = path.join(process.cwd(), "public", "media");
    
    // Verificar se o diretório existe
    if (!fs.existsSync(mediaDir)) {
      return { count: 0, size: 0 };
    }
    
    // Obter tamanho antes da limpeza
    const sizeBefore = await getDirSize(mediaDir);
    
    // Listar arquivos no diretório de mídia
    const files = fs.readdirSync(mediaDir);
    
    // Filtrar arquivos de mídia mais antigos que o número de dias especificado
    const now = Date.now();
    const olderThanMs = olderThan * 24 * 60 * 60 * 1000;
    
    const filesToRemove = files.filter(file => {
      const filePath = path.join(mediaDir, file);
      const stats = fs.statSync(filePath);
      return stats.isFile() && (now - stats.mtimeMs > olderThanMs);
    });
    
    // Remover arquivos
    let removedCount = 0;
    for (const file of filesToRemove) {
      const filePath = path.join(mediaDir, file);
      fs.unlinkSync(filePath);
      removedCount++;
    }
    
    // Obter tamanho após a limpeza
    const sizeAfter = await getDirSize(mediaDir);
    const freedSize = sizeBefore - sizeAfter;
    
    return { count: removedCount, size: freedSize };
  } catch (error) {
    logger.error("Erro ao limpar arquivos de mídia:", error);
    return { count: 0, size: 0 };
  }
};

// Função para limpar mensagens e tickets antigos
const cleanMessagesAndTickets = async (options: CleanupOptions): Promise<{ messages: number; tickets: number }> => {
  try {
    const { olderThan = 30, status = "closed", queueIds } = options;
    
    // Calcular a data limite
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - olderThan);
    
    // Condições para tickets
    const ticketWhere: any = {
      updatedAt: {
        [Op.lt]: limitDate
      }
    };
    
    // Adicionar condição de status se especificado
    if (status !== "all") {
      ticketWhere.status = status;
    }
    
    // Adicionar condição de setores se especificado
    if (queueIds && queueIds.length > 0) {
      ticketWhere.queueId = {
        [Op.in]: queueIds
      };
    }
    
    // Buscar IDs dos tickets que serão removidos
    const ticketsToRemove = await Ticket.findAll({
      attributes: ["id"],
      where: ticketWhere
    });
    
    const ticketIds = ticketsToRemove.map(t => t.id);
    
    // Remover mensagens dos tickets
    let removedMessages = 0;
    if (ticketIds.length > 0) {
      const result = await Message.destroy({
        where: {
          ticketId: {
            [Op.in]: ticketIds
          }
        }
      });
      removedMessages = result;
    }
    
    // Remover tickets
    const removedTickets = await Ticket.destroy({
      where: ticketWhere
    });
    
    return {
      messages: removedMessages,
      tickets: removedTickets
    };
  } catch (error) {
    logger.error("Erro ao limpar mensagens e tickets:", error);
    return { messages: 0, tickets: 0 };
  }
};

// Função principal para executar a limpeza do sistema
export const cleanupSystem = async (options: CleanupOptions): Promise<CleanupResult> => {
  const errors: string[] = [];
  let messagesRemoved = 0;
  let ticketsRemoved = 0;
  let tempFilesRemoved = 0;
  let logsRemoved = 0;
  let mediaFilesRemoved = 0;
  let totalSizeFreed = 0;
  
  try {
    // Limpar arquivos temporários
    if (options.cleanTemp) {
      const tempResult = await cleanTempFiles();
      tempFilesRemoved = tempResult.count;
      totalSizeFreed += tempResult.size;
    }
    
    // Limpar arquivos de log
    if (options.cleanLogs) {
      const logsResult = await cleanLogFiles();
      logsRemoved = logsResult.count;
      totalSizeFreed += logsResult.size;
    }
    
    // Limpar arquivos de mídia
    if (options.cleanMedia) {
      const mediaResult = await cleanMediaFiles(options.olderThan);
      mediaFilesRemoved = mediaResult.count;
      totalSizeFreed += mediaResult.size;
    }
    
    // Limpar tickets fechados e suas mensagens
    if (options.cleanClosedTickets) {
      const dbResult = await cleanMessagesAndTickets(options);
      messagesRemoved = dbResult.messages;
      ticketsRemoved = dbResult.tickets;
    }
    
    return {
      success: true,
      messagesRemoved,
      ticketsRemoved,
      diskSpaceFreed: formatBytes(totalSizeFreed),
      logsRemoved,
      tempFilesRemoved,
      mediaFilesRemoved,
      errors
    };
  } catch (error: any) {
    logger.error("Erro durante a limpeza do sistema:", error);
    errors.push(error.message || "Erro desconhecido durante a limpeza");
    
    return {
      success: false,
      messagesRemoved,
      ticketsRemoved,
      diskSpaceFreed: formatBytes(totalSizeFreed),
      logsRemoved,
      tempFilesRemoved,
      mediaFilesRemoved,
      errors
    };
  }
};

// Função para obter configurações de limpeza automática
export const getCleanupSettings = async (): Promise<{
  autoCleanup: boolean;
  scheduleTime: string;
  olderThan: number;
  cleanTemp: boolean;
  cleanLogs: boolean;
  cleanMedia: boolean;
  cleanClosedTickets: boolean;
}> => {
  try {
    const [
      autoCleanupSetting,
      scheduleTimeSetting,
      olderThanSetting,
      cleanTempSetting,
      cleanLogsSetting,
      cleanMediaSetting,
      cleanClosedTicketsSetting
    ] = await Promise.all([
      Setting.findOne({ where: { key: "cleanup.autoCleanup" } }),
      Setting.findOne({ where: { key: "cleanup.scheduleTime" } }),
      Setting.findOne({ where: { key: "cleanup.olderThan" } }),
      Setting.findOne({ where: { key: "cleanup.cleanTemp" } }),
      Setting.findOne({ where: { key: "cleanup.cleanLogs" } }),
      Setting.findOne({ where: { key: "cleanup.cleanMedia" } }),
      Setting.findOne({ where: { key: "cleanup.cleanClosedTickets" } })
    ]);
    
    return {
      autoCleanup: autoCleanupSetting?.value === "true",
      scheduleTime: scheduleTimeSetting?.value || "00:00",
      olderThan: parseInt(olderThanSetting?.value || "30", 10),
      cleanTemp: cleanTempSetting?.value === "true",
      cleanLogs: cleanLogsSetting?.value === "true",
      cleanMedia: cleanMediaSetting?.value === "true",
      cleanClosedTickets: cleanClosedTicketsSetting?.value === "true"
    };
  } catch (error) {
    logger.error("Erro ao obter configurações de limpeza:", error);
    return {
      autoCleanup: false,
      scheduleTime: "00:00",
      olderThan: 30,
      cleanTemp: true,
      cleanLogs: true,
      cleanMedia: false,
      cleanClosedTickets: false
    };
  }
};

// Função para salvar configurações de limpeza automática
export const saveCleanupSettings = async (settings: {
  autoCleanup: boolean;
  scheduleTime: string;
  olderThan: number;
  cleanTemp: boolean;
  cleanLogs: boolean;
  cleanMedia: boolean;
  cleanClosedTickets: boolean;
}): Promise<void> => {
  try {
    await Promise.all([
      Setting.findOrCreate({
        where: { key: "cleanup.autoCleanup" },
        defaults: { key: "cleanup.autoCleanup", value: String(settings.autoCleanup) }
      }).then(([setting]) => {
        setting.value = String(settings.autoCleanup);
        return setting.save();
      }),
      
      Setting.findOrCreate({
        where: { key: "cleanup.scheduleTime" },
        defaults: { key: "cleanup.scheduleTime", value: settings.scheduleTime }
      }).then(([setting]) => {
        setting.value = settings.scheduleTime;
        return setting.save();
      }),
      
      Setting.findOrCreate({
        where: { key: "cleanup.olderThan" },
        defaults: { key: "cleanup.olderThan", value: String(settings.olderThan) }
      }).then(([setting]) => {
        setting.value = String(settings.olderThan);
        return setting.save();
      }),
      
      Setting.findOrCreate({
        where: { key: "cleanup.cleanTemp" },
        defaults: { key: "cleanup.cleanTemp", value: String(settings.cleanTemp) }
      }).then(([setting]) => {
        setting.value = String(settings.cleanTemp);
        return setting.save();
      }),
      
      Setting.findOrCreate({
        where: { key: "cleanup.cleanLogs" },
        defaults: { key: "cleanup.cleanLogs", value: String(settings.cleanLogs) }
      }).then(([setting]) => {
        setting.value = String(settings.cleanLogs);
        return setting.save();
      }),
      
      Setting.findOrCreate({
        where: { key: "cleanup.cleanMedia" },
        defaults: { key: "cleanup.cleanMedia", value: String(settings.cleanMedia) }
      }).then(([setting]) => {
        setting.value = String(settings.cleanMedia);
        return setting.save();
      }),
      
      Setting.findOrCreate({
        where: { key: "cleanup.cleanClosedTickets" },
        defaults: { key: "cleanup.cleanClosedTickets", value: String(settings.cleanClosedTickets) }
      }).then(([setting]) => {
        setting.value = String(settings.cleanClosedTickets);
        return setting.save();
      })
    ]);
  } catch (error) {
    logger.error("Erro ao salvar configurações de limpeza:", error);
    throw new Error("Não foi possível salvar as configurações de limpeza");
  }
};
