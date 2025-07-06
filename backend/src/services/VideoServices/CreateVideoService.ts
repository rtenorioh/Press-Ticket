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
}

const CreateVideoService = async ({ videoData }: Request): Promise<Video> => {
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

  const video = await Video.create({
    title,
    url,
    active
  });

  if (users && users.length > 0) {
    const usersFound = await User.findAll({
      where: {
        id: users
      }
    });

    if (usersFound) {
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
  }

  return video;
};

export default CreateVideoService;
