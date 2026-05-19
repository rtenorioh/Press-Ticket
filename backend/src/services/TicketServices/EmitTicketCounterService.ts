import { getIO } from "../../libs/socket";
import CountTicketsService from "./CountTicketsService";
import { logger } from "../../utils/logger";

const EmitTicketCounterService = async (): Promise<void> => {
  try {
    const counters = await CountTicketsService({});

    const io = getIO();

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
  } catch (error) {
    logger.error(`Erro ao emitir atualização de contadores: ${error}`);
    throw error;
  }
};

export default EmitTicketCounterService;
