import { Request, Response } from "express";
import * as Yup from "yup";
import { getIO } from "../libs/socket";

import CreateContactService from "../services/ContactServices/CreateContactService";
import DeleteAllContactService from "../services/ContactServices/DeleteAllContactService";
import DeleteContactService from "../services/ContactServices/DeleteContactService";
import ExportContactsService from "../services/ContactServices/ExportContactsService";
import ListContactsService from "../services/ContactServices/ListContactsService";
import ShowContactService from "../services/ContactServices/ShowContactService";
import UpdateContactService from "../services/ContactServices/UpdateContactService";

import AppError from "../errors/AppError";
import GetContactService from "../services/ContactServices/GetContactService";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import CheckContactNumber from "../services/WbotServices/CheckNumber";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import SyncTagsService from "../services/TagServices/SyncTagsService";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import Whatsapp from "../models/Whatsapp";
import { getWbot } from "../libs/wbot";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  tags?: string;
  isGroup?: string;
  status?: string;
};

export const getBlockStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;
  const { whatsappId } = req.query as { whatsappId?: string };

  const contact = await ShowContactService(contactId);

  if (contact.isGroup) {
    return res.status(400).json({ error: "BLOCK_STATUS_NOT_SUPPORTED_FOR_GROUP" });
  }

  let sessionId: number | null = whatsappId ? parseInt(whatsappId as string, 10) : null;
  if (!sessionId || Number.isNaN(sessionId)) {
    const connected = await Whatsapp.findOne({ where: { status: "CONNECTED", type: "wwebjs" } });
    sessionId = connected?.id || null;
  }
  if (!sessionId) {
    return res.status(400).json({ error: "Nenhuma sessão WhatsApp conectada" });
  }

  const wbot = getWbot(sessionId);
  const numberId = await wbot.getNumberId(contact.number);
  if (!numberId) {
    return res.status(404).json({ error: "Número não registrado no WhatsApp" });
  }

  const wContact = await wbot.getContactById(numberId._serialized);
  return res.status(200).json({ isBlocked: Boolean((wContact as any).isBlocked) });
};

export const blockContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;
  const { whatsappId } = req.body as { whatsappId?: number };

  const contact = await ShowContactService(contactId);

  if (contact.isGroup) {
    return res.status(400).json({ error: "BLOCK_ACTION_NOT_SUPPORTED_FOR_GROUP" });
  }

  let sessionId: number | null = whatsappId && Number.isInteger(whatsappId) ? Number(whatsappId) : null;
  if (!sessionId) {
    const connected = await Whatsapp.findOne({ where: { status: "CONNECTED", type: "wwebjs" } });
    sessionId = connected?.id || null;
  }
  if (!sessionId) {
    return res.status(400).json({ error: "Nenhuma sessão WhatsApp conectada" });
  }

  const wbot = getWbot(sessionId);
  const numberId = await wbot.getNumberId(contact.number);
  if (!numberId) {
    return res.status(404).json({ error: "Número não registrado no WhatsApp" });
  }
  const wContact = await wbot.getContactById(numberId._serialized);
  const result = await (wContact as any).block();

  const logUserId = req.user?.id || 1;
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.UPDATE,
    description: `Contato ${contact.name} (${contact.number}) bloqueado no WhatsApp (sessão ${sessionId})`,
    entityType: EntityTypes.CONTACT,
    entityId: contact.id,
    additionalData: { whatsappId: sessionId }
  });

  return res.status(200).json({ success: Boolean(result) });
};

export const unblockContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;
  const { whatsappId } = req.body as { whatsappId?: number };

  const contact = await ShowContactService(contactId);

  if (contact.isGroup) {
    return res.status(400).json({ error: "BLOCK_ACTION_NOT_SUPPORTED_FOR_GROUP" });
  }

  let sessionId: number | null = whatsappId && Number.isInteger(whatsappId) ? Number(whatsappId) : null;
  if (!sessionId) {
    const connected = await Whatsapp.findOne({ where: { status: "CONNECTED", type: "wwebjs" } });
    sessionId = connected?.id || null;
  }
  if (!sessionId) {
    return res.status(400).json({ error: "Nenhuma sessão WhatsApp conectada" });
  }

  const wbot = getWbot(sessionId);
  const numberId = await wbot.getNumberId(contact.number);
  if (!numberId) {
    return res.status(404).json({ error: "Número não registrado no WhatsApp" });
  }
  const wContact = await wbot.getContactById(numberId._serialized);
  const result = await (wContact as any).unblock();

  const logUserId = req.user?.id || 1;
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.UPDATE,
    description: `Contato ${contact.name} (${contact.number}) desbloqueado no WhatsApp (sessão ${sessionId})`,
    entityType: EntityTypes.CONTACT,
    entityId: contact.id,
    additionalData: { whatsappId: sessionId }
  });

  return res.status(200).json({ success: Boolean(result) });
};

