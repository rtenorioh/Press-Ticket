import { IChannel } from "../controllers/ChannelHubController";
import Whatsapp from "../models/Whatsapp";
import { showHubToken } from "./showHubToken";
import { logger } from "../utils/logger";

const { Client, MessageSubscription, MessageStatusSubscription } = require("notificamehubsdk");
require("dotenv").config();

const createSubscriptionSafe = async (
  client: any,
  subscription: any,
  label: string
): Promise<void> => {
  try {
    await client.createSubscription(subscription);
    logger.info(`Webhook Hub: subscription "${label}" registrada com sucesso`);
  } catch (err: any) {
    const status = err?.response?.status || err?.status || err?.statusCode;
    if (status === 409) {
      logger.warn(`Webhook Hub: subscription "${label}" já existe (409) — ignorando`);
    } else {
      logger.error(`Webhook Hub: erro ao registrar subscription "${label}": ${err}`);
      throw err;
    }
  }
};

export const setChannelWebhook = async (
  whatsapp: IChannel | any,
  whatsappId: string
) => {
  const notificameHubToken = await showHubToken();
  const client = new Client(notificameHubToken);

  const url = `${process.env.WEBHOOK}/hub-webhook/${whatsapp.qrcode}`;
  const criteria = { channel: whatsapp.qrcode };

  const messageSubscription = new MessageSubscription({ url }, criteria);
  await createSubscriptionSafe(client, messageSubscription, `MESSAGE:${whatsapp.qrcode}`);

  const statusSubscription = new MessageStatusSubscription({ url }, criteria);
  await createSubscriptionSafe(client, statusSubscription, `MESSAGE_STATUS:${whatsapp.qrcode}`);

  logger.info(`Webhook Hub registrado com sucesso para canal: ${whatsapp.qrcode}`);

  await Whatsapp.update(
    { status: "CONNECTED" },
    { where: { id: whatsappId } }
  );
};
