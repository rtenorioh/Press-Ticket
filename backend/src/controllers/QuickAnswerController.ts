import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import ListQuickAnswerService from "../services/QuickAnswerService/ListQuickAnswerService";
import CreateQuickAnswerService from "../services/QuickAnswerService/CreateQuickAnswerService";
import ShowQuickAnswerService from "../services/QuickAnswerService/ShowQuickAnswerService";
import UpdateQuickAnswerService from "../services/QuickAnswerService/UpdateQuickAnswerService";
import DeleteQuickAnswerService from "../services/QuickAnswerService/DeleteQuickAnswerService";
import DeleteAllQuickAnswerService from "../services/QuickAnswerService/DeleteAllQuickAnswerService";

import AppError from "../errors/AppError";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import GetClientIp from "../helpers/GetClientIp";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

interface QuickAnswerData {
  shortcut: string;
  message: string;
  mediaPath?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { quickAnswers, count, hasMore } = await ListQuickAnswerService({
    searchParam,
    pageNumber
  });

  return res.json({ quickAnswers, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const newQuickAnswer: QuickAnswerData = req.body;
  const media = req.file as Express.Multer.File;

  const QuickAnswerSchema = Yup.object().shape({
    shortcut: Yup.string().required(),
    message: Yup.string().required()
  });

  try {
    await QuickAnswerSchema.validate(newQuickAnswer);
  } catch (err) {
    throw new AppError(err.message);
  }

  if (media) {
    newQuickAnswer.mediaPath = media.filename;
  }

  const quickAnswer = await CreateQuickAnswerService({
    ...newQuickAnswer
  });

  const logUserId = req.user?.id || 1;
  
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.CREATE,
    description: `Resposta rápida "${quickAnswer.shortcut}" criada`,
    entityType: EntityTypes.QUICKANSWER,
    entityId: quickAnswer.id,
    additionalData: {
      shortcut: quickAnswer.shortcut,
      message: quickAnswer.message
    }
  });

  const io = getIO();
  io.emit("quickAnswer", {
    action: "create",
    quickAnswer
  });

  return res.status(200).json(quickAnswer);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { quickAnswerId } = req.params;

  const quickAnswer = await ShowQuickAnswerService(quickAnswerId);

  return res.status(200).json(quickAnswer);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const quickAnswerData: QuickAnswerData = req.body;
  const media = req.file as Express.Multer.File;

  const schema = Yup.object().shape({
    shortcut: Yup.string(),
    message: Yup.string()
  });

  try {
    await schema.validate(quickAnswerData);
  } catch (err) {
    throw new AppError(err.message);
  }

  if (media) {
    quickAnswerData.mediaPath = media.filename;
  }

  const { quickAnswerId } = req.params;

  const quickAnswer = await UpdateQuickAnswerService({
    quickAnswerData,
    quickAnswerId
  });

  const logUserId = req.user?.id || 1;
  
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.UPDATE,
    description: `Resposta rápida "${quickAnswer.shortcut}" atualizada`,
    entityType: EntityTypes.QUICKANSWER,
    entityId: quickAnswer.id,
    additionalData: quickAnswerData
  });

  const io = getIO();
  io.emit("quickAnswer", {
    action: "update",
    quickAnswer
  });

  return res.status(200).json(quickAnswer);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { quickAnswerId } = req.params;

  const quickAnswerToDelete = await ShowQuickAnswerService(quickAnswerId);
  
  await DeleteQuickAnswerService(quickAnswerId);
  
  const logUserId = req.user?.id || 1;
  
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.DELETE,
    description: `Resposta rápida "${quickAnswerToDelete.shortcut}" excluída`,
    entityType: EntityTypes.QUICKANSWER,
    entityId: parseInt(quickAnswerId),
    additionalData: {
      shortcut: quickAnswerToDelete.shortcut,
      message: quickAnswerToDelete.message
    }
  });

  const io = getIO();
  io.emit("quickAnswer", {
    action: "delete",
    quickAnswerId
  });

  return res.status(200).json({ message: "Quick Answer deleted" });
};

export const removeAll = async (
  req: Request,
  res: Response
): Promise<Response> => {
  await DeleteAllQuickAnswerService();
  
  const logUserId = req.user?.id || 1;
  
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.DELETE,
    description: `Todas as respostas rápidas foram excluídas`,
    entityType: EntityTypes.QUICKANSWER,
    entityId: 0,
    ip: clientIp,

    additionalData: {
      massDelete: true
    }
  });

  return res.status(200).json({ message: "All Quick Answer deleted" });
};