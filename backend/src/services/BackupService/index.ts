import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { logger } from "../../utils/logger";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

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
  if (bytes === 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

const dbArgs = (): string[] => [
  `--host=${DB_CONFIG.host}`,
  `--port=${String(DB_CONFIG.port)}`,
  `--user=${DB_CONFIG.username}`
];

// Password passed via env var to avoid exposure in process listings
const dbEnv = (): NodeJS.ProcessEnv => ({
  ...process.env,
  MYSQL_PWD: DB_CONFIG.password
});

const runMysqldump = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const dump = spawn("mysqldump", [...dbArgs(), DB_CONFIG.database], {
      env: dbEnv()
    });
    const gzip = spawn("gzip", []);
    const out = fs.createWriteStream(filePath);

    dump.stdout.pipe(gzip.stdin);
    gzip.stdout.pipe(out);

    let settled = false;
    const fail = (err: Error) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    };

    out.on("finish", () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    });
    out.on("error", fail);
    dump.on("error", fail);
    gzip.on("error", fail);
    dump.stderr.on("data", d => logger.warn(`mysqldump: ${d}`));
  });
};

const runMysqlRestore = (
  filePath: string,
  isGzipped: boolean
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const mysql = spawn("mysql", [...dbArgs(), DB_CONFIG.database], {
      env: dbEnv()
    });
    const fileStream = fs.createReadStream(filePath);

    if (isGzipped) {
      const gunzip = spawn("gunzip", []);
      fileStream.pipe(gunzip.stdin);
      gunzip.stdout.pipe(mysql.stdin);
      gunzip.on("error", reject);
    } else {
      fileStream.pipe(mysql.stdin);
    }

    let settled = false;
    mysql.on("close", code => {
      if (!settled) {
        settled = true;
        if (code === 0) resolve();
        else reject(new Error(`mysql exited with code ${code}`));
      }
    });
    mysql.on("error", reject);
    mysql.stderr.on("data", d => logger.warn(`mysql: ${d}`));
  });
};

export const listBackups = async (): Promise<BackupInfo[]> => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      return [];
    }

    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith(".sql") || file.endsWith(".sql.gz"));

    const backups = files.map(filename => {
      const filePath = path.join(BACKUP_DIR, filename);
      const stats = fs.statSync(filePath);

      return {
        filename,
        path: filePath,
        size: formatBytes(stats.size),
        date: format(stats.mtime, "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", {
          locale: pt
        }),
        timestamp: stats.mtime.getTime()
      };
    });

    return backups.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error: any) {
    logger.error(`Erro ao listar backups: ${error.message}`);
    throw new Error(`Não foi possível listar os backups: ${error.message}`);
  }
};

export const createBackup = async (
  customName?: string
): Promise<BackupInfo> => {
  try {
    const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
    const filename = customName
      ? `${customName.replace(/[^a-zA-Z0-9_-]/g, "_")}_${timestamp}.sql.gz`
      : `backup_${timestamp}.sql.gz`;

    const filePath = path.join(BACKUP_DIR, filename);

    logger.info(`Iniciando backup do banco de dados para ${filePath}`);
    await runMysqldump(filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error("Backup falhou: arquivo não foi criado");
    }

    const stats = fs.statSync(filePath);

    logger.info(
      `Backup concluído com sucesso: ${filePath} (${formatBytes(stats.size)})`
    );

    return {
      filename,
      path: filePath,
      size: formatBytes(stats.size),
      date: format(stats.mtime, "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", {
        locale: pt
      }),
      timestamp: stats.mtime.getTime()
    };
  } catch (error: any) {
    logger.error(`Erro ao criar backup: ${error.message}`);
    throw new Error(`Não foi possível criar o backup: ${error.message}`);
  }
};

export const restoreBackup = async (
  filename: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Validate filename to prevent path traversal
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      throw new Error("Nome de arquivo de backup inválido");
    }

    const filePath = path.join(BACKUP_DIR, filename);
    const resolvedPath = path.resolve(filePath);
    const resolvedBase = path.resolve(BACKUP_DIR);
    if (!resolvedPath.startsWith(resolvedBase + path.sep)) {
      throw new Error("Acesso negado: caminho inválido");
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo de backup não encontrado: ${filename}`);
    }

    logger.info(`Iniciando restauração do backup: ${filePath}`);

    const isGzipped = filename.endsWith(".sql.gz");
    await runMysqlRestore(filePath, isGzipped);

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

export const uploadBackup = async (
  file: Express.Multer.File
): Promise<BackupInfo> => {
  try {
    if (
      !file.originalname.endsWith(".sql") &&
      !file.originalname.endsWith(".sql.gz")
    ) {
      throw new Error(
        "Formato de arquivo inválido. Apenas arquivos .sql ou .sql.gz são aceitos."
      );
    }

    const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const filename = `importado_${timestamp}_${sanitizedName}`;
    const filePath = path.join(BACKUP_DIR, filename);

    fs.writeFileSync(filePath, file.buffer);

    const stats = fs.statSync(filePath);

    logger.info(
      `Backup importado com sucesso: ${filePath} (${formatBytes(stats.size)})`
    );

    return {
      filename,
      path: filePath,
      size: formatBytes(stats.size),
      date: format(stats.mtime, "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", {
        locale: pt
      }),
      timestamp: stats.mtime.getTime()
    };
  } catch (error: any) {
    logger.error(`Erro ao importar backup: ${error.message}`);
    throw new Error(`Não foi possível importar o backup: ${error.message}`);
  }
};

export const deleteBackup = async (
  filename: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Validate filename to prevent path traversal
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      throw new Error("Nome de arquivo de backup inválido");
    }

    const filePath = path.join(BACKUP_DIR, filename);
    const resolvedPath = path.resolve(filePath);
    const resolvedBase = path.resolve(BACKUP_DIR);
    if (!resolvedPath.startsWith(resolvedBase + path.sep)) {
      throw new Error("Acesso negado: caminho inválido");
    }

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
