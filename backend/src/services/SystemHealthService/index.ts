import os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "../../utils/logger";
import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import Whatsapp from "../../models/Whatsapp";
import Queue from "../../models/Queue";
import User from "../../models/User";
import sequelize from "../../database";

const execPromise = promisify(exec);

interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  timestamp: number;
  uptime: number;
  cpu: {
    usage: number;
    cores: number;
    model: string;
    loadAvg: number[];
  };
  memory: {
    total: number;
    free: number;
    used: number;
    percentUsed: number;
  };
  disk: {
    total: number;
    free: number;
    used: number;
    percentUsed: number;
  };
  database: {
    status: "connected" | "error";
    responseTime: number;
    activeConnections: number;
    version: string;
    error?: string;
  };
  whatsapp: {
    total: number;
    connected: number;
    disconnected: number;
    pendingMessages: number;
  };
  application: {
    version: string;
    nodeVersion: string;
    activeUsers: number;
    openTickets: number;
    pendingTickets: number;
    messagesLast24h: number;
    errors: number;
  };
  alerts: {
    level: "info" | "warning" | "critical";
    message: string;
    component: string;
  }[];
}

const getCpuUsage = async (): Promise<number> => {
  try {
    const startMeasure = os.cpus().map(cpu => {
      return Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
    });
    
    const startIdle = os.cpus().map(cpu => cpu.times.idle);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const endMeasure = os.cpus().map(cpu => {
      return Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
    });
    
    const endIdle = os.cpus().map(cpu => cpu.times.idle);
    
    const idleDifferences = endIdle.map((idle, i) => idle - startIdle[i]);
    const totalDifferences = endMeasure.map((measure, i) => measure - startMeasure[i]);
    
    const averageUsage = idleDifferences.reduce((acc, idle, i) => {
      const total = totalDifferences[i];
      const usage = 1 - idle / total;
      return acc + usage;
    }, 0) / os.cpus().length;
    
    return Math.round(averageUsage * 100);
  } catch (error) {
    logger.error("Erro ao obter uso de CPU:", error);
    return 0;
  }
};

const getDiskInfo = async (): Promise<{ total: number; free: number; used: number; percentUsed: number }> => {
  try {
    const { stdout } = await execPromise("df -k / | tail -1");
    const values = stdout.trim().split(/\s+/);
    
    const total = parseInt(values[1], 10) / 1024 / 1024;
    const used = parseInt(values[2], 10) / 1024 / 1024;
    const free = parseInt(values[3], 10) / 1024 / 1024;
    const percentUsed = Math.round((used / total) * 100);
    
    return {
      total: parseFloat(total.toFixed(2)),
      free: parseFloat(free.toFixed(2)),
      used: parseFloat(used.toFixed(2)),
      percentUsed
    };
  } catch (error) {
    logger.error("Erro ao obter informações de disco:", error);
    return {
      total: 0,
      free: 0,
      used: 0,
      percentUsed: 0
    };
  }
};

const getDatabaseInfo = async (): Promise<{
  status: "connected" | "error";
  responseTime: number;
  activeConnections: number;
  version: string;
  error?: string;
}> => {
  try {
    const startTime = Date.now();
    
    await sequelize.authenticate();
    
    const responseTime = Date.now() - startTime;
    
    const [versionResult] = await sequelize.query("SELECT version();");
    const version = Array.isArray(versionResult) && versionResult.length > 0 
      ? (versionResult[0] as any).version || "Unknown"
      : "Unknown";
    
    let connectionsResult;
    let activeConnections = 0;
    
    try {
      if (sequelize.getDialect() === 'postgres') {
        [connectionsResult] = await sequelize.query("SELECT count(*) as count FROM pg_stat_activity;");
      } else if (sequelize.getDialect() === 'mysql' || sequelize.getDialect() === 'mariadb') {
        [connectionsResult] = await sequelize.query("SELECT COUNT(*) as count FROM information_schema.processlist WHERE command != 'Sleep';");
      } else {
        [connectionsResult] = await sequelize.query("SELECT 1 as count;");
        logger.info(`Contagem de conexões não implementada para o dialeto: ${sequelize.getDialect()}`);
      }
      
      activeConnections = Array.isArray(connectionsResult) && connectionsResult.length > 0 
        ? parseInt((connectionsResult[0] as any).count, 10) || 0
        : 0;
    } catch (error) {
      logger.error("Erro ao contar conexões ativas:", error);
      activeConnections = 0;
    }
    
    return {
      status: "connected",
      responseTime,
      activeConnections,
      version: version.split(" ")[0]
    };
  } catch (error: any) {
    logger.error("Erro ao obter informações do banco de dados:", error);
    return {
      status: "error",
      responseTime: 0,
      activeConnections: 0,
      version: "Unknown",
      error: error.message
    };
  }
};

