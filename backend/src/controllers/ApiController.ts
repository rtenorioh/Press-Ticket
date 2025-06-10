import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import GetDefaultWhatsApp from "../helpers/GetDefaultWhatsApp";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import Message from "../models/Message";
import Whatsapp from "../models/Whatsapp";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import ListSettingsServiceOne from "../services/SettingServices/ListSettingsServiceOne";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import CheckContactNumber from "../services/WbotServices/CheckNumber";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

type WhatsappData = {
  whatsappId: number;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
};

interface ContactData {
  number: string;
}

const createContact = async (
  whatsappId: number | undefined,
  newContact: string,
  userId?: number,
  queueId?: number
) => {
  await CheckIsValidContact(newContact);

  const validNumber: any = await CheckContactNumber(newContact);

  const profilePicUrl = await GetProfilePicUrl(validNumber);

  const number = validNumber;

  const contactData = {
    name: `${number}`,
    number,
    profilePicUrl,
    isGroup: false
  };

  const contact = await CreateOrUpdateContactService(contactData);

  let whatsapp: Whatsapp | null;

  if (whatsappId === undefined) {
    whatsapp = await GetDefaultWhatsApp();
  } else {
    whatsapp = await Whatsapp.findByPk(whatsappId);

    if (whatsapp === null) {
      throw new AppError(`whatsapp #${whatsappId} not found`);
    }
  }

  const createTicket = await FindOrCreateTicketService(
    contact,
    whatsapp.id,
    1,
    userId,
    queueId
  );

  const ticket = await ShowTicketService(createTicket.id);

  if (ticket.status === "open") {
    await SetTicketMessagesAsRead(ticket);
  }

  return ticket;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    whatsappId,
    body,
    quotedMsg,
    userId,
    queueId
  }: MessageData & WhatsappData & { userId: number; queueId: number } =
    req.body;
  const medias = req.files as Express.Multer.File[];
  const newContact: ContactData = req.body;

  const formattedNumber = newContact.number.replace("-", "").replace(" ", "");

  const schema = Yup.object().shape({
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers are allowed."),
    userId: Yup.number().required("User ID is required")
  });

  try {
    await schema.validate({ number: formattedNumber, userId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const contactAndTicket = await createContact(
    whatsappId,
    formattedNumber,
    userId,
    queueId
  );

  let resp: any;

  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        resp = await SendWhatsAppMedia({
          body,
          media,
          ticket: contactAndTicket
        });
      })
    );
  } else {
    resp = await SendWhatsAppMessage({
      body,
      ticket: contactAndTicket,
      quotedMsg
    });
  }

  const listSettingsService = await ListSettingsServiceOne({
    key: "closeTicketApi"
  });
  const closeTicketApi = listSettingsService?.value;

  if (closeTicketApi === "enabled") {
    setTimeout(async () => {
      await UpdateTicketService({
        ticketId: contactAndTicket.id,
        ticketData: { status: "closed" }
      });
    }, 1000);
  }

  return res.send({ resp });
};

export const sendMessage = async (req: Request, res: Response): Promise<Response> => {
  const { body, quotedMsg, userId, queueId, whatsappId }: MessageData & WhatsappData & { userId: number; queueId: number } =
    req.body;

  const newContact: ContactData = req.body;
  const formattedNumber = newContact.number.replace("-", "").replace(" ", "");

  const schema = Yup.object().shape({
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers are allowed."),
    userId: Yup.number().required("User ID is required")
  });

  try {
    await schema.validate({ number: formattedNumber, userId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const contactAndTicket = await createContact(whatsappId, formattedNumber, userId, queueId);

  const resp = await SendWhatsAppMessage({
    body,
    ticket: contactAndTicket,
    quotedMsg
  });

  const listSettingsService = await ListSettingsServiceOne({
    key: "closeTicketApi"
  });
  const closeTicketApi = listSettingsService?.value;

  if (closeTicketApi === "enabled") {
    setTimeout(async () => {
      await UpdateTicketService({
        ticketId: contactAndTicket.id,
        ticketData: { status: "closed" }
      });
    }, 1000);
  }

  return res.send({ resp });
};

export const sendMedia = async (req: Request, res: Response): Promise<Response> => {
  const { body, quotedMsg, userId, queueId, whatsappId }: MessageData & WhatsappData & { userId: number; queueId: number } =
    req.body;

  const medias = req.files as Express.Multer.File[];
  const newContact: ContactData = req.body;
  const formattedNumber = newContact.number.replace("-", "").replace(" ", "");

  const schema = Yup.object().shape({
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers are allowed."),
    userId: Yup.number().required("User ID is required")
  });

  try {
    await schema.validate({ number: formattedNumber, userId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const contactAndTicket = await createContact(whatsappId, formattedNumber, userId, queueId);

  let resp: any;
  if (medias && medias.length > 0) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        resp = await SendWhatsAppMedia({
          body,
          media,
          ticket: contactAndTicket
        });
      })
    );
  } else {
    resp = await SendWhatsAppMessage({
      body,
      ticket: contactAndTicket,
      quotedMsg
    });
  }

  const listSettingsService = await ListSettingsServiceOne({
    key: "closeTicketApi"
  });
  const closeTicketApi = listSettingsService?.value;

  if (closeTicketApi === "enabled") {
    setTimeout(async () => {
      await UpdateTicketService({
        ticketId: contactAndTicket.id,
        ticketData: { status: "closed" }
      });
    }, 1000);
  }

  return res.send({ resp });
};

export const getMediaBase64 = async (req: Request, res: Response): Promise<Response> => {
  const { messageId } = req.params;
  const fs = require('fs');
  const path = require('path');

  try {
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      throw new AppError("Mensagem não encontrada", 404);
    }

    if (!message.mediaUrl) {
      throw new AppError("Esta mensagem não possui mídia", 400);
    }

    const mediaUrlParts = message.mediaUrl.split('/');
    const filename = mediaUrlParts[mediaUrlParts.length - 1];
    
    const publicFolder = path.resolve(__dirname, "..", "..", "public");
    const filePath = path.join(publicFolder, filename);

    if (!fs.existsSync(filePath)) {
      throw new AppError("Arquivo de mídia não encontrado no servidor", 404);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');

    let mimeType = '';
    switch (message.mediaType) {
      case 'image':
        mimeType = 'image/jpeg';
        break;
      case 'video':
        mimeType = 'video/mp4';
        break;
      case 'audio':
        mimeType = 'audio/ogg';
        break;
      case 'document':
        mimeType = 'application/pdf';
        break;
      default:
        mimeType = 'application/octet-stream';
    }

    return res.json({
      success: true,
      data: {
        mediaType: message.mediaType,
        filename,
        mimeType,        
        base64Data: `data:${mimeType};base64,${base64Data}`
      }
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    
    console.error("Erro ao obter mídia em base64:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};