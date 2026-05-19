import axios from "axios";
import {
  createNotificameClient,
  resolveChannel,
  resolveContactId,
  NotificameMessagePayload
} from "../../libs/notificameClient";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Whatsapp from "../../models/Whatsapp";
import CreateMessageService from "./CreateHubMessageService";
import { showHubToken } from "../../helpers/showHubToken";
import { logger } from "../../utils/logger";

require("dotenv").config();

export interface HubQuickReplyButton {
  label: string;
}

export const SendReplyableTextService = async (
  text: string,
  quickReplyButtons: HubQuickReplyButton[],
  ticketId: number,
  contact: Contact,
  connection: Whatsapp,
  commentMessageId?: string
): Promise<Message | undefined> => {
  if (connection.type === "wwebjs") {
    throw new Error("Envio de respostas rápidas não suportado neste canal.");
  }

  if (!text?.trim()) {
    throw new Error("O texto da mensagem é obrigatório.");
  }

  const channel = resolveChannel(contact);
  if (!channel || channel === "webchat") {
    logger.error(
      "SendReplyableTextService: requer canal facebook, instagram ou telegram."
    );
    throw new Error("Envio de respostas rápidas não suportado neste canal.");
  }

  const contactId = resolveContactId(contact, channel);
  if (!contactId) {
    throw new Error(
      `SendReplyableTextService: ID do destinatário não encontrado para canal ${channel}`
    );
  }

  const hubToken = await showHubToken();
  const client = createNotificameClient(hubToken);

  // Instagram comment reply: use reply_text with messsageId (3 "s" — typo intencional da API)
  const isInstagramCommentReply = channel === "instagram" && !!commentMessageId;

  const contents = isInstagramCommentReply
    ? [{ type: "reply_text" as const, messsageId: commentMessageId, text }]
    : [
        {
          type: "template" as const,
          template: {
            template_type: "button",
            text,
            buttons: quickReplyButtons.map(b => ({
              type: "postback",
              payload: b.label,
              title: b.label
            }))
          }
        }
      ];

  if (!isInstagramCommentReply && !quickReplyButtons?.length) {
    throw new Error("Informe pelo menos um botão de resposta rápida.");
  }

  const payload: NotificameMessagePayload = {
    from: connection.qrcode,
    to: contactId,
    contents
  };

  try {
    const response = await client.post(
      `/v1/channels/${channel}/messages`,
      payload
    );
    const data = response.data;

    const newMessage = await CreateMessageService({
      id: data.id,
      contactId: contact.id,
      body: text,
      ticketId,
      fromMe: true
    });

    return newMessage;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errBody = axios.isAxiosError(error)
      ? (error.response?.data ?? error.response?.headers)
      : undefined;
    logger.error(
      `SendReplyableTextService: erro ao enviar replyable-text Hub: ${errMsg}`
    );
    if (errBody)
      logger.error(`Hub API response body: ${JSON.stringify(errBody)}`);
    throw error;
  }
};
