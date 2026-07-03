import { Client, Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import SerializeWbotMsgId from "../../helpers/SerializeWbotMsgId";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

import formatBody from "../../helpers/Mustache";
import { logger } from "../../utils/logger";

// wwebjs missing type definition for numberLid
interface ContactWithLid {
  numberLid?: string | null;
  number?: string;
}

// wwebjs missing type definition for pupPage
type ClientWithPupPage = Client & {
  pupPage?: {
    evaluate(
      fn: (...args: unknown[]) => unknown,
      ...args: unknown[]
    ): Promise<unknown>;
  };
};

// Options passed to wbot.sendMessage — wwebjs types are incomplete here
interface SendMessageOptions {
  linkPreview?: boolean;
  quotedMessageId?: string;
  mentions?: string[];
}

async function findMessageDirectlyFromWA(
  wbot: Client,
  ticket: Ticket,
  quotedMsgId: string
): Promise<WbotMessage | null> {
  try {
    const groupId = ticket.contact.number!.includes("@")
      ? ticket.contact.number!
      : `${ticket.contact.number!}@g.us`;
    const chat = await wbot.getChatById(groupId);

    const messages = await chat.fetchMessages({ limit: 500 });

    const foundMsg = messages.find(m => m.id.id === quotedMsgId);

    if (foundMsg) {
      return foundMsg;
    }

    return null;
  } catch (error) {
    logger.error(`Erro ao buscar mensagem diretamente do WhatsApp: ${error}`);
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

  // Garante que a sessão está realmente conectada antes de enviar.
  // Sem esta verificação, wbot.sendMessage pode resolver apenas
  // enfileirando a mensagem localmente (sessão desconectada/em sync),
  // fazendo a mensagem parecer enviada sem nunca chegar ao WhatsApp.
  // O envio de mídia (SendWhatsAppMedia) já faz esta mesma checagem.
  let connectionState: string | null = null;
  try {
    connectionState = await wbot.getState();
  } catch (stateErr) {
    logger.error(
      `Erro ao verificar estado da sessão do WhatsApp: ${stateErr}`
    );
  }

  if (connectionState !== "CONNECTED") {
    logger.warn(
      `Tentativa de envio com sessão não conectada (state=${connectionState}) no ticket ${ticket.id}`
    );
    throw new AppError(
      "WhatsApp não está conectado. Por favor, reconecte o WhatsApp."
    );
  }

  const contactNumber = ticket.contact.number!;
  const groupId = contactNumber.includes("@")
    ? contactNumber
    : `${contactNumber}@g.us`;
  const userId = contactNumber.includes("@")
    ? contactNumber
    : `${contactNumber}@c.us`;

  if (quotedMsg && ticket.isGroup) {
    const originalMessage = await findMessageDirectlyFromWA(
      wbot,
      ticket,
      quotedMsg.id
    );

    if (originalMessage) {
      try {
        try {
          const chat = await wbot.getChatById(groupId);
          await chat.sendStateTyping();
          await new Promise(resolve => setTimeout(resolve, 400));
        } catch (_e) {}
        const replyOptions: SendMessageOptions = {};
        if (mentions && mentions.length > 0) {
          replyOptions.mentions = mentions;
        }
        const sentMessage = await originalMessage.reply(
          formatBody(body, ticket),
          undefined,
          replyOptions as Record<string, unknown>
        );

        await ticket.update({ lastMessage: body });
        await ticket.reload();
        return sentMessage;
      } catch (replyError) {
        logger.error(`Erro ao usar reply nativo: ${replyError}`);

        try {
          try {
            const chat = await wbot.getChatById(groupId);
            await chat.sendStateTyping();
            await new Promise(resolve => setTimeout(resolve, 400));
          } catch (_e) {}
          const payload = formatBody(body, ticket);
          let sentMessage: WbotMessage;
          const sendOpts: SendMessageOptions = {
            linkPreview: false,
            quotedMessageId: originalMessage.id._serialized
          };
          if (mentions && mentions.length > 0) {
            sendOpts.mentions = mentions;
          }
          try {
            sentMessage = await wbot.sendMessage(
              groupId,
              payload,
              sendOpts as Record<string, unknown>
            );
          } catch (_e1) {
            await new Promise(r => setTimeout(r, 500));
            sentMessage = await wbot.sendMessage(
              groupId,
              payload,
              sendOpts as Record<string, unknown>
            );
          }

          await ticket.update({ lastMessage: body });
          await ticket.reload();
          return sentMessage;
        } catch (idError) {
          logger.error(`Erro ao usar ID serializado: ${idError}`);
        }
      }
    }

    try {
      const chat = await wbot.getChatById(groupId);
      await chat.sendStateTyping();
      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (_e) {}
    const payload = formatBody(body, ticket);
    let sentMessage: WbotMessage;
    const sendOpts: SendMessageOptions = { linkPreview: false };
    if (mentions && mentions.length > 0) {
      sendOpts.mentions = mentions;
    }
    try {
      sentMessage = await wbot.sendMessage(
        groupId,
        payload,
        sendOpts as Record<string, unknown>
      );
    } catch (_e1) {
      await new Promise(r => setTimeout(r, 500));
      sentMessage = await wbot.sendMessage(
        groupId,
        payload,
        sendOpts as Record<string, unknown>
      );
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
      } catch (_e) {}
      const payload = formatBody(body, ticket);
      let sentMessage: WbotMessage;
      const sendOpts: SendMessageOptions = { linkPreview: false };
      if (mentions && mentions.length > 0) {
        sendOpts.mentions = mentions;
      }
      try {
        sentMessage = await wbot.sendMessage(
          groupId,
          payload,
          sendOpts as Record<string, unknown>
        );
      } catch (_e1) {
        await new Promise(r => setTimeout(r, 500));
        sentMessage = await wbot.sendMessage(
          groupId,
          payload,
          sendOpts as Record<string, unknown>
        );
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

      const CreateMessageService =
        require("../MessageServices/CreateMessageService").default;

      try {
        await CreateMessageService({ messageData });
      } catch (err) {
        logger.error(`Erro ao salvar mensagem: ${err}`);
      }

      return sentMessage;
    } catch (err) {
      logger.error(`Erro ao enviar mensagem para grupo: ${err}`);
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }
  }

  let quotedMsgSerializedId: string | undefined;

  if (quotedMsg) {
    try {
      await GetWbotMessage(ticket, quotedMsg.id);
      quotedMsgSerializedId = SerializeWbotMsgId(ticket, quotedMsg);
    } catch (error) {
      logger.error(`Erro ao buscar mensagem citada: ${error}`);
      throw new AppError("ERR_FETCH_WAPP_MSG");
    }
  }

  const sendOptions: SendMessageOptions = {
    linkPreview: false
  };

  if (quotedMsgSerializedId) {
    sendOptions.quotedMessageId = quotedMsgSerializedId;
  }

  try {
    const payload = formatBody(body, ticket);
    // Pode permanecer indefinida se ambas as tentativas de envio falharem;
    // a checagem logo após os envios trata esse caso explicitamente.
    let sentMessage: WbotMessage | undefined;
    let lidError = false;

    const preFn = new Function(
      "pnId",
      "lidId",
      [
        "return (async function() {",
        "  var ids = [pnId, lidId];",
        "  for (var i = 0; i < ids.length; i++) {",
        "    try {",
        '      var wid = window.require("WAWebWidFactory").createWid(ids[i]);',
        '      var chatResult = await window.require("WAWebFindChatAction").findOrCreateLatestChat(wid);',
        "      var chat = chatResult && chatResult.chat ? chatResult.chat : chatResult;",
        '      if (chat) { await window.require("WAWebCmd").Cmd.openChatBottom({ chat: chat }); break; }',
        "    } catch(_) {}",
        "  }",
        "})();"
      ].join("\n")
    );

    const contactWithLid = ticket.contact as unknown as ContactWithLid;
    const lidBase = contactWithLid.numberLid || ticket.contact.number;
    const lidUserId = `${lidBase}@lid`;

    try {
      await (wbot as unknown as ClientWithPupPage).pupPage?.evaluate(
        preFn as (...args: unknown[]) => unknown,
        userId,
        lidUserId
      );
      await new Promise(r => setTimeout(r, 2000));
    } catch (evalErr) {
      logger.warn(`[SEND] preFn evaluate falhou (segue mesmo assim): ${evalErr}`);
    }

    try {
      sentMessage = await wbot.sendMessage(
        userId,
        payload,
        sendOptions as Record<string, unknown>
      );
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      lidError =
        errMsg.includes("No LID for user") ||
        String(e).includes("No LID for user");
      logger.error(`[SEND] sendMessage(${userId}) erro: ${errMsg}`);
      if (!lidError) throw e;
    }

    if (lidError) {
      sentMessage = await wbot.sendMessage(
        lidUserId,
        payload,
        sendOptions as Record<string, unknown>
      );
    }

    // Antes retornava um objeto sem id.id silenciosamente (HTTP 200 com {}),
    // sem logar nada — impossível diagnosticar. Agora falha explícito e loga.
    if (!sentMessage || !sentMessage.id?.id) {
      logger.error(
        `[SEND] wbot.sendMessage não retornou id válido. ` +
          `target=${userId} lidError=${lidError} ` +
          `idObj=${JSON.stringify(sentMessage?.id ?? null)}`
      );
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }

    logger.info(
      `[SEND] OK ticket=${ticket.id} msgId=${sentMessage.id.id} target=${userId}`
    );

    await ticket.update({ lastMessage: body });
    await ticket.reload();

    const messageData = {
      id: sentMessage!.id.id,
      ticketId: ticket.id,
      contactId: undefined,
      body: body,
      fromMe: true,
      mediaType: "chat",
      read: true,
      quotedMsgId: quotedMsg?.id,
      userId: ticket.userId
    };

    const CreateMessageService =
      require("../MessageServices/CreateMessageService").default;

    try {
      await CreateMessageService({ messageData });
    } catch (err) {
      logger.error(`Erro ao salvar mensagem: ${err}`);
    }

    return sentMessage!;
  } catch (err) {
    logger.error(`Erro ao enviar mensagem: ${err}`);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
