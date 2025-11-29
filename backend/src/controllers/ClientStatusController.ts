import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";

import CreateService from "../services/ClientStatusServices/CreateService";
import DeleteAllService from "../services/ClientStatusServices/DeleteAllService";
import DeleteService from "../services/ClientStatusServices/DeleteService";
import ListService from "../services/ClientStatusServices/ListService";
import ShowService from "../services/ClientStatusServices/ShowService";
import UpdateService from "../services/ClientStatusServices/UpdateService";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import GetClientIp from "../helpers/GetClientIp";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;

  const { clientStatus, count, hasMore } = await ListService({
    searchParam,
    pageNumber
  });

  return res.json({ clientStatus, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, color } = req.body;

  const clientStatus = await CreateService({
    name,
    color
  });

  const logUserId = req.user?.id || 1;
  
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.CREATE,
    description: `Status de cliente ${clientStatus.name} criado`,
    entityType: EntityTypes.TAG,
    entityId: clientStatus.id,
    additionalData: {
      name: clientStatus.name,
      color: clientStatus.color
    }
  });

  const io = getIO();
  io.emit("clientStatus", {
    action: "create",
    clientStatus
  });

  return res.status(200).json(clientStatus);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { clientStatusId } = req.params;

  const clientStatus = await ShowService(clientStatusId);

  return res.status(200).json(clientStatus);
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

    const { clientStatusId } = req.params;
    const clientStatusData = req.body;

    if (!clientStatusData.name && !clientStatusData.color) {
      throw new AppError("É necessário fornecer pelo menos um campo para atualização (nome ou cor)", 400);
    }

    const clientStatus = await UpdateService({ clientStatusData, id: clientStatusId });

    const logUserId = req.user?.id || 1;
    
    const clientIp = GetClientIp(req);
    
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.UPDATE,
      description: `Status de cliente ${clientStatus.name} atualizado`,
      entityType: EntityTypes.TAG,
      entityId: clientStatus.id,
      additionalData: clientStatusData
    });

    const io = getIO();
    io.emit("clientStatus", {
      action: "update",
      clientStatus
    });

    return res.status(200).json(clientStatus);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("Erro ao atualizar status:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { clientStatusId } = req.params;

  const statusToDelete = await ShowService(clientStatusId);
  
  await DeleteService(clientStatusId);
  
  const logUserId = req.user?.id || 1;
  
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.DELETE,
    description: `Status de cliente ${statusToDelete.name} excluído`,
    entityType: EntityTypes.TAG,
    entityId: parseInt(clientStatusId),
    additionalData: {
      name: statusToDelete.name,
      color: statusToDelete.color
    }
  });

  const io = getIO();
  io.emit("clientStatus", {
    action: "delete",
    clientStatusId
  });

  return res.status(200).json({ message: "Client status deleted" });
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
    description: `Todos os status de clientes foram excluídos`,
    entityType: EntityTypes.TAG,
    entityId: 0,
    ip: clientIp,

    additionalData: {
      massDelete: true
    }
  });

  return res.send();
};

export const statistics = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const ClientStatus = (await import("../models/ClientStatus")).default;
  const Contact = (await import("../models/Contact")).default;
  const { Sequelize, Op } = await import("sequelize");

  const statusWithCounts = await ClientStatus.findAll({
    attributes: {
      include: [
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM Contacts AS contact
            WHERE contact.status = ClientStatus.name
          )`),
          "contactsCount"
        ]
      ]
    },
    order: [["name", "ASC"]]
  });

  const contactsWithoutStatus = await Contact.count({
    where: {
      status: {
        [Op.or]: [null, ""]
      }
    }
  });

  const totalContacts = await Contact.count();

  const statistics = {
    statusData: statusWithCounts.map((status: any) => ({
      id: status.id,
      name: status.name,
      color: status.color,
      count: parseInt(status.getDataValue("contactsCount")) || 0
    })),
    withoutStatus: contactsWithoutStatus,
    total: totalContacts
  };

  return res.status(200).json(statistics);
};
