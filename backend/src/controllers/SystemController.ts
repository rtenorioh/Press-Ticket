import { Request, Response } from "express";

export const restartPm2 = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (process.env.PM2_FRONTEND && process.env.PM2_BACKEND) {
    setTimeout(function () {
      const { execSync } = require("child_process");
      execSync(`pm2 restart ${process.env.PM2_FRONTEND}`);
      execSync(`pm2 restart ${process.env.PM2_BACKEND}`);
    }, 100);
    return res.status(200).json({ status: "Reiniciando o Sistema" });
  }
  return res
    .status(200)
    .json(
      "Erro falta Adicionar ao Arquivo .env do backend os parâmetros PM2_FRONTEND  PM2_BACKEND"
    );
};
