/* eslint-disable no-plusplus */
/* eslint-disable no-nested-ternary */
import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import * as Sentry from "@sentry/node";
import { head, isNull, isNil, isNaN, isNative } from "lodash";
import moment from "moment";

import {
  Contact as WbotContact,
  Message as WbotMessage,
  MessageAck,
  Client
} from "whatsapp-web.js";

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import Settings from "../../models/Setting";
import Whatsapp from "../../models/Whatsapp";

import { getIO } from "../../libs/socket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import ListSettingsServiceOne from "../SettingServices/ListSettingsServiceOne";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

import ShowWhatsaAppHours from "../WhatsappService/ShowWhatsaAppHours";
import { debounce } from "../../helpers/Debounce";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import CreateContactService from "../ContactServices/CreateContactService";
import formatBody from "../../helpers/Mustache";
import UserRating from "../../models/UserRating";
import TicketTraking from "../../models/TicketTraking";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import Queue from "../../models/Queue";
import { boolean } from "yup";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface Session extends Client {
  id?: number;
}

const writeFileAsync = promisify(writeFile);

const verifyContact = async (msgContact: WbotContact): Promise<Contact> => {
  // const profilePicUrl = await msgContact.getProfilePicUrl();

  const contactData = {
    name: msgContact.name || msgContact.pushname || msgContact.id.user,
    number: msgContact.id.user,
    // profilePicUrl,
    isGroup: msgContact.isGroup
  };

  const contact = CreateOrUpdateContactService(contactData);

  return contact;
};

