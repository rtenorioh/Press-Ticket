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
    
    // Verificar se o arquivo package.json da biblioteca existe
    if (!fs.existsSync(nodeModulesWhatsappPath)) {
      return {
        success: false,
        message: 'Biblioteca whatsapp-web.js não encontrada no node_modules',
        error: 'Arquivo não encontrado'
      };
    }
    
    // Ler o arquivo package.json do projeto
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Ler o arquivo package.json da biblioteca no node_modules para obter a versão atual instalada
    const whatsappPackageContent = fs.readFileSync(nodeModulesWhatsappPath, 'utf8');
    const whatsappPackage = JSON.parse(whatsappPackageContent);
    const currentInstalledVersion = whatsappPackage.version;
    
    // Obter a versão declarada no package.json do projeto
    const declaredVersion = packageJson.dependencies['whatsapp-web.js']?.replace('^', '') || null;
    
    console.log(`Versão instalada: ${currentInstalledVersion}, Versão declarada: ${declaredVersion}`);
    
    // Buscar a versão mais recente da biblioteca
    const { stdout: npmViewOutput } = await execPromise('npm view whatsapp-web.js version');
    const latestVersion = npmViewOutput.trim();
    
    console.log(`Versão mais recente disponível: ${latestVersion}`);
    
    // Verificar se já está na versão mais recente
    if (currentInstalledVersion === latestVersion) {
      return {
        success: true,
        message: `A biblioteca whatsapp-web.js já está na versão mais recente (v${currentInstalledVersion})`,
        newVersion: currentInstalledVersion
      };
    }
    
    // Atualizar a versão no package.json do projeto
    packageJson.dependencies['whatsapp-web.js'] = `^${latestVersion}`;
    
    // Escrever o arquivo package.json atualizado
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    // Salvar a versão antiga para relatório
    const oldVersion = currentInstalledVersion;
    
    // Criar um diretório temporário para instalação limpa
    const tempDir = path.resolve(rootDir, 'temp_whatsapp_update');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Criar um package.json temporário apenas com whatsapp-web.js
    const tempPackageJson = {
      name: "temp-whatsapp-updater",
      version: "1.0.0",
      dependencies: {
        "whatsapp-web.js": `^${latestVersion}`
      }
    };
    
    fs.writeFileSync(path.resolve(tempDir, 'package.json'), JSON.stringify(tempPackageJson, null, 2));
    
    try {
      // Instalar apenas a biblioteca no diretório temporário
      console.log('Instalando a nova versão da biblioteca em diretório temporário...');
      await execPromise('npm install --no-audit', { cwd: tempDir });
      
      // Remover o diretório da biblioteca atual
      const whatsappLibDir = path.resolve(rootDir, 'node_modules/whatsapp-web.js');
      if (fs.existsSync(whatsappLibDir)) {
        console.log('Removendo versão antiga da biblioteca...');
        fs.rmSync(whatsappLibDir, { recursive: true, force: true });
      }
      
      // Copiar a nova biblioteca para o node_modules do projeto
      console.log('Copiando nova versão da biblioteca para o projeto...');
      const tempWhatsappDir = path.resolve(tempDir, 'node_modules/whatsapp-web.js');
      
      // Função auxiliar para copiar diretórios recursivamente (alternativa ao fs.cpSync)
      const copyDirRecursive = (src: string, dest: string) => {
        // Criar o diretório de destino se não existir
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        // Ler o conteúdo do diretório
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        // Copiar cada item
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            // Recursivamente copiar subdiretórios
            copyDirRecursive(srcPath, destPath);
          } else {
            // Copiar arquivos
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      
      // Copiar a biblioteca usando nossa função auxiliar
      copyDirRecursive(tempWhatsappDir, whatsappLibDir);
      
      // Limpar diretório temporário
      fs.rmSync(tempDir, { recursive: true, force: true });
      
      // Verificar se a instalação foi bem-sucedida
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
      
      // Restaurar a versão original no package.json
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
