import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";

process.on("uncaughtException", (err: Error) => {
  logger.error(`uncaughtException: ${err.message}`);
  logger.error(err.stack || "");
});

process.on("unhandledRejection", (reason: any) => {
  logger.error(`unhandledRejection: ${reason?.message || reason}`);
  if (reason?.stack) logger.error(reason.stack);
});

const server = app.listen(process.env.PORT, () => {
  logger.info(`Servidor iniciado na porta: ${process.env.PORT}`);
});

initIO(server);
StartAllWhatsAppsSessions();
gracefulShutdown(server);
