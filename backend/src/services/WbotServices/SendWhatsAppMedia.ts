import fs from "fs";
import { MessageMedia, Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";

import formatBody from "../../helpers/Mustache";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
}

const SendWhatsAppMedia = async ({
  media,
  ticket,
  body
}: Request): Promise<WbotMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket);
    const hasBody = body
      ? formatBody(body as string, ticket)
      : undefined;

    const newMedia = MessageMedia.fromFilePath(media.path);
    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
      newMedia,
      {
        caption: hasBody,
        sendAudioAsVoice: true
      }
    );

    await ticket.update({ lastMessage: body || media.filename });
    
    const messageData = {
      id: sentMessage.id.id,
      ticketId: ticket.id,
      contactId: undefined,
      body: body || media.filename,
      fromMe: true,
      mediaType: media.mimetype.split("/")[0],
      read: true,
      userId: ticket.userId
    };

    const CreateMessageService = require("../MessageServices/CreateMessageService").default;
    
    try {
      await CreateMessageService({ messageData });
    } catch (err) {
      console.error("Erro ao salvar mensagem de mídia no banco de dados:", err);
    }

    fs.unlinkSync(media.path);

    return sentMessage;
  } catch (err) {
    console.error("Erro ao enviar mídia:", err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;
