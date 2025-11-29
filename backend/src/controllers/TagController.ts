import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";

import CreateService from "../services/TagServices/CreateService";
import DeleteAllService from "../services/TagServices/DeleteAllService";
import DeleteService from "../services/TagServices/DeleteService";
import ListService from "../services/TagServices/ListService";
import ListServiceCount from "../services/TagServices/ListServiceCount";
import ShowService from "../services/TagServices/ShowService";
import SimpleListService from "../services/TagServices/SimpleListService";
import SyncTagService from "../services/TagServices/SyncTagsService";
import UpdateService from "../services/TagServices/UpdateService";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import GetClientIp from "../helpers/GetClientIp";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;

  const { tags, count, hasMore } = await ListService({
    searchParam,
    pageNumber
  });

  return res.json({ tags, count, hasMore });
};

export const indexCount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;

  const { tags, count, hasMore } = await ListServiceCount({
    searchParam,
    pageNumber
  });

  return res.json({ tags, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, color } = req.body;

  const tag = await CreateService({
    name,
    color
  });

  const logUserId = req.user?.id || 1;
  
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.CREATE,
    description: `Tag ${tag.name} criada`,
    entityType: EntityTypes.TAG,
    entityId: tag.id,
    additionalData: {
      name: tag.name,
      color: tag.color
    }
  });

  const io = getIO();
  io.emit("tag", {
    action: "create",
    tag
  });

  return res.status(200).json(tag);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { tagId } = req.params;

  const tag = await ShowService(tagId);

  return res.status(200).json(tag);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const isApiRequest = req.originalUrl.includes('/v1/');
    
    if (!isApiRequest && req.user && req.user.profile !== "admin") {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }

    const { tagId } = req.params;
    const tagData = req.body;

    if (!tagData.name && !tagData.color) {
      throw new AppError("É necessário fornecer pelo menos um campo para atualização (nome ou cor)", 400);
    }

    const tag = await UpdateService({ tagData, id: tagId });

    const logUserId = req.user?.id || 1;
    
    const clientIp = GetClientIp(req);
    
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.UPDATE,
      description: `Tag ${tag.name} atualizada`,
      entityType: EntityTypes.TAG,
      entityId: tag.id,
      additionalData: tagData
    });

    const io = getIO();
    io.emit("tag", {
      action: "update",
      tag
    });

    return res.status(200).json(tag);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("Erro ao atualizar tag:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tagId } = req.params;

  const tagToDelete = await ShowService(tagId);
  
  await DeleteService(tagId);
  
  const logUserId = req.user?.id || 1;
  
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.DELETE,
    description: `Tag ${tagToDelete.name} excluída`,
    entityType: EntityTypes.TAG,
    entityId: parseInt(tagId),
    additionalData: {
      name: tagToDelete.name,
      color: tagToDelete.color
    }
  });

  const io = getIO();
  io.emit("tag", {
    action: "delete",
    tagId
  });

  return res.status(200).json({ message: "Tag deleted" });
};

export const removeAll = async (
  req: Request,
  res: Response
): Promise<Response> => {

  await DeleteAllService();
  
  const logUserId = req.user?.id || 1;
  
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.DELETE,
    description: `Todas as tags foram excluídas`,
    entityType: EntityTypes.TAG,
    entityId: 0,
    ip: clientIp,

    additionalData: {
      massDelete: true
    }
  });

  return res.send();
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;

  const tags = await SimpleListService({ searchParam });

  return res.json(tags);
};

export const syncTags = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body;

  try {
    if (!data) {
      return res.status(400).json({ error: "Dados não fornecidos" });
    }

    const contact = await SyncTagService(data);
    
    const io = getIO();
    io.emit("contact", {
      action: "update",
      contact
    });

    return res.status(200).json(contact);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    
    console.error("Erro ao sincronizar tags:", err);
    return res.status(500).json({ error: "Erro ao sincronizar tags" });
  }
};
