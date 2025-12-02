import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

interface FileInfo {
  name: string;
  path: string;
  size: number;
  sizeFormatted: string;
  type: string;
  isDirectory: boolean;
  extension: string;
  modifiedAt: Date;
  isImage: boolean;
  isVideo: boolean;
}

interface FolderStats {
  totalSize: number;
  totalSizeFormatted: string;
  fileCount: number;
  folderCount: number;
  files: FileInfo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const getFileType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const videoExts = ['.mp4', '.webm', '.avi', '.mov', '.mkv'];
  const audioExts = ['.mp3', '.wav', '.ogg', '.m4a'];
  const docExts = ['.pdf', '.doc', '.docx', '.txt', '.md'];
  
  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (docExts.includes(ext)) return 'document';
  return 'file';
};

const isImageFile = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'].includes(ext);
};

const isVideoFile = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return ['.mp4', '.webm', '.avi', '.mov', '.mkv'].includes(ext);
};

export const getPublicFolderStats = async (page: number = 1, limit: number = 20): Promise<FolderStats> => {
  const publicPath = path.join(__dirname, '..', '..', '..', 'public');
  
  let totalSize = 0;
  let fileCount = 0;
  let folderCount = 0;
  const allFiles: FileInfo[] = [];

  const processDirectory = async (dirPath: string, relativePath: string = '') => {
    const items = await readdir(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const itemRelativePath = path.join(relativePath, item);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        folderCount++;
        await processDirectory(fullPath, itemRelativePath);
      } else {
        fileCount++;
        totalSize += stats.size;
        
        allFiles.push({
          name: item,
          path: itemRelativePath.replace(/\\/g, '/'),
          size: stats.size,
          sizeFormatted: formatBytes(stats.size),
          type: getFileType(item),
          isDirectory: false,
          extension: path.extname(item).toLowerCase(),
          modifiedAt: stats.mtime,
          isImage: isImageFile(item),
          isVideo: isVideoFile(item)
        });
      }
    }
  };

  await processDirectory(publicPath);

  // Ordenar todos os arquivos
  const sortedFiles = allFiles.sort((a, b) => a.name.localeCompare(b.name));
  
  // Calcular paginação
  const totalFiles = sortedFiles.length;
  const totalPages = Math.ceil(totalFiles / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedFiles = sortedFiles.slice(startIndex, endIndex);

  return {
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    fileCount,
    folderCount,
    files: paginatedFiles,
    total: totalFiles,
    page,
    limit,
    totalPages
  };
};

export const deleteFiles = async (filePaths: string[]): Promise<{ success: boolean; deleted: string[]; errors: string[] }> => {
  const publicPath = path.join(__dirname, '..', '..', '..', 'public');
  const deleted: string[] = [];
  const errors: string[] = [];

  for (const filePath of filePaths) {
    try {
      const fullPath = path.join(publicPath, filePath);
      
      // Verificar se o arquivo está dentro da pasta public
      if (!fullPath.startsWith(publicPath)) {
        errors.push(`Acesso negado: ${filePath}`);
        continue;
      }

      // Verificar se o arquivo existe
      if (!fs.existsSync(fullPath)) {
        errors.push(`Arquivo não encontrado: ${filePath}`);
        continue;
      }

      // Deletar arquivo
      await unlink(fullPath);
      deleted.push(filePath);
    } catch (err) {
      errors.push(`Erro ao deletar ${filePath}: ${err.message}`);
    }
  }

  return {
    success: errors.length === 0,
    deleted,
    errors
  };
};

export const getFilePath = (relativePath: string): string | null => {
  const publicPath = path.join(__dirname, '..', '..', '..', 'public');
  const fullPath = path.join(publicPath, relativePath);

  // Verificar se o arquivo está dentro da pasta public
  if (!fullPath.startsWith(publicPath)) {
    return null;
  }

  // Verificar se o arquivo existe
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  return fullPath;
};
