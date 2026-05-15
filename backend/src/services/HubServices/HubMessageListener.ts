import { downloadFiles } from "../../helpers/downloadHubFiles";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import CreateMessageService from "./CreateHubMessageService";
import FindOrCreateContactService from "./FindOrCreateHubContactService";
import { UpdateMessageAck } from "./UpdateMessageHubAck";
import { logger } from "../../utils/logger";
import { getIO } from "../../libs/socket";

export interface IContent {
  type: "text" | "image" | "audio" | "video" | "file" | "location" | "reply_text";
  text?: string;
  url?: string;
  fileUrl?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  address?: string;
  filename?: string;
  fileSize?: number;
  fileMimeType?: string;
  messsageId?: string;
}

export interface HubInMessage {
  type: "MESSAGE";
  id: string;
  timestamp: string;
  subscriptionId: string;
  channel:
  | "telegram"
  | "whatsapp"
  | "facebook"
  | "instagram"
  | "sms"
  | "email"
  | "webchat";
  direction: "IN";
  message: {
    id: string;
    from: string;
    to: string;
    direction: "IN";
    channel:
    | "telegram"
    | "whatsapp"
    | "facebook"
    | "instagram"
    | "sms"
    | "email"
    | "webchat";
    visitor: {
      name: string;
      firstName: string;
      lastName: string;
      picture: string;
      number: string;
    };
    group: {
      id: string;
      name: string;
    };
    isGroup: boolean;
    contents: IContent[];
    timestamp: string;
  };
}

export interface HubConfirmationSentMessage {
  type: "MESSAGE_STATUS";
  timestamp: string;
  subscriptionId: string;
  channel:
  | "telegram"
  | "whatsapp"
  | "facebook"
  | "instagram"
  | "sms"
  | "email"
  | "webchat";
  messageId: string;
  contentIndex: number;
  messageStatus: {
    timestamp: string;
    code: "SENT" | "REJECTED";
    description: string;
  };
}

const verifySentMessageStatus = (message: HubConfirmationSentMessage) => {
  const {
    messageStatus: { code }
  } = message;

  const isMessageSent = code === "SENT";

  if (isMessageSent) {
    return true;
  }

  return false;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const HubMessageListener = async (
  message: any | HubInMessage | HubConfirmationSentMessage,
  whatsapp: Whatsapp,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  medias: Express.Multer.File[]
) => {

  if (message.direction === "IN") {
    message.fromMe = false;
  }

  const ignoreEvent = message.direction === "OUT";
  if (ignoreEvent) {
    return;
  }

  const isMsgJoinInvite = message.contents === null;
  if (isMsgJoinInvite) {
    return;
  }

  const isMessageFromMe = message.type === "MESSAGE_STATUS";

  if (isMessageFromMe) {
    const isMessageSent = verifySentMessageStatus(
      message as HubConfirmationSentMessage
    );

    if (isMessageSent) {
      UpdateMessageAck(message.messageId);
    } else {
      logger.warn(
        `HubMessageListener: message not sent - ${message.messageStatus.code}: ${message.messageStatus.description}`
      );
    }

    return;
  }

  const {
    message: { id, from, channel, contents, visitor, group, isGroup }
  } = message as HubInMessage;

  try {
    const contact = await FindOrCreateContactService({
      ...visitor,
      from,
      group,
      isGroup,
      whatsapp,
      channel
    });

    let groupContact: Contact | undefined;
    if (isGroup && group.id) {
      groupContact = await FindOrCreateContactService({
        name: group.name || "Grupo",
        number: "",
        firstName: "",
        lastName: "",
        picture: visitor.picture || "",
        from: group.id,
        group,
        isGroup: true,
        whatsapp,
        channel
      });
    }

    const ticket = await FindOrCreateTicketService(
      contact,
      whatsapp.id!,
      1,
      undefined,
      undefined,
      groupContact
    );

    const textCaption = contents.find(c => c.type === "text")?.text || "";
    const firstContent = contents[0];
    let caption: string;
    if (!firstContent || firstContent.type === "text" || firstContent.type === "reply_text") {
      caption = textCaption;
    } else if (firstContent.type === "image") {
      caption = textCaption || "📷 Imagem";
    } else if (firstContent.type === "video") {
      caption = textCaption || "🎥 Vídeo";
    } else if (firstContent.type === "audio") {
      caption = textCaption || "🎵 Áudio";
    } else if (firstContent.type === "location") {
      caption = "📍 Localização";
    } else {
      caption = textCaption || "📎 Arquivo";
    }

    if (ticket) {
      let newStatus = ticket.status;
      const newQueueId = ticket.queueId;

      if (ticket.status === "closed") {
        newStatus = "pending";
      }

      await ticket.update({
        lastMessage: caption,
        status: newStatus,
        queueId: newQueueId
      });

      await ticket.reload({
        include: [
          { association: "contact" },
          { association: "user" },
          { association: "queue" },
          { association: "whatsapp" }
        ]
      });

      const io = getIO();
      io.to(ticket.status)
        .to("notification")
        .to(ticket.id.toString())
        .emit("ticket", {
          action: "update",
          ticket
        });
    }


    if (contents[0]?.type === "text" || contents[0]?.type === "reply_text") {
      await CreateMessageService({
        id,
        contactId: contact.id,
        body: caption,
        ticketId: ticket.id,
        fromMe: false
      });
    } else if (contents[0]?.fileUrl) {
      const media = await downloadFiles(contents[0].fileUrl);

      if (typeof media.mimeType === "string") {
        await CreateMessageService({
          id,
          contactId: contact.id,
          body: caption,
          ticketId: ticket.id,
          fromMe: false,
          fileName: `${media.filename}`,
          mediaType: media.mimeType.split("/")[0],
          originalName: media.originalname
        });
      }
    } else if (contents[0]?.type === "location") {
      const loc = contents[0];
      const parts: string[] = ["📍 Localização"];
      if (loc.name) parts.push(loc.name);
      if (loc.address) parts.push(loc.address);
      if (loc.latitude != null && loc.longitude != null) {
        parts.push(`https://maps.google.com/?q=${loc.latitude},${loc.longitude}`);
      }
      await CreateMessageService({
        id,
        contactId: contact.id,
        body: parts.join("\n"),
        ticketId: ticket.id,
        fromMe: false
      });
    }
  } catch (error: any) {
    logger.error(`HubMessageListener erro: ${error}`);
  }
};
export default HubMessageListener;
