import Message from "../models/Message";
import Ticket from "../models/Ticket";


const SerializeWbotMsgId = (ticket: Ticket, message: Message): string => {

  // let SeGrupo = 'g.us_' + message.id + '_'+ (message.contact.number ?? ticket) + '@c.us';
  // let SeIndiv = 'c.us_' + message.id;
  let SeGrupo;
  if (ticket.isGroup) {
    if (message.contact != null) {
      SeGrupo = `g.us_${message.id}_${message.contact.number}@c.us`;
    } else {
      SeGrupo = `g.us_${message.id}_${ticket.whatsappId}@c.us`;
      // console.log(ticket)
    }

  }
  else {
    SeGrupo = `c.us_${message.id}`;
  }


  // const serializedMsgId = `${message.fromMe}_${ticket.contact.number}@${ticket.isGroup ? SeGrupo : SeIndiv }`;
  const serializedMsgId = `${message.fromMe}_${ticket.contact.number}@${SeGrupo}`;
  return serializedMsgId;
};

export default SerializeWbotMsgId;