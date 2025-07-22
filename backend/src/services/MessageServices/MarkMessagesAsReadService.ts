import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import { getWbot, restartWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  ticketId: string | number;
}

const MarkMessagesAsReadService = async ({
  ticketId
}: Request): Promise<void> => {
  const io = getIO();
  
  const unreadMessages = await Message.findAll({
    where: {
      ticketId,
      read: false,
      fromMe: false
    },
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      }
    ]
  });

  if (unreadMessages.length === 0) {
    return;
  }

  const ticket = await Ticket.findByPk(ticketId, { include: ["contact"] });

  if (!ticket) {
    throw new Error("Ticket não encontrado");
  }

  try {
    // Verificar se o WhatsApp está conectado e pronto
    const whatsapp = await Whatsapp.findByPk(ticket.whatsappId);
    if (!whatsapp) {
      throw new Error(`WhatsApp não encontrado para o ticket ${ticketId}`);
    }
    
    // Verificar o estado da conexão
    let wbot: any;
    try {
      wbot = getWbot(ticket.whatsappId);
      
      // Verificar se o wbot está pronto
      if (!wbot.info || !wbot.info.wid) {
        logger.warn(`Sessão WhatsApp para o ticket ${ticketId} não está totalmente inicializada. Tentando reiniciar...`);
        wbot = await restartWbot(ticket.whatsappId);
        // Aguardar um momento para garantir que a sessão esteja pronta
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (wbotError) {
      logger.error(`Erro ao obter wbot para o ticket ${ticketId}: ${wbotError.message}`);
      logger.info(`Tentando reiniciar a sessão WhatsApp para o ticket ${ticketId}...`);
      try {
        wbot = await restartWbot(ticket.whatsappId);
        // Aguardar um momento para garantir que a sessão esteja pronta
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (restartError) {
        logger.error(`Falha ao reiniciar sessão WhatsApp: ${restartError.message}`);
        throw new Error(`Não foi possível obter uma sessão válida do WhatsApp: ${restartError.message}`);
      }
    }
    
    // Determinar o formato correto do ID do chat com base no tipo de conversa
    const chatId = ticket.isGroup 
      ? `${ticket.contact.number}@g.us` 
      : `${ticket.contact.number}@c.us`;
    
    logger.info(`Marcando mensagens como lidas para o ticket ${ticket.id}, chat ${chatId}`);
    
    try {
      // Obter o chat e enviar o sinal de visualização
      const chat = await wbot.getChatById(chatId);
      
      // Verificar se o chat está pronto
      if (!chat || !chat.sendSeen) {
        logger.error(`Chat inválido para o ID ${chatId}`);
        throw new Error(`Chat inválido ou não inicializado para o ID ${chatId}`);
      }
      
      // Tentar enviar o sinal de visualização com retry
      const sendSeenWithRetry = async (retries = 3): Promise<boolean> => {
        try {
          // Forçar o WhatsApp a estar disponível
          wbot.sendPresenceAvailable();
          
          // Pequena pausa para garantir que o WhatsApp esteja pronto
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Enviar o sinal de visualização
          await chat.sendSeen();
          
          logger.info(`SendSeen executado com sucesso para o chat ${chatId}`);
          return true;
        } catch (seenError) {
          if (retries > 0) {
            logger.warn(`Erro ao enviar sendSeen, tentando novamente (${retries} tentativas restantes): ${seenError.message}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return sendSeenWithRetry(retries - 1);
          }
          logger.error(`Falha ao enviar sendSeen após múltiplas tentativas: ${seenError.message}`);
          return false;
        }
      };
      
      // Executar sendSeen com retry
      await sendSeenWithRetry();
    } catch (chatError) {
      logger.error(`Erro ao obter chat para marcar como lido: ${chatError.message}`);
    }
    
    // Atualizar as mensagens no banco de dados e notificar o frontend
    // mesmo se o sendSeen falhar, para manter a consistência
    for (const message of unreadMessages) {
      await message.update({ read: true, ack: 3 });
      
      io.to(message.ticketId.toString()).emit("appMessage", {
        action: "update",
        message
      });
    }
    
    // Atualizar o contador de mensagens não lidas do ticket
    await ticket.update({ unreadMessages: 0 });
    
  } catch (error) {
    logger.error(`Erro ao marcar mensagens como lidas para o ticket ${ticketId}: ${error.message}`);
    console.error("Erro ao marcar mensagens como lidas:", error);
  }
};

export default MarkMessagesAsReadService;
