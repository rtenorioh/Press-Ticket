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
    const groupId = ticket.contact.number.includes("@")
      ? ticket.contact.number
      : `${ticket.contact.number}@g.us`;
    const chat = await wbot.getChatById(groupId);

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
  mentions?: string[];
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
  mentions
}: Request): Promise<WbotMessage> => {
  const wbot = await GetTicketWbot(ticket);
  const groupId = ticket.contact.number.includes("@")
    ? ticket.contact.number
    : `${ticket.contact.number}@g.us`;
  const userId = ticket.contact.number.includes("@")
    ? ticket.contact.number
    : `${ticket.contact.number}@c.us`;

  if (quotedMsg && ticket.isGroup) {
    const originalMessage = await findMessageDirectlyFromWA(wbot, ticket, quotedMsg.id);

    if (originalMessage) {
      try {
        try {
          const chat = await wbot.getChatById(groupId);
          await chat.sendStateTyping();
          await new Promise(resolve => setTimeout(resolve, 400));
        } catch (e) {
        }
        const replyOptions: any = {};
        if (mentions && mentions.length > 0) {
          replyOptions.mentions = mentions;
        }
        const sentMessage = await originalMessage.reply(formatBody(body, ticket), undefined, replyOptions);

        await ticket.update({ lastMessage: body });
        await ticket.reload();
        return sentMessage;
      } catch (replyError) {
        console.error(`Erro ao usar reply nativo: ${replyError}`);

        try {
          try {
            const chat = await wbot.getChatById(groupId);
            await chat.sendStateTyping();
            await new Promise(resolve => setTimeout(resolve, 400));
          } catch (e) {}
          const payload = formatBody(body, ticket);
          let sentMessage: any;
          const sendOpts: any = { linkPreview: false, quotedMessageId: originalMessage.id._serialized };
          if (mentions && mentions.length > 0) {
            sendOpts.mentions = mentions;
          }
          try {
            sentMessage = await wbot.sendMessage(groupId, payload, sendOpts);
          } catch (e1) {
            await new Promise(r => setTimeout(r, 500));
            sentMessage = await wbot.sendMessage(groupId, payload, sendOpts);
          }

          await ticket.update({ lastMessage: body });
          await ticket.reload();
          return sentMessage;
        } catch (idError) {
          console.error(`Erro ao usar ID serializado diretamente: ${idError}`);
        }
      }
    }

    try {
      const chat = await wbot.getChatById(groupId);
      await chat.sendStateTyping();
      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (e) {}
    const payload = formatBody(body, ticket);
    let sentMessage: any;
    const sendOpts: any = { linkPreview: false };
    if (mentions && mentions.length > 0) {
      sendOpts.mentions = mentions;
    }
    try {
      sentMessage = await wbot.sendMessage(groupId, payload, sendOpts);
    } catch (e1) {
      await new Promise(r => setTimeout(r, 500));
      sentMessage = await wbot.sendMessage(groupId, payload, sendOpts);
    }

    await ticket.update({ lastMessage: body });
    await ticket.reload();
    return sentMessage;
  }
  
  if (ticket.isGroup) {
    try {
      try {
        const chat = await wbot.getChatById(groupId);
        await chat.sendStateTyping();
        await new Promise(resolve => setTimeout(resolve, 400));
      } catch (e) {}
      const payload = formatBody(body, ticket);
      let sentMessage: any;
      const sendOpts: any = { linkPreview: false };
      if (mentions && mentions.length > 0) {
        sendOpts.mentions = mentions;
      }
      try {
        sentMessage = await wbot.sendMessage(groupId, payload, sendOpts);
      } catch (e1) {
        await new Promise(r => setTimeout(r, 500));
        sentMessage = await wbot.sendMessage(groupId, payload, sendOpts);
      }

      await ticket.update({ lastMessage: body });
      await ticket.reload();
      
      const messageData = {
        id: sentMessage.id.id,
        ticketId: ticket.id,
        contactId: undefined,
        body: body,
        fromMe: true,
        mediaType: "chat",
        read: true,
        quotedMsgId: quotedMsg?.id,
        userId: ticket.userId
      };

      const CreateMessageService = require("../MessageServices/CreateMessageService").default;
      
      try {
        await CreateMessageService({ messageData });
      } catch (err) {
        console.error("Erro ao salvar mensagem no banco de dados:", err);
      }
      
      return sentMessage;
    } catch (err) {
      console.error("Erro ao enviar mensagem para grupo:", err);
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }
  }

  let quotedMsgSerializedId: string | undefined;

  if (quotedMsg) {
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
    const payload = formatBody(body, ticket);
    let sentMessage: any;
    let lidError = false;

    const preFn = new Function('pnId', 'lidId', [
      'return (async function() {',
      '  var ids = [pnId, lidId];',
      '  for (var i = 0; i < ids.length; i++) {',
      '    try {',
      '      var wid = window.require("WAWebWidFactory").createWid(ids[i]);',
      '      var chatResult = await window.require("WAWebFindChatAction").findOrCreateLatestChat(wid);',
      '      var chat = chatResult && chatResult.chat ? chatResult.chat : chatResult;',
      '      if (chat) { await window.require("WAWebCmd").Cmd.openChatBottom({ chat: chat }); break; }',
      '    } catch(_) {}',
      '  }',
      '})();'
    ].join('\n'));

    const lidUserId = `${ticket.contact.number}@lid`;

    try {
      await (wbot as any).pupPage.evaluate(preFn, userId, lidUserId);
      await new Promise(r => setTimeout(r, 2000));
    } catch (_) {}

    try {
      sentMessage = await wbot.sendMessage(userId, payload, sendOptions);
    } catch (e: any) {
      lidError = e?.message?.includes("No LID for user") || String(e).includes("No LID for user");
      if (!lidError) throw e;
    }

    if (lidError) {
      console.warn(`[LID_FALLBACK] Tentando com WID @lid: ${lidUserId}`);
      sentMessage = await wbot.sendMessage(lidUserId, payload, sendOptions);
    }

    await ticket.update({ lastMessage: body });
    await ticket.reload();
    
    const messageData = {
      id: sentMessage.id.id,
      ticketId: ticket.id,
      contactId: undefined,
      body: body,
      fromMe: true,
      mediaType: "chat",
      read: true,
      quotedMsgId: quotedMsg?.id,
      userId: ticket.userId
    };

    const CreateMessageService = require("../MessageServices/CreateMessageService").default;
    
    try {
      await CreateMessageService({ messageData });
    } catch (err) {
      console.error("Erro ao salvar mensagem no banco de dados:", err);
    }
    
    return sentMessage;
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;