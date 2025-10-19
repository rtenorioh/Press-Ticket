import { Op } from "sequelize";
import Video from "../../models/Video";
import User from "../../models/User";

interface Request {
  searchParam?: string;
  userId?: number;
  isAdmin?: boolean;
}

interface Response {
  videos: Video[];
  count: number;
}

const ListVideosService = async ({
  searchParam = "",
  userId,
  isAdmin = false
}: Request): Promise<Response> => {
  let whereCondition = {};

  if (searchParam) {
    whereCondition = {
      [Op.or]: [
        { title: { [Op.like]: `%${searchParam}%` } }
      ]
    };
  }

  const { count, rows: videos } = await Video.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: User,
        as: "users",
        attributes: ["id", "name"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  if (!isAdmin && userId) {
    const filteredVideos = videos.filter(video => {
      if (!video.users || video.users.length === 0) return true;
      
      return video.users.some(u => u.id === userId);
    });

    return {
      videos: filteredVideos,
      count: filteredVideos.length
    };
  }

  return {
    videos,
    count
  };
};

export default ListVideosService;
