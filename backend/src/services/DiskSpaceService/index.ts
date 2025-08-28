import { exec } from "child_process";
import path from "path";
import { logger } from "../../utils/logger";

interface FolderSizeInfo {
  path: string;
  name: string;
  size: string;
  sizeBytes: number;
  type: 'folder' | 'file';
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

// Função para obter conteúdo de uma pasta específica
export const getFolderContents = async (folderPath: string): Promise<FolderSizeInfo[]> => {
  const companyName = process.env.COMPANY_NAME || "";
  
  if (!companyName) {
    throw new Error("COMPANY_NAME não definido no arquivo .env");
  }

  const basePath = path.resolve("/home/deploy", companyName);
  
  // Verificar se o caminho está dentro da pasta permitida
  const fullPath = path.resolve(basePath, folderPath);
  if (!fullPath.startsWith(basePath)) {
    throw new Error("Acesso negado: caminho fora da pasta permitida");
  }

  return new Promise<FolderSizeInfo[]>((resolve, reject) => {
    exec(`ls -la "${fullPath}" 2>/dev/null`, (error, stdout, stderr) => {
      if (error) {
        resolve([]);
        return;
      }
      
      const lines = stdout.trim().split('\n').slice(1); // Remove primeira linha (total)
      const items: FolderSizeInfo[] = [];
      let processedCount = 0;
      
      if (lines.length === 0) {
        resolve([]);
        return;
      }
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 9) {
          processedCount++;
          if (processedCount === lines.length) {
            resolve(items.sort((a, b) => b.sizeBytes - a.sizeBytes));
          }
          continue;
        }
        
        const permissions = parts[0];
        const fileName = parts.slice(8).join(' ');
        
        // Pular arquivos ocultos e especiais
        if (fileName === '.' || fileName === '..' || 
            fileName.includes('node_modules') || 
            fileName.includes('.git') ||
            fileName.includes('dist') ||
            fileName.includes('build') ||
            fileName.includes('coverage')) {
          processedCount++;
          if (processedCount === lines.length) {
            resolve(items.sort((a, b) => b.sizeBytes - a.sizeBytes));
          }
          continue;
        }
        
        const itemFullPath = path.join(fullPath, fileName);
        const isDirectory = permissions.startsWith('d');
        const relativeName = path.relative(basePath, itemFullPath);
        
        // Obter tamanho do item
        const duCommand = isDirectory ? `du -sb "${itemFullPath}" 2>/dev/null` : `stat -c%s "${itemFullPath}" 2>/dev/null`;
        
        exec(duCommand, (error, stdout, stderr) => {
          if (error) {
            processedCount++;
            if (processedCount === lines.length) {
              resolve(items.sort((a, b) => b.sizeBytes - a.sizeBytes));
            }
            return;
          }
          
          const sizeBytes = parseInt(stdout.trim().split(/\s+/)[0]) || 0;
          
          // Converter bytes para formato legível
          const formatSize = (bytes: number): string => {
            const sizes = ['B', 'K', 'M', 'G', 'T'];
            if (bytes === 0) return '0B';
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + sizes[i];
          };
          
          const item: FolderSizeInfo = {
            path: itemFullPath,
            name: relativeName || fileName,
            size: formatSize(sizeBytes),
            sizeBytes,
            type: isDirectory ? 'folder' : 'file',
            children: []
          };
          
          items.push(item);
          processedCount++;
          
          if (processedCount === lines.length) {
            resolve(items.sort((a, b) => b.sizeBytes - a.sizeBytes));
          }
        });
      }
    });
  });
};