const verifyQuotedMessage = async (
  msg: WbotMessage
): Promise<Message | null> => {
  if (!msg.hasQuotedMsg) return null;

  const wbotQuotedMsg = await msg.getQuotedMessage();

  const quotedMsg = await Message.findOne({
    where: { id: wbotQuotedMsg.id.id }
  });

  if (!quotedMsg) return null;

  return quotedMsg;
};
const verifyRevoked = async (msgBody?: string): Promise<void> => {
  await new Promise(r => setTimeout(r, 500));

  const io = getIO();

  if (msgBody === undefined) {
    return;
  }

  try {
    const message = await Message.findOne({
      where: {
        body: msgBody
      }
    });

    if (!message) {
      return;
    }

    if (message) {
      // console.log(message);
      await Message.update(
        { isDeleted: true },
        {
          where: { id: message.id }
        }
      );

      const msgIsDeleted = await Message.findOne({
        where: {
          body: msgBody
        }
      });

      if (!msgIsDeleted) {
        return;
      }

      io.to(msgIsDeleted.ticketId.toString()).emit("appMessage", {
        action: "update",
        message: msgIsDeleted
      });
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error Message Revoke. Err: ${err}`);
  }
};

const verifyMediaMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  const quotedMsg = await verifyQuotedMessage(msg);

  const media = await msg.downloadMedia();

  if (!media) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    media.filename = `${new Date().getTime()}.${ext}`;
  } else {
    const originalFilename = media.filename ? `-${media.filename}` : "";
    // Always write a random filename
    media.filename = `${new Date().getTime()}${originalFilename}`;
  }

  try {
    await writeFileAsync(
      join(__dirname, "..", "..", "..", "public", media.filename),
      media.data,
      "base64"
    );
  } catch (err: any) {
    Sentry.captureException(err);
    logger.error(err);
  }

  let $tipoArquivo: string;

  switch (media.mimetype.split("/")[0]) {
    case 'audio':
      $tipoArquivo = '🔉 Mensagem de audio';
      break;

    case 'image':
      $tipoArquivo = '🖼️ Arquivo de imagem';
      break;

    case 'video':
      $tipoArquivo = '🎬 Arquivo de vídeo';
      break;

    case 'document':
      $tipoArquivo = '📘 Documento';
      break;

    case 'application':
      $tipoArquivo = '📎 Documento';
      break;

    case 'ciphertext':
      $tipoArquivo = '⚠️ Notificação';
      break;

    case 'e2e_notification':
      $tipoArquivo = '⛔ Notificação';
      break;

    case 'revoked':
      $tipoArquivo = '❌ Apagado';
      break;
    default:
      $tipoArquivo = '📎 Arquivo';
      break;
  }

  let $strBody: string;

  if (msg.fromMe === true) {

    $strBody = msg.body;

  } else {

    $strBody = msg.body;

  }

  const messageData = {
    id: msg.id.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: $strBody,
    fromMe: msg.fromMe,
    read: msg.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype.split("/")[0],
    quotedMsgId: quotedMsg?.id
  };

  if (msg.fromMe == true) {
    await ticket.update({ lastMessage: "🢅" + "⠀" + $tipoArquivo || "🢅" + "⠀" + $tipoArquivo });
  } else {
    await ticket.update({ lastMessage: "🢇" + "⠀" + $tipoArquivo || "🢇" + "⠀" + $tipoArquivo });
  }

  const newMessage = await CreateMessageService({ messageData });

  return newMessage;
};

const prepareLocation = (msg: WbotMessage): WbotMessage => {
  const gmapsUrl = `https://maps.google.com/maps?q=${msg.location.latitude}%2C${msg.location.longitude}&z=17`;
  msg.body = `data:image/png;base64,${msg.body}|${gmapsUrl}`;
  msg.body += `|${msg.location.description
    ? msg.location.description
    : `${msg.location.latitude}, ${msg.location.longitude}`
    }`;
  return msg;
};

export const verifyMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
) => {
  if (msg.type === "location") msg = prepareLocation(msg);

  const quotedMsg = await verifyQuotedMessage(msg);
  const messageData = {
    id: msg.id.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg.body,
    fromMe: msg.fromMe,
    mediaType: msg.type,
    read: msg.fromMe,
    quotedMsgId: quotedMsg?.id
  };

  if (msg.fromMe == true) {
    await ticket.update({//texto que sai do chat tb,
      fromMe: msg.fromMe,
      lastMessage:
        msg.type === "location"
          ? msg.location.description
            ? "🢅" + "⠀" + `Localization - ${msg.location.description.split("\\n")[0]}`
            : "🢅" + "⠀" + "🗺️:" + "Localization"
          : "🢅" + "⠀" + msg.body
    });
  } else {
    await ticket.update({//aqui mapei texto que chega do chat
      lastMessage:
        msg.type === "location"
          ? msg.location.description
            ? "🢇" + "⠀" + "🗺️:" + `Localization - ${msg.location.description.split("\\n")[0]}`
            : "🢇" + "⠀" + "🗺️:" + "Localization"
          : "🢇" + "⠀" + msg.body
    });
  }
  await CreateMessageService({ messageData });
};

const verifyQueue = async (
  wbot: Session,
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
) => {
  const { queues, greetingMessage, isDisplay } = await ShowWhatsAppService(
    wbot.id!


  );

  const {
    defineWorkHours,
    outOfWorkMessage,
    id,
    sunday,
    StartDefineWorkHoursSunday,
    EndDefineWorkHoursSunday,
    StartDefineWorkHoursSundayLunch,
    EndDefineWorkHoursSundayLunch,
    monday,
    StartDefineWorkHoursMonday,
    EndDefineWorkHoursMonday,
    StartDefineWorkHoursMondayLunch,
    EndDefineWorkHoursMondayLunch,
    tuesday,
    StartDefineWorkHoursTuesday,
    EndDefineWorkHoursTuesday,
    StartDefineWorkHoursTuesdayLunch,
    EndDefineWorkHoursTuesdayLunch,
    wednesday,
    StartDefineWorkHoursWednesday,
    EndDefineWorkHoursWednesday,
    StartDefineWorkHoursWednesdayLunch,
    EndDefineWorkHoursWednesdayLunch,
    thursday,
    StartDefineWorkHoursThursday,
    EndDefineWorkHoursThursday,
    StartDefineWorkHoursThursdayLunch,
    EndDefineWorkHoursThursdayLunch,
    friday,
    StartDefineWorkHoursFriday,
    EndDefineWorkHoursFriday,
    StartDefineWorkHoursFridayLunch,
    EndDefineWorkHoursFridayLunch,
    saturday,
    StartDefineWorkHoursSaturday,
    EndDefineWorkHoursSaturday,
    StartDefineWorkHoursSaturdayLunch,
    EndDefineWorkHoursSaturdayLunch
  } = await ShowWhatsaAppHours(
    wbot.id!
  );

  //Verificando se está habilitado dias de expediente
  if (defineWorkHours === true) {
    const now = new Date();
    const diaSemana = now.getDay();
    let diaSemanaStr;
    //Verificando os dias da semana se estão hbailitador, se não envie a mensagem de indisponivel

    // Domingo_____________________________________________________________________________________________________________________
    if (diaSemana === 0) {
      diaSemanaStr = "sunday"
      //if que identifica o dia da semana
      if (sunday === true) {
        //if que identifica se o dia da semana está ativo
        const hh: number = now.getHours() * 60 * 60;
        const mm: number = now.getMinutes() * 60;
        const hora = hh + mm;

        const start: string = StartDefineWorkHoursSunday;
        const hhStart = Number(start.split(":")[0]) * 60 * 60;
        const mmStart = Number(start.split(":")[1]) * 60;
        const hoursStart = hhStart + mmStart;

        const startLunch: string = StartDefineWorkHoursSundayLunch;
        const hhStartLunch = Number(startLunch.split(":")[0]) * 60 * 60;
        const mmStartLunch = Number(startLunch.split(":")[1]) * 60;
        const hoursStartLunch = hhStartLunch + mmStartLunch;

        const endLunch: string = EndDefineWorkHoursSundayLunch;
        const hhEndLunch = Number(endLunch.split(":")[0]) * 60 * 60;
        const mmEndLunch = Number(endLunch.split(":")[1]) * 60;
        const hoursEndLunch = hhEndLunch + mmEndLunch;

        const end: string = EndDefineWorkHoursSunday;
        const hhEnd = Number(end.split(":")[0]) * 60 * 60;
        const mmEnd = Number(end.split(":")[1]) * 60;
        const hoursEnd = hhEnd + mmEnd;

        if ((hora >= hoursStart && hora < hoursStartLunch) || (hora >= hoursEndLunch && hora < hoursEnd)) {
          //if que identifica se está dentro do horario comerical desse dia em especifico
          if (queues.length === 1) {
            //if que identifica se a conexão tem só 1 setor, se tiver só um envia mensagem de saudação e transfere o chamado para o setor.
            const selectedOption = '1';

            const choosenQueue = queues[+selectedOption - 1];
            if (choosenQueue) {
              const Hr = new Date();

              const hh: number = Hr.getHours() * 60 * 60;
              const mm: number = Hr.getMinutes() * 60;
              const hora = hh + mm;

              const inicio: string = choosenQueue.startWork;
              const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
              const mminicio = Number(inicio.split(":")[1]) * 60;
              const horainicio = hhinicio + mminicio;

              const termino: string = choosenQueue.endWork;
              const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
              const mmtermino = Number(termino.split(":")[1]) * 60;
              const horatermino = hhtermino + mmtermino;

              if (hora < horainicio || hora > horatermino) {
                const absenceMessage = choosenQueue.absenceMessage;
                if (absenceMessage) {
                  const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
                  const debouncedSentMessage = debounce(
                    async () => {
                      const sentMessage = await wbot.sendMessage(
                        `${contact.number}@c.us`,
                        body
                      );
                      verifyMessage(sentMessage, ticket, contact);
                    },
                    3000,
                    ticket.id
                  );

                  debouncedSentMessage();
                }
              } else {
                await UpdateTicketService({
                  ticketData: { queueId: choosenQueue.id },
                  ticketId: ticket.id
                });

                const chat = await msg.getChat();
                await chat.sendStateTyping();

                const greetingMessage = choosenQueue.greetingMessage;
                if (greetingMessage) {
                  const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

                  const sentMessage = await wbot.sendMessage(
                    `${contact.number}@c.us`,
                    body
                  );

                  await verifyMessage(sentMessage, ticket, contact);
                }
              }
            }
            await UpdateTicketService({
              ticketData: { queueId: queues[0].id },
              ticketId: ticket.id
            });
            return;
          }

          const selectedOption = msg.body;
          const choosenQueue = queues[+selectedOption - 1];
          if (choosenQueue) {
            //if que identifica todos os setores selecionados na conexão
            const Hr = new Date();

            const hh: number = Hr.getHours() * 60 * 60;
            const mm: number = Hr.getMinutes() * 60;
            const hora = hh + mm;

            const inicio: string = choosenQueue.startWork;
            const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
            const mminicio = Number(inicio.split(":")[1]) * 60;
            const horainicio = hhinicio + mminicio;

            const termino: string = choosenQueue.endWork;
            const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
            const mmtermino = Number(termino.split(":")[1]) * 60;
            const horatermino = hhtermino + mmtermino;

            if (hora < horainicio || hora > horatermino) {
              //If que identifica se o setor tem hora definida de atendimento
              const absenceMessage = choosenQueue.absenceMessage;
              if (absenceMessage) {
                const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
                const debouncedSentMessage = debounce(
                  async () => {
                    const sentMessage = await wbot.sendMessage(
                      `${contact.number}@c.us`,
                      body
                    );
                    verifyMessage(sentMessage, ticket, contact);
                  },
                  3000,
                  ticket.id
                );

                debouncedSentMessage();
              }
            } else {
              //else que retorna a mensagem de fora de expediente do setor
              await UpdateTicketService({
                ticketData: { queueId: choosenQueue.id },
                ticketId: ticket.id
              });

              const chat = await msg.getChat();
              await chat.sendStateTyping();

              const greetingMessage = choosenQueue.greetingMessage;
              if (greetingMessage) {
                const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );

                await verifyMessage(sentMessage, ticket, contact);
              }
            }
          } else {
            //Envia mensagem com setores
            let options = "";

            const chat = await msg.getChat();
            await chat.sendStateTyping();

            queues.forEach((queue, index) => {
              if (queue.startWork && queue.endWork) {
                if (isDisplay) {
                  options += `*${index + 1}* - ${queue.name} das ${queue.startWork
                    } as ${queue.endWork}\n`;
                } else {
                  options += `*${index + 1}* - ${queue.name}\n`;
                }
              } else {
                options += `*${index + 1}* - ${queue.name}\n`;
              }
            });

            const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, ticket);


            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );
                verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );

            debouncedSentMessage();
          }
        } else {
          //envia mensagem de fora do expediente, horario fora
          if (outOfWorkMessage && outOfWorkMessage.trim() !== "") {
            const body = formatBody(`\u200e${outOfWorkMessage}`, ticket);
            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );
                verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );
            debouncedSentMessage();
          }
        }
      } else {
        //envia mensagem de fora do expediente, dia desativado
        if (outOfWorkMessage && outOfWorkMessage.trim() !== "") {
          const body = formatBody(`\u200e${outOfWorkMessage}`, ticket);
          const debouncedSentMessage = debounce(
            async () => {
              const sentMessage = await wbot.sendMessage(
                `${contact.number}@c.us`,
                body
              );
              verifyMessage(sentMessage, ticket, contact);
            },
            3000,
            ticket.id
          );
          debouncedSentMessage();
        }
      }
    }
    // Fim Domingo_________________________________________________________________________________________________________________

    // Segunda_____________________________________________________________________________________________________________________
    if (diaSemana === 1) {
      diaSemanaStr = "monday"
      //Verifica dia ativo ou não
      if (monday === true) {
        //if que identifica se o dia da semana está ativo
        const hh: number = now.getHours() * 60 * 60;
        const mm: number = now.getMinutes() * 60;
        const hora = hh + mm;

        const start: string = StartDefineWorkHoursMonday;
        const hhStart = Number(start.split(":")[0]) * 60 * 60;
        const mmStart = Number(start.split(":")[1]) * 60;
        const hoursStart = hhStart + mmStart;

        const startLunch: string = StartDefineWorkHoursMondayLunch;
        const hhStartLunch = Number(startLunch.split(":")[0]) * 60 * 60;
        const mmStartLunch = Number(startLunch.split(":")[1]) * 60;
        const hoursStartLunch = hhStartLunch + mmStartLunch;

        const endLunch: string = EndDefineWorkHoursMondayLunch;
        const hhEndLunch = Number(endLunch.split(":")[0]) * 60 * 60;
        const mmEndLunch = Number(endLunch.split(":")[1]) * 60;
        const hoursEndLunch = hhEndLunch + mmEndLunch;

        const end: string = EndDefineWorkHoursMonday;
        const hhEnd = Number(end.split(":")[0]) * 60 * 60;
        const mmEnd = Number(end.split(":")[1]) * 60;
        const hoursEnd = hhEnd + mmEnd;

        if ((hora >= hoursStart && hora < hoursStartLunch) || (hora >= hoursEndLunch && hora < hoursEnd)) {
          //if que identifica se está dentro do horario comerical desse dia em especifico
          if (queues.length === 1) {
            //if que identifica se a conexão tem só 1 setor, se tiver só um envia mensagem de saudação e transfere o chamado para o setor.
            const selectedOption = '1';

            const choosenQueue = queues[+selectedOption - 1];
            if (choosenQueue) {
              const Hr = new Date();

              const hh: number = Hr.getHours() * 60 * 60;
              const mm: number = Hr.getMinutes() * 60;
              const hora = hh + mm;

              const inicio: string = choosenQueue.startWork;
              const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
              const mminicio = Number(inicio.split(":")[1]) * 60;
              const horainicio = hhinicio + mminicio;

              const termino: string = choosenQueue.endWork;
              const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
              const mmtermino = Number(termino.split(":")[1]) * 60;
              const horatermino = hhtermino + mmtermino;

              if (hora < horainicio || hora > horatermino) {
                const absenceMessage = choosenQueue.absenceMessage;
                if (absenceMessage) {
                  const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
                  const debouncedSentMessage = debounce(
                    async () => {
                      const sentMessage = await wbot.sendMessage(
                        `${contact.number}@c.us`,
                        body
                      );
                      verifyMessage(sentMessage, ticket, contact);
                    },
                    3000,
                    ticket.id
                  );

                  debouncedSentMessage();
                }
              } else {
                await UpdateTicketService({
                  ticketData: { queueId: choosenQueue.id },
                  ticketId: ticket.id
                });

                const chat = await msg.getChat();
                await chat.sendStateTyping();
                const greetingMessage = choosenQueue.greetingMessage;
                if (greetingMessage) {
                  const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

                  const sentMessage = await wbot.sendMessage(
                    `${contact.number}@c.us`,
                    body
                  );

                  await verifyMessage(sentMessage, ticket, contact);
                }
              }
            }
            await UpdateTicketService({
              ticketData: { queueId: queues[0].id },
              ticketId: ticket.id
            });
            return;
          }
          const selectedOption = msg.body;
          const choosenQueue = queues[+selectedOption - 1];
          if (choosenQueue) {
            //if que identifica todos os setores selecionados na conexão
            const Hr = new Date();

            const hh: number = Hr.getHours() * 60 * 60;
            const mm: number = Hr.getMinutes() * 60;
            const hora = hh + mm;

            const inicio: string = choosenQueue.startWork;
            const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
            const mminicio = Number(inicio.split(":")[1]) * 60;
            const horainicio = hhinicio + mminicio;

            const termino: string = choosenQueue.endWork;
            const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
            const mmtermino = Number(termino.split(":")[1]) * 60;
            const horatermino = hhtermino + mmtermino;

            if (hora < horainicio || hora > horatermino) {
              const absenceMessage = choosenQueue.absenceMessage;
              if (absenceMessage) {
                const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
                const debouncedSentMessage = debounce(
                  async () => {
                    const sentMessage = await wbot.sendMessage(
                      `${contact.number}@c.us`,
                      body
                    );
                    verifyMessage(sentMessage, ticket, contact);
                  },
                  3000,
                  ticket.id
                );

                debouncedSentMessage();
              }
            } else {
              //else que retorna a mensagem de fora de expediente do setor
              await UpdateTicketService({
                ticketData: { queueId: choosenQueue.id },
                ticketId: ticket.id
              });

              const chat = await msg.getChat();
              await chat.sendStateTyping();

              const greetingMessage = choosenQueue.greetingMessage;
              if (greetingMessage) {
                const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );

                await verifyMessage(sentMessage, ticket, contact);
              }
            }
          } else {
            //Envia mensagem com setores
            let options = "";

            const chat = await msg.getChat();
            await chat.sendStateTyping();

            queues.forEach((queue, index) => {
              if (queue.startWork && queue.endWork) {
                if (isDisplay) {
                  options += `*${index + 1}* - ${queue.name} das ${queue.startWork
                    } as ${queue.endWork}\n`;
                } else {
                  options += `*${index + 1}* - ${queue.name}\n`;
                }
              } else {
                options += `*${index + 1}* - ${queue.name}\n`;
              }
            });

            const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, ticket);

            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );
                verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );

            debouncedSentMessage();
          }
        } else {
          //envia mensagem de fora do expediente, horario fora
          if (outOfWorkMessage && outOfWorkMessage.trim() !== "") {
            const body = formatBody(`\u200e${outOfWorkMessage}`, ticket);
            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );
                verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );
            debouncedSentMessage();
          }
        }
      } else {
        //envia mensagem de fora do expediente, dia desativado
        if (outOfWorkMessage && outOfWorkMessage !== "") {
          const body = formatBody(`\u200e${outOfWorkMessage}`, ticket);
          const debouncedSentMessage = debounce(
            async () => {
              const sentMessage = await wbot.sendMessage(
                `${contact.number}@c.us`,
                body
              );
              verifyMessage(sentMessage, ticket, contact);
            },
            3000,
            ticket.id
          );
          debouncedSentMessage();
        }
      }
    }
    // Fim Segunda_________________________________________________________________________________________________________________

    // Terça_____________________________________________________________________________________________________________________
    if (diaSemana === 2) {
      diaSemanaStr = "tuesday"
      //if que identifica o dia da semana
      if (tuesday === true) {
        //if que identifica se o dia da semana está ativo
        const hh: number = now.getHours() * 60 * 60;
        const mm: number = now.getMinutes() * 60;
        const hora = hh + mm;

        const start: string = StartDefineWorkHoursTuesday;
        const hhStart = Number(start.split(":")[0]) * 60 * 60;
        const mmStart = Number(start.split(":")[1]) * 60;
        const hoursStart = hhStart + mmStart;

        const startLunch: string = StartDefineWorkHoursTuesdayLunch;
        const hhStartLunch = Number(startLunch.split(":")[0]) * 60 * 60;
        const mmStartLunch = Number(startLunch.split(":")[1]) * 60;
        const hoursStartLunch = hhStartLunch + mmStartLunch;

        const endLunch: string = EndDefineWorkHoursTuesdayLunch;
        const hhEndLunch = Number(endLunch.split(":")[0]) * 60 * 60;
        const mmEndLunch = Number(endLunch.split(":")[1]) * 60;
        const hoursEndLunch = hhEndLunch + mmEndLunch;

        const end: string = EndDefineWorkHoursTuesday;
        const hhEnd = Number(end.split(":")[0]) * 60 * 60;
        const mmEnd = Number(end.split(":")[1]) * 60;
        const hoursEnd = hhEnd + mmEnd;

        if ((hora >= hoursStart && hora < hoursStartLunch) || (hora >= hoursEndLunch && hora < hoursEnd)) {
          //if que identifica se está dentro do horario comerical desse dia em especifico
          if (queues.length === 1) {
            //if que identifica se a conexão tem só 1 setor, se tiver só um envia mensagem de saudação e transfere o chamado para o setor.
            const selectedOption = '1';

            const choosenQueue = queues[+selectedOption - 1];
            if (choosenQueue) {
              const Hr = new Date();

              const hh: number = Hr.getHours() * 60 * 60;
              const mm: number = Hr.getMinutes() * 60;
              const hora = hh + mm;

              const inicio: string = choosenQueue.startWork;
              const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
              const mminicio = Number(inicio.split(":")[1]) * 60;
              const horainicio = hhinicio + mminicio;

              const termino: string = choosenQueue.endWork;
              const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
              const mmtermino = Number(termino.split(":")[1]) * 60;
              const horatermino = hhtermino + mmtermino;

              if (hora < horainicio || hora > horatermino) {
                const absenceMessage = choosenQueue.absenceMessage;
                if (absenceMessage) {
                  const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
                  const debouncedSentMessage = debounce(
                    async () => {
                      const sentMessage = await wbot.sendMessage(
                        `${contact.number}@c.us`,
                        body
                      );
                      verifyMessage(sentMessage, ticket, contact);
                    },
                    3000,
                    ticket.id
                  );

                  debouncedSentMessage();
                }
              } else {
                await UpdateTicketService({
                  ticketData: { queueId: choosenQueue.id },
                  ticketId: ticket.id
                });

                const chat = await msg.getChat();
                await chat.sendStateTyping();
                const greetingMessage = choosenQueue.greetingMessage;
                if (greetingMessage) {
                  const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

                  const sentMessage = await wbot.sendMessage(
                    `${contact.number}@c.us`,
                    body
                  );

                  await verifyMessage(sentMessage, ticket, contact);
                }
              }
            }
            await UpdateTicketService({
              ticketData: { queueId: queues[0].id },
              ticketId: ticket.id
            });
            return;
          }
          const selectedOption = msg.body;
          const choosenQueue = queues[+selectedOption - 1];
          if (choosenQueue) {
            //if que identifica todos os setores selecionados na conexão
            const Hr = new Date();

            const hh: number = Hr.getHours() * 60 * 60;
            const mm: number = Hr.getMinutes() * 60;
            const hora = hh + mm;

            const inicio: string = choosenQueue.startWork;
            const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
            const mminicio = Number(inicio.split(":")[1]) * 60;
            const horainicio = hhinicio + mminicio;

            const termino: string = choosenQueue.endWork;
            const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
            const mmtermino = Number(termino.split(":")[1]) * 60;
            const horatermino = hhtermino + mmtermino;

            if (hora < horainicio || hora > horatermino) {
              const absenceMessage = choosenQueue.absenceMessage;
              if (absenceMessage) {
                const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
                const debouncedSentMessage = debounce(
                  async () => {
                    const sentMessage = await wbot.sendMessage(
                      `${contact.number}@c.us`,
                      body
                    );
                    verifyMessage(sentMessage, ticket, contact);
                  },
                  3000,
                  ticket.id
                );

                debouncedSentMessage();
              }
            } else {
              //else que retorna a mensagem de fora de expediente do setor
              await UpdateTicketService({
                ticketData: { queueId: choosenQueue.id },
                ticketId: ticket.id
              });

              const chat = await msg.getChat();
              await chat.sendStateTyping();

              const greetingMessage = choosenQueue.greetingMessage;
              if (greetingMessage) {
                const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );

                await verifyMessage(sentMessage, ticket, contact);
              }
            }
          } else {
            //Envia mensagem com setores
            let options = "";

            const chat = await msg.getChat();
            await chat.sendStateTyping();

            queues.forEach((queue, index) => {
              if (queue.startWork && queue.endWork) {
                if (isDisplay) {
                  options += `*${index + 1}* - ${queue.name} das ${queue.startWork
                    } as ${queue.endWork}\n`;
                } else {
                  options += `*${index + 1}* - ${queue.name}\n`;
                }
              } else {
                options += `*${index + 1}* - ${queue.name}\n`;
              }
            });

            const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, ticket);

            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );
                verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );

            debouncedSentMessage();
          }
        } else {
          //envia mensagem de fora do expediente, horario fora
          if (outOfWorkMessage && outOfWorkMessage.trim() !== "") {
            const body = formatBody(`\u200e${outOfWorkMessage}`, ticket);
            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );
                verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );
            debouncedSentMessage();
          }
        }
      } else {
        //envia mensagem de fora do expediente, dia desativado
        if (outOfWorkMessage && outOfWorkMessage !== "") {
          const body = formatBody(`\u200e${outOfWorkMessage}`, ticket);
          const debouncedSentMessage = debounce(
            async () => {
              const sentMessage = await wbot.sendMessage(
                `${contact.number}@c.us`,
                body
              );
              verifyMessage(sentMessage, ticket, contact);
            },
            3000,
            ticket.id
          );
          debouncedSentMessage();
        }
      }
    }
    // Fim Terça_________________________________________________________________________________________________________________

    // Quarta_____________________________________________________________________________________________________________________
    if (diaSemana === 3) {
      diaSemanaStr = "wednesday"
      //if que identifica o dia da semana
      if (wednesday === true) {
        //if que identifica se o dia da semana está ativo
        const hh: number = now.getHours() * 60 * 60;
        const mm: number = now.getMinutes() * 60;
        const hora = hh + mm;

        const start: string = StartDefineWorkHoursWednesday;
        const hhStart = Number(start.split(":")[0]) * 60 * 60;
        const mmStart = Number(start.split(":")[1]) * 60;
        const hoursStart = hhStart + mmStart;

        const startLunch: string = StartDefineWorkHoursWednesdayLunch;
        const hhStartLunch = Number(startLunch.split(":")[0]) * 60 * 60;
        const mmStartLunch = Number(startLunch.split(":")[1]) * 60;
        const hoursStartLunch = hhStartLunch + mmStartLunch;

        const endLunch: string = EndDefineWorkHoursWednesdayLunch;
        const hhEndLunch = Number(endLunch.split(":")[0]) * 60 * 60;
        const mmEndLunch = Number(endLunch.split(":")[1]) * 60;
        const hoursEndLunch = hhEndLunch + mmEndLunch;

        const end: string = EndDefineWorkHoursWednesday;
        const hhEnd = Number(end.split(":")[0]) * 60 * 60;
        const mmEnd = Number(end.split(":")[1]) * 60;
        const hoursEnd = hhEnd + mmEnd;

        if ((hora >= hoursStart && hora < hoursStartLunch) || (hora >= hoursEndLunch && hora < hoursEnd)) {
          //if que identifica se está dentro do horario comerical desse dia em especifico
          if (queues.length === 1) {
            //if que identifica se a conexão tem só 1 setor, se tiver só um envia mensagem de saudação e transfere o chamado para o setor.
            const selectedOption = '1';

            const choosenQueue = queues[+selectedOption - 1];
            if (choosenQueue) {
              const Hr = new Date();

              const hh: number = Hr.getHours() * 60 * 60;
              const mm: number = Hr.getMinutes() * 60;
              const hora = hh + mm;

              const inicio: string = choosenQueue.startWork;
              const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
              const mminicio = Number(inicio.split(":")[1]) * 60;
              const horainicio = hhinicio + mminicio;

              const termino: string = choosenQueue.endWork;
              const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
              const mmtermino = Number(termino.split(":")[1]) * 60;
              const horatermino = hhtermino + mmtermino;

              if (hora < horainicio || hora > horatermino) {
                const absenceMessage = choosenQueue.absenceMessage;
                if (absenceMessage) {
                  const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
                  const debouncedSentMessage = debounce(
                    async () => {
                      const sentMessage = await wbot.sendMessage(
                        `${contact.number}@c.us`,
                        body
                      );
                      verifyMessage(sentMessage, ticket, contact);
                    },
                    3000,
                    ticket.id
                  );

                  debouncedSentMessage();
                }
              } else {
                await UpdateTicketService({
                  ticketData: { queueId: choosenQueue.id },
                  ticketId: ticket.id
                });

                const chat = await msg.getChat();
                await chat.sendStateTyping();
                const greetingMessage = choosenQueue.greetingMessage;
                if (greetingMessage) {
                  const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

                  const sentMessage = await wbot.sendMessage(
                    `${contact.number}@c.us`,
                    body
                  );

                  await verifyMessage(sentMessage, ticket, contact);
                }
              }
            }
            await UpdateTicketService({
              ticketData: { queueId: queues[0].id },
              ticketId: ticket.id
            });
            return;
          }
          const selectedOption = msg.body;
          const choosenQueue = queues[+selectedOption - 1];
          if (choosenQueue) {
            //if que identifica todos os setores selecionados na conexão
            const Hr = new Date();

            const hh: number = Hr.getHours() * 60 * 60;
            const mm: number = Hr.getMinutes() * 60;
            const hora = hh + mm;

            const inicio: string = choosenQueue.startWork;
            const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
            const mminicio = Number(inicio.split(":")[1]) * 60;
            const horainicio = hhinicio + mminicio;

            const termino: string = choosenQueue.endWork;
            const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
            const mmtermino = Number(termino.split(":")[1]) * 60;
            const horatermino = hhtermino + mmtermino;

            if (hora < horainicio || hora > horatermino) {
              const absenceMessage = choosenQueue.absenceMessage;
              if (absenceMessage) {
                const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
                const debouncedSentMessage = debounce(
                  async () => {
                    const sentMessage = await wbot.sendMessage(
                      `${contact.number}@c.us`,
                      body
                    );
                    verifyMessage(sentMessage, ticket, contact);
                  },
                  3000,
                  ticket.id
                );

                debouncedSentMessage();
              }
            } else {
              //else que retorna a mensagem de fora de expediente do setor
              await UpdateTicketService({
                ticketData: { queueId: choosenQueue.id },
                ticketId: ticket.id
              });

              const chat = await msg.getChat();
              await chat.sendStateTyping();

              const greetingMessage = choosenQueue.greetingMessage;
              if (greetingMessage) {
                const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );

                await verifyMessage(sentMessage, ticket, contact);
              }
            }
          } else {
            //Envia mensagem com setores
            let options = "";

            const chat = await msg.getChat();
            await chat.sendStateTyping();

            queues.forEach((queue, index) => {
              if (queue.startWork && queue.endWork) {
                if (isDisplay) {
                  options += `*${index + 1}* - ${queue.name} das ${queue.startWork
                    } as ${queue.endWork}\n`;
                } else {
                  options += `*${index + 1}* - ${queue.name}\n`;
                }
              } else {
                options += `*${index + 1}* - ${queue.name}\n`;
              }
            });

            const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, ticket);

            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );
                verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );

            debouncedSentMessage();
          }
        } else {
          //envia mensagem de fora do expediente, horario fora
          if (outOfWorkMessage && outOfWorkMessage.trim() !== "") {
            const body = formatBody(`\u200e${outOfWorkMessage}`, ticket);
            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );
                verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );
            debouncedSentMessage();
          }
        }
      } else {
        //envia mensagem de fora do expediente, dia desativado
        if (outOfWorkMessage && outOfWorkMessage !== "") {
          const body = formatBody(`\u200e${outOfWorkMessage}`, ticket);
          const debouncedSentMessage = debounce(
            async () => {
              const sentMessage = await wbot.sendMessage(
                `${contact.number}@c.us`,
                body
              );
              verifyMessage(sentMessage, ticket, contact);
            },
            3000,
            ticket.id
          );
          debouncedSentMessage();
        }
      }
    }
    // Fim Quarta_________________________________________________________________________________________________________________

    // Quinta_____________________________________________________________________________________________________________________
    if (diaSemana === 4) {
      diaSemanaStr = "thursday"

      // console.log(thursday)
      //if que identifica o dia da semana
      if (thursday === true) {
        //if que identifica se o dia da semana está ativo
        const hh: number = now.getHours() * 60 * 60;
        const mm: number = now.getMinutes() * 60;
        const hora = hh + mm;

        // console.log(StartDefineWorkHoursThursday)

        const start: string = StartDefineWorkHoursThursday;
        const hhStart = Number(start.split(":")[0]) * 60 * 60;
        const mmStart = Number(start.split(":")[1]) * 60;
        const hoursStart = hhStart + mmStart;

        const startLunch: string = StartDefineWorkHoursThursdayLunch;
        const hhStartLunch = Number(startLunch.split(":")[0]) * 60 * 60;
        const mmStartLunch = Number(startLunch.split(":")[1]) * 60;
        const hoursStartLunch = hhStartLunch + mmStartLunch;

        const endLunch: string = EndDefineWorkHoursThursdayLunch;
        const hhEndLunch = Number(endLunch.split(":")[0]) * 60 * 60;
        const mmEndLunch = Number(endLunch.split(":")[1]) * 60;
        const hoursEndLunch = hhEndLunch + mmEndLunch;

        const end: string = EndDefineWorkHoursThursday;
        const hhEnd = Number(end.split(":")[0]) * 60 * 60;
        const mmEnd = Number(end.split(":")[1]) * 60;
        const hoursEnd = hhEnd + mmEnd;

        // console.log(StartDefineWorkHoursThursday)
        if ((hora >= hoursStart && hora < hoursStartLunch) || (hora >= hoursEndLunch && hora < hoursEnd)) {
          //if que identifica se está dentro do horario comerical desse dia em especifico
          if (queues.length === 1) {
            //if que identifica se a conexão tem só 1 setor, se tiver só um envia mensagem de saudação e transfere o chamado para o setor.
            const selectedOption = '1';

            const choosenQueue = queues[+selectedOption - 1];
            if (choosenQueue) {
              const Hr = new Date();

              const hh: number = Hr.getHours() * 60 * 60;
              const mm: number = Hr.getMinutes() * 60;
              const hora = hh + mm;

              const inicio: string = choosenQueue.startWork;
              const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
              const mminicio = Number(inicio.split(":")[1]) * 60;
              const horainicio = hhinicio + mminicio;

              const termino: string = choosenQueue.endWork;
              const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
              const mmtermino = Number(termino.split(":")[1]) * 60;
              const horatermino = hhtermino + mmtermino;

              if (hora < horainicio || hora > horatermino) {
                const absenceMessage = choosenQueue.absenceMessage;
                if (absenceMessage) {
                  const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
                  const debouncedSentMessage = debounce(
                    async () => {
                      const sentMessage = await wbot.sendMessage(
                        `${contact.number}@c.us`,
                        body
                      );
                      verifyMessage(sentMessage, ticket, contact);
                    },
                    3000,
                    ticket.id
                  );

                  debouncedSentMessage();
                }
              } else {
                await UpdateTicketService({
                  ticketData: { queueId: choosenQueue.id },
                  ticketId: ticket.id
                });

                const chat = await msg.getChat();
                await chat.sendStateTyping();
                const greetingMessage = choosenQueue.greetingMessage;
                if (greetingMessage) {
                  const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

                  const sentMessage = await wbot.sendMessage(
                    `${contact.number}@c.us`,
                    body
                  );

                  await verifyMessage(sentMessage, ticket, contact);
                }
              }
            }
            await UpdateTicketService({
              ticketData: { queueId: queues[0].id },
              ticketId: ticket.id
            });
            return;
          }
          const selectedOption = msg.body;
          const choosenQueue = queues[+selectedOption - 1];
          if (choosenQueue) {
            //if que identifica todos os setores selecionados na conexão
            const Hr = new Date();

            const hh: number = Hr.getHours() * 60 * 60;
            const mm: number = Hr.getMinutes() * 60;
            const hora = hh + mm;

            const inicio: string = choosenQueue.startWork;
            const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
            const mminicio = Number(inicio.split(":")[1]) * 60;
            const horainicio = hhinicio + mminicio;

            const termino: string = choosenQueue.endWork;
            const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
            const mmtermino = Number(termino.split(":")[1]) * 60;
            const horatermino = hhtermino + mmtermino;

            if (hora < horainicio || hora > horatermino) {
              const absenceMessage = choosenQueue.absenceMessage;
              if (absenceMessage) {
                const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
                const debouncedSentMessage = debounce(
                  async () => {
                    const sentMessage = await wbot.sendMessage(
                      `${contact.number}@c.us`,
                      body
                    );
                    verifyMessage(sentMessage, ticket, contact);
                  },
                  3000,
                  ticket.id
                );

                debouncedSentMessage();
              }
            } else {
              //else que retorna a mensagem de fora de expediente do setor
              await UpdateTicketService({
                ticketData: { queueId: choosenQueue.id },
                ticketId: ticket.id
              });

              const chat = await msg.getChat();
              await chat.sendStateTyping();

              const greetingMessage = choosenQueue.greetingMessage;
              if (greetingMessage) {
                const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );

                await verifyMessage(sentMessage, ticket, contact);
              }
            }
          } else {
            //Envia mensagem com setores
            let options = "";

            const chat = await msg.getChat();
            await chat.sendStateTyping();

            queues.forEach((queue, index) => {
              if (queue.startWork && queue.endWork) {
                if (isDisplay) {
                  options += `*${index + 1}* - ${queue.name} das ${queue.startWork
                    } as ${queue.endWork}\n`;
                } else {
                  options += `*${index + 1}* - ${queue.name}\n`;
                }
              } else {
                options += `*${index + 1}* - ${queue.name}\n`;
              }
            });

            const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, ticket);

            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );
                verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );

            debouncedSentMessage();
          }
        } else {
          //envia mensagem de fora do expediente, horario fora
          if (outOfWorkMessage && outOfWorkMessage.trim() !== "") {
            const body = formatBody(`\u200e${outOfWorkMessage}`, ticket);
            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );
                verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );
            debouncedSentMessage();
          }
        }
      } else {
        //envia mensagem de fora do expediente, dia desativado
        if (outOfWorkMessage && outOfWorkMessage !== "") {
          const body = formatBody(`\u200e${outOfWorkMessage}`, ticket);
          const debouncedSentMessage = debounce(
            async () => {
              const sentMessage = await wbot.sendMessage(
                `${contact.number}@c.us`,
                body
              );
              verifyMessage(sentMessage, ticket, contact);
            },
            3000,
            ticket.id
          );
          debouncedSentMessage();
        }
      }
    }
    // Fim Quinta_________________________________________________________________________________________________________________

    // Sexta_________________________________________________________________________________________________________________
    if (diaSemana === 5) {
      diaSemanaStr = "friday"
      //if que identifica o dia da semana
      if (friday === true) {
        //if que identifica se o dia da semana está ativo
        const hh: number = now.getHours() * 60 * 60;
        const mm: number = now.getMinutes() * 60;
        const hora = hh + mm;

        const start: string = StartDefineWorkHoursFriday;
        const hhStart = Number(start.split(":")[0]) * 60 * 60;
        const mmStart = Number(start.split(":")[1]) * 60;
        const hoursStart = hhStart + mmStart;

        const startLunch: string = StartDefineWorkHoursFridayLunch;
        const hhStartLunch = Number(startLunch.split(":")[0]) * 60 * 60;
        const mmStartLunch = Number(startLunch.split(":")[1]) * 60;
        const hoursStartLunch = hhStartLunch + mmStartLunch;

        const endLunch: string = EndDefineWorkHoursFridayLunch;
        const hhEndLunch = Number(endLunch.split(":")[0]) * 60 * 60;
        const mmEndLunch = Number(endLunch.split(":")[1]) * 60;
        const hoursEndLunch = hhEndLunch + mmEndLunch;

        const end: string = EndDefineWorkHoursFriday;
        const hhEnd = Number(end.split(":")[0]) * 60 * 60;
        const mmEnd = Number(end.split(":")[1]) * 60;
        const hoursEnd = hhEnd + mmEnd;

        if ((hora >= hoursStart && hora < hoursStartLunch) || (hora >= hoursEndLunch && hora < hoursEnd)) {
          //if que identifica se está dentro do horario comerical desse dia em especifico
          if (queues.length === 1) {
            //if que identifica se a conexão tem só 1 setor, se tiver só um envia mensagem de saudação e transfere o chamado para o setor.
            const selectedOption = '1';

            const choosenQueue = queues[+selectedOption - 1];
            if (choosenQueue) {
              const Hr = new Date();

              const hh: number = Hr.getHours() * 60 * 60;
              const mm: number = Hr.getMinutes() * 60;
              const hora = hh + mm;

              const inicio: string = choosenQueue.startWork;
              const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
              const mminicio = Number(inicio.split(":")[1]) * 60;
              const horainicio = hhinicio + mminicio;

              const termino: string = choosenQueue.endWork;
              const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
              const mmtermino = Number(termino.split(":")[1]) * 60;
              const horatermino = hhtermino + mmtermino;

              if (hora < horainicio || hora > horatermino) {
                const absenceMessage = choosenQueue.absenceMessage;
                if (absenceMessage) {
                  const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
                  const debouncedSentMessage = debounce(
                    async () => {
                      const sentMessage = await wbot.sendMessage(
                        `${contact.number}@c.us`,
                        body
                      );
                      verifyMessage(sentMessage, ticket, contact);
                    },
                    3000,
                    ticket.id
                  );

                  debouncedSentMessage();
                }
              } else {
                await UpdateTicketService({
                  ticketData: { queueId: choosenQueue.id },
                  ticketId: ticket.id
                });

                const chat = await msg.getChat();
                await chat.sendStateTyping();
                const greetingMessage = choosenQueue.greetingMessage;
                if (greetingMessage) {
                  const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

                  const sentMessage = await wbot.sendMessage(
                    `${contact.number}@c.us`,
                    body
                  );

                  await verifyMessage(sentMessage, ticket, contact);
                }
              }
            }
            await UpdateTicketService({
              ticketData: { queueId: queues[0].id },
              ticketId: ticket.id
            });
            return;
          }
          const selectedOption = msg.body;
          const choosenQueue = queues[+selectedOption - 1];
          if (choosenQueue) {
            //if que identifica todos os setores selecionados na conexão
            const Hr = new Date();

            const hh: number = Hr.getHours() * 60 * 60;
            const mm: number = Hr.getMinutes() * 60;
            const hora = hh + mm;

            const inicio: string = choosenQueue.startWork;
            const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
            const mminicio = Number(inicio.split(":")[1]) * 60;
            const horainicio = hhinicio + mminicio;

            const termino: string = choosenQueue.endWork;
            const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
            const mmtermino = Number(termino.split(":")[1]) * 60;
            const horatermino = hhtermino + mmtermino;

            if (hora < horainicio || hora > horatermino) {
              const absenceMessage = choosenQueue.absenceMessage;
              if (absenceMessage) {
                const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
                const debouncedSentMessage = debounce(
                  async () => {
                    const sentMessage = await wbot.sendMessage(
                      `${contact.number}@c.us`,
                      body
                    );
                    verifyMessage(sentMessage, ticket, contact);
                  },
                  3000,
                  ticket.id
                );

                debouncedSentMessage();
              }
            } else {
              //else que retorna a mensagem de fora de expediente do setor
              await UpdateTicketService({
                ticketData: { queueId: choosenQueue.id },
                ticketId: ticket.id
              });

              const chat = await msg.getChat();
              await chat.sendStateTyping();

              const greetingMessage = choosenQueue.greetingMessage;
              if (greetingMessage) {
                const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );

                await verifyMessage(sentMessage, ticket, contact);
              }
            }
          } else {
            //Envia mensagem com setores
            let options = "";

            const chat = await msg.getChat();
            await chat.sendStateTyping();

            queues.forEach((queue, index) => {
              if (queue.startWork && queue.endWork) {
                if (isDisplay) {
                  options += `*${index + 1}* - ${queue.name} das ${queue.startWork
                    } as ${queue.endWork}\n`;
                } else {
                  options += `*${index + 1}* - ${queue.name}\n`;
                }
              } else {
                options += `*${index + 1}* - ${queue.name}\n`;
              }
            });

            const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, ticket);

            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );
                verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );

            debouncedSentMessage();
          }
        } else {
          //envia mensagem de fora do expediente, horario fora
          if (outOfWorkMessage && outOfWorkMessage.trim() !== "") {
            const body = formatBody(`\u200e${outOfWorkMessage}`, ticket);
            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );
                verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );
            debouncedSentMessage();
          }
        }
      } else {
        //envia mensagem de fora do expediente, dia desativado
        if (outOfWorkMessage && outOfWorkMessage !== "") {
          const body = formatBody(`\u200e${outOfWorkMessage}`, ticket);
          const debouncedSentMessage = debounce(
            async () => {
              const sentMessage = await wbot.sendMessage(
                `${contact.number}@c.us`,
                body
              );
              verifyMessage(sentMessage, ticket, contact);
            },
            3000,
            ticket.id
          );
          debouncedSentMessage();
        }
      }
    }
    // Fim Sexta_________________________________________________________________________________________________________________

    // Sabado_________________________________________________________________________________________________________________
    if (diaSemana === 6) {
      diaSemanaStr = "saturday"
      //if que identifica o dia da semana
      if (saturday === true) {
        //if que identifica se o dia da semana está ativo
        const hh: number = now.getHours() * 60 * 60;
        const mm: number = now.getMinutes() * 60;
        const hora = hh + mm;

        const start: string = StartDefineWorkHoursSaturday;
        const hhStart = Number(start.split(":")[0]) * 60 * 60;
        const mmStart = Number(start.split(":")[1]) * 60;
        const hoursStart = hhStart + mmStart;

        const startLunch: string = StartDefineWorkHoursSaturdayLunch;
        const hhStartLunch = Number(startLunch.split(":")[0]) * 60 * 60;
        const mmStartLunch = Number(startLunch.split(":")[1]) * 60;
        const hoursStartLunch = hhStartLunch + mmStartLunch;

        const endLunch: string = EndDefineWorkHoursSaturdayLunch;
        const hhEndLunch = Number(endLunch.split(":")[0]) * 60 * 60;
        const mmEndLunch = Number(endLunch.split(":")[1]) * 60;
        const hoursEndLunch = hhEndLunch + mmEndLunch;

        const end: string = EndDefineWorkHoursSaturday;
        const hhEnd = Number(end.split(":")[0]) * 60 * 60;
        const mmEnd = Number(end.split(":")[1]) * 60;
        const hoursEnd = hhEnd + mmEnd;

        if ((hora >= hoursStart && hora < hoursStartLunch) || (hora >= hoursEndLunch && hora < hoursEnd)) {
          //if que identifica se está dentro do horario comerical desse dia em especifico
          if (queues.length === 1) {
            //if que identifica se a conexão tem só 1 setor, se tiver só um envia mensagem de saudação e transfere o chamado para o setor.
            const selectedOption = '1';

            const choosenQueue = queues[+selectedOption - 1];
            if (choosenQueue) {
              const Hr = new Date();

              const hh: number = Hr.getHours() * 60 * 60;
              const mm: number = Hr.getMinutes() * 60;
              const hora = hh + mm;

              const inicio: string = choosenQueue.startWork;
              const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
              const mminicio = Number(inicio.split(":")[1]) * 60;
              const horainicio = hhinicio + mminicio;

              const termino: string = choosenQueue.endWork;
              const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
              const mmtermino = Number(termino.split(":")[1]) * 60;
              const horatermino = hhtermino + mmtermino;

              if (hora < horainicio || hora > horatermino) {
                const absenceMessage = choosenQueue.absenceMessage;
                if (absenceMessage) {
                  const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
                  const debouncedSentMessage = debounce(
                    async () => {
                      const sentMessage = await wbot.sendMessage(
                        `${contact.number}@c.us`,
                        body
                      );
                      verifyMessage(sentMessage, ticket, contact);
                    },
                    3000,
                    ticket.id
                  );

                  debouncedSentMessage();
                }
              } else {
                await UpdateTicketService({
                  ticketData: { queueId: choosenQueue.id },
                  ticketId: ticket.id
                });

                const chat = await msg.getChat();
                await chat.sendStateTyping();
                const greetingMessage = choosenQueue.greetingMessage;
                if (greetingMessage) {
                  const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

                  const sentMessage = await wbot.sendMessage(
                    `${contact.number}@c.us`,
                    body
                  );

                  await verifyMessage(sentMessage, ticket, contact);
                }
              }
            }
            await UpdateTicketService({
              ticketData: { queueId: queues[0].id },
              ticketId: ticket.id
            });
            return;
          }
          const selectedOption = msg.body;
          const choosenQueue = queues[+selectedOption - 1];
          if (choosenQueue) {
            //if que identifica todos os setores selecionados na conexão
            const Hr = new Date();

            const hh: number = Hr.getHours() * 60 * 60;
            const mm: number = Hr.getMinutes() * 60;
            const hora = hh + mm;

            const inicio: string = choosenQueue.startWork;
            const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
            const mminicio = Number(inicio.split(":")[1]) * 60;
            const horainicio = hhinicio + mminicio;

            const termino: string = choosenQueue.endWork;
            const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
            const mmtermino = Number(termino.split(":")[1]) * 60;
            const horatermino = hhtermino + mmtermino;

            if (hora < horainicio || hora > horatermino) {
              const absenceMessage = choosenQueue.absenceMessage;
              if (absenceMessage) {
                const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
                const debouncedSentMessage = debounce(
                  async () => {
                    const sentMessage = await wbot.sendMessage(
                      `${contact.number}@c.us`,
                      body
                    );
                    verifyMessage(sentMessage, ticket, contact);
                  },
                  3000,
                  ticket.id
                );

                debouncedSentMessage();
              }
            } else {
              //else que retorna a mensagem de fora de expediente do setor
              await UpdateTicketService({
                ticketData: { queueId: choosenQueue.id },
                ticketId: ticket.id
              });

              const chat = await msg.getChat();
              await chat.sendStateTyping();

              const greetingMessage = choosenQueue.greetingMessage;
              if (greetingMessage) {
                const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );

                await verifyMessage(sentMessage, ticket, contact);
              }
            }
          } else {
            //Envia mensagem com setores
            let options = "";

            const chat = await msg.getChat();
            await chat.sendStateTyping();

            queues.forEach((queue, index) => {
              if (queue.startWork && queue.endWork) {
                if (isDisplay) {
                  options += `*${index + 1}* - ${queue.name} das ${queue.startWork
                    } as ${queue.endWork}\n`;
                } else {
                  options += `*${index + 1}* - ${queue.name}\n`;
                }
              } else {
                options += `*${index + 1}* - ${queue.name}\n`;
              }
            });

            const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, ticket);

            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );
                verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );

            debouncedSentMessage();
          }
        } else {
          //envia mensagem de fora do expediente, horario fora
          if (outOfWorkMessage && outOfWorkMessage.trim() !== "") {
            const body = formatBody(`\u200e${outOfWorkMessage}`, ticket);
            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );
                verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );
            debouncedSentMessage();
          }
        }
      } else {
        //envia mensagem de fora do expediente, dia desativado
        if (outOfWorkMessage && outOfWorkMessage !== "") {
          const body = formatBody(`\u200e${outOfWorkMessage}`, ticket);
          const debouncedSentMessage = debounce(
            async () => {
              const sentMessage = await wbot.sendMessage(
                `${contact.number}@c.us`,
                body
              );
              verifyMessage(sentMessage, ticket, contact);
            },
            3000,
            ticket.id
          );
          debouncedSentMessage();
        }
      }
    }
    // Fim sabado_________________________________________________________________________________________________________________

    // console.log(diaSemanaStr);
    return;
  }
  if (queues.length === 1) {
    const selectedOption = '1';

    const choosenQueue = queues[+selectedOption - 1];

    if (choosenQueue) {
      const Hr = new Date();

      const hh: number = Hr.getHours() * 60 * 60;
      const mm: number = Hr.getMinutes() * 60;
      const hora = hh + mm;

      const inicio: string = choosenQueue.startWork;
      const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
      const mminicio = Number(inicio.split(":")[1]) * 60;
      const horainicio = hhinicio + mminicio;

      const termino: string = choosenQueue.endWork;
      const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
      const mmtermino = Number(termino.split(":")[1]) * 60;
      const horatermino = hhtermino + mmtermino;

      if (hora < horainicio || hora > horatermino) {
        const absenceMessage = choosenQueue.absenceMessage;
        if (absenceMessage) {
          const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
          const debouncedSentMessage = debounce(
            async () => {
              const sentMessage = await wbot.sendMessage(
                `${contact.number}@c.us`,
                body
              );
              verifyMessage(sentMessage, ticket, contact);
            },
            3000,
            ticket.id
          );

          debouncedSentMessage();
        }
      } else {
        await UpdateTicketService({
          ticketData: { queueId: choosenQueue.id },
          ticketId: ticket.id
        });

        const chat = await msg.getChat();
        await chat.sendStateTyping();
        const greetingMessage = choosenQueue.greetingMessage;
        if (greetingMessage) {
          const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

          const sentMessage = await wbot.sendMessage(
            `${contact.number}@c.us`,
            body
          );

          await verifyMessage(sentMessage, ticket, contact);
        }
      }
    }

    await UpdateTicketService({
      ticketData: { queueId: queues[0].id },
      ticketId: ticket.id
    });

    return;
  }
  const selectedOption = msg.body;
  const choosenQueue = queues[+selectedOption - 1];
  if (choosenQueue) {
    const Hr = new Date();

    const hh: number = Hr.getHours() * 60 * 60;
    const mm: number = Hr.getMinutes() * 60;
    const hora = hh + mm;

    const inicio: string = choosenQueue.startWork;
    const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
    const mminicio = Number(inicio.split(":")[1]) * 60;
    const horainicio = hhinicio + mminicio;

    const termino: string = choosenQueue.endWork;
    const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
    const mmtermino = Number(termino.split(":")[1]) * 60;
    const horatermino = hhtermino + mmtermino;

    if (hora < horainicio || hora > horatermino) {
      const absenceMessage = choosenQueue.absenceMessage;
      if (absenceMessage) {
        const body = formatBody(`\u200e${choosenQueue.absenceMessage}`, ticket);
        const debouncedSentMessage = debounce(
          async () => {
            const sentMessage = await wbot.sendMessage(
              `${contact.number}@c.us`,
              body
            );
            verifyMessage(sentMessage, ticket, contact);
          },
          3000,
          ticket.id
        );

        debouncedSentMessage();
      }
    } else {
      await UpdateTicketService({
        ticketData: { queueId: choosenQueue.id },
        ticketId: ticket.id
      });

      const chat = await msg.getChat();
      await chat.sendStateTyping();
      const greetingMessage = choosenQueue.greetingMessage;
      if (greetingMessage) {
        const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket);

        const sentMessage = await wbot.sendMessage(
          `${contact.number}@c.us`,
          body
        );

        await verifyMessage(sentMessage, ticket, contact);
      }
    }
  } else {
    let options = "";

    const chat = await msg.getChat();
    await chat.sendStateTyping();

    queues.forEach((queue, index) => {
      if (queue.startWork && queue.endWork) {
        if (isDisplay) {
          options += `*${index + 1}* - ${queue.name} das ${queue.startWork
            } as ${queue.endWork}\n`;
        } else {
          options += `*${index + 1}* - ${queue.name}\n`;
        }
      } else {
        options += `*${index + 1}* - ${queue.name}\n`;
      }
    });

    const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, ticket);

    const debouncedSentMessage = debounce(
      async () => {
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@c.us`,
          body
        );
        verifyMessage(sentMessage, ticket, contact);
      },
      3000,
      ticket.id
    );

    debouncedSentMessage();
  }
};

const isValidMsg = (msg: WbotMessage): boolean => {
  if (msg.from === "status@broadcast") return false;
  if (
    msg.type === "chat" ||
    msg.type === "audio" ||
    msg.type === "ptt" ||
    msg.type === "video" ||
    msg.type === "image" ||
    msg.type === "document" ||
    msg.type === "vcard" ||
    msg.type === "call_log" ||
    // msg.type === "multi_vcard" ||
    msg.type === "sticker" ||
    msg.type === "e2e_notification" || // Ignore Empty Messages Generated When Someone Changes His Account from Personal to Business or vice-versa
    msg.type === "notification_template" || // Ignore Empty Messages Generated When Someone Changes His Account from Personal to Business or vice-versa
    msg.author !== null || // Ignore Group Messages
    msg.type === "location"
  )
    return true;
  return false;
};

const handleMessage = async (
  msg: WbotMessage,
  wbot: Session
): Promise<void> => {
  if (!isValidMsg(msg)) {
    return;
  }
  const showMessageGroupConnection = await ShowWhatsAppService(wbot.id!);

  // IGNORAR MENSAGENS DE GRUPO
  const Settingdb = await Settings.findOne({
    where: { key: "CheckMsgIsGroup" }
  });
  if (showMessageGroupConnection.isGroup) {
  }
  else if (Settingdb?.value === "enabled" || !showMessageGroupConnection.isGroup) {
    const chat = await msg.getChat();
    if (
      msg.type === "sticker" ||
      msg.type === "e2e_notification" ||
      msg.type === "notification_template" ||
      msg.from === "status@broadcast" ||
      // msg.author === null ||
      chat.isGroup
    ) {
      return;
    }
  }

  // IGNORAR MENSAGENS DE GRUPO

  try {
    let msgContact: WbotContact;
    let groupContact: Contact | undefined;
    let queueId: number = 0;
    let tagsId: number = 0;
    let userId: number = 0;
    let isBody: boolean = false;

    // console.log(msg)
    if (msg.fromMe) {
      // messages sent automatically by wbot have a special character in front of it
      // if so, this message was already been stored in database;

      isBody = /\u200e/.test(msg.body[0]);
      console.log("ISBODY  " + isBody)
      if (isBody) return;
      // media messages sent from me from cell phone, first comes with "hasMedia = false" and type = "image/ptt/etc"
      // in this case, return and let this message be handled by "media_uploaded" event, when it will have "hasMedia = true"

      if (
        !msg.hasMedia &&
        msg.type !== "location" &&
        msg.type !== "chat" &&
        msg.type !== "vcard"
        //  && msg.type !== "multi_vcard"
      )
        return;

      msgContact = await wbot.getContactById(msg.to);
    } else {
      const listSettingsService = await ListSettingsServiceOne({ key: "call" });
      var callSetting = listSettingsService?.value;

      msgContact = await msg.getContact();
    }

    const chat = await msg.getChat();

    if (chat.isGroup) {
      let msgGroupContact;

      if (msg.fromMe) {
        msgGroupContact = await wbot.getContactById(msg.to);
      } else {
        msgGroupContact = await wbot.getContactById(msg.from);
      }

      groupContact = await verifyContact(msgGroupContact);
    }
    const whatsapp = await ShowWhatsAppService(wbot.id!);

    const unreadMessages = msg.fromMe ? 0 : chat.unreadCount;

    const contact = await verifyContact(msgContact);

    // console.log("OUTRO TESTE " + unreadMessages)
    let ticket = await FindOrCreateTicketService(
      contact,
      wbot.id!,
      unreadMessages,
      queueId,
      tagsId,
      userId,
      groupContact
    );


    if (
      (unreadMessages === 0 &&
        whatsapp.farewellMessage &&
        formatBody(whatsapp.farewellMessage, ticket) === msg.body)) {
      console.log("entrou aquii IF 2193")
      return;
    }


    ticket = await FindOrCreateTicketService(
      contact,
      wbot.id!,
      unreadMessages,
      queueId,
      tagsId,
      userId,
      groupContact
    );

    if (msg.body === "#" && ticket.userId === null) {
      await ticket.update({
        queueOptionId: null,
        chatbot: true,
        queueId: null,
      });
      await verifyQueue(wbot, msg, ticket, ticket.contact);
      return;
    }

    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      whatsappId: whatsapp?.id,
      userId: ticket.userId
    });

    try {
      if (!msg.fromMe) {
        if (ticketTraking !== null && verifyRating(ticketTraking) && whatsapp.ratingMessage) {
          let rate = +msg.body;
          //testa se o usuário digitou uma avaliação numérica, se não enviou, envia novametne a mensagem de avaliação
          if (!Number.isNaN(rate) && Number.isInteger(rate) && !isNull(rate)) {
            handleRating(msg, ticket, ticketTraking);
            return;
          }
          else {
            let bodyRatingMessage = `\u200e${whatsapp.ratingMessage}\n`;

            const msg = await SendWhatsAppMessage({ body: bodyRatingMessage, ticket });

            await verifyMessage(msg, ticket, ticket.contact);

            return;
          }
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

    if (msg.hasMedia) {
      await verifyMediaMessage(msg, ticket, contact);
    } else {
      await verifyMessage(msg, ticket, contact);
    }

    if (
      !ticket.queue &&
      !chat.isGroup &&
      !msg.fromMe &&
      !ticket.userId &&
      whatsapp.queues.length >= 1
    ) {
      await verifyQueue(wbot, msg, ticket, contact);
    }

    // Atualiza o ticket se a ultima mensagem foi enviada por mim, para que possa ser finalizado. Se for grupo, nao finaliza
    try {
      // console.log("FROMME"+ msg.fromMe+" GRUPO "+(await msg.getChat()).isGroup)

      await ticket.update({
        fromMe: msg.fromMe,
        isMsgGroup: chat.isGroup
      });
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

    if (msg.type === "vcard") {
      try {
        const array = msg.body.split("\n");
        const obj = [];
        // eslint-disable-next-line no-shadow
        let contact = "";
        for (let index = 0; index < array.length; index++) {
          const v = array[index];
          const values = v.split(":");
          for (let ind = 0; ind < values.length; ind++) {
            if (values[ind].indexOf("+") !== -1) {
              obj.push({ number: values[ind] });
            }
            if (values[ind].indexOf("FN") !== -1) {
              contact = values[ind + 1];
            }
          }
        }
        // eslint-disable-next-line no-restricted-syntax
        for await (const ob of obj) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const cont = await CreateContactService({
            name: contact,
            number: ob.number.replace(/\D/g, "")
          });
        }
      } catch (error) {
        console.log(error);
      }
    }

    /* if (msg.type === "multi_vcard") {
                  try {
                    const array = msg.vCards.toString().split("\n");
                    let name = "";
                    let number = "";
                    const obj = [];
                    const conts = [];
                    for (let index = 0; index < array.length; index++) {
                      const v = array[index];
                      const values = v.split(":");
                      for (let ind = 0; ind < values.length; ind++) {
                        if (values[ind].indexOf("+") !== -1) {
                          number = values[ind];
                        }
                        if (values[ind].indexOf("FN") !== -1) {
                          name = values[ind + 1];
                        }
                        if (name !== "" && number !== "") {
                          obj.push({
                            name,
                            number
                          });
                          name = "";
                          number = "";
                        }
                      }
                    }

                    // eslint-disable-next-line no-restricted-syntax
                    for await (const ob of obj) {
                      try {
                        const cont = await CreateContactService({
                          name: ob.name,
                          number: ob.number.replace(/\D/g, "")
                        });
                        conts.push({
                          id: cont.id,
                          name: cont.name,
                          number: cont.number
                        });
                      } catch (error) {
                        if (error.message === "ERR_DUPLICATED_CONTACT") {
                          const cont = await GetContactService({
                            name: ob.name,
                            number: ob.number.replace(/\D/g, ""),
                            email: ""
                          });
                          conts.push({
                            id: cont.id,
                            name: cont.name,
                            number: cont.number
                          });
                        }
                      }
                    }
                    msg.body = JSON.stringify(conts);
                  } catch (error) {
                    console.log(error);
                  }
                } */

    // eslint-disable-next-line block-scoped-var
    if (msg.type === "call_log" && callSetting === "disabled") {
      const sentMessage = await wbot.sendMessage(
        `${contact.number}@c.us`,
        "*Mensagem Automática:*\nAs chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto. Obrigado"
      );
      await verifyMessage(sentMessage, ticket, contact);
    }
    const profilePicUrl = await msgContact.getProfilePicUrl();
    const contactData = {
      name: msgContact.name || msgContact.pushname || msgContact.id.user,
      number: msgContact.id.user,
      profilePicUrl,
      isGroup: msgContact.isGroup
    };
    // console.log(profilePicUrl)
    await CreateOrUpdateContactService(contactData);
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling whatsapp message: Err: ${err}`);
  }
};

