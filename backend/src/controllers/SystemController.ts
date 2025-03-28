import { Request, Response } from "express";
import { exec } from "child_process";
import { logger } from "../utils/logger";

export const restartPm2 = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (process.env.PM2_FRONTEND && process.env.PM2_BACKEND) {
    res.status(200).json({ status: "Reiniciando o Sistema" });
    
    setTimeout(() => {
      const restartFrontend = () => {
        return new Promise((resolve, reject) => {
          exec(`pm2 restart ${process.env.PM2_FRONTEND}`, (error, stdout, stderr) => {
            if (error) {
              logger.error(`Erro ao reiniciar frontend: ${error.message}`);
              reject(error);
              return;
            }
            logger.info(`Frontend reiniciado com sucesso: ${stdout}`);
            resolve(stdout);
          });
        });
      };

      const restartBackend = () => {
        return new Promise((resolve, reject) => {
          exec(`pm2 restart ${process.env.PM2_BACKEND}`, (error, stdout, stderr) => {
            if (error) {
              logger.error(`Erro ao reiniciar backend: ${error.message}`);
              reject(error);
              return;
            }
            logger.info(`Backend reiniciado com sucesso: ${stdout}`);
            resolve(stdout);
          });
        });
      };

      restartFrontend()
        .then(() => restartBackend())
        .catch(err => {
          logger.error(`Erro ao reiniciar o sistema: ${err}`);
        });
    }, 100);
    
    return res.end();
  }
  
  return res
    .status(400)
    .json(
      "Erro: Falta adicionar ao arquivo .env do backend os parâmetros PM2_FRONTEND e PM2_BACKEND"
    );
};
