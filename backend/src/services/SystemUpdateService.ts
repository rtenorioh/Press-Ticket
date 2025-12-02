import { exec as execCallback } from "child_process";
import util from "util";
import axios from "axios";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";
import { promisify } from "util";
import dotenv from "dotenv";

const exec = util.promisify(execCallback);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  needsUpdate: boolean;
  releaseNotes: string;
  downloadUrl: string;
  publishedAt?: string;
}

interface UpdateStatus {
  status: "idle" | "checking" | "downloading" | "installing" | "building" | "completed" | "error";
  progress: number;
  message: string;
  error?: string;
  lastUpdateCheck?: Date;
  lastUpdateInstalled?: Date;
}

const REPO_URL = "https://api.github.com/repos/rtenorioh/Press-Ticket/releases/latest";
const CONFIG_DIR = path.join(process.cwd(), "config");
const UPDATE_STATUS_FILE = path.join(CONFIG_DIR, "update_status.json");
const BACKUP_DIR = path.join(process.cwd(), "backups");

let updateStatus: UpdateStatus = {
  status: "idle",
  progress: 0,
  message: "Sistema pronto para verificar atualizações",
};

const initUpdateStatus = async (): Promise<void> => {
  try {

    if (!fs.existsSync(CONFIG_DIR)) {
      await mkdir(CONFIG_DIR, { recursive: true });
    }

    if (fs.existsSync(UPDATE_STATUS_FILE)) {
      const statusData = await readFile(UPDATE_STATUS_FILE, "utf8");
      updateStatus = JSON.parse(statusData);
    } else {
      await writeFile(UPDATE_STATUS_FILE, JSON.stringify(updateStatus), "utf8");
    }
  } catch (error: any) {
    logger.error(`Erro ao inicializar status de atualização: ${error.message}`);
  }
};

const saveUpdateStatus = async (): Promise<void> => {
  try {
    await writeFile(UPDATE_STATUS_FILE, JSON.stringify(updateStatus), "utf8");
  } catch (error: any) {
    logger.error(`Erro ao salvar status de atualização: ${error.message}`);
  }
};

const getCurrentVersion = async (): Promise<string> => {
  try {
    const { systemVersion } = await import("../config/version");
    return systemVersion.startsWith("v") ? systemVersion.substring(1) : systemVersion;
  } catch (error: any) {
    logger.error(`Erro ao obter versão atual: ${error.message}`);
    return "0.0.0";
  }
};

export const checkForUpdates = async (): Promise<UpdateInfo> => {
  try {
    updateStatus.status = "checking";
    updateStatus.message = "Verificando atualizações...";
    updateStatus.progress = 10;
    await saveUpdateStatus();

    const currentVersion = await getCurrentVersion();
    const response = await axios.get(REPO_URL);
    const latestRelease = response.data;
    const latestVersion = latestRelease.tag_name.replace("v", "");
    const needsUpdate = latestVersion !== currentVersion;
    
    const updateInfo: UpdateInfo = {
      currentVersion,
      latestVersion,
      needsUpdate,
      releaseNotes: latestRelease.body || "Nenhuma nota de lançamento disponível",
      downloadUrl: latestRelease.zipball_url,
      publishedAt: latestRelease.published_at
    };

    updateStatus.status = "idle";
    updateStatus.message = needsUpdate 
      ? `Atualização disponível: v${latestVersion}` 
      : "Sistema está atualizado";
    updateStatus.progress = 0;
    updateStatus.lastUpdateCheck = new Date();
    await saveUpdateStatus();

    return updateInfo;
  } catch (error: any) {
    logger.error(`Erro ao verificar atualizações: ${error.message}`);
    updateStatus.status = "error";
    updateStatus.message = "Erro ao verificar atualizações";
    updateStatus.error = error.message;
    updateStatus.progress = 0;
    await saveUpdateStatus();
    
    throw new Error(`Erro ao verificar atualizações: ${error.message}`);
  }
};

const backupSystem = async (): Promise<string> => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      await mkdir(BACKUP_DIR, { recursive: true });
    }

    const currentVersion = await getCurrentVersion();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `backup-v${currentVersion}-${timestamp}.tar.gz`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    updateStatus.message = "Criando backup do sistema...";
    updateStatus.progress = 30;
    await saveUpdateStatus();

    await exec(`tar --exclude='./node_modules' --exclude='./dist' --exclude='./build' --exclude='./backups' --exclude='./public/media' -czf ${backupPath} .`);

    return backupPath;
  } catch (error: any) {
    logger.error(`Erro ao criar backup: ${error.message}`);
    throw new Error(`Erro ao criar backup: ${error.message}`);
  }
};