export const getDiskSpaceInfo = async (): Promise<DiskSpaceInfo> => {
  const companyName = process.env.COMPANY_NAME || "";
  
  if (!companyName) {
    throw new Error("COMPANY_NAME não definido no arquivo .env");
  }

  // Caminho da pasta do sistema atual
  const folderPath = path.resolve("/home/deploy", companyName);

  // Função para obter estrutura completa de pastas e arquivos
  const getLargestFolders = () => {
    return new Promise<FolderSizeInfo[]>((resolve, reject) => {
      // Função recursiva para construir a árvore
      const buildTree = async (dirPath: string, maxDepth: number = 2, currentDepth: number = 0): Promise<FolderSizeInfo[]> => {
        if (currentDepth >= maxDepth) return [];
        
        return new Promise((resolve, reject) => {
          exec(`ls -la "${dirPath}" 2>/dev/null`, (error, stdout, stderr) => {
            if (error) {
              resolve([]);
              return;
            }
            
            const lines = stdout.trim().split('\n').slice(1); // Remove primeira linha (total)
            const items: FolderSizeInfo[] = [];
            let processedCount = 0;
            
            if (lines.length === 0) {
              resolve([]);
              return;
            }
            
            for (const line of lines) {
              const parts = line.trim().split(/\s+/);
              if (parts.length < 9) {
                processedCount++;
                if (processedCount === lines.length) {
                  resolve(items.sort((a, b) => b.sizeBytes - a.sizeBytes));
                }
                continue;
              }
              
              const permissions = parts[0];
              const fileName = parts.slice(8).join(' ');
              
              // Pular arquivos ocultos e especiais
              if (fileName === '.' || fileName === '..' || 
                  fileName.includes('node_modules') || 
                  fileName.includes('.git') ||
                  fileName.includes('dist') ||
                  fileName.includes('build') ||
                  fileName.includes('coverage')) {
                processedCount++;
                if (processedCount === lines.length) {
                  resolve(items.sort((a, b) => b.sizeBytes - a.sizeBytes));
                }
                continue;
              }
              
              const fullPath = path.join(dirPath, fileName);
              const isDirectory = permissions.startsWith('d');
              const relativeName = path.relative(path.resolve("/home/deploy", companyName), fullPath);
              
              // Obter tamanho do item
              const duCommand = isDirectory ? `du -sb "${fullPath}" 2>/dev/null` : `stat -c%s "${fullPath}" 2>/dev/null`;
              
              exec(duCommand, async (error, stdout, stderr) => {
                if (error) {
                  processedCount++;
                  if (processedCount === lines.length) {
                    resolve(items.sort((a, b) => b.sizeBytes - a.sizeBytes));
                  }
                  return;
                }
                
                const sizeBytes = parseInt(stdout.trim().split(/\s+/)[0]) || 0;
                
                // Converter bytes para formato legível
                const formatSize = (bytes: number): string => {
                  const sizes = ['B', 'K', 'M', 'G', 'T'];
                  if (bytes === 0) return '0B';
                  const i = Math.floor(Math.log(bytes) / Math.log(1024));
                  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + sizes[i];
                };
                
                const item: FolderSizeInfo = {
                  path: fullPath,
                  name: relativeName || fileName,
                  size: formatSize(sizeBytes),
                  sizeBytes,
                  type: isDirectory ? 'folder' : 'file',
                  children: []
                };
                
                // Se for diretório e não atingiu profundidade máxima, buscar filhos
                if (isDirectory && currentDepth < maxDepth - 1) {
                  try {
                    item.children = await buildTree(fullPath, maxDepth, currentDepth + 1);
                  } catch (err) {
                    item.children = [];
                  }
                }
                
                items.push(item);
                processedCount++;
                
                if (processedCount === lines.length) {
                  resolve(items.sort((a, b) => b.sizeBytes - a.sizeBytes));
                }
              });
            }
          });
        });
      };
      
      // Construir apenas o primeiro nível para carregamento inicial
      buildTree(folderPath, 1, 0)
        .then(tree => {
          // Pegar apenas os 20 maiores itens do primeiro nível
          const topItems = tree.slice(0, 20);
          resolve(topItems);
        })
        .catch(reject);
    });
  };
  
  // Obter tamanho da pasta do sistema
  const getFolderSize = () => {
    return new Promise<{ size: string, bytes: number }>((resolve, reject) => {
      exec(`du -sh ${folderPath}`, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Erro ao obter tamanho da pasta: ${error.message}`);
          reject(error);
          return;
        }
        
        const output = stdout.trim();
        const size = output.split("\t")[0];
        
        // Obter o tamanho em bytes para comparação
        exec(`du -sb ${folderPath}`, (error, stdout, stderr) => {
          if (error) {
            logger.error(`Erro ao obter tamanho da pasta em bytes: ${error.message}`);
            reject(error);
            return;
          }
          
          const bytesOutput = stdout.trim();
          const bytes = parseInt(bytesOutput.split("\t")[0]);
          
          resolve({ size, bytes });
        });
      });
    });
  };
  
  // Obter espaço livre no disco
  const getDiskFreeSpace = () => {
    return new Promise<{ free: string, total: string, freeBytes: number, totalBytes: number }>((resolve, reject) => {
      exec("df -h /", (error, stdout, stderr) => {
        if (error) {
          logger.error(`Erro ao obter espaço livre no disco: ${error.message}`);
          reject(error);
          return;
        }
        
        const lines = stdout.trim().split("\n");
        if (lines.length < 2) {
          reject(new Error("Formato de saída do comando df inesperado"));
          return;
        }
        
        const parts = lines[1].split(/\s+/);
        if (parts.length < 4) {
          reject(new Error("Formato de saída do comando df inesperado"));
          return;
        }
        
        const total = parts[1];
        const free = parts[3];
        
        // Obter valores em bytes para cálculos
        exec("df --output=size,avail / | tail -1", (error, stdout, stderr) => {
          if (error) {
            logger.error(`Erro ao obter espaço em bytes: ${error.message}`);
            reject(error);
            return;
          }
          
          const bytesInfo = stdout.trim().split(/\s+/);
          if (bytesInfo.length < 2) {
            reject(new Error("Formato de saída do comando df inesperado"));
            return;
          }
          
          const totalBytes = parseInt(bytesInfo[0]) * 1024;
          const freeBytes = parseInt(bytesInfo[1]) * 1024;
          
          resolve({ free, total, freeBytes, totalBytes });
        });
      });
    });
  };
  
  // Executar as funções para obter as informações
  const [folderInfo, diskInfo, largestFolders] = await Promise.all([
    getFolderSize(),
    getDiskFreeSpace(),
    getLargestFolders()
  ]);
  
  // Calcular a porcentagem de uso
  const usedPercentage = Math.round((folderInfo.bytes / diskInfo.totalBytes) * 100);
  
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
    largestFolders
  };
};
