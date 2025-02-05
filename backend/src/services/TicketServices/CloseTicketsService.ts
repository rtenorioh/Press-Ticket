import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import ShowTicketService from "./ShowTicketService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import formatBody from "../../helpers/Mustache";

interface Request {
  status?: string;
  userId: number;
  tickets: Ticket[];
  queueId?: number;
}

const CloseTicketsService = async ({
  status,
  userId,
  tickets,
  }: Request): Promise<void> => {
  const io = getIO();
  const promises = [];

  for (let ticket of tickets) {
    const oldStatus = ticket.status;
    
    promises.push(
      (async () => {
        await ticket.update({
          status: "closed",
          userId,
          queueId: null
        });

        if (ticket.status === "closed" && ticket.isGroup === false) {
          const whatsapp = await ShowWhatsAppService(ticket.whatsappId);
          const { farewellMessage } = whatsapp;

          if (farewellMessage) {
            await SendWhatsAppMessage({
              body: formatBody(`\u200e${farewellMessage}`, ticket),
              ticket
            });
          }
        }

        io.to(oldStatus).emit("ticket", {
          action: "delete",
          ticketId: ticket.id
        });

        io.to(ticket.status)
          .to("notification")
          .to(ticket.id.toString())
          .emit("ticket", {
            action: "update",
            ticket
          });
      })()
    );
  }

  await Promise.all(promises);
};

export default CloseTicketsService;