const getWhatsappInfo = async (): Promise<{
  total: number;
  connected: number;
  disconnected: number;
  pendingMessages: number;
}> => {
  try {
    const whatsapps = await Whatsapp.findAll();
    
    const total = whatsapps.length;
    const connected = whatsapps.filter(w => w.status === "CONNECTED").length;
    const disconnected = total - connected;
    
    const pendingMessages = await Message.count({
      where: {
        ack: 0,
        fromMe: true
      }
    });
    
    return {
      total,
      connected,
      disconnected,
      pendingMessages
    };
  } catch (error) {
    logger.error("Erro ao obter informações do WhatsApp:", error);
    return {
      total: 0,
      connected: 0,
      disconnected: 0,
      pendingMessages: 0
    };
  }
};

const getApplicationInfo = async (): Promise<{
  version: string;
  nodeVersion: string;
  activeUsers: number;
  openTickets: number;
  pendingTickets: number;
  messagesLast24h: number;
  errors: number;
}> => {
  try {
    const packageJsonPath = `${process.cwd()}/package.json`;
    const packageJson = require(packageJsonPath);
    const version = packageJson.version || "Unknown";
    
    const activeUsers = await User.count({
      where: {
        online: true
      }
    });
    
    const openTickets = await Ticket.count({
      where: {
        status: "open"
      }
    });
    
    const pendingTickets = await Ticket.count({
      where: {
        status: "pending"
      }
    });
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const messagesLast24h = await Message.count({
      where: {
        createdAt: {
          [Op.gte]: oneDayAgo
        }
      }
    });
    
    const errors = 0; 
    
    return {
      version,
      nodeVersion: process.version,
      activeUsers,
      openTickets,
      pendingTickets,
      messagesLast24h,
      errors
    };
  } catch (error) {
    logger.error("Erro ao obter informações da aplicação:", error);
    return {
      version: "Unknown",
      nodeVersion: process.version,
      activeUsers: 0,
      openTickets: 0,
      pendingTickets: 0,
      messagesLast24h: 0,
      errors: 0
    };
  }
};

const generateAlerts = (healthData: Partial<SystemHealth>): {
  level: "info" | "warning" | "critical";
  message: string;
  component: string;
}[] => {
  const alerts: {
    level: "info" | "warning" | "critical";
    message: string;
    component: string;
  }[] = [];
  
  if (healthData.cpu && healthData.cpu.usage > 90) {
    alerts.push({
      level: "critical",
      message: `Uso de CPU muito alto: ${healthData.cpu.usage}%`,
      component: "cpu"
    });
  } else if (healthData.cpu && healthData.cpu.usage > 70) {
    alerts.push({
      level: "warning",
      message: `Uso de CPU elevado: ${healthData.cpu.usage}%`,
      component: "cpu"
    });
  }
  
  if (healthData.memory && healthData.memory.percentUsed > 90) {
    alerts.push({
      level: "critical",
      message: `Uso de memória muito alto: ${healthData.memory.percentUsed}%`,
      component: "memory"
    });
  } else if (healthData.memory && healthData.memory.percentUsed > 70) {
    alerts.push({
      level: "warning",
      message: `Uso de memória elevado: ${healthData.memory.percentUsed}%`,
      component: "memory"
    });
  }
  
  if (healthData.disk && healthData.disk.percentUsed > 90) {
    alerts.push({
      level: "critical",
      message: `Espaço em disco quase esgotado: ${healthData.disk.percentUsed}%`,
      component: "disk"
    });
  } else if (healthData.disk && healthData.disk.percentUsed > 70) {
    alerts.push({
      level: "warning",
      message: `Uso de disco elevado: ${healthData.disk.percentUsed}%`,
      component: "disk"
    });
  }
  
  if (healthData.database && healthData.database.status === "error") {
    alerts.push({
      level: "critical",
      message: `Erro na conexão com o banco de dados: ${healthData.database.error}`,
      component: "database"
    });
  } else if (healthData.database && healthData.database.responseTime > 1000) {
    alerts.push({
      level: "warning",
      message: `Tempo de resposta do banco de dados elevado: ${healthData.database.responseTime}ms`,
      component: "database"
    });
  }
  
  if (healthData.whatsapp && healthData.whatsapp.disconnected > 0) {
    const level = healthData.whatsapp.disconnected === healthData.whatsapp.total ? "critical" : "warning";
    alerts.push({
      level,
      message: `${healthData.whatsapp.disconnected} conexão(ões) WhatsApp desconectada(s)`,
      component: "whatsapp"
    });
  }
  
  if (healthData.whatsapp && healthData.whatsapp.pendingMessages > 100) {
    alerts.push({
      level: "warning",
      message: `${healthData.whatsapp.pendingMessages} mensagens pendentes para envio`,
      component: "whatsapp"
    });
  }
  
  return alerts;
};

