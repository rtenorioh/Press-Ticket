import AppError from "../../errors/AppError";
import ApiToken from "../../models/ApiToken";

const DeleteApiTokenService = async (id: number): Promise<void> => {
  const token = await ApiToken.findByPk(id);

  if (!token) {
    throw new AppError("ERR_TOKEN_NOT_FOUND", 404);
  }

  await token.destroy();
};

export default DeleteApiTokenService;
