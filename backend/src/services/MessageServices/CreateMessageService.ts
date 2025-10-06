import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import OldMessage from "../../models/OldMessage";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";

interface MessageData {
  id: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
}
interface Request {
  messageData: MessageData;
}

const CreateMessageService = async ({
  messageData
}: Request): Promise<Message> => {
  try {

    if (messageData.mediaType === "multi_vcard") {
      if (typeof messageData.body === 'string') {
        try {
          const parsedBody = JSON.parse(messageData.body);
          if (Array.isArray(parsedBody)) {
            console.log("Array length:", parsedBody.length);
            console.log("First item:", parsedBody[0]);
          }
        } catch (error) {
          console.error("Error parsing message body:", error);
        }
      }
    }
    
    const existingMessage = await Message.findByPk(messageData.id);
    if (existingMessage) {
      console.log("Mensagem já existe no banco de dados, atualizando:", messageData.id);
    } else {
      console.log("Criando nova mensagem no banco de dados:", messageData.id);
    }
    
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

    // Atualizar lastContactAt quando o contato envia uma mensagem (não é do usuário)
    if (!messageData.fromMe && message.ticket?.contact) {
      try {
        await message.ticket.contact.update({
          lastContactAt: new Date()
        });
        console.log(`[CREATE_MESSAGE_SERVICE] lastContactAt atualizado para contato ${message.ticket.contact.id}`);
      } catch (error) {
        console.error("Erro ao atualizar lastContactAt:", error);
      }
    }

    const io = getIO();
    const timestamp = new Date().toISOString();

    // Garantir que o ticket embutido esteja 100% atualizado (inclui lastMessage atualizado por listeners)
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
      console.error("Erro ao recarregar ticket antes de emitir appMessage:", reloadError);
    }

    const currentBody = message.body || "";
    const arrow = message.fromMe ? "🢅 " : "🢇 ";
    const composedLastMessage = `${arrow}${currentBody}`.trim();

    const ticketPayload: any = message.ticket ? message.ticket.toJSON ? message.ticket.toJSON() : { ...message.ticket } : {};
    if (!ticketPayload.lastMessage || ticketPayload.lastMessage === "" || ticketPayload.lastMessage.replace("🢇", "").replace("🢅", "").trim() !== currentBody.trim()) {
      ticketPayload.lastMessage = composedLastMessage;
    }
    ticketPayload.updatedAt = new Date();

    console.log(`[CREATE_MESSAGE_SERVICE][${timestamp}] Emitindo evento appMessage (create):`, {
      messageId: message.id,
      ticketId: message.ticketId,
      ticketStatus: ticketPayload?.status,
      lastMessage: ticketPayload?.lastMessage,
      body: message.body?.substring(0, 50)
    });

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
    console.error("Erro ao criar/atualizar mensagem:", error);
    throw error;
  }
};

export default CreateMessageService;
