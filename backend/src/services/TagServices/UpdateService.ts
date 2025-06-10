import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";
import ShowService from "./ShowService";

interface TagData {
  id?: number;
  name?: string;
  color?: string;
}

interface Request {
  tagData: TagData;
  id: string | number;
}

const UpdateUserService = async ({
  tagData,
  id
}: Request): Promise<Tag> => {
  try {
    const tag = await ShowService(id);
    const { name, color } = tagData;
    
    if (name) {
      const schema = Yup.object().shape({
        name: Yup.string().min(3, "O nome da tag deve ter pelo menos 3 caracteres")
      });

      try {
        await schema.validate({ name });
      } catch (err: any) {
        throw new AppError(err.message, 400);
      }
    }

    const updateData: TagData = {};
    
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;

    await tag.update(updateData);

    await tag.reload();
    
    return tag;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error("Erro ao atualizar tag:", error);
    throw new AppError("Erro ao atualizar tag. Verifique os dados e tente novamente.", 500);
  }
};

export default UpdateUserService;
