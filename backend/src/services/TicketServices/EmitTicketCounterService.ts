import { getIO } from "../../libs/socket";
import CountTicketsService from "./CountTicketsService";

const EmitTicketCounterService = async (): Promise<any> => {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[BACK_EMIT_COUNTER][${timestamp}] Emitindo atualização de contadores`);
    
    // Obter contagem atual de tickets
    const counters = await CountTicketsService({});
    
    // Obter instância do socket.io
    const io = getIO();
    
    // Emitir evento de atualização de contadores para todos os canais relevantes
    io.to("ticketCounter").emit("ticket", {
      action: "updateCounter",
      counters
    });
    
    // Emitir também para os canais específicos de status
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
    
    console.log(`[BACK_EMIT_COUNTER_DONE][${timestamp}] Evento de atualização emitido:`, counters);
    
    return counters;
  } catch (error) {
    console.error(`[BACK_EMIT_COUNTER_ERROR] Erro ao emitir atualização de contadores:`, error);
    throw error;
  }
};

export default EmitTicketCounterService;
