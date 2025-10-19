import { Request, Response } from "express";
import { getIO } from "../libs/socket";

declare module "express" {
  interface Request {
    user: {
      id: string;
      profile: string;
    };
  }
}

import ListVideosService from "../services/VideoServices/ListVideosService";
import CreateVideoService from "../services/VideoServices/CreateVideoService";
import UpdateVideoService from "../services/VideoServices/UpdateVideoService";
import DeleteVideoService from "../services/VideoServices/DeleteVideoService";
import ShowVideoService from "../services/VideoServices/ShowVideoService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query;
  
  let userId = "1"; 
  let isAdmin = true; 
  
  if (req.user) {
    userId = req.user.id;
    isAdmin = req.user.profile === "admin";
  }

  const videos = await ListVideosService({
    searchParam: searchParam as string,
    userId: parseInt(userId, 10),
    isAdmin
  });

  return res.json(videos.videos);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const videoData = req.body;

  const video = await CreateVideoService({
    videoData
  });

  const io = getIO();
  io.emit("video", {
    action: "create",
    video
  });

  return res.status(200).json(video);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const video = await ShowVideoService({ id });

  return res.status(200).json(video);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const videoData = req.body;

  const video = await UpdateVideoService({
    videoId: id,
    videoData
  });

  const io = getIO();
  io.emit("video", {
    action: "update",
    video
  });

  return res.status(200).json(video);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  await DeleteVideoService({ id });

  const io = getIO();
  io.emit("video", {
    action: "delete",
    videoId: +id
  });

  return res.status(200).json({ message: "Vídeo excluído com sucesso!" });
};
