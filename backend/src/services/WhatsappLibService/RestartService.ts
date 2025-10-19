import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';

const execPromise = promisify(exec);

interface RestartResult {
  success: boolean;
  message: string;
  error?: string;
}

export const restartBackend = async (): Promise<RestartResult> => {
  try {
    const rootDir = path.resolve(__dirname, '../../../');
    
    console.log('Iniciando processo de reinicialização do servidor...');
    
    try {
      console.log('Tentando reiniciar com PM2...');
      await execPromise('pm2 restart dev-back || pm2 restart backend || pm2 restart all', { cwd: rootDir });
      return {
        success: true,
        message: 'Servidor reiniciado com sucesso via PM2.'
      };
    } catch (pm2Error) {
      console.log('Falha ao reiniciar com PM2:', pm2Error.message);
      
      try {
        console.log('Tentando reiniciar com systemctl...');
        await execPromise('sudo systemctl restart press-ticket-backend || sudo systemctl restart press-ticket', { cwd: rootDir });
        return {
          success: true,
          message: 'Servidor reiniciado com sucesso via systemctl.'
        };
      } catch (systemctlError) {
        console.log('Falha ao reiniciar com systemctl:', systemctlError.message);
        
        return {
          success: false,
          message: 'Não foi possível reiniciar o servidor automaticamente. Por favor, reinicie o servidor manualmente para aplicar as mudanças.',
          error: 'Métodos de reinicialização automática falharam'
        };
      }
    }
  } catch (error) {
    console.error('Erro ao tentar reiniciar o servidor:', error);
    return {
      success: false,
      message: 'Erro ao tentar reiniciar o servidor',
      error: error.message || 'Erro desconhecido'
    };
  }
};
