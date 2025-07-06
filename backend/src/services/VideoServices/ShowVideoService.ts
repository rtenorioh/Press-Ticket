import AppError from "../../errors/AppError";
import Video from "../../models/Video";
import User from "../../models/User";

interface Request {
  id: string;
}

const ShowVideoService = async ({ id }: Request): Promise<Video> => {
  const video = await Video.findByPk(id, {
    include: [
      {
        model: User,
        as: "users",
        attributes: ["id", "name"]
      }
    ]
  });

  if (!video) {
    throw new AppError("Vídeo não encontrado", 404);
  }

  return video;
};

export default ShowVideoService;
