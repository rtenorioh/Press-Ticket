import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { logger } from "../../utils/logger";

const execFileAsync = promisify(execFile);

interface FolderSizeInfo {
  path: string;
  name: string;
  size: string;
  sizeBytes: number;
  type: "folder" | "file";
  children?: FolderSizeInfo[];
}

interface DiskSpaceInfo {
  folderName: string;
  folderPath: string;
  folderSize: string;
  folderSizeBytes: number;
  freeSpace: string;
  freeSpaceBytes: number;
  totalSpace: string;
  totalSpaceBytes: number;
  usedPercentage: number;
  largestFolders: FolderSizeInfo[];
}

const EXCLUDED_NAMES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
]);

const formatSize = (bytes: number): string => {
  const sizes = ["B", "K", "M", "G", "T"];
  if (bytes === 0) return "0B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + sizes[i];
};

const getDirSize = async (dirPath: string): Promise<number> => {
  try {
    const { stdout } = await execFileAsync("du", ["-sb", dirPath]);
    return parseInt(stdout.trim().split(/\s+/)[0]) || 0;
  } catch {
    return 0;
  }
};

const getFileSize = async (filePath: string): Promise<number> => {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
};

export const getFolderContents = async (
  folderPath: string
): Promise<FolderSizeInfo[]> => {
  const companyName = process.env.COMPANY_NAME || "";

  if (!companyName) {
    throw new Error("COMPANY_NAME não definido no arquivo .env");
  }

  const basePath = path.resolve("/home/deploy", companyName);
  const fullPath = path.resolve(basePath, folderPath);

  if (!fullPath.startsWith(basePath + path.sep) && fullPath !== basePath) {
    throw new Error("Acesso negado: caminho fora da pasta permitida");
  }

  let entries;
  try {
    entries = await fs.readdir(fullPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const items: FolderSizeInfo[] = [];

  await Promise.all(
    entries
      .filter(
        (e) =>
          !EXCLUDED_NAMES.has(e.name) &&
          e.name !== "." &&
          e.name !== ".."
      )
      .map(async (entry) => {
        const itemFullPath = path.join(fullPath, entry.name);
        const isDirectory = entry.isDirectory();
        const relativeName = path.relative(basePath, itemFullPath);

        const sizeBytes = isDirectory
          ? await getDirSize(itemFullPath)
          : await getFileSize(itemFullPath);

        items.push({
          path: itemFullPath,
          name: relativeName || entry.name,
          size: formatSize(sizeBytes),
          sizeBytes,
          type: isDirectory ? "folder" : "file",
          children: [],
        });
      })
  );

  return items.sort((a, b) => b.sizeBytes - a.sizeBytes);
};

export const getDiskSpaceInfo = async (): Promise<DiskSpaceInfo> => {
  const companyName = process.env.COMPANY_NAME || "";

  if (!companyName) {
    throw new Error("COMPANY_NAME não definido no arquivo .env");
  }

  const folderPath = path.resolve("/home/deploy", companyName);

  const buildTree = async (
    dirPath: string,
    maxDepth: number,
    currentDepth: number
  ): Promise<FolderSizeInfo[]> => {
    if (currentDepth >= maxDepth) return [];

    let entries;
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
    } catch {
      return [];
    }

    const items: FolderSizeInfo[] = [];

    await Promise.all(
      entries
        .filter(
          (e) =>
            !EXCLUDED_NAMES.has(e.name) &&
            e.name !== "." &&
            e.name !== ".."
        )
        .map(async (entry) => {
          const fullPath = path.join(dirPath, entry.name);
          const isDirectory = entry.isDirectory();
          const relativeName = path.relative(
            path.resolve("/home/deploy", companyName),
            fullPath
          );

          const sizeBytes = isDirectory
            ? await getDirSize(fullPath)
            : await getFileSize(fullPath);

          const item: FolderSizeInfo = {
            path: fullPath,
            name: relativeName || entry.name,
            size: formatSize(sizeBytes),
            sizeBytes,
            type: isDirectory ? "folder" : "file",
            children: [],
          };

          if (isDirectory && currentDepth < maxDepth - 1) {
            try {
              item.children = await buildTree(fullPath, maxDepth, currentDepth + 1);
            } catch {
              item.children = [];
            }
          }

          items.push(item);
        })
    );

    return items.sort((a, b) => b.sizeBytes - a.sizeBytes);
  };

  const getFolderSize = async (): Promise<{ size: string; bytes: number }> => {
    const { stdout: shStdout } = await execFileAsync("du", ["-sh", folderPath]);
    const size = shStdout.trim().split("\t")[0];

    const { stdout: sbStdout } = await execFileAsync("du", ["-sb", folderPath]);
    const bytes = parseInt(sbStdout.trim().split("\t")[0]);

    return { size, bytes };
  };

  const getDiskFreeSpace = async (): Promise<{
    free: string;
    total: string;
    freeBytes: number;
    totalBytes: number;
  }> => {
    const { stdout: dfHuman } = await execFileAsync("df", ["-h", "/"]);
    const lines = dfHuman.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("Formato de saída do comando df inesperado");
    }
    const parts = lines[1].split(/\s+/);
    if (parts.length < 4) {
      throw new Error("Formato de saída do comando df inesperado");
    }
    const total = parts[1];
    const free = parts[3];

    const { stdout: dfBytes } = await execFileAsync("df", [
      "--output=size,avail",
      "/",
    ]);
    const byteLines = dfBytes.trim().split("\n");
    const bytesInfo = byteLines[byteLines.length - 1].trim().split(/\s+/);
    if (bytesInfo.length < 2) {
      throw new Error("Formato de saída do comando df inesperado");
    }
    const totalBytes = parseInt(bytesInfo[0]) * 1024;
    const freeBytes = parseInt(bytesInfo[1]) * 1024;

    return { free, total, freeBytes, totalBytes };
  };

  const [folderInfo, diskInfo, largestFolders] = await Promise.all([
    getFolderSize(),
    getDiskFreeSpace(),
    buildTree(folderPath, 1, 0).then((tree) => tree.slice(0, 20)),
  ]);

  const usedPercentage = Math.round(
    (folderInfo.bytes / diskInfo.totalBytes) * 100
  );

  return {
    folderName: companyName,
    folderPath,
    folderSize: folderInfo.size,
    folderSizeBytes: folderInfo.bytes,
    freeSpace: diskInfo.free,
    freeSpaceBytes: diskInfo.freeBytes,
    totalSpace: diskInfo.total,
    totalSpaceBytes: diskInfo.totalBytes,
    usedPercentage,
    largestFolders,
  };
};
