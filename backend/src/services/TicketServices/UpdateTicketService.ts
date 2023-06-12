import moment from "moment";
// import * as Sentry from "@sentry/node";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import ShowTicketService from "./ShowTicketService";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import { verifyMessage } from "../WbotServices/wbotMessageListener";

interface TicketData {
  status?: string;
  userId?: number | null;
  queueId?: number | null;
  whatsappId?: number;
  fromMe?: boolean;
  isMsgGroup?: boolean;
  isFinished?: boolean;
  }

interface Request {
  ticketData: TicketData | Ticket;
  ticketId: string | number;
  }

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId
}: Request): Promise<Response> => {
    const { status }= ticketData;  

      const io = getIO();

      const ticket = await ShowTicketService(ticketId);
      let { userId, queueId, whatsappId, fromMe, isMsgGroup ,isFinished }= ticketData;

      await SetTicketMessagesAsRead(ticket);

      if(whatsappId && ticket.whatsappId !== whatsappId) {
        await CheckContactOpenTickets(ticket.contactId, whatsappId);
      }

      const ticketTraking = await FindOrCreateATicketTrakingService({
        ticketId,
        whatsappId: ticket.whatsappId
      });

      const oldStatus = ticket.status;
      const oldUserId = ticket.user?.id;

      if (oldStatus === "closed") {
        await CheckContactOpenTickets(ticket.contact.id, ticket.whatsappId);
      }

      if (status !== undefined && ["closed"].indexOf(status) > -1 && !isFinished) {
        const { ratingMessage } = await ShowWhatsAppService(
          ticket.whatsappId
        );

        if (ratingMessage && !ticket.isGroup) {
          if (ticketTraking.ratingAt == null) {

            await ticketTraking.update({
              closedAt: moment().toDate()
            });
            
            const ratingTxt = ratingMessage || "";
            let bodyRatingMessage = `\u200e${ratingTxt}\n`;

            const msg = await SendWhatsAppMessage({ body: bodyRatingMessage, ticket });

            await verifyMessage(msg, ticket, ticket.contact);

            io.to("open")
              .to(ticketId.toString())
              .emit("ticket", {
                action: "delete",
                ticketId: ticket.id
              });

            return { ticket, oldStatus, oldUserId };
          }
        }
    };

   
    if (queueId !== undefined && queueId !== null) {
      let queuedAt = moment().toDate();
      await ticketTraking.update({ 
        queuedAt
      });
    }

    await ticket.update({
      status,
      queueId,
      userId,
      fromMe,
      isMsgGroup
    });

    if(whatsappId) {
      await ticket.update({
        whatsappId
      });
    }

    await ticket.reload();

    if (status !== undefined && ["pending"].indexOf(status) > -1) {
      ticketTraking.update({
        whatsappId: ticket.whatsappId,
        queuedAt: moment().toDate(),
        startedAt: null,
        userId: null
      });
    }

    if (status !== undefined && ["open"].indexOf(status) > -1) {
      ticketTraking.update({
        startedAt: moment().toDate(),
        ratingAt: null,
        rated: false,
        whatsappId: ticket.whatsappId,
        userId: ticket.userId
      });
    }

    await ticketTraking.save();
    
    if (ticket.status !== oldStatus || ticket.user?.id !== oldUserId) {
      ticketTraking.update({
        userId: ticket.userId
      })
      io.to(oldStatus).emit("ticket", {
        action: "delete",
        ticketId: ticket.id
      });
    }

    io.to(ticket.status)
      .to("notification")
      .to(ticketId.toString())
      .emit("ticket", {
        action: "update",
        ticket
      });

    return { ticket, oldStatus, oldUserId };
};

export default UpdateTicketService;