import User from "../models/User";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";

const GetDefaultWhatsAppByUser = async (
  userId: number
): Promise<Whatsapp | null> => {
  const user = await User.findByPk(userId, { include: ["whatsapps"] });
  if (!user || !user.whatsapps || user.whatsapps.length === 0) {
    return null;
  }

  const defaultWhatsapp = user.whatsapps[0];

  logger.info(
    `Found WhatsApp linked to user '${user.name}' is '${defaultWhatsapp.name}'.`
  );

  return defaultWhatsapp;
};

export default GetDefaultWhatsAppByUser;