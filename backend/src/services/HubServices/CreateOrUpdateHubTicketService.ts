import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { IContent } from "./HubMessageListener";

interface TicketData {
  contactId: number;
  channel: string;
  contents: IContent[];
  connection: Whatsapp;
}

const CreateOrUpdateTicketService = async (
  ticketData: TicketData
): Promise<Ticket> => {
  const { contactId, channel, contents, connection } = ticketData;

  console.log("TICKETDATA:", ticketData);
  console.log("CONTENTS:", contents);
  const ticketExists = await Ticket.findOne({
    where: {
      contactId,
      channel,
      whatsappId: connection.id
    }
  });

  if (ticketExists) {
    let newStatus = ticketExists.status;
    let newQueueId = ticketExists.queueId;

    if (ticketExists.status === "closed") {
      newStatus = "pending";
    }

    await ticketExists.update({
      lastMessage: contents[0].text,
      status: newStatus,
      queueId: newQueueId
    });

    await ticketExists.reload({
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

    return ticketExists;
  }

  const newTicket = await Ticket.create({
    status: "pending",
    channel,
    lastMessage: contents[0].text,
    contactId,
    whatsappId: connection.id
  });

  await newTicket.reload({
    include: [
      {
        association: "contact"
      },
      {
        association: "user"
      },
      {
        association: "whatsapp"
      }
    ]
  });

  return newTicket;
};

export default CreateOrUpdateTicketService;
