import { Request, Response } from "express";
import { setChannelWebhook } from "../helpers/setChannelHubWebhook";
import CreateChannelsService from "../services/HubServices/CreateHubChannelsService";
import ListChannels from "../services/HubServices/ListHubChannels";

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
  const { whatsapps } = await CreateChannelsService(req.body);

  whatsapps.forEach(whatsapp => {
    setTimeout(() => {
      setChannelWebhook(whatsapp, whatsapp.id.toString());
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
