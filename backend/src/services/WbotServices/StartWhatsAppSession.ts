import { initWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import { logger } from "../../utils/logger";
import GroupEventsService from "./GroupEventsService";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp
): Promise<void> => {
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.emit("whatsappSession", {
    action: "update",
    session: whatsapp
  });

  let retries = 0;

  while (retries <= MAX_RETRIES) {
    try {
      const wbot = await initWbot(whatsapp);
      wbotMessageListener(wbot);
      wbotMonitor(wbot, whatsapp);
      GroupEventsService.setupGroupListeners(wbot, whatsapp.id);
      return;
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (
        errMsg.includes("Execution context was destroyed") ||
        errMsg.includes("navigation")
      ) {
        retries += 1;
        logger.warn(
          `[SESSION] Sessão ${whatsapp.name} falhou por navegação (tentativa ${retries}/${MAX_RETRIES}). Retentando em ${RETRY_DELAY_MS / 1000}s...`
        );
        if (retries <= MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        }
      } else {
        logger.error(`[SESSION] Erro ao iniciar sessão ${whatsapp.name}: ${errMsg}`);
        return;
      }
    }
  }

  logger.error(`[SESSION] Sessão ${whatsapp.name} falhou após ${MAX_RETRIES} tentativas.`);
};
