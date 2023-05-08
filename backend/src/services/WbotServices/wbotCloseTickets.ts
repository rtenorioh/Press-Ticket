import * as Sentry from "@sentry/node";
import { logger } from "../../utils/logger";
import Ticket from "../../models/Ticket"
//import Whatsapp from "../../models/Whatsapp"
import { getIO } from "../../libs/socket"
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import ShowTicketService from "../TicketServices/ShowTicketService";
import formatBody from "../../helpers/Mustache";


//import Tag from "../../models/Tag";

export const ClosedAllOpenTickets = async (): Promise<void> => {
  const io = getIO();
  // @ts-ignore: Unreachable code error
  const closeTicket = async (ticket: Ticket, useNPS: boolean, currentStatus: any, body: any) => {
    if (currentStatus === 'nps') {

      await ticket.update({
        status: "closed",
        userId: ticket.userId || null,
        queueId: null,
        lastMessage: body,
        unreadMessages: 0
      });

    } else if (currentStatus === 'open') {
      await ticket.update({
        status: useNPS ? 'nps' : "closed",
        userId: ticket.userId || null,
        queueId: null,
        unreadMessages: 0
      });

    } else {

      await ticket.update({
        status: "closed",
        userId: ticket.userId || null,
        queueId: null,
        unreadMessages: 0
      });

    }
  };
   
  try {

    const { rows: tickets } = await Ticket.findAndCountAll({
      where: { status: "open" },
      order: [["updatedAt", "DESC"]]
    });
   
    tickets.forEach(async ticket => {

      const whatsapp = await ShowWhatsAppService(ticket?.whatsappId)
      const ticketBody = await ShowTicketService(ticket?.id);
      let horasFecharAutomaticamente = whatsapp?.timeInactiveMessage;
      let useNPS = whatsapp?.useNPS;
      let sendIsInactive = whatsapp?.sendInactiveMessage;
      let messageInactive = whatsapp?.inactiveMessage;
      let fromMe = ticket.fromMe;
      let isMsgGroup = ticket.isMsgGroup;
      
      // @ts-ignore: Unreachable code error
      if (horasFecharAutomaticamente && horasFecharAutomaticamente !== "" &&
        // @ts-ignore: Unreachable code error
        horasFecharAutomaticamente !== "0" && Number(horasFecharAutomaticamente) > 0) {

        let dataLimite = new Date()
        dataLimite.setHours(dataLimite.getHours() - Number(horasFecharAutomaticamente));

        if (ticket.status === "open" && fromMe && !isMsgGroup) {

          let dataUltimaInteracaoChamado = new Date(ticket.updatedAt)

          if (dataUltimaInteracaoChamado < dataLimite) {
            const body = formatBody(`\u200e${messageInactive}`,ticketBody);
             
            if (sendIsInactive || ticket.status === "open") {
              console.log(body)
              await SendWhatsAppMessage({ body: body, ticket: ticketBody});
     
             }

             closeTicket(ticket, useNPS, ticket.status, body);
                      
            io.to("open").emit(`ticket`, {
              action: "delete",
              ticket,
              ticketId: ticket.id
            });
            }
        }
      }

    });

  } catch (e: any) {
    console.log('e', e)
  }

}