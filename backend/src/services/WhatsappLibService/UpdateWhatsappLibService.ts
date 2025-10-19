import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

interface WhatsappLibUpdateResult {
  success: boolean;
  message: string;
  newVersion?: string;
  error?: string;
}

export const updateWhatsappLib = async (): Promise<WhatsappLibUpdateResult> => {
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
    
    const declaredVersion = packageJson.dependencies['whatsapp-web.js']?.replace('^', '') || null;
    
    console.log(`Versão instalada: ${currentInstalledVersion}, Versão declarada: ${declaredVersion}`);
    
    const { stdout: npmViewOutput } = await execPromise('npm view whatsapp-web.js version');
    const latestVersion = npmViewOutput.trim();
    
    console.log(`Versão mais recente disponível: ${latestVersion}`);
    
    if (currentInstalledVersion === latestVersion) {
      return {
        success: true,
        message: `A biblioteca whatsapp-web.js já está na versão mais recente (v${currentInstalledVersion})`,
        newVersion: currentInstalledVersion
      };
    }
    
    packageJson.dependencies['whatsapp-web.js'] = `^${latestVersion}`;
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    const oldVersion = currentInstalledVersion;
    
    const tempDir = path.resolve(rootDir, 'temp_whatsapp_update');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempPackageJson = {
      name: "temp-whatsapp-updater",
      version: "1.0.0",
      dependencies: {
        "whatsapp-web.js": `^${latestVersion}`
      }
    };
    
    fs.writeFileSync(path.resolve(tempDir, 'package.json'), JSON.stringify(tempPackageJson, null, 2));
    
    try {
      console.log('Instalando a nova versão da biblioteca em diretório temporário...');
      await execPromise('npm install --no-audit', { cwd: tempDir });
      
      const whatsappLibDir = path.resolve(rootDir, 'node_modules/whatsapp-web.js');
      if (fs.existsSync(whatsappLibDir)) {
        console.log('Removendo versão antiga da biblioteca...');
        fs.rmSync(whatsappLibDir, { recursive: true, force: true });
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
        
        if (newInstalledVersion !== latestVersion) {
          throw new Error(`Versão instalada (${newInstalledVersion}) não corresponde à versão esperada (${latestVersion})`);
        }
      } else {
        throw new Error('Falha ao instalar a biblioteca: arquivo package.json não encontrado após instalação');
      }
    } catch (installError) {
      console.error('Erro durante a instalação:', installError);
      
      packageJson.dependencies['whatsapp-web.js'] = `^${oldVersion}`;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      throw new Error(`Falha ao instalar a biblioteca: ${installError.message}`);
    }
    
    return {
      success: true,
      message: `Biblioteca whatsapp-web.js atualizada com sucesso de v${oldVersion} para v${latestVersion}. O servidor precisará ser reiniciado para aplicar as mudanças.`,
      newVersion: latestVersion
    };
  } catch (error) {
    console.error('Erro ao atualizar a biblioteca whatsapp-web.js:', error);
    return {
      success: false,
      message: 'Erro ao atualizar a biblioteca whatsapp-web.js',
      error: error.message || 'Erro desconhecido'
    };
  }
};
