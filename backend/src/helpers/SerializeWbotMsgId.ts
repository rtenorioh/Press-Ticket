import Message from "../models/Message";
import Ticket from "../models/Ticket";

const SerializeWbotMsgId = (ticket: Ticket, message: Message): string => {
  // Remover @c.us ou @g.us se já existir no número
  const cleanNumber = ticket.contact.number.replace(/@(c|g)\.us$/, '');
  
  const serializedMsgId = `${message.fromMe}_${cleanNumber}@${
    ticket.isGroup ? "g" : "c"
  }.us_${message.id}`;

  return serializedMsgId;
};

export default SerializeWbotMsgId;
