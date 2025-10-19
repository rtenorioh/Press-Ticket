import { getIO } from "../libs/socket";
import { logger } from "../utils/logger";

interface TicketCounters {
  open: number;
  pending: number;
  closed: number;
}

const EmitTicketCounterService = {
  async execute(counters: TicketCounters): Promise<void> {
    try {
      const io = getIO();
      const timestamp = new Date().toISOString();
      
      logger.info(`[BACK_COUNTERS_EMIT][${timestamp}] Emitindo evento de atualização de contadores`, {
        counters
      });
      
      io.to("ticketCounter").emit("ticket", {
        action: "updateCounter",
        counters
      });
      
      io.to("open").emit("ticket", {
        action: "updateCounter",
        counters
      });
      
      io.to("pending").emit("ticket", {
        action: "updateCounter",
        counters
      });
      
      io.to("closed").emit("ticket", {
        action: "updateCounter",
        counters
      });
      
      logger.info(`[BACK_COUNTERS_SUCCESS][${timestamp}] Evento de atualização de contadores emitido com sucesso`);
    } catch (err) {
      logger.error("Erro ao emitir evento de atualização de contadores", {
        error: err.message,
        stack: err.stack
      });
    }
  }
};

export default EmitTicketCounterService;