export const verifyRating = (ticketTraking: TicketTraking) => {
  if (
    ticketTraking &&
    ticketTraking.finishedAt === null &&
    ticketTraking.closedAt !== null &&
    ticketTraking.userId !== null &&
    ticketTraking.ratingAt === null
  ) {
    return true;
  }
  return false;
};



const handleRating = async (msg: WbotMessage, ticket: Ticket, ticketTraking: TicketTraking) => {
  const io = getIO();
  let rate: number | null = null;

  const bodyMessage = msg.body;
  const { farewellMessage, ratingMessage } = await ShowWhatsAppService(ticket.whatsappId);


  if (bodyMessage) {
    rate = +bodyMessage;
  }

  if (!Number.isNaN(rate) && Number.isInteger(rate) && !isNull(rate)) {

    let finalRate = rate;

    if (rate < 0) {
      finalRate = 0;
    }
    if (rate > 10) {
      finalRate = 10;
    }



    await UserRating.create({
      ticketId: ticketTraking.ticketId,
      userId: ticketTraking.userId,
      rate: finalRate,
    });

    // await record?.update({ rate: finalRate });

    if (farewellMessage.trim() !== '') {
      const body = `\u200e${farewellMessage}`;

      await SendWhatsAppMessage({ body, ticket });
    }
    await ticketTraking.update({
      ratingAt: moment().toDate(),
      finishedAt: moment().toDate(),
      rated: true,
    });

    await ticket.update({
      status: "closed"
    });


    io.to("open").emit(`ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });

    io.to(ticket.status).to(ticket.id.toString()).emit(`ticket`, {
      action: "update",
      ticket,
      ticketId: ticket.id
    });
  }
};

const handleMsgAck = async (msg: WbotMessage, ack: MessageAck) => {
  await new Promise(r => setTimeout(r, 1000));

  const io = getIO();

  // console.log("entrou no ack" + msg.body)
  try {
    const messageToUpdate = await Message.findByPk(msg.id.id, {
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        }
      ]
    });

    if (!messageToUpdate) {
      return;
    }
    await messageToUpdate.update({ ack });

    io.to(messageToUpdate.ticketId.toString()).emit("appMessage", {
      action: "update",
      message: messageToUpdate
    });
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling message ack. Err: ${err}`);
  }
};

const wbotMessageListener = async (wbot: Session): Promise<void> => {
  wbot.on("message_create", async msg => {
    handleMessage(msg, wbot);
  });

  wbot.on("media_uploaded", async msg => {
    handleMessage(msg, wbot);
  });

  wbot.on("message_ack", async (msg, ack) => {
    handleMsgAck(msg, ack);
  });

  wbot.on("message_revoke_everyone", async (after, before) => {

    const msgBody: string | undefined = before?.body;
    if (msgBody !== undefined) {
      verifyRevoked(msgBody || "");
    }
  });
};

export { wbotMessageListener, handleMessage, handleMsgAck };