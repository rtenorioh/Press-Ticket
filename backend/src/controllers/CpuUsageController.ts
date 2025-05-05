import { Request, Response } from 'express';
import { getCpuUsageInfo } from '../services/CpuUsageService';

export const cpuUsage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const cpuInfo = await getCpuUsageInfo();
    return res.status(200).json(cpuInfo);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao obter informações de uso de CPU' });
  }
};
