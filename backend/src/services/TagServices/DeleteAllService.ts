import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";

const DeleteAllService = async (): Promise<void> => {
  await Tag.findAll();

  if (!Tag) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }

  await Tag.destroy({ where: {} });
};

export default DeleteAllService;
