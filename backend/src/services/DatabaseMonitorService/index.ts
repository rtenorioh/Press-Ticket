import { logger } from "../../utils/logger";
import { exec } from "child_process";
import { promisify } from "util";
import { Sequelize } from "sequelize";
import { QueryTypes } from "sequelize";

const execAsync = promisify(exec);

const dbConfig = require("../../config/database");

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false,
  }
);

interface TableInfo {
  name: string;
  rows: number;
  dataSize: string;
  indexSize: string;
  totalSize: string;
  sizeBytes: number;
}

interface ProcessInfo {
  id: number;
  user: string;
  host: string;
  db: string;
  command: string;
  time: number;
  state: string;
  info: string;
}

interface SlowQueryInfo {
  id: number;
  start_time: string;
  user_host: string;
  query_time: number;
  lock_time: number;
  rows_sent: number;
  rows_examined: number;
  db: string;
  sql_text: string;
  [key: string]: any;
}

interface DatabaseInfo {
  name: string;
  host: string;
  port: number;
  dialect: string;
  status: string;
  tables: TableInfo[];
  size: {
    total: string;
    totalBytes: number;
    byTable: TableInfo[];
  };
  performance: {
    slowQueries: SlowQueryInfo[];
    connectionCount: number;
    totalConnections?: number;
    totalQueries?: number;
    slowQueryCount?: number;
    activeProcesses?: ProcessInfo[];
    uptime: string;
    uptimeSeconds: number;
  };
  error?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

export const getDatabaseInfo = async (): Promise<DatabaseInfo> => {
  try {
    await sequelize.authenticate();
    logger.info("Conexão com o banco de dados estabelecida com sucesso.");

    const dbInfo: DatabaseInfo = {
      name: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      status: "online",
      tables: [],
      size: {
        total: "0 B",
        totalBytes: 0,
        byTable: []
      },
      performance: {
        slowQueries: [],
        connectionCount: 0,
        totalConnections: 0,
        totalQueries: 0,
        slowQueryCount: 0,
        activeProcesses: [],
        uptime: "0",
        uptimeSeconds: 0
      }
    };

    try {
      const dbSizeResults: any = await sequelize.query(`
        SELECT 
          table_schema as 'database',
          SUM(data_length + index_length) as 'size_bytes',
          ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as 'size_mb'
        FROM information_schema.tables
        WHERE table_schema = :dbName
        GROUP BY table_schema
      `, {
        replacements: { dbName: dbConfig.database },
        type: QueryTypes.SELECT,
        plain: true
      });

      if (dbSizeResults) {
        dbInfo.size.totalBytes = parseInt(dbSizeResults.size_bytes || "0", 10);
        dbInfo.size.total = formatBytes(dbInfo.size.totalBytes);
      }

      const tableSizes: any[] = await sequelize.query(`
        SELECT 
          table_name as 'name',
          data_length as 'data_bytes',
          index_length as 'index_bytes',
          (data_length + index_length) as 'total_bytes',
          table_rows as 'rows'
        FROM information_schema.tables
        WHERE table_schema = :dbName
        ORDER BY (data_length + index_length) DESC
      `, {
        replacements: { dbName: dbConfig.database },
        type: QueryTypes.SELECT
      });

      const tableInfos: TableInfo[] = tableSizes.map((table: any) => ({
        name: table.name,
        rows: parseInt(table.rows || "0", 10),
        dataSize: formatBytes(parseInt(table.data_bytes || "0", 10)),
        indexSize: formatBytes(parseInt(table.index_bytes || "0", 10)),
        totalSize: formatBytes(parseInt(table.total_bytes || "0", 10)),
        sizeBytes: parseInt(table.total_bytes || "0", 10)
      }));

      dbInfo.tables = tableInfos;
      dbInfo.size.byTable = tableInfos;

      let slowQueries: SlowQueryInfo[] = [];
      try {
        const queryResult = await sequelize.query(`
          SELECT 
            id, 
            start_time, 
            user_host, 
            query_time, 
            lock_time, 
            rows_sent, 
            rows_examined, 
            db, 
            sql_text
          FROM mysql.slow_log
          WHERE start_time > DATE_SUB(NOW(), INTERVAL 24 HOUR)
          ORDER BY query_time DESC
          LIMIT 10
        `, {
          type: QueryTypes.SELECT
        });
        
        slowQueries = (queryResult as any[]).map(row => ({
          id: Number(row.id || 0),
          start_time: String(row.start_time || ''),
          user_host: String(row.user_host || ''),
          query_time: Number(row.query_time || 0),
          lock_time: Number(row.lock_time || 0),
          rows_sent: Number(row.rows_sent || 0),
          rows_examined: Number(row.rows_examined || 0),
          db: String(row.db || ''),
          sql_text: String(row.sql_text || '')
        }));
      } catch (error: any) {
        logger.warn(`Não foi possível obter consultas lentas: ${error.message}`);
      }

      dbInfo.performance.slowQueries = slowQueries;

      const statusVariables: any[] = await sequelize.query(`
        SHOW GLOBAL STATUS WHERE Variable_name IN (
          'Uptime', 
          'Threads_connected', 
          'Connections', 
          'Questions', 
          'Slow_queries'
        )
      `, {
        type: QueryTypes.SELECT
      });

      const statusMap = statusVariables.reduce((acc: any, row: any) => {
        acc[row.Variable_name] = row.Value;
        return acc;
      }, {});

      const uptimeSeconds = parseInt(statusMap.Uptime || "0", 10);
      const days = Math.floor(uptimeSeconds / 86400);
      const hours = Math.floor((uptimeSeconds % 86400) / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = uptimeSeconds % 60;
      
      dbInfo.performance.uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      dbInfo.performance.uptimeSeconds = uptimeSeconds;
      dbInfo.performance.connectionCount = parseInt(statusMap.Threads_connected || "0", 10);
      dbInfo.performance.totalConnections = parseInt(statusMap.Connections || "0", 10);
      dbInfo.performance.totalQueries = parseInt(statusMap.Questions || "0", 10);
      dbInfo.performance.slowQueryCount = parseInt(statusMap.Slow_queries || "0", 10);

      const processlist: ProcessInfo[] = await sequelize.query(`
        SELECT 
          id, 
          user, 
          host, 
          db, 
          command, 
          time, 
          state, 
          info
        FROM information_schema.processlist
        WHERE command != 'Sleep'
        ORDER BY time DESC
        LIMIT 10
      `, {
        type: QueryTypes.SELECT
      });

      dbInfo.performance.activeProcesses = processlist;

    } catch (error) {
      logger.error(`Erro ao obter informações detalhadas do banco de dados: ${error}`);
    }

    return dbInfo;
  } catch (error: any) {
    logger.error(`Erro ao conectar com o banco de dados: ${error}`);
    return {
      name: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      status: "offline",
      tables: [],
      size: {
        total: "0 B",
        totalBytes: 0,
        byTable: []
      },
      performance: {
        slowQueries: [],
        connectionCount: 0,
        uptime: "0",
        uptimeSeconds: 0
      },
      error: `Não foi possível conectar ao banco de dados: ${error.message}`
    };
  }
};
