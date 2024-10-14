import { downloadFiles } from "../../helpers/downloadHubFiles";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import CreateMessageService from "./CreateHubMessageService";
import FindOrCreateContactService from "./FindOrCreateHubContactService";
import { UpdateMessageAck } from "./UpdateMessageHubAck";

export interface IContent {
  type: "text" | "image" | "audio" | "video" | "file" | "location";
  text?: string;
  url?: string;
  fileUrl?: string;
  latitude?: number;
  longitude?: number;
  filename?: string;
  fileSize?: number;
  fileMimeType?: string;
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
  console.log("HubMessageListener", message);
  console.log("contents", message.message.contents);

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
      console.log("HubMessageListener: message sent");
      UpdateMessageAck(message.messageId);
    } else {
      console.log(
        "HubMessageListener: message not sent",
        message.messageStatus.code,
        message.messageStatus.description
      );
    }

    return;
  }

  const {
    message: { id, from, channel, contents, visitor, group, isGroup }
  } = message as HubInMessage;

  try {
    let contact = await FindOrCreateContactService({
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
        ...visitor,
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

    if (ticket) {
      let newStatus = ticket.status;
      let newQueueId = ticket.queueId;

      if (ticket.status === "closed") {
        newStatus = "pending";
      }

      await ticket.update({
        lastMessage: contents[0].text,
        status: newStatus,
        queueId: newQueueId
      });

      await ticket.reload({
        include: [
          {
            association: "contact"
          },
          {
            association: "user"
          },
          {
            association: "queue"
          },
          {
            association: "whatsapp"
          }
        ]
      });

      // return ticket;
    }

    // const ticket = await CreateOrUpdateTicketService({
    //   contactId: contact.id,
    //   channel,
    //   contents,
    //   whatsapp
    // });

    if (contents[0]?.type === "text") {
      await CreateMessageService({
        id,
        contactId: contact.id,
        body: contents[0].text || "",
        ticketId: ticket.id,
        fromMe: false
      });
    } else if (contents[0]?.fileUrl) {
      const media = await downloadFiles(contents[0].fileUrl);

      if (typeof media.mimeType === "string") {
        await CreateMessageService({
          id,
          contactId: contact.id,
          body: contents[0].text || "",
          ticketId: ticket.id,
          fromMe: false,
          fileName: `${media.filename}`,
          mediaType: media.mimeType.split("/")[0],
          originalName: media.originalname
        });
      }
    }
  } catch (error: any) {
    console.log(error);
  }
};
export default HubMessageListener;
