import Email from "../../models/Email";
import Whatsapp from "../../models/Whatsapp";
import { createNotificameClient } from "../../libs/notificameClient";
import { showHubToken } from "../../helpers/showHubToken";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";

require("dotenv").config();

interface EmailAttachmentInput {
  fileUrl: string;
  fileName: string;
}

interface SendEmailParams {
  whatsappId: number;
  to: string;
  subject: string;
  htmlBody?: string;
  textBody?: string;
  attachments?: EmailAttachmentInput[];
}

export const SendEmailHubService = async ({
  whatsappId,
  to,
  subject,
  htmlBody,
  textBody,
  attachments
}: SendEmailParams): Promise<Email> => {
  const connection = await Whatsapp.findByPk(whatsappId);

  if (!connection) {
    throw new Error(`Conexão ${whatsappId} não encontrada.`);
  }

  if (connection.type !== "email") {
    throw new Error(
      `Conexão ${whatsappId} não é do tipo email (type="${connection.type}").`
    );
  }

  if (connection.status !== "CONNECTED") {
    throw new Error(
      `Conexão de email "${connection.name}" não está conectada (status="${connection.status}").`
    );
  }

  const cleanHtml = htmlBody
    ? `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${htmlBody}</body></html>`
    : `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><p>${textBody || ""}</p></body></html>`;

  const hubToken = await showHubToken();
  const client = createNotificameClient(hubToken);

  const payload = {
    from: connection.qrcode,
    to,
    contents: [
      {
        type: "email",
        subject: subject || "",
        html: cleanHtml,
        attachments: attachments && attachments.length > 0 ? attachments : []
      }
    ]
  };

  try {
    const response = await client.post("/v1/channels/email/messages", payload);
    const data = response.data;

    const email = await Email.create({
      messageId: data?.id || undefined,
      whatsappId,
      contactId: undefined,
      direction: "out",
      fromAddress: connection.qrcode,
      toAddress: to,
      subject: subject || undefined,
      bodyHtml: htmlBody || undefined,
      bodyText:
        textBody ||
        (htmlBody ? htmlBody.slice(0, 500_000).replace(/<[^>]+>/g, " ").trim() : undefined),
      folder: "sent",
      isRead: true
    });

    logger.info(`SendEmailHubService: email ${email.id} salvo em "sent"`);

    const io = getIO();
    io.emit("email:sent", {
      action: "create",
      email,
      whatsappId
    });

    return email;
  } catch (error) {
    logger.error(`SendEmailHubService: erro ao enviar email: ${error}`);
    throw error;
  }
};
