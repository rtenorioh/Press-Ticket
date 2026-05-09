import { convertMp3ToMp4 } from "../../helpers/ConvertMp3ToMp4";
import { createNotificameClient, resolveChannel, resolveContactId, NotificameMessagePayload } from "../../libs/notificameClient";
import Contact from "../../models/Contact";
import CreateMessageService from "./CreateHubMessageService";
import { showHubToken } from "../../helpers/showHubToken";
import { logger } from "../../utils/logger";

require("dotenv").config();

export const SendMediaMessageService = async (
  media: Express.Multer.File,
  message: string,
  ticketId: number,
  contact: Contact,
  connection: any
) => {
  const channel = resolveChannel(contact);
  if (!channel) {
    logger.error("SendMediaMessageService: nenhum canal disponível para este contato.");
    throw new Error("Nenhum canal disponível para este contato.");
  }

  const contactId = resolveContactId(contact, channel);
  if (!contactId) {
    throw new Error(`SendMediaMessageService: ID do destinatário não encontrado para canal ${channel}`);
  }

  const backendUrl = process.env.WEBHOOK;
  const filename = encodeURIComponent(media.filename);
  let mediaUrl = `${backendUrl}/public/${filename}`;

  // Normalizar mimetype para o formato aceito pela API (tipos simples, não MIME completo)
  let fileMimeType: string;
  if (media.mimetype.includes("image")) {
    fileMimeType = channel === "telegram" ? "photo" : "image";
  } else if (media.mimetype.includes("audio")) {
    fileMimeType = "audio";
  } else if (media.mimetype.includes("video")) {
    fileMimeType = "video";
  } else {
    fileMimeType = (channel === "telegram" || channel === "webchat") ? "document" : "file";
  }

  // Converter MP3 para MP4 no Instagram (não suporta audio direto)
  if (media.originalname.includes(".mp3") && channel === "instagram") {
    const outputMP4Path = `${media.destination}/${media.filename.split(".")[0]}.mp4`;
    try {
      await convertMp3ToMp4(media.path, outputMP4Path);
      media.filename = outputMP4Path.split("/").pop() ?? "default.mp4";
      mediaUrl = `${backendUrl}/public/${media.filename}`;
      media.originalname = media.filename;
      fileMimeType = "audio";
    } catch (e) {
      logger.error(`SendMediaMessageService: erro ao converter MP3 para MP4 (Instagram): ${e}`);
      logger.warn(`Enviando arquivo original sem conversão: ${media.originalname}`);
    }
  }

  if (media.originalname.includes(".mp3") && channel === "facebook") {
    mediaUrl = `${backendUrl}/public/${media.filename}`;
    media.originalname = media.filename;
    fileMimeType = "audio";
  }

  const hubToken = await showHubToken();
  const client = createNotificameClient(hubToken);

  const fileContent: Record<string, unknown> = {
    type: 'file',
    fileMimeType,
    fileUrl: mediaUrl,
  };
  if (channel === "webchat") {
    fileContent.fileName = media.originalname || media.filename;
  } else {
    fileContent.fileCaption = message || undefined;
  }

  const payload: NotificameMessagePayload = {
    from: connection.qrcode,
    to: contactId,
    contents: [fileContent as any]
  };

  try {
    const response = await client.post(`/v1/channels/${channel}/messages`, payload);
    const data = response.data;

    const newMessage = await CreateMessageService({
      id: data.id,
      contactId: contact.id,
      body: message,
      ticketId,
      fromMe: true,
      fileName: `${media.filename}`,
      mediaType: media.mimetype.split("/")[0],
      originalName: media.originalname
    });

    return newMessage;
  } catch (error) {
    logger.error(`SendMediaMessageService: erro ao enviar mídia Hub: ${error}`);
    throw error;
  }
};
