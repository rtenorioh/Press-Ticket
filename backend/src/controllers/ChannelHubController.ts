import { Request, Response } from "express";
import { setChannelWebhook } from "../helpers/setChannelHubWebhook";
import CreateChannelsService from "../services/HubServices/CreateHubChannelsService";
import ListChannels from "../services/HubServices/ListHubChannels";
import notificameTokenValidator from "../services/HubServices/NotificameTokenValidator";
import { showHubToken } from "../helpers/showHubToken";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";

export interface IChannel {
  name: string;
  status?: string;
  isDefault?: boolean;
  qrcode?: string;
  type?: string;
  channel?: string;
  id?: string;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const hubToken = await showHubToken();
    const validation = await notificameTokenValidator.validate(hubToken);

    if (!validation.isValid) {
      return res.status(403).json({
        error:
          "Token inválido ou não autorizado. " +
          "Este token não pertence a uma conta Press Ticket® válida."
      });
    }

    logger.info(
      `Canal Hub conectado: ${validation.info?.name || "—"} (${validation.info?.type || "—"})`
    );
  } catch (err) {
    logger.warn(
      `ChannelHubController.store: validação de token falhou — continuando: ${err}`
    );
  }

  const { whatsapps } = await CreateChannelsService(req.body);

  whatsapps.forEach(whatsapp => {
    setTimeout(() => {
      setChannelWebhook(whatsapp as unknown as IChannel, whatsapp.id.toString());
    }, 2000);
  });

  return res.status(200).json(whatsapps);
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const channels = await ListChannels();
    return res.status(200).json(channels);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export const resubscribe = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;

  const whatsapp = await Whatsapp.findByPk(whatsappId);
  if (!whatsapp || !whatsapp.qrcode) {
    return res
      .status(404)
      .json({ error: "Canal não encontrado ou sem qrcode." });
  }

  try {
    logger.info(
      `Resubscribe: re-registrando subscriptions para canal ${whatsapp.qrcode}`
    );
    await setChannelWebhook(whatsapp as unknown as IChannel, whatsappId);
    return res
      .status(200)
      .json({ message: "Subscriptions re-registradas com sucesso." });
  } catch (error) {
    logger.error(`Resubscribe: erro — ${error}`);
    return res.status(500).json({ error: String(error) });
  }
};
