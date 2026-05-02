import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";

interface MessageData {
  id: string;
  contactId: number;
  body: string;
  ticketId: number;
  read?: boolean;
  fromMe: boolean;
  fileName?: string;
  mediaType?: string;
  originalName?: string;
}

const CreateMessageService = async (
  messageData: MessageData
): Promise<Message | any> => {

  const {
    id,
    contactId,
    body,
    ticketId,
    read,
    fromMe,
    fileName,
    mediaType,
    originalName
  } = messageData;

  if ((!body || body === "") && (!fileName || fileName === "")) {
    return;
  }

  const data: any = {
    id,
    contactId,
    body,
    ticketId,
    fromMe,
    read,
    ack: 2
  };

  if (fileName) {
    data.mediaUrl = fileName;
    data.mediaType = mediaType === "photo" ? "image" : mediaType;
  } else {
    data.mediaType = "chat";
  }

  // Determine preview text for ticket list
  let lastMessage: string;
  if (!fileName) {
    lastMessage = body || "";
  } else {
    const mt = mediaType === "photo" ? "image" : (mediaType || "");
    lastMessage =
      mt === "image"  ? "📷 Imagem"  :
      mt === "video"  ? "🎥 Vídeo"   :
      mt === "audio"  ? "🎵 Áudio"   :
      "📎 Arquivo";
  }

  try {
    const newMessage = await Message.create(data);

    const message = await Message.findByPk(messageData.id, {
      include: [
        "contact",
        {
          model: Ticket,
          as: "ticket",
          include: [
            "contact",
            "queue",
            {
              model: Whatsapp,
              as: "whatsapp",
              attributes: ["name", "type"]
            }
          ]
        },
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        }
      ]
    });

    if (message) {
      // Update lastMessage on ticket
      if (lastMessage) {
        await Ticket.update({ lastMessage }, { where: { id: ticketId } });
        message.ticket.lastMessage = lastMessage;
      }

      const io = getIO();
      io.to(message.ticketId.toString())
        .to(message.ticket.status)
        .to("notification")
        .emit("appMessage", {
          action: "create",
          message,
          ticket: message.ticket,
          contact: message.ticket.contact
        });

      io.to(message.ticket.status)
        .to("notification")
        .to(ticketId.toString())
        .emit("ticket", {
          action: "update",
          ticket: message.ticket
        });
    }

    // eslint-disable-next-line consistent-return
    return newMessage;
  } catch (error) {
    logger.error(`Erro: ${error}`);
  }
};

export default CreateMessageService;