export const downloadAndInstallUpdate = async (updateInfo: UpdateInfo): Promise<boolean> => {
  try {
    if (!updateInfo.needsUpdate) {
      return false;
    }

    updateStatus.status = "downloading";
    updateStatus.message = "Baixando atualização...";
    updateStatus.progress = 20;
    await saveUpdateStatus();

    const backupPath = await backupSystem();
    logger.info(`Backup criado em: ${backupPath}`);

    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }
    
    const zipFilePath = path.join(tempDir, `update-${updateInfo.latestVersion}.zip`);
    const writer = fs.createWriteStream(zipFilePath);
    
    const response = await axios({
      url: updateInfo.downloadUrl,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    updateStatus.status = "installing";
    updateStatus.message = "Instalando atualização...";
    updateStatus.progress = 50;
    await saveUpdateStatus();

    const extractDir = path.join(tempDir, "extract");
    if (!fs.existsSync(extractDir)) {
      await mkdir(extractDir, { recursive: true });
    }

    await exec(`unzip -o ${zipFilePath} -d ${extractDir}`);

    await exec(`cp -R ${extractDir}/* .`);

    updateStatus.message = "Instalando dependências do backend...";
    updateStatus.progress = 50;
    await saveUpdateStatus();
    await exec("npm install");
    
    updateStatus.message = "Compilando backend...";
    updateStatus.progress = 60;
    await saveUpdateStatus();
    await exec("npm run build");
    
    updateStatus.message = "Executando migrações...";
    updateStatus.progress = 65;
    await saveUpdateStatus();
    await exec("npx sequelize db:migrate");
    
    updateStatus.message = "Executando seeders...";
    updateStatus.progress = 70;
    await saveUpdateStatus();
    await exec("npx sequelize db:seed:all");
    
    updateStatus.status = "building";
    updateStatus.message = "Atualizando frontend...";
    updateStatus.progress = 75;
    await saveUpdateStatus();
    
    const frontendDir = path.join(process.cwd(), "../frontend");
    
    updateStatus.message = "Instalando dependências do frontend...";
    updateStatus.progress = 80;
    await saveUpdateStatus();
    await exec("npm install", { cwd: frontendDir });
    
    updateStatus.message = "Compilando frontend...";
    updateStatus.progress = 85;
    await saveUpdateStatus();
    await exec("npm run build", { cwd: frontendDir });
    
    updateStatus.message = "Reiniciando serviços...";
    updateStatus.progress = 90;
    await saveUpdateStatus();
    
    dotenv.config();
    const pm2FrontendId = process.env.PM2_FRONTEND || "1";
    const pm2BackendId = process.env.PM2_BACKEND || "0";
    
    try {
      await exec(`pm2 restart ${pm2BackendId} --update-env`);
      await exec(`pm2 restart ${pm2FrontendId} --update-env`);
    } catch (pmError: any) {
      logger.warn(`Aviso ao reiniciar serviços PM2: ${pmError.message}`);
    }
    
    await exec(`rm -rf ${tempDir}`);

    updateStatus.status = "completed";
    updateStatus.message = `Atualização para v${updateInfo.latestVersion} concluída com sucesso`;
    updateStatus.progress = 100;
    updateStatus.lastUpdateInstalled = new Date();
    await saveUpdateStatus();

    return true;
  } catch (error: any) {
    logger.error(`Erro ao instalar atualização: ${error.message}`);
    updateStatus.status = "error";
    updateStatus.message = "Erro ao instalar atualização";
    updateStatus.error = error.message;
    updateStatus.progress = 0;
    await saveUpdateStatus();
    
    throw new Error(`Erro ao instalar atualização: ${error.message}`);
  }
};

export const getUpdateStatus = async (): Promise<UpdateStatus> => {
  return updateStatus;
};
export const restoreBackup = async (backupFileName: string): Promise<boolean> => {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup não encontrado: ${backupFileName}`);
    }

    updateStatus.status = "installing";
    updateStatus.message = "Restaurando backup...";
    updateStatus.progress = 30;
    await saveUpdateStatus();

    const tempDir = path.join(process.cwd(), "temp_restore");
    if (!fs.existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    await exec(`tar -xzf ${backupPath} -C ${tempDir}`);

    await exec(`cp -R ${tempDir}/* .`);

    updateStatus.message = "Instalando dependências...";
    updateStatus.progress = 70;
    await saveUpdateStatus();
    await exec("npm install");
    await exec(`rm -rf ${tempDir}`);

    updateStatus.status = "completed";
    updateStatus.message = "Backup restaurado com sucesso";
    updateStatus.progress = 100;
    await saveUpdateStatus();

    return true;
  } catch (error: any) {
    logger.error(`Erro ao restaurar backup: ${error.message}`);
    updateStatus.status = "error";
    updateStatus.message = "Erro ao restaurar backup";
    updateStatus.error = error.message;
    updateStatus.progress = 0;
    await saveUpdateStatus();
    
    throw new Error(`Erro ao restaurar backup: ${error.message}`);
  }
};

export const listBackups = async (): Promise<string[]> => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      await mkdir(BACKUP_DIR, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(BACKUP_DIR);
    return files.filter(file => file.startsWith("backup-") && file.endsWith(".tar.gz"));
  } catch (error: any) {
    logger.error(`Erro ao listar backups: ${error.message}`);
    throw new Error(`Erro ao listar backups: ${error.message}`);
  }
};

initUpdateStatus().catch(error => {
  logger.error(`Erro ao inicializar serviço de atualização: ${error.message}`);
});
