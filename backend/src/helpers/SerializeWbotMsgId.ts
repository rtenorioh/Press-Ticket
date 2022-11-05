import Message from "../models/Message";
import Ticket from "../models/Ticket";

const SerializeWbotMsgId = (ticket: Ticket, message: Message): string => {

  let SeGrupo = 'g.us_' + message.id + '_'+ message.contact.number + '@c.us';
  let SeIndiv = 'c.us_' + message.id;

  const serializedMsgId = `${message.fromMe}_${ticket.contact.number}@${ticket.isGroup ? SeGrupo : SeIndiv }`;

  return serializedMsgId;
};

export default SerializeWbotMsgId;