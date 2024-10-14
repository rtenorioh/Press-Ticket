import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";

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
  // console.log("creating message");
  // console.log({
  //   messageData
  // });

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
    // data.body = data.mediaUrl;
  } else {
    data.mediaType = "chat";
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
    }

    // eslint-disable-next-line consistent-return
    return newMessage;
  } catch (error) {
    console.log(error);
  }
};

export default CreateMessageService;
