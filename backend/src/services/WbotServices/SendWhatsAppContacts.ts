import { Message as WbotMessage, MessageMedia } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";

interface ContactData {
  id: string;
  name: string;
  number: string;
  profilePicUrl?: string;
}

interface Request {
  contacts: ContactData[];
  ticket: Ticket;
}

const SendWhatsAppContacts = async ({
  contacts,
  ticket
}: Request): Promise<WbotMessage> => {
  const wbot = await GetTicketWbot(ticket);

  try {
    let sentMessage: WbotMessage | undefined;
    const chatId = `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`;

    if (contacts.length === 1) {
      const contact = contacts[0];
      
      const cleanNumber = contact.number.replace(/\D/g, "");
      const formattedNumber = cleanNumber.startsWith("55") ? `+${cleanNumber}` : `+55${cleanNumber}`;
      
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
TEL;TYPE=CELL:${formattedNumber}
TEL;waid=${cleanNumber}:${formattedNumber}
END:VCARD`;

      try {
        const chat = await wbot.getChatById(chatId);
        await chat.sendStateTyping();
        await new Promise(resolve => setTimeout(resolve, 400));
      } catch (e) {}
      sentMessage = await wbot.sendMessage(chatId, vcard);
    } else {
      
      const vcards = contacts.map(contact => {
        const cleanNumber = contact.number.replace(/\D/g, "");
        const formattedNumber = cleanNumber.startsWith("55") ? `+${cleanNumber}` : `+55${cleanNumber}`;
        
        return `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
TEL;TYPE=CELL:${formattedNumber}
TEL;waid=${cleanNumber}:${formattedNumber}
END:VCARD`;
      });
      
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const cleanNumber = contact.number.replace(/\D/g, "");
        const formattedNumber = cleanNumber.startsWith("55") ? `+${cleanNumber}` : `+55${cleanNumber}`;
        
        const individualVcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
TEL;TYPE=CELL:${formattedNumber}
TEL;waid=${cleanNumber}:${formattedNumber}
END:VCARD`;

        try {
          const chat = await wbot.getChatById(chatId);
          await chat.sendStateTyping();
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (e) {}
        sentMessage = await wbot.sendMessage(chatId, individualVcard);
        
        if (i < contacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    const lastMessageText = contacts.length === 1 
      ? `📞 Contato compartilhado: ${contacts[0].name}`
      : `📞 ${contacts.length} contatos compartilhados`;
      
    await ticket.update({ lastMessage: lastMessageText });
    await ticket.reload();

    if (!sentMessage) {
      throw new AppError("ERR_SENDING_WAPP_CONTACTS");
    }

    return sentMessage;
  } catch (err) {
    console.error("Erro ao enviar contatos:", err);
    throw new AppError("ERR_SENDING_WAPP_CONTACTS");
  }
};

export default SendWhatsAppContacts;
