import GetTicketWbot from "../../helpers/GetTicketWbot";
import SerializeWbotMsgId from "../../helpers/SerializeWbotMsgId";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";

interface ReactParams {
  messageId: string;
  emoji: string;
}

const ReactToWhatsAppMessage = async ({ messageId, emoji }: ReactParams): Promise<{ ticketId: number }> => {
  const message = await Message.findByPk(messageId);
  if (!message) {
    throw new Error("Message not found");
  }
  const ticket = await Ticket.findByPk(message.ticketId, { include: ["user", "whatsapp", "contact"] });
  if (!ticket) {
    throw new Error("Ticket not found for message");
  }
  const wbot = await GetTicketWbot(ticket);

  let remoteJid: string | null = null;
  try {
    if (ticket.isGroup) {
      remoteJid = null;
    } else {
      const contact = await Contact.findByPk(ticket.contactId);
      const num = contact?.number?.replace(/\D/g, "");
      if (num) remoteJid = `${num}@c.us`;
    }
  } catch {}

  const serializedId = (() => {
    try { return SerializeWbotMsgId(ticket as any, message as any); } catch { return null; }
  })();
  const altSerializedId = (() => {
    try {
      if (!remoteJid) return null;
      const from = message.fromMe ? 'true' : 'false';
      return `${from}_${remoteJid}_${message.id}`;
    } catch { return null; }
  })();

  try {
    if (serializedId) {
      const bySerialized = await (wbot as any).getMessageById?.(serializedId);
      if (bySerialized && typeof bySerialized.react === "function") {
        await bySerialized.react(emoji);
        return { ticketId: message.ticketId };
      }
    }
      
    if (altSerializedId) {
      const byAlt = await (wbot as any).getMessageById?.(altSerializedId);
      if (byAlt && typeof byAlt.react === "function") {
        await byAlt.react(emoji);
        return { ticketId: message.ticketId };
      }
    }

    const msgInstance = await (wbot as any).getMessageById?.(messageId);
    if (msgInstance && typeof msgInstance.react === "function") {
      await msgInstance.react(emoji);
      return { ticketId: message.ticketId };
    }
  } catch (err) {
    console.warn("[ReactToWhatsAppMessage] Falha ao usar getMessageById/react, tentando fallback Store:", err);
  }

  if (!wbot.pupPage) {
    throw new Error("WhatsApp page not ready");
  }

  const success = await wbot.pupPage.evaluate((msgId: string, serialized: string | null, altSerialized: string | null, reaction: string, remote: string | null) => {
    try {
      const Store = (window as any).Store;
      const byAnyId = async (id: string) => {
        let msg = Store?.Msg?.get?.(id);
        if (msg) return msg;
        const models = Store?.Msg?.models || [];
        msg = models.find((m: any) => {
          const sid = m?.id?._serialized;
          const iid = m?.id?.id;
          return sid === id || iid === id || (typeof sid === 'string' && sid.includes(id)) || (typeof id === 'string' && id.includes(iid));
        });
        if (msg) return msg;
        if (typeof id === 'string' && id.includes('_') && id.includes('@')) {
          try {
            const res = await Store?.Msg?.getMessagesById?.([id]);
            const list = res?.messages || [];
            msg = list.find((m: any) => {
              const sid = m?.id?._serialized;
              const iid = m?.id?.id;
              return sid === id || iid === id || (typeof sid === 'string' && sid.includes(id)) || (typeof id === 'string' && id.includes(iid));
            }) || list[0];
            if (msg) return msg;
          } catch {}
        }
        if (remote) {
          try {
            const chat = Store?.Chat?.get?.(remote) || (await Store?.Chat?.find?.(remote));
            const tryFindInChat = () => {
              const arr = chat?.msgs?.getModelsArray?.() || [];
              return arr.find((m: any) => {
                const sid = m?.id?._serialized;
                const iid = m?.id?.id;
                return sid === id || iid === id || (typeof sid === 'string' && sid.includes(id)) || (typeof id === 'string' && id.includes(iid));
              });
            };

            msg = tryFindInChat();
            if (msg) return msg;
            if (typeof chat?.loadEarlierMsgs === 'function') {
              for (let i = 0; i < 3 && !msg; i++) {
                try { await chat.loadEarlierMsgs(); } catch {}
                msg = tryFindInChat();
              }
            }
            if (msg) return msg;
          } catch {}
        }
        try {
          const allChats = Store?.Chat?.models || [];
          for (const c of allChats) {
            const arr = c?.msgs?.getModelsArray?.() || [];
            const found = arr.find((m: any) => {
              const sid = m?.id?._serialized;
              const iid = m?.id?.id;
              return sid === id || iid === id || (typeof sid === 'string' && sid.includes(id)) || (typeof id === 'string' && id.includes(iid));
            });
            if (found) return found;
          }
        } catch {}
        return msg || null;
      };

      const tryIds = [serialized, altSerialized, msgId].filter(Boolean) as string[];
      const tryChain = async (): Promise<any> => {
        for (const id of tryIds) {
          const m = await byAnyId(id);
          if (m) return m;
        }
        return null;
      };

      return Promise.resolve(tryChain())
        .then((msg: any) => {
          if (!msg) return false;
          return Store.sendReactionToMsg(msg, reaction).then(() => true).catch(() => false);
        })
        .catch(() => false);
    } catch (e) {
      return false;
    }
  }, messageId, serializedId, altSerializedId, emoji, remoteJid);

  if (!success) {
    throw new Error("Failed to send reaction via WhatsApp Web");
  }

  return { ticketId: message.ticketId };
};

export default ReactToWhatsAppMessage;
