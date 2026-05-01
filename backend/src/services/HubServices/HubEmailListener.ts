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

const HubEmailListener = async (
  payload: IEmailWebhookPayload,
  whatsapp: Whatsapp
): Promise<void> => {
  if (payload.direction === "OUT") {
    logger.info("HubEmailListener: ignorando webhook direction=OUT");
    return;
  }

  if (payload.type !== "MESSAGE") {
    return;
  }

  const { message } = payload;

  logger.info(`HubEmailListener: processando email recebido de ${message.from}`);

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
      logger.info(`HubEmailListener: novo contato criado para ${fromAddress}`);
    }

    // Extract subject — may not exist in webhook
    const subject = (message as any).subject || "";

    // Extract content from contents array (real webhook structure)
    let bodyHtml = "";
    let bodyText = "";
    const fileContents: IEmailContent[] = [];

    if (message.contents && Array.isArray(message.contents)) {
      const textContent = message.contents.find(c => c.type === "text");
      if (textContent?.text) {
        const raw = textContent.text;
        if (/<[^>]+>/.test(raw)) {
          bodyHtml = raw;
          bodyText = extractTextFromHtml(raw);
        } else {
          bodyText = raw;
        }
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
      subject: subject || undefined,
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
