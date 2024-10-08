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
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { tagId } = req.params;
  const tagData = req.body;

  const tag = await UpdateService({ tagData, id: tagId });

  const io = getIO();
  io.emit("tag", {
    action: "update",
    tag
  });

  return res.status(200).json(tag);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tagId } = req.params;

  await DeleteService(tagId);

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
  const { tagId } = req.params;

  await DeleteAllService();

  return res.send();
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;

  const tags = await SimpleListService({ searchParam });

  return res.json(tags);
};

export const syncTags = async (req: Request, res: Response): Promise<any> => {
  const data = req.body;

  try {
    if (data) {
      const tags = await SyncTagService(data);

      return res.json(tags);
    }
  } catch (err) {
    throw new AppError("ERR_SYNC_TAGS", 500);
  }
};
