import { IChannel } from "../controllers/ChannelHubController";
import Whatsapp from "../models/Whatsapp";
import { showHubToken } from "./showHubToken";
import { logger } from "../utils/logger";

const { Client, MessageSubscription } = require("notificamehubsdk");
require("dotenv").config();

export const setChannelWebhook = async (
  whatsapp: IChannel | any,
  whatsappId: string
) => {
  const notificameHubToken = await showHubToken();

  const client = new Client(notificameHubToken);

  const url = `${process.env.WEBHOOK}/hub-webhook/${whatsapp.qrcode}`;

  const subscription = new MessageSubscription(
    {
      url
    },
    {
      channel: whatsapp.qrcode
    }
  );

  client
    .createSubscription(subscription)
    .then((response: any) => {
    })
    .catch((error: any) => {
      logger.error(`Erro ao subscribir webhook Hub: ${error}`);
    });

  await Whatsapp.update(
    {
      status: "CONNECTED"
    },
    {
      where: {
        id: whatsappId
      }
    }
  );
};