const determineSystemStatus = (alerts: {
  level: "info" | "warning" | "critical";
  message: string;
  component: string;
}[]): "healthy" | "warning" | "critical" => {
  if (alerts.some(alert => alert.level === "critical")) {
    return "critical";
  }
  
  if (alerts.some(alert => alert.level === "warning")) {
    return "warning";
  }
  
  return "healthy";
};

export const getSystemHealth = async (): Promise<SystemHealth> => {
  try {
    const [
      cpuUsage,
      diskInfo,
      databaseInfo,
      whatsappInfo,
      applicationInfo
    ] = await Promise.all([
      getCpuUsage(),
      getDiskInfo(),
      getDatabaseInfo(),
      getWhatsappInfo(),
      getApplicationInfo()
    ]);
    
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const percentMemoryUsed = Math.round((usedMemory / totalMemory) * 100);
    
    const healthData: Partial<SystemHealth> = {
      timestamp: Date.now(),
      uptime: os.uptime(),
      cpu: {
        usage: cpuUsage,
        cores: os.cpus().length,
        model: os.cpus()[0].model,
        loadAvg: os.loadavg()
      },
      memory: {
        total: Math.round(totalMemory / 1024 / 1024 / 1024 * 100) / 100, 
        free: Math.round(freeMemory / 1024 / 1024 / 1024 * 100) / 100, 
        used: Math.round(usedMemory / 1024 / 1024 / 1024 * 100) / 100, 
        percentUsed: percentMemoryUsed
      },
      disk: diskInfo,
      database: databaseInfo,
      whatsapp: whatsappInfo,
      application: applicationInfo
    };
    
    const alerts = generateAlerts(healthData);
    
    const status = determineSystemStatus(alerts);
    
    return {
      ...healthData,
      status,
      alerts
    } as SystemHealth;
  } catch (error) {
    logger.error("Erro ao obter saúde do sistema:", error);
    
    return {
      status: "critical",
      timestamp: Date.now(),
      uptime: os.uptime(),
      cpu: {
        usage: 0,
        cores: os.cpus().length,
        model: os.cpus()[0].model,
        loadAvg: os.loadavg()
      },
      memory: {
        total: 0,
        free: 0,
        used: 0,
        percentUsed: 0
      },
      disk: {
        total: 0,
        free: 0,
        used: 0,
        percentUsed: 0
      },
      database: {
        status: "error",
        responseTime: 0,
        activeConnections: 0,
        version: "Unknown",
        error: "Falha ao coletar informações do sistema"
      },
      whatsapp: {
        total: 0,
        connected: 0,
        disconnected: 0,
        pendingMessages: 0
      },
      application: {
        version: "Unknown",
        nodeVersion: process.version,
        activeUsers: 0,
        openTickets: 0,
        pendingTickets: 0,
        messagesLast24h: 0,
        errors: 1
      },
      alerts: [
        {
          level: "critical",
          message: "Falha ao coletar informações do sistema",
          component: "system"
        }
      ]
    };
  }
};
