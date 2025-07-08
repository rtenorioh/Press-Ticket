import { Op } from "sequelize";
import User from "../../models/User";

interface Request {
  profiles: string[];
}

const FindAdminUsersService = async ({
  profiles
}: Request): Promise<User[]> => {
  const users = await User.findAll({
    where: {
      profile: {
        [Op.in]: profiles
      }
    }
  });

  return users;
};

export default FindAdminUsersService;
