import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

interface WhatsappLibGitUpdateResult {
  success: boolean;
  message: string;
  newVersion?: string;
  commitsInstalled?: number;
  error?: string;
}

export const updateWhatsappLibFromGit = async (): Promise<WhatsappLibGitUpdateResult> => {
  try {
    const rootDir = path.resolve(__dirname, '../../../');
    const packageJsonPath = path.resolve(rootDir, 'package.json');
    const nodeModulesWhatsappPath = path.resolve(rootDir, 'node_modules/whatsapp-web.js/package.json');
    
    if (!fs.existsSync(nodeModulesWhatsappPath)) {
      return {
        success: false,
        message: 'Biblioteca whatsapp-web.js não encontrada no node_modules',
        error: 'Arquivo não encontrado'
      };
    }
    
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    const whatsappPackageContent = fs.readFileSync(nodeModulesWhatsappPath, 'utf8');
    const whatsappPackage = JSON.parse(whatsappPackageContent);
    const currentInstalledVersion = whatsappPackage.version;
    
    console.log(`Versão instalada: ${currentInstalledVersion}`);
    console.log('Instalando versão do GitHub (branch main)...');
    
    const oldVersion = currentInstalledVersion;
    
    // Instalar direto do GitHub
    packageJson.dependencies['whatsapp-web.js'] = 'github:pedroslopez/whatsapp-web.js#main';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    const tempDir = path.resolve(rootDir, 'temp_whatsapp_git_update');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempPackageJson = {
      name: "temp-whatsapp-git-updater",
      version: "1.0.0",
      dependencies: {
        "whatsapp-web.js": "github:pedroslopez/whatsapp-web.js#main"
      }
    };
    
    fs.writeFileSync(path.resolve(tempDir, 'package.json'), JSON.stringify(tempPackageJson, null, 2));
    
    try {
      console.log('Instalando a versão do GitHub em diretório temporário...');
      await execPromise('npm install --no-audit', { cwd: tempDir });
      
      const whatsappLibDir = path.resolve(rootDir, 'node_modules/whatsapp-web.js');
      const backupDir = path.resolve(rootDir, 'node_modules/whatsapp-web.js.backup');
      
      // Criar backup da versão antiga antes de remover
      if (fs.existsSync(whatsappLibDir)) {
        console.log('Criando backup da versão antiga...');
        if (fs.existsSync(backupDir)) {
          fs.rmSync(backupDir, { recursive: true, force: true });
        }
        fs.renameSync(whatsappLibDir, backupDir);
        console.log('Backup criado com sucesso.');
      }
      
      console.log('Copiando nova versão da biblioteca para o projeto...');
      const tempWhatsappDir = path.resolve(tempDir, 'node_modules/whatsapp-web.js');
      
      const copyDirRecursive = (src: string, dest: string) => {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      
      copyDirRecursive(tempWhatsappDir, whatsappLibDir);
      
      fs.rmSync(tempDir, { recursive: true, force: true });
      
      if (fs.existsSync(nodeModulesWhatsappPath)) {
        const newWhatsappPackageContent = fs.readFileSync(nodeModulesWhatsappPath, 'utf8');
        const newWhatsappPackage = JSON.parse(newWhatsappPackageContent);
        const newInstalledVersion = newWhatsappPackage.version;
        
        console.log(`Nova versão instalada: ${newInstalledVersion}`);
        
        // Tudo OK, remover backup
        if (fs.existsSync(backupDir)) {
          console.log('Removendo backup da versão antiga...');
          fs.rmSync(backupDir, { recursive: true, force: true });
        }
        
        return {
          success: true,
          message: `Biblioteca whatsapp-web.js atualizada com sucesso do GitHub (branch main) de v${oldVersion} para v${newInstalledVersion}. O servidor precisará ser reiniciado para aplicar as mudanças.`,
          newVersion: newInstalledVersion,
          commitsInstalled: 0 // Será calculado no frontend
        };
      } else {
        throw new Error('Falha ao instalar a biblioteca: arquivo package.json não encontrado após instalação');
      }
    } catch (installError) {
      console.error('Erro durante a instalação:', installError);
      
      // Restaurar backup se existir
      const whatsappLibDir = path.resolve(rootDir, 'node_modules/whatsapp-web.js');
      const backupDir = path.resolve(rootDir, 'node_modules/whatsapp-web.js.backup');
      
      if (fs.existsSync(backupDir)) {
        console.log('Restaurando versão anterior do backup...');
        if (fs.existsSync(whatsappLibDir)) {
          fs.rmSync(whatsappLibDir, { recursive: true, force: true });
        }
        fs.renameSync(backupDir, whatsappLibDir);
        console.log('Versão anterior restaurada com sucesso.');
      }
      
      // Reverter para versão anterior no package.json
      packageJson.dependencies['whatsapp-web.js'] = `^${oldVersion}`;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      throw new Error(`Falha ao instalar a biblioteca do GitHub: ${installError.message}`);
    }
  } catch (error) {
    console.error('Erro ao atualizar a biblioteca whatsapp-web.js do GitHub:', error);
    return {
      success: false,
      message: 'Erro ao atualizar a biblioteca whatsapp-web.js do GitHub',
      error: error.message || 'Erro desconhecido'
    };
  }
};
