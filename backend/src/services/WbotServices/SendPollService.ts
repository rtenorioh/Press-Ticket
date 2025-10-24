import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import { getIO } from "../../libs/socket";
import { Poll } from "whatsapp-web.js";

interface PollOption {
  name: string;
}

interface SendPollData {
  ticketId: number;
  pollName: string;
  options: PollOption[];
  allowMultipleAnswers?: boolean;
}

class SendPollService {
  async execute(data: SendPollData): Promise<Message> {
    const { ticketId, pollName, options, allowMultipleAnswers = false } = data;

    try {
      if (!pollName || pollName.trim() === "") {
        throw new AppError("Nome da enquete é obrigatório");
      }

      if (!options || options.length < 2) {
        throw new AppError("A enquete deve ter no mínimo 2 opções");
      }

      if (options.length > 12) {
        throw new AppError("A enquete pode ter no máximo 12 opções");
      }

      const ticket = await Ticket.findByPk(ticketId, {
        include: [
          { model: Contact, as: "contact" }
        ]
      });

      if (!ticket) {
        throw new AppError("Ticket não encontrado");
      }

      const wbot = getWbot(ticket.whatsappId);

      const state = await wbot.getState();
      if (state !== 'CONNECTED') {
        throw new AppError("WhatsApp não está conectado");
      }

      const pollOptions = options.map(opt => opt.name);

      const chatId = ticket.contact.number.includes('@') 
        ? ticket.contact.number 
        : `${ticket.contact.number}@c.us`;

      logger.info(`[POLL] Enviando enquete para ${chatId}`);
      logger.info(`[POLL] Nome: ${pollName}`);
      logger.info(`[POLL] Opções: ${pollOptions.join(", ")}`);
      logger.info(`[POLL] Múltipla escolha: ${allowMultipleAnswers}`);

      const poll = new Poll(pollName, pollOptions, {
        allowMultipleAnswers: allowMultipleAnswers || false
      } as any);

      const sentMessage = await wbot.sendMessage(chatId, poll);

      const messageBody = `📊 Enquete: ${pollName}\n\nOpções:\n${pollOptions.map((opt, i) => `${i + 1}. ${opt}`).join("\n")}`;

      const message = await Message.create({
        id: sentMessage.id.id,
        ticketId: ticket.id,
        contactId: ticket.contactId,
        body: messageBody,
        fromMe: true,
        read: true,
        mediaType: "poll",
        quotedMsgId: null,
        ack: 1,
        timestamp: new Date()
      });

      await ticket.update({
        lastMessage: `📊 Enquete: ${pollName}`
      });

      await ticket.reload({
        include: [
          { model: Contact, as: "contact" },
          { model: (await import("../../models/Queue")).default, as: "queue" },
          { model: (await import("../../models/User")).default, as: "user" },
          { model: (await import("../../models/Whatsapp")).default, as: "whatsapp" }
        ]
      });

      const io = getIO();

      io.to(ticket.id.toString())
        .to(`ticket-${ticket.id}`)
        .to("notification")
        .emit(`appMessage`, {
          action: "create",
          message,
          ticket,
          contact: ticket.contact
        });

      io.to(ticket.status)
        .to("notification")
        .emit(`ticket`, {
          action: "update",
          ticket
        });

      logger.info(`[POLL] Enquete enviada com sucesso: ${sentMessage.id.id}`);

      return message;
    } catch (error) {
      logger.error(`[POLL] Erro ao enviar enquete: ${error}`);
      throw new AppError(`Erro ao enviar enquete: ${error.message}`);
    }
  }
}

export default new SendPollService();
