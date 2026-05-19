import GetTicketWbot from "../../helpers/GetTicketWbot";
import SerializeWbotMsgId from "../../helpers/SerializeWbotMsgId";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";

interface ReactParams {
  messageId: string;
  emoji: string;
}

const ReactToWhatsAppMessage = async ({
  messageId,
  emoji
}: ReactParams): Promise<{ ticketId: number }> => {
  const message = await Message.findByPk(messageId);
  if (!message) {
    throw new Error("Message not found");
  }
  const ticket = await Ticket.findByPk(message.ticketId, {
    include: ["user", "whatsapp", "contact"]
  });
  if (!ticket) {
    throw new Error("Ticket not found for message");
  }
  const wbot = await GetTicketWbot(ticket);

  if (!ticket.contact) {
    const contact = await Contact.findByPk(ticket.contactId);
    if (contact) {
      (ticket as unknown as { contact: typeof contact }).contact = contact;
    }
  }

  let remoteJid: string | null = null;
  const num = ticket.contact?.number?.replace(/\D/g, "");
  if (num) {
    remoteJid = ticket.isGroup ? `${num}@g.us` : `${num}@c.us`;
  }

  const serializedId = (() => {
    try {
      const id = SerializeWbotMsgId(ticket, message);
      return id;
    } catch (_err) {
      return null;
    }
  })();
  const altSerializedId = (() => {
    try {
      if (!remoteJid) return null;
      const from = message.fromMe ? "true" : "false";
      const id = `${from}_${remoteJid}_${message.id}`;
      return id;
    } catch (_err) {
      return null;
    }
  })();

  if (!ticket.isGroup) {
    try {
      // wwebjs missing type definition for getMessageById
      const wbotExt = wbot as unknown as { getMessageById?: (id: string) => Promise<{ react: (e: string) => Promise<void> } | null> };
      if (serializedId) {
        const bySerialized = await wbotExt.getMessageById?.(serializedId);
        if (bySerialized && typeof bySerialized.react === "function") {
          await bySerialized.react(emoji);
          return { ticketId: message.ticketId };
        }
      }

      if (altSerializedId) {
        const byAlt = await wbotExt.getMessageById?.(altSerializedId);
        if (byAlt && typeof byAlt.react === "function") {
          await byAlt.react(emoji);
          return { ticketId: message.ticketId };
        }
      }

      const msgInstance = await wbotExt.getMessageById?.(messageId);
      if (msgInstance && typeof msgInstance.react === "function") {
        await msgInstance.react(emoji);
        return { ticketId: message.ticketId };
      }
    } catch (err) {
      logger.warn(
        `Falha ao reagir via getMessageById, tentando fallback: ${err}`
      );
    }
  } else {
  }

  if (!wbot.pupPage) {
    throw new Error("WhatsApp page not ready");
  }

  let result: { success: boolean; logs?: string[] } | null = null;
  try {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    // wwebjs pupPage.evaluate runs in browser context — Store/DOM types require any
    result = await wbot.pupPage.evaluate(
      (
        msgId: string,
        serialized: string | null,
        altSerialized: string | null,
        reaction: string,
        remote?: string | null
      ) => {
        const logs: string[] = [];
        try {
          const Store = (window as any).Store;
          logs.push(
            `Tentando IDs: ${JSON.stringify({ msgId, serialized, altSerialized, remote })}`
          );

          const byAnyId = (id: string) => {
            logs.push(`Buscando por ID: ${id}`);
            let msg = Store?.Msg?.get?.(id);
            if (msg) {
              logs.push("Mensagem encontrada via Store.Msg.get");
              return Promise.resolve(msg);
            }
            const models = Store?.Msg?.models || [];
            msg = models.find((m: any) => {
              const sid = m?.id?._serialized;
              const iid = m?.id?.id;
              return (
                sid === id ||
                iid === id ||
                (typeof sid === "string" && sid.includes(id)) ||
                (typeof id === "string" && id.includes(iid))
              );
            });
            if (msg) return Promise.resolve(msg);

            if (remote) {
              try {
                const chat = Store?.Chat?.get?.(remote);
                if (chat) {
                  const arr = chat?.msgs?.getModelsArray?.() || [];
                  msg = arr.find((m: any) => {
                    const sid = m?.id?._serialized;
                    const iid = m?.id?.id;
                    return (
                      sid === id ||
                      iid === id ||
                      (typeof sid === "string" && sid.includes(id)) ||
                      (typeof id === "string" && id.includes(iid))
                    );
                  });
                  if (msg) {
                    logs.push(`Mensagem encontrada no chat ${remote}`);
                    return Promise.resolve(msg);
                  }
                }
              } catch (e) {
                logs.push(`Erro ao buscar no chat: ${e}`);
              }
            }

            try {
              const allChats = Store?.Chat?.models || [];
              for (const c of allChats) {
                const arr = c?.msgs?.getModelsArray?.() || [];
                const found = arr.find((m: any) => {
                  const sid = m?.id?._serialized;
                  const iid = m?.id?.id;
                  return (
                    sid === id ||
                    iid === id ||
                    (typeof sid === "string" && sid.includes(id)) ||
                    (typeof id === "string" && id.includes(iid))
                  );
                });
                if (found) {
                  logs.push("Mensagem encontrada em busca global");
                  return Promise.resolve(found);
                }
              }
            } catch (e) {
              logs.push(`Erro na busca global: ${e}`);
            }

            return Promise.resolve(null);
          };

          const tryIds = [serialized, altSerialized, msgId].filter(
            Boolean
          ) as string[];
          logs.push(`Lista de IDs para tentar: ${JSON.stringify(tryIds)}`);

          const tryChain = () => {
            let promise = Promise.resolve(null);
            for (const id of tryIds) {
              promise = promise.then((found: any) => {
                if (found) return found;
                return byAnyId(id).then((m: any) => {
                  if (m) {
                    logs.push(`Mensagem encontrada com ID: ${id}`);
                    return m;
                  }
                  return null;
                });
              });
            }
            return promise.then((result: any) => {
              if (!result) {
                logs.push("Nenhuma mensagem encontrada");
              }
              return result;
            });
          };

          return tryChain()
            .then((msg: any) => {
              if (!msg) {
                logs.push("Mensagem não encontrada, abortando");
                return { success: false, logs };
              }
              logs.push(`Enviando reação: ${reaction}`);
              return Store.sendReactionToMsg(msg, reaction)
                .then(() => {
                  logs.push("Reação enviada com sucesso");
                  return { success: true, logs };
                })
                .catch((err: any) => {
                  logs.push(`Erro ao enviar reação: ${err?.message || err}`);
                  return { success: false, logs };
                });
            })
            .catch((err: any) => {
              logs.push(`Erro no tryChain: ${err?.message || err}`);
              return { success: false, logs };
            });
        } catch (e: any) {
          logs.push(`Erro geral: ${e?.message || e}`);
          return { success: false, logs };
        }
      },
      messageId,
      serializedId,
      altSerializedId,
      emoji,
      remoteJid
    );
    /* eslint-enable @typescript-eslint/no-explicit-any */
  } catch (evalError) {
    logger.error(`Erro no pupPage.evaluate para reação: ${evalError}`);
    throw new Error("Failed to evaluate Store reaction");
  }

  if (!result?.success) {
    throw new Error("Failed to send reaction via WhatsApp Web");
  }

  return { ticketId: message.ticketId };
};

export default ReactToWhatsAppMessage;
