import { getIO } from "../../libs/socket";
import CountTicketsService from "./CountTicketsService";

const EmitTicketCounterService = async (): Promise<any> => {
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
    
    return counters;
  } catch (error) {
    console.error(`[BACK_EMIT_COUNTER_ERROR] Erro ao emitir atualização de contadores:`, error);
    throw error;
  }
};

export default EmitTicketCounterService;
