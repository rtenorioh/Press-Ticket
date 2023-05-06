import * as Sentry from "@sentry/node";
import { logger } from "../../utils/logger";
import Ticket from "../../models/Ticket"
import Whatsapp from "../../models/Whatsapp"
import { getIO } from "../../libs/socket"
import Contact from "../../models/Contact";
import formatBody from "../../helpers/Mustache";
import GetWhatsappWbot  from "../../helpers/GetWhatsappWbot";
import SendWhatsAppMessage from "./SendWhatsAppMessage";


export const ClosedAllOpenTickets = async (): Promise<void> => {

  // @ts-ignore: Unreachable code error
  const closeTicket = async (ticket: any, useNPS: any, currentStatus: any, body: any) => {
    if (currentStatus === 'nps') {

      await ticket.update({
        status: "closed",
        //userId: ticket.userId || null,
        astMessage: body,
        queueId: null,
        chatbot: null,
        queueOptionId: null,
        userId: null,
        unreadMessages: 0
      });

    } else if (currentStatus === 'open') {

      await ticket.update({
        status: useNPS ? 'nps' : "closed",
      //  userId: ticket.userId || null,
        queueId: null,
        chatbot: null,
        queueOptionId: null,
        userId: null,
        unreadMessages: 0
      });

    } else {

      await ticket.update({
        status: "closed",
        //userId: ticket.userId || null,
        queueId: null,
        chatbot: null,
        queueOptionId: null,
        userId: null,
        unreadMessages: 0
      });

    }
  };

   
  const io = getIO();
  console.log("ENTROU NO FECHAMENTO")
  try {

    const { rows: tickets } = await Ticket.findAndCountAll({
      where: { status: "open" },
      order: [["updatedAt", "DESC"]]
    });
    console.log('WH ID: ' + tickets)

    tickets.forEach(async ticket => {

      console.log('WH ID: ' + ticket.whatsappId + ' CONTACTID :' + ticket.contactId)

      const whatsapp = await Whatsapp.findByPk(ticket.whatsappId);
      const contact = await Contact.findByPk(ticket.contactId);
      let horasFecharAutomaticamente = whatsapp?.timeInactiveMessage;
      let useNPS = whatsapp?.useNPS;
      let sendIsInactive = whatsapp?.sendInactiveMessage;
      let messageInactive = whatsapp?.inactiveMessage;
      // const wbot = await GetWhatsappWbot(whatsapp);
      
   //   const body = formatBody(`${messageInactive}`, contact);
    
      // const contactNumber = `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`

      // @ts-ignore: Unreachable code error
      if (horasFecharAutomaticamente && horasFecharAutomaticamente !== "" &&
        // @ts-ignore: Unreachable code error
        horasFecharAutomaticamente !== "0" && Number(horasFecharAutomaticamente) > 0) {

        let dataLimite = new Date()
        dataLimite.setHours(dataLimite.getHours() - Number(horasFecharAutomaticamente));
	
	logger.info(`horario limite para encerramento` + dataLimite)
        if (ticket.status === "open") {

          let dataUltimaInteracaoChamado = new Date(ticket.updatedAt)

          if (dataUltimaInteracaoChamado < dataLimite) {
            //logger.info('Contato: ' + contact.number + ' body: ' + body + ' wbot: ' +wbot + ' data limite:' + dataLimite)
            let sentMessage
            

    //        closeTicket(ticket, useNPS, ticket.status, body);
            
            if (sendIsInactive || ticket.status === "open") {
     //         await SendWhatsAppMessage({ body, ticket });
             }

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