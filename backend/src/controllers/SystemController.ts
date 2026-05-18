import { execFile as execFileCb } from "child_process";
import { promisify } from "util";
import { Request, Response } from "express";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";

const execFile = promisify(execFileCb);

function validatePm2Id(id: string): string {
  if (!/^[a-zA-Z0-9_-]{1,50}$/.test(id)) {
    throw new AppError("Identificador PM2 inválido", 400);
  }
  return id;
}

export const restartPm2 = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (process.env.PM2_FRONTEND && process.env.PM2_BACKEND) {
    res.status(200).json({ status: "Reiniciando o Sistema" });

    setTimeout(async () => {
      try {
        const frontendId = validatePm2Id(process.env.PM2_FRONTEND!);
        const backendId = validatePm2Id(process.env.PM2_BACKEND!);

        const { stdout: frontStdout } = await execFile("pm2", ["restart", frontendId]);
        logger.info(`Frontend reiniciado com sucesso: ${frontStdout}`);

        const { stdout: backStdout } = await execFile("pm2", ["restart", backendId]);
        logger.info(`Backend reiniciado com sucesso: ${backStdout}`);
      } catch (err: any) {
        logger.error(`Erro ao reiniciar o sistema: ${err.message}`);
      }
    }, 100);

    return res.end();
  }

  return res
    .status(400)
    .json(
      "Erro: Falta adicionar ao arquivo .env do backend os parâmetros PM2_FRONTEND e PM2_BACKEND"
    );
};
