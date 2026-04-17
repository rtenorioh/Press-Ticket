import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import OldMessage from "../../models/OldMessage";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import FormatLastMessage from "../../helpers/FormatLastMessage";
import { logger } from "../../utils/logger";

interface MessageData {
  id: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  mimetype?: string;
  messageType?: string;
  filename?: string;
}
interface Request {
  messageData: MessageData;
}

const CreateMessageService = async ({
  messageData
}: Request): Promise<Message> => {
  try {

    await Message.upsert(messageData);

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
              attributes: ["name", "color"]
            }
          ]
        },
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        },
        {
          model: OldMessage,
          as: "oldMessages"
        }
      ]
    });

    if (!message) {
      throw new Error("ERR_CREATING_MESSAGE");
    }
    if (!messageData.fromMe && message.ticket?.contact) {
      try {
        await message.ticket.contact.update({
          lastContactAt: new Date()
        });
      } catch (error) {
        logger.error(`Erro ao atualizar lastContactAt: ${error}`);
      }
    }

    const io = getIO();
    try {
      if (message.ticket && typeof message.ticket.reload === "function") {
        await message.ticket.reload({
          include: [
            "contact",
            "queue",
            {
              model: Whatsapp,
              as: "whatsapp",
              attributes: ["name", "color"]
            }
          ]
        });
      }
    } catch (reloadError) {
      logger.error(`Erro ao recarregar ticket: ${reloadError}`);
    }

    const composedLastMessage = FormatLastMessage({
      body: message.body || "",
      mediaType: messageData.mediaType,
      mimetype: messageData.mimetype,
      messageType: messageData.messageType,
      fromMe: message.fromMe,
      filename: messageData.filename
    });

    const ticketPayload: any = message.ticket ? message.ticket.toJSON ? message.ticket.toJSON() : { ...message.ticket } : {};
    ticketPayload.lastMessage = composedLastMessage;
    ticketPayload.updatedAt = new Date();

    io.to(message.ticketId.toString())
      .to(ticketPayload.status)
      .to("notification")
      .emit("appMessage", {
        action: "create",
        message,
        ticket: ticketPayload,
        contact: ticketPayload.contact
      });

    return message;
  } catch (error) {
    logger.error(`Erro ao criar/atualizar mensagem: ${error}`);
    throw error;
  }
};

export default CreateMessageService;
