import AppError from "../../errors/AppError";
import ApiToken from "../../models/ApiToken";

const FindByTokenService = async (token: string): Promise<ApiToken> => {
  const apiToken = await ApiToken.findOne({
    where: { token }
  });

  if (!apiToken) {
    throw new AppError("ERR_TOKEN_NOT_FOUND", 404);
  }

  return apiToken;
};

export default FindByTokenService;
