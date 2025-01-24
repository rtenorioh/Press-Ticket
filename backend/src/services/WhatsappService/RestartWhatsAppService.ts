import { getWbot, restartWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";

const RestartWhatsAppService = async (whatsappId: string): Promise<void> => {
  const whatsappIDNumber: number = parseInt(whatsappId, 10);

  try {
    const wbot = getWbot(whatsappIDNumber);
    if (!wbot) {
      throw new Error("No active session found for this ID.");
    }

    await restartWbot(whatsappIDNumber);
    logger.info(`WhatsApp session for ID ${whatsappId} has been restarted.`);
  } catch (error) {
    logger.error(
      `Failed to restart WhatsApp session: ${(error as Error).message}`
    );
  }
};

export default RestartWhatsAppService;