type IndexGetContactQuery = {
  name: string;
  number: string;
  address: string;
  email: string;
};

interface ExtraInfo {
  name: string;
  value: string;
}
interface ContactData {
  name: string;
  number: string;
  address?: string;
  email?: string;
  messengerId?: string;
  instagramId?: string;
  telegramId?: string;
  extraInfo?: ExtraInfo[];
  birthdate?: Date | string;
  gender?: string;
  status?: string;
  lastContactAt?: Date | string;
  country?: string;
  zip?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cpf?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, tags, isGroup, status } = req.query as IndexQuery;

  const tagIds = tags ? tags.split(",").map(tag => Number(tag)) : [];

  const { contacts, count, hasMore } = await ListContactsService({
    searchParam,
    pageNumber,
    tags: tagIds,
    isGroup,
    status
  });

  return res.json({ contacts, count, hasMore });
};

export const getContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, number, address, email } = req.body as IndexGetContactQuery;

  if (!name && !number && !address && !email) {
    return res.status(400).json({ error: "Pelo menos um parâmetro de busca deve ser fornecido" });
  }

  try {
    const contact = await GetContactService({
      name,
      number,
      address,
      email
    });

    return res.status(200).json(contact);
  } catch (error) {
    if (error.message === "CONTACT_NOT_FIND") {
      return res.status(404).json({ error: "Contato não encontrado" });
    }
    return res.status(500).json({ error: error.message });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const newContact: ContactData = req.body;
  newContact.number = newContact.number.replace("-", "").replace(" ", "");

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  try {
    await schema.validate(newContact);
  } catch (err) {
    throw new AppError(err.message);
  }

  const isApiRequest = req.originalUrl.includes('/v1/');
  let validNumber: string = newContact.number;
  let profilePicUrl: string | undefined = undefined;

  if (!isApiRequest) {
    try {
      await CheckIsValidContact(newContact.number);
      validNumber = await CheckContactNumber(newContact.number);
      profilePicUrl = await GetProfilePicUrl(validNumber);
    } catch (err) {
      throw new AppError(err.message);
    }
  } else {
    try {
      const checkedNumber = await CheckContactNumber(newContact.number);
      validNumber = checkedNumber;
      profilePicUrl = await GetProfilePicUrl(validNumber);
    } catch (error) {
      console.log("Erro ao validar contato da API, continuando com o número original", error);
    }
  }

  let { name } = newContact;
  let number = validNumber;
  let { address } = newContact;
  let { email } = newContact;
  let { extraInfo } = newContact;
  const {
    birthdate,
    gender,
    status,
    lastContactAt,
    country,
    zip,
    addressNumber,
    addressComplement,
    neighborhood,
    city,
    state,
    cpf
  } = newContact;

  const contact = await CreateContactService({
    name,
    number,
    address,
    email,
    extraInfo,
    profilePicUrl,
    birthdate,
    gender,
    status,
    lastContactAt,
    country,
    zip,
    addressNumber,
    addressComplement,
    neighborhood,
    city,
    state,
    cpf
  });

  const logUserId = req.user?.id || 1;
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.CREATE,
    description: `Contato ${contact.name} (${contact.number}) criado`,
    entityType: EntityTypes.CONTACT,
    entityId: contact.id,
    additionalData: {
      name: contact.name,
      number: contact.number,
      email: contact.email
    }
  });

  const io = getIO();
  io.emit("contact", {
    action: "create",
    contact
  });

  return res.status(200).json(contact);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const contact = await ShowContactService(contactId);
  return res.status(200).json(contact);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const contactData: ContactData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string()
  });

  try {
    await schema.validate(contactData);
  } catch (err) {
    throw new AppError(err.message);
  }

  if (
    !contactData.messengerId &&
    !contactData.instagramId &&
    !contactData.telegramId
  ) {
    await CheckIsValidContact(contactData.number);
  }

  const { contactId } = req.params;

  const contact = await UpdateContactService({ contactData, contactId });
  const logUserId = req.user?.id || 1;
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.UPDATE,
    description: `Contato ${contact.name} (${contact.number}) atualizado`,
    entityType: EntityTypes.CONTACT,
    entityId: contact.id,
    additionalData: contactData
  });

  const io = getIO();
  io.emit("contact", {
    action: "update",
    contact
  });

  return res.status(200).json(contact);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;

  const contactToDelete = await ShowContactService(contactId);
  
  await DeleteContactService(contactId);
  const logUserId = req.user?.id || 1;
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.DELETE,
    description: `Contato ${contactToDelete.name} (${contactToDelete.number}) excluído`,
    entityType: EntityTypes.CONTACT,
    entityId: parseInt(contactId),
    additionalData: {
      name: contactToDelete.name,
      number: contactToDelete.number,
      email: contactToDelete.email
    }
  });

  const io = getIO();
  io.emit("contact", {
    action: "delete",
    contactId
  });

  return res.status(200).json({ message: "Contact deleted" });
};

