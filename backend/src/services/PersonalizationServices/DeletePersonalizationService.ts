import AppError from "../../errors/AppError";
import Personalization from "../../models/Personalization";

const deletePersonalization = async (theme: string): Promise<void> => {
  const personalization = await Personalization.findOne({ where: { theme } });

  if (!personalization) {
    throw new AppError("ERR_NO_PERSONALIZATION_FOUND", 404);
  }
  await personalization.destroy();
};

export default deletePersonalization;
