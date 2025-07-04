import { exec } from "child_process";
import path from "path";
import { logger } from "../../utils/logger";

interface FolderSizeInfo {
  path: string;
  name: string;
  size: string;
  sizeBytes: number;
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

export const getDiskSpaceInfo = async (): Promise<DiskSpaceInfo> => {
  const companyName = process.env.COMPANY_NAME || "";
  
  if (!companyName) {
    throw new Error("COMPANY_NAME não definido no arquivo .env");
  }

  // Caminho da pasta do sistema atual
  const folderPath = path.resolve("/home/deploy", companyName);

  // Função para obter as 10 maiores pastas, incluindo subpastas
  const getLargestFolders = () => {
    return new Promise<FolderSizeInfo[]>((resolve, reject) => {
      // Usar find para localizar todos os diretórios e du para obter o tamanho
      // -type d para encontrar apenas diretórios
      // -not -path "*/node_modules/*" para excluir node_modules que geralmente é muito grande
      // -not -path "*/dist/*" para excluir pasta dist
      exec(`find ${folderPath} -type d -not -path "*/node_modules/*" -not -path "*/build/*" -not -path "*/dist/*" | xargs du -sh | sort -hr | head -n 20`, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Erro ao obter as maiores pastas: ${error.message}`);
          reject(error);
          return;
        }
        
        const lines = stdout.trim().split("\n");
        const folders: FolderSizeInfo[] = [];
        let processedCount = 0;
        
        // Se não houver pastas, resolver com array vazio
        if (lines.length === 0) {
          resolve([]);
          return;
        }
        
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) {
            const size = parts[0];
            // O caminho pode conter espaços, então juntamos o resto
            const folderPath = parts.slice(1).join(" ");
            const name = path.relative(path.resolve("/home/deploy", companyName), folderPath);
            
            // Obter o tamanho em bytes para ordenação
            exec(`du -sb "${folderPath}"`, (error, stdout, stderr) => {
              if (error) {
                logger.error(`Erro ao obter tamanho em bytes: ${error.message}`);
                processedCount++;
                
                if (processedCount === lines.length) {
                  folders.sort((a, b) => b.sizeBytes - a.sizeBytes);
                  resolve(folders);
                }
                return;
              }
              
              const bytesOutput = stdout.trim();
              const sizeBytes = parseInt(bytesOutput.split(/\s+/)[0]);
              
              folders.push({
                path: folderPath,
                name: name || path.basename(folderPath), // Usar nome relativo ou basename se não for possível
                size,
                sizeBytes
              });
              
              processedCount++;
              if (processedCount === lines.length) {
                // Ordenar por tamanho em bytes (decrescente)
                folders.sort((a, b) => b.sizeBytes - a.sizeBytes);
                resolve(folders);
              }
            });
          } else {
            processedCount++;
            if (processedCount === lines.length) {
              folders.sort((a, b) => b.sizeBytes - a.sizeBytes);
              resolve(folders);
            }
          }
        }
      });
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
