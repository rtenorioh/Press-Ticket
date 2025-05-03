import { Request, Response } from "express";
import * as Yup from "yup";
import { parseISO } from "date-fns";

import CreateErrorLogService from "../services/ErrorLogServices/CreateErrorLogService";
import ListErrorLogsService from "../services/ErrorLogServices/ListErrorLogsService";
import ShowErrorLogService from "../services/ErrorLogServices/ShowErrorLogService";
import DeleteOldErrorLogsService from "../services/ErrorLogServices/DeleteOldErrorLogsService";
import AppError from "../errors/AppError";

interface ErrorLogRequest {
  source: string;
  message: string;
  stack?: string;
  userId?: number;
  username?: string;
  url?: string;
  userAgent?: string;
  component?: string;
  severity?: string;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const schema = Yup.object().shape({
    source: Yup.string().required(),
    message: Yup.string().required(),
    stack: Yup.string(),
    userId: Yup.number(),
    username: Yup.string(),
    url: Yup.string(),
    userAgent: Yup.string(),
    component: Yup.string(),
    severity: Yup.string()
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const {
    source,
    message,
    stack,
    userId,
    username,
    url,
    userAgent,
    component,
    severity
  }: ErrorLogRequest = req.body;

  const errorLog = await CreateErrorLogService({
    source,
    message,
    stack,
    userId,
    username,
    url,
    userAgent,
    component,
    severity
  });

  return res.status(200).json(errorLog);
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    source,
    startDate,
    endDate,
    severity,
    pageNumber = "1",
    limit = "50"
  } = req.query;

  const limitNum = parseInt(limit as string, 10);
  const pageNum = parseInt(pageNumber as string, 10);
  const offset = (pageNum - 1) * limitNum;

  const searchParams: any = {};

  if (source) {
    searchParams.source = source;
  }

  if (severity) {
    searchParams.severity = severity;
  }

  if (startDate) {
    searchParams.startDate = parseISO(startDate as string);
  }

  if (endDate) {
    searchParams.endDate = parseISO(endDate as string);
  }

  const { rows, count } = await ListErrorLogsService({
    searchParams,
    limit: limitNum,
    offset
  });

  return res.status(200).json({ logs: rows, count, limit: limitNum, offset });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const errorLog = await ShowErrorLogService(parseInt(id, 10));

  return res.status(200).json(errorLog);
};

export const cleanupOldLogs = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { days = "30" } = req.query;

  const daysNum = parseInt(days as string, 10);

  const count = await DeleteOldErrorLogsService(daysNum);

  return res.status(200).json({ message: `${count} logs removidos com sucesso` });
};
