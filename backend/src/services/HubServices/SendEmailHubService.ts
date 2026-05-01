import Email from "../../models/Email";
import Whatsapp from "../../models/Whatsapp";
import { showHubToken } from "../../helpers/showHubToken";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";

require("dotenv").config();
const { Client, EmailContent } = require("notificamehubsdk");

interface SendEmailParams {
  whatsappId: number;
  to: string;
  subject: string;
  htmlBody?: string;
  textBody?: string;
}

export const SendEmailHubService = async ({
  whatsappId,
  to,
  subject,
  htmlBody,
  textBody
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

  const body = htmlBody || textBody || "";

  logger.info(
    `SendEmailHubService: enviando para ${to} via conta ${connection.qrcode}`
  );

  const notificameHubToken = await showHubToken();
  const client = new Client(notificameHubToken);
  const emailChannel = client.setChannel("email");

  const content = new EmailContent(subject, [], body);

  try {
    emailChannel.contentSupportValidation(content);

    const response = await emailChannel.sendMessage(
      connection.qrcode,
      to,
      content
    );

    let data: any;
    try {
      if (typeof response === "object") {
        data = response;
      } else {
        const jsonStart = response.indexOf("{");
        data = JSON.parse(response.substring(jsonStart));
      }
    } catch (parseError) {
      logger.error(
        `SendEmailHubService: erro ao parsear resposta: ${parseError} | Response: ${JSON.stringify(response)}`
      );
      data = response;
    }

    const email = await Email.create({
      messageId: data?.id || undefined,
      whatsappId,
      contactId: undefined,
      direction: "out",
      fromAddress: connection.qrcode,
      toAddress: to,
      subject: subject || undefined,
      bodyHtml: htmlBody || undefined,
      bodyText: textBody || (htmlBody ? htmlBody.replace(/<[^>]+>/g, " ").trim() : undefined),
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
