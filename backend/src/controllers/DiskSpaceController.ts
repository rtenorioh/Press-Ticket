import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { getDiskSpaceInfo } from "../services/DiskSpaceService";

export const getDiskSpace = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const diskSpaceInfo = await getDiskSpaceInfo();
    return res.status(200).json(diskSpaceInfo);
  } catch (error) {
    logger.error(`Erro ao obter informações de espaço em disco: ${error}`);
    return res.status(500).json({ 
      error: "Erro ao obter informações de espaço em disco" 
    });
  }
};
