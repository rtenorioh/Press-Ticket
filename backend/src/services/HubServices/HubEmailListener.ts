import Contact from "../../models/Contact";
import Email from "../../models/Email";
import EmailAttachment from "../../models/EmailAttachment";
import Whatsapp from "../../models/Whatsapp";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";

interface IEmailContent {
  type: string;
  text?: string;
  url?: string;
  fileUrl?: string;
  filename?: string;
  fileMimeType?: string;
  fileSize?: number;
}

interface IEmailWebhookPayload {
  type: string;
  channel: string;
  direction: string;
  message: {
    id: string;
    from: string;
    to: string;
    subject?: string;
    htmlBody?: string;
    textBody?: string;
    contents?: IEmailContent[];
    visitor?: {
      name?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    };
  };
}

const extractTextFromHtml = (html: string): string => {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const isBase64 = (str: string): boolean => {
  if (!str || str.length < 50) return false;
  // Check first 100 chars stripped of line breaks — base64 has no spaces or HTML tags
  const sample = str.substring(0, 100).replace(/[\r\n]/g, "");
  return /^[A-Za-z0-9+/]{50,}={0,2}$/.test(sample);
};

const decodeIfBase64 = (text: string, label: string): string => {
  if (isBase64(text)) {
    try {
      return Buffer.from(text, "base64").toString("utf-8");
    } catch {
      logger.warn(
        `HubEmailListener: falha ao decodificar base64 em ${label}, usando raw`
      );
    }
  }
  return text;
};

const HubEmailListener = async (
  payload: IEmailWebhookPayload,
  whatsapp: Whatsapp
): Promise<void> => {
  if (payload.direction === "OUT") {
    return;
  }

  if (payload.type !== "MESSAGE") {
    return;
  }

  const { message } = payload;

  try {
    const fromAddress = message.from || message.visitor?.email || "";

    if (!fromAddress) {
      logger.warn("HubEmailListener: email sem remetente — ignorado");
      return;
    }

    // FindOrCreate contact by email address
    let contact = await Contact.findOne({ where: { email: fromAddress } });
    if (!contact) {
      const visitorName =
        message.visitor?.name ||
        `${message.visitor?.firstName || ""} ${message.visitor?.lastName || ""}`.trim() ||
        fromAddress;

      contact = await Contact.create({
        name: visitorName,
        email: fromAddress
      });
    }

    // Subject does not exist in the NotificaMe email webhook payload
    const subject = undefined;

    // Extract content from contents array (real webhook structure)
    let bodyHtml = "";
    let bodyText = "";
    const fileContents: IEmailContent[] = [];

    if (message.contents && Array.isArray(message.contents)) {
      const rawText = decodeIfBase64(
        message.contents[0]?.text || "",
        "contents[0]"
      );
      const htmlIndex = rawText.search(/<[a-z][^>]*>/i);

      if (htmlIndex > 0) {
        bodyText = rawText
          .substring(0, htmlIndex)
          .replace(/\r\n/g, "\n")
          .trim();
        bodyHtml = rawText.substring(htmlIndex).trim();
      } else if (htmlIndex === 0) {
        bodyHtml = rawText.trim();
        bodyText = extractTextFromHtml(rawText);
      } else {
        bodyText = rawText.replace(/\r\n/g, "\n").trim();
      }

      message.contents
        .filter(c => c.type === "file" && c.fileUrl)
        .forEach(c => fileContents.push(c));
    }

    // Fallback for alternative payload shapes
    if (!bodyHtml && !bodyText) {
      bodyHtml = (message as any).htmlBody || "";
      bodyText = (message as any).textBody || "";
      if (!bodyText && bodyHtml) {
        bodyText = extractTextFromHtml(bodyHtml);
      }
    }

    const email = await Email.create({
      messageId: message.id,
      whatsappId: whatsapp.id!,
      contactId: contact.id,
      direction: "in",
      fromAddress,
      toAddress: message.to || "",
      subject,
      bodyHtml: bodyHtml || undefined,
      bodyText: bodyText || undefined,
      folder: "inbox",
      isRead: false,
      isStarred: false
    });

    logger.info(`HubEmailListener: email ${email.id} salvo no banco`);

    // Save file attachments
    if (fileContents.length > 0) {
      await Promise.all(
        fileContents.map(fc =>
          EmailAttachment.create({
            emailId: email.id!,
            filename: fc.filename || "attachment",
            mimeType: fc.fileMimeType || undefined,
            fileUrl: fc.fileUrl!,
            direction: "in"
          })
        )
      );
      logger.info(`HubEmailListener: ${fileContents.length} anexo(s) salvos`);
    }

    const emailWithAttachments = await Email.findByPk(email.id, {
      include: [{ model: EmailAttachment, as: "attachments" }]
    });

    const io = getIO();
    io.emit("email:new", {
      action: "create",
      email: emailWithAttachments,
      whatsappId: whatsapp.id
    });
  } catch (error) {
    logger.error(`HubEmailListener erro: ${error}`);
    throw error;
  }
};

export default HubEmailListener;
