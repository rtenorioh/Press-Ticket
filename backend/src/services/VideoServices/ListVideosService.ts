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

  // Se não for admin e não for requisição via API (userId definido),
  // filtra os vídeos que o usuário tem permissão para ver
  if (!isAdmin && userId) {
    const filteredVideos = videos.filter(video => {
      // Se não há usuários específicos, todos podem ver
      if (!video.users || video.users.length === 0) return true;
      
      // Verifica se o usuário atual está na lista de usuários permitidos
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
