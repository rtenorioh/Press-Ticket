import cron from "node-cron";
import { logger } from "../utils/logger";
import { CheckUpdatesNotifyService } from "../services/SystemServices/CheckUpdatesNotifyService";

const CRON_SCHEDULE = "0 */3 * * *"; // A cada 3 horas

export const StartUpdateCheckJob = (): void => {
  cron.schedule(CRON_SCHEDULE, async () => {
    logger.info("[Cron] Iniciando verificação de atualizações...");
    await CheckUpdatesNotifyService();
  });

  logger.info(
    `[Cron] Job de verificação de atualizações agendado: ${CRON_SCHEDULE}`
  );
};
