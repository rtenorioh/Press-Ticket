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

    console.log("SendWhatsAppContacts - Dados recebidos:", {
      contactsCount: contacts.length,
      contacts: contacts.map(c => ({ id: c.id, name: c.name, number: c.number }))
    });

    if (contacts.length === 1) {
      // Enviar como vCard único
      const contact = contacts[0];
      console.log("Enviando vCard único:", { name: contact.name, number: contact.number });
      
      // Limpar e formatar o número corretamente
      const cleanNumber = contact.number.replace(/\D/g, "");
      const formattedNumber = cleanNumber.startsWith("55") ? `+${cleanNumber}` : `+55${cleanNumber}`;
      
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
TEL;TYPE=CELL:${formattedNumber}
TEL;waid=${cleanNumber}:${formattedNumber}
END:VCARD`;

      console.log("vCard gerado:", vcard);
      sentMessage = await wbot.sendMessage(chatId, vcard);
    } else {
      // Enviar como multi_vCard - usar array de vCards para whatsapp-web.js
      console.log("Enviando multi_vCard:", contacts.map(c => ({ name: c.name, number: c.number })));
      
      const vcards = contacts.map(contact => {
        // Limpar e formatar o número corretamente
        const cleanNumber = contact.number.replace(/\D/g, "");
        const formattedNumber = cleanNumber.startsWith("55") ? `+${cleanNumber}` : `+55${cleanNumber}`;
        
        return `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
TEL;TYPE=CELL:${formattedNumber}
TEL;waid=${cleanNumber}:${formattedNumber}
END:VCARD`;
      });

      console.log("multi_vCard array gerado:", vcards);
      
      // Enviar múltiplos contatos individualmente para garantir processamento correto
      console.log("Enviando múltiplos contatos individualmente...");
      
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

        console.log(`Enviando contato ${i + 1}/${contacts.length}:`, contact.name);
        sentMessage = await wbot.sendMessage(chatId, individualVcard);
        
        // Pequeno delay entre envios para evitar spam
        if (i < contacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // Atualizar lastMessage do ticket
    const lastMessageText = contacts.length === 1 
      ? `📞 Contato compartilhado: ${contacts[0].name}`
      : `📞 ${contacts.length} contatos compartilhados`;
      
    await ticket.update({ lastMessage: lastMessageText });

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
