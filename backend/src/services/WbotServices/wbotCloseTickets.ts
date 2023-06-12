import moment from "moment";
import * as Sentry from "@sentry/node";
import { logger } from "../../utils/logger";
import Ticket from "../../models/Ticket"
//import Whatsapp from "../../models/Whatsapp"
import { getIO } from "../../libs/socket"
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import ShowTicketService from "../TicketServices/ShowTicketService";
import formatBody from "../../helpers/Mustache";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";


//import Tag from "../../models/Tag";

export const ClosedAllOpenTickets = async (): Promise<void> => {
  const io = getIO();
  // @ts-ignore: Unreachable code error
  const closeTicket = async (ticket: Ticket, useNPS: boolean, currentStatus: any) => {
    if (currentStatus === 'nps') {

      await ticket.update({
        status: "closed",
        userId: ticket.userId || null,
        queueId: ticket.queueId || null,
        unreadMessages: 0
      });

    } else if (currentStatus === 'open') {
      await ticket.update({
        status: useNPS ? 'nps' : "closed",
        userId: ticket.userId || null,
        queueId: ticket.queueId || null,
        unreadMessages: 0
      });

    } else {

      await ticket.update({
        status: "closed",
        userId: ticket.userId || null,
        queueId: ticket.queueId || null,
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
      const ticketTraking = await FindOrCreateATicketTrakingService({ticketId: ticket.id, 
                whatsappId: whatsapp.id, 
                userId: ticket.userId});

      // Define horario para fechar automaticamente ticket aguardando avaliação. Tempo default: 10 minutos
        
      if (ticketTraking){
        let dataLimiteNPS = new Date()

        dataLimiteNPS.setMinutes(dataLimiteNPS.getMinutes() - 10)
        if (ticketTraking.finishedAt === null && ticketTraking.ratingAt === null && ticketTraking.closedAt !== null && ticketTraking.closedAt < dataLimiteNPS) {
          closeTicket(ticket, useNPS, ticket.status);

          await ticketTraking.update({
            closedAt: moment().toDate(),
            finishedAt: moment().toDate()
          });

              io.to("open").emit(`ticket`, {
                action: "delete",
                ticket,
                ticketId: ticket.id
              });
        };
      }
      // @ts-ignore: Unreachable code error
      if (horasFecharAutomaticamente && horasFecharAutomaticamente !== "" &&
        // @ts-ignore: Unreachable code error
        horasFecharAutomaticamente !== "0" && Number(horasFecharAutomaticamente) > 0) {

        let dataLimite = new Date()

        if (Number(horasFecharAutomaticamente) < 1) {
          dataLimite.setMinutes(dataLimite.getMinutes() - (Number(horasFecharAutomaticamente)*60));
        } else {
          dataLimite.setHours(dataLimite.getHours() - Number(horasFecharAutomaticamente));
        }

       // console.log(dataLimite + " TEMPO FECHAMENTO " + horasFecharAutomaticamente)

        if (ticket.status === "open" && fromMe && !isMsgGroup) {

          let dataUltimaInteracaoChamado = new Date(ticket.updatedAt)

          if (dataUltimaInteracaoChamado < dataLimite) {
             
            if (sendIsInactive && ticket.status === "open" && messageInactive ) {
              const body = formatBody(`\u200e${messageInactive}`,ticketBody);
              await SendWhatsAppMessage({ body: body, ticket: ticketBody});
     
             }

             closeTicket(ticket, useNPS, ticket.status);
                      
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