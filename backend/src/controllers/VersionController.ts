import { Request, Response } from "express";
import * as VersionService from "../services/VersionService/VersionService";
import { logger } from "../utils/logger";

export const getVersion = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const versionInfo = await VersionService.getVersionInfo();
    return res.status(200).json(versionInfo);
  } catch (err) {
    logger.error(`Erro ao verificar versão: ${err}`);
    return res
      .status(500)
      .json({ error: "Erro ao verificar versão do sistema" });
  }
};
