import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateQueueService from "../services/QueueService/CreateQueueService";
import DeleteQueueService from "../services/QueueService/DeleteQueueService";
import ListQueuesService from "../services/QueueService/ListQueuesService";
import ShowQueueService from "../services/QueueService/ShowQueueService";
import UpdateQueueService from "../services/QueueService/UpdateQueueService";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import GetClientIp from "../helpers/GetClientIp";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const queues = await ListQueuesService();

  return res.status(200).json(queues);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, color, greetingMessage, startWork, endWork, absenceMessage, startBreak, endBreak, breakMessage } = req.body;

  const queue = await CreateQueueService({ 
    name, 
    color, 
    greetingMessage, 
    startWork, 
    endWork, 
    absenceMessage, 
    startBreak, 
    endBreak, 
    breakMessage 
  });

  const logUserId = req.user?.id || 1;
  
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.CREATE,
    description: `Setor ${queue.name} criado`,
    entityType: EntityTypes.QUEUE,
    entityId: queue.id,
    additionalData: {
      name,
      color,
      startWork,
      endWork
    }
  });

  const io = getIO();
  io.emit("queue", {
    action: "update",
    queue
  });

  return res.status(200).json(queue);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { queueId } = req.params;

  const queue = await ShowQueueService(queueId);

  return res.status(200).json(queue);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueId } = req.params;

  const queue = await UpdateQueueService(queueId, req.body);
  const logUserId = req.user?.id || 1;
  
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.UPDATE,
    description: `Setor ${queue.name} atualizado`,
    entityType: EntityTypes.QUEUE,
    entityId: queue.id,
    additionalData: req.body
  });

  const io = getIO();
  io.emit("queue", {
    action: "update",
    queue
  });

  return res.status(201).json(queue);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueId } = req.params;

  const queueToDelete = await ShowQueueService(queueId);
  
  await DeleteQueueService(queueId);
  const logUserId = req.user?.id || 1;
  
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.DELETE,
    description: `Setor ${queueToDelete.name} excluído`,
    entityType: EntityTypes.QUEUE,
    entityId: parseInt(queueId),
    additionalData: {
      name: queueToDelete.name,
      color: queueToDelete.color
    }
  });

  const io = getIO();
  io.emit("queue", {
    action: "delete",
    queueId: +queueId
  });

  return res.status(200).send();
};
