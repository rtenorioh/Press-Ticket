import User from "../../models/User";
import AppError from "../../errors/AppError";

interface Request {
  userRequest?: string;
}

const isQueueIdHistoryBlocked = async ({
  userRequest
}: Request): Promise<boolean> => {
  if (!userRequest) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }
  const user = await User.findByPk(userRequest);
  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }
  return user.allHistoric === "enabled";
};

export default isQueueIdHistoryBlocked;