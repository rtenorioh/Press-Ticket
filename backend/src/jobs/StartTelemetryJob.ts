import cron from "node-cron";
import { TelemetryHeartbeatService } from "../services/SystemServices/TelemetryHeartbeatService";

const CRON_SCHEDULE = "0 */12 * * *"; // A cada 12 horas

export const StartTelemetryJob = (): void => {
  cron.schedule(CRON_SCHEDULE, async () => {
    // logger.info("[Cron] Executando telemetria heartbeat...");
    await TelemetryHeartbeatService();
  });

  setTimeout(
    async () => {
      // logger.info("[Cron] Executando telemetria heartbeat inicial...");
      await TelemetryHeartbeatService();
    },
    2 * 60 * 1000
  ); // 2 minutos após o boot

  // logger.info(`[Cron] Job de telemetria agendado: ${CRON_SCHEDULE}`);
};
