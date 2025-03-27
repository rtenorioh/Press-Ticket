import { Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import SerializeWbotMsgId from "../../helpers/SerializeWbotMsgId";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

import formatBody from "../../helpers/Mustache";

async function findMessageDirectlyFromWA(wbot: any, ticket: Ticket, quotedMsgId: string): Promise<any | null> {
  try {
    const chat = await wbot.getChatById(`${ticket.contact.number}@g.us`);

    const messages = await chat.fetchMessages({ limit: 500 });

    const foundMsg = messages.find((m: any) => m.id.id === quotedMsgId);

    if (foundMsg) {
      return foundMsg;
    }

    return null;
  } catch (error) {
    console.error(`Erro ao buscar mensagem diretamente do WhatsApp: ${error}`);
    return null;
  }
}

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg
}: Request): Promise<WbotMessage> => {
  const wbot = await GetTicketWbot(ticket);

  if (quotedMsg && ticket.isGroup) {
    const originalMessage = await findMessageDirectlyFromWA(wbot, ticket, quotedMsg.id);

    if (originalMessage) {
      try {
        const sentMessage = await originalMessage.reply(formatBody(body, ticket));

        await ticket.update({ lastMessage: body });
        return sentMessage;
      } catch (replyError) {
        console.error(`Erro ao usar reply nativo: ${replyError}`);

        try {
          const sentMessage = await wbot.sendMessage(
            `${ticket.contact.number}@g.us`,
            formatBody(body, ticket),
            { linkPreview: false, quotedMessageId: originalMessage.id._serialized }
          );

          await ticket.update({ lastMessage: body });
          return sentMessage;
        } catch (idError) {
          console.error(`Erro ao usar ID serializado diretamente: ${idError}`);
        }
      }
    }

    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@g.us`,
      formatBody(body, ticket),
      { linkPreview: false }
    );

    await ticket.update({ lastMessage: body });
    return sentMessage;
  }

  let quotedMsgSerializedId: string | undefined;

  if (quotedMsg && !ticket.isGroup) {
    try {
      await GetWbotMessage(ticket, quotedMsg.id);
      quotedMsgSerializedId = SerializeWbotMsgId(ticket, quotedMsg);
    } catch (error) {
      console.error(`Erro ao buscar mensagem citada: ${error}`);
      throw new AppError("ERR_FETCH_WAPP_MSG");
    }
  }

  const sendOptions: {
    linkPreview: boolean;
    quotedMessageId?: string;
  } = {
    linkPreview: false
  };

  if (quotedMsgSerializedId) {
    sendOptions.quotedMessageId = quotedMsgSerializedId;
  }

  try {
    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@c.us`,
      formatBody(body, ticket),
      sendOptions
    );

    await ticket.update({ lastMessage: body });
    return sentMessage;
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;