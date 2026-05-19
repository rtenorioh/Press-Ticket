import { Request, Response } from "express";
import WhatsappLabel from "../models/WhatsappLabel";
import TicketLabel from "../models/TicketLabel";
import SyncLabelsService from "../services/WbotServices/SyncLabelsService";
import { logger } from "../utils/logger";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.query;

  try {
    const labels = await WhatsappLabel.findAll({
      where: { whatsappId: Number(whatsappId) },
      include: [{ model: TicketLabel, attributes: ["ticketId"] }],
      order: [["name", "ASC"]]
    });

    const result = labels.map(l => ({
      id: l.id,
      labelId: l.labelId,
      name: l.name,
      hexColor: l.hexColor,
      ticketIds: l.ticketLabels?.map(tl => tl.ticketId) || []
    }));

    return res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    logger.error(`[LABELS_CONTROLLER] Erro ao listar labels: ${message}`);
    return res.status(500).json({ error: message });
  }
};

export const sync = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.body;

  try {
    await SyncLabelsService(Number(whatsappId));
    return res
      .status(200)
      .json({ message: "Labels sincronizadas com sucesso" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    logger.error(`[LABELS_CONTROLLER] Erro ao sincronizar labels: ${message}`);
    return res.status(500).json({ error: message });
  }
};
