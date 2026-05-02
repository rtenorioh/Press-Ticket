import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";
import HubEmailListener from "../services/HubServices/HubEmailListener";
import HubMessageListener from "../services/HubServices/HubMessageListener";
import { logger } from "../utils/logger";

export const listen = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (!req.body.type || !req.body.channel) {
    return res.status(200).json({ ok: true });
  }

  const medias = req.files as Express.Multer.File[];
  const { channelId } = req.params;

  const connection = await Whatsapp.findOne({
    where: { qrcode: channelId }
  });

  if (!connection) {
    logger.warn(
      `WebhookHub: channelId "${channelId}" não encontrado na tabela Whatsapps`
    );
    return res.status(404).json({ message: "Whatsapp channel not found" });
  }

  try {
    const payload = req.body;

    logger.info(
      `WebhookHub: channel="${payload.channel}" type="${payload.type}" direction="${payload.direction}" connection="${connection.name}" (${channelId})`
    );

    if (payload.channel === "email" && payload.type === "MESSAGE") {
      await HubEmailListener(payload, connection);
    } else {
      await HubMessageListener(payload, connection, medias);
    }

    return res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    logger.error(`WebhookHub: erro ao processar webhook — ${error}`);
    return res.status(400).json({ message: String(error) });
  }
};