export const removeAll = async (
  req: Request,
  res: Response
): Promise<Response> => {
  await DeleteAllContactService();
  const logUserId = req.user?.id || 1;
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.DELETE,
    description: `Todos os contatos foram excluídos`,
    entityType: EntityTypes.CONTACT,
    entityId: 0,
    additionalData: {
      massDelete: true
    }
  });

  return res.send();
};

export const updateTags = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;
  const { tags } = req.body;

  const schema = Yup.object().shape({
    tags: Yup.array().of(
      Yup.object().shape({
        id: Yup.number().required()
      })
    ).required()
  });

  try {
    await schema.validate({ tags });
  } catch (err) {
    throw new AppError(err.message);
  }

  const contact = await SyncTagsService({
    tags,
    contactId: +contactId
  });
  
  const logUserId = req.user?.id || 1;
  
  if (contact) {
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.UPDATE,
      description: `Tags do contato ${contact.name} atualizadas`,
      entityType: EntityTypes.CONTACT,
      entityId: contact.id,
      additionalData: {
        tags: tags.map((tag: { id: number }) => ({ id: tag.id }))
      }
    });
  }

  const io = getIO();
  io.emit("contact", {
    action: "update",
    contact
  });

  return res.status(200).json(contact);
};

export const exportContacts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { searchParam, tags, isGroup, status } = req.query as IndexQuery;

  const tagIds = tags ? tags.split(",").map(tag => Number(tag)) : [];

  try {
    const { contacts } = await ExportContactsService({
      searchParam,
      tags: tagIds,
      isGroup,
      status
    });

    if (contacts.length === 0) {
      return res.status(404).json({ error: "ERR_NO_CONTACT_FOUND" });
    }

    const exportData = contacts.map(contact => {
      let extraInfoFormatted = "";
      if (contact.extraInfo && Array.isArray(contact.extraInfo) && contact.extraInfo.length > 0) {
        extraInfoFormatted = contact.extraInfo
          .map(field => `${field.name}: ${field.value}`)
          .join(" | ");
      }

      return {
        id: contact.id,
        name: contact.name || "",
        number: contact.number || "",
        email: contact.email || "",
        cpf: contact.cpf || "",
        birthdate: contact.birthdate ? new Date(contact.birthdate).toLocaleDateString('pt-BR') : "",
        gender: contact.gender || "",
        status: contact.status || "",
        address: contact.address || "",
        addressNumber: contact.addressNumber || "",
        addressComplement: contact.addressComplement || "",
        neighborhood: contact.neighborhood || "",
        city: contact.city || "",
        state: contact.state || "",
        zip: contact.zip || "",
        country: contact.country || "",
        isGroup: contact.isGroup ? "Sim" : "Não",
        profilePicUrl: contact.profilePicUrl || "",
        extraInfo: extraInfoFormatted,
        tags: contact.tags ? contact.tags.map(tag => tag.name).join(", ") : "",
        createdAt: contact.createdAt ? new Date(contact.createdAt).toLocaleDateString('pt-BR') : "",
        updatedAt: contact.updatedAt ? new Date(contact.updatedAt).toLocaleDateString('pt-BR') : "",
        lastContactAt: contact.lastContactAt ? new Date(contact.lastContactAt).toLocaleDateString('pt-BR') : ""
      };
    });

    return res.status(200).json(exportData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
