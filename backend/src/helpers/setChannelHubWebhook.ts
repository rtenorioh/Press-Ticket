import { IChannel } from "../controllers/ChannelHubController";
import { createNotificameClient } from "../libs/notificameClient";
import Whatsapp from "../models/Whatsapp";
import { showHubToken } from "./showHubToken";
import { logger } from "../utils/logger";

require("dotenv").config();

const createSubscriptionSafe = async (
  client: ReturnType<typeof createNotificameClient>,
  payload: object,
  label: string
): Promise<void> => {
  try {
    await client.post("/v1/subscriptions/", payload);
    logger.info(`Webhook Hub: subscription "${label}" registrada com sucesso`);
  } catch (err: any) {
    const status = err?.response?.status || err?.status || err?.statusCode;
    if (status === 409) {
      logger.warn(
        `Webhook Hub: subscription "${label}" já existe (409) — ignorando`
      );
    } else {
      logger.error(
        `Webhook Hub: erro ao registrar subscription "${label}": ${err}`
      );
      throw err;
    }
  }
};

export const setChannelWebhook = async (
  whatsapp: IChannel | any,
  whatsappId: string
): Promise<void> => {
  const hubToken = await showHubToken();
  const client = createNotificameClient(hubToken);

  const url = `${process.env.WEBHOOK}/hub-webhook/${whatsapp.qrcode}`;
  const criteria = { channel: whatsapp.qrcode };

  await createSubscriptionSafe(
    client,
    { criteria, webhook: { url } },
    `MESSAGE:${whatsapp.qrcode}`
  );

  await createSubscriptionSafe(
    client,
    { criteria, webhook: { url } },
    `MESSAGE_STATUS:${whatsapp.qrcode}`
  );

  logger.info(
    `Webhook Hub registrado com sucesso para canal: ${whatsapp.qrcode}`
  );

  await Whatsapp.update({ status: "CONNECTED" }, { where: { id: whatsappId } });
};
