import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Video from "../../models/Video";
import User from "../../models/User";

interface VideoData {
  title: string;
  url: string;
  active: boolean;
  users: number[];
}

interface Request {
  videoData: VideoData;
  videoId: string;
}

const UpdateVideoService = async ({
  videoData,
  videoId
}: Request): Promise<Video> => {
  const { title, url, active, users } = videoData;

  const schema = Yup.object().shape({
    title: Yup.string().required(),
    url: Yup.string().required(),
    active: Yup.boolean(),
    users: Yup.array().of(Yup.number())
  });

  try {
    await schema.validate({ title, url, active, users });
  } catch (err) {
    throw new AppError(err.message);
  }

  const video = await Video.findByPk(videoId, {
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

  await video.update({
    title,
    url,
    active
  });

  if (users) {
    const usersFound = await User.findAll({
      where: {
        id: users
      }
    });

    await video.$set("users", usersFound);
    await video.reload({
      include: [
        {
          model: User,
          as: "users",
          attributes: ["id", "name"]
        }
      ]
    });
  }

  return video;
};

export default UpdateVideoService;
