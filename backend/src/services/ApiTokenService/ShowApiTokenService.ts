import AppError from "../../errors/AppError";
import ApiToken from "../../models/ApiToken";

const ShowApiTokenService = async (id: number): Promise<ApiToken> => {
  const token = await ApiToken.findByPk(id);

  if (!token) {
    throw new AppError("ERR_TOKEN_NOT_FOUND", 404);
  }

  return token;
};

export default ShowApiTokenService;
