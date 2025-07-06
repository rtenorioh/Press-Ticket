import AppError from "../../errors/AppError";
import Video from "../../models/Video";

interface Request {
  id: string;
}

const DeleteVideoService = async ({ id }: Request): Promise<void> => {
  const video = await Video.findByPk(id);

  if (!video) {
    throw new AppError("Vídeo não encontrado", 404);
  }

  await video.destroy();
};

export default DeleteVideoService;
