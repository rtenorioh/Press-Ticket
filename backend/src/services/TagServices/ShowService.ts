import { Sequelize } from "sequelize";
import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";

const TagService = async (id: string | number): Promise<Tag> => {
  try {
    const tagExists = await Tag.findByPk(id);
    
    if (!tagExists) {
      throw new AppError("ERR_NO_TAG_FOUND", 404);
    }
    
    const tag = await Tag.findByPk(id, {
      include: [
        {
          model: Contact,
          as: "contacts",
          attributes: [],
          through: { attributes: [] }
        }
      ],
      attributes: {
        include: [
          [Sequelize.fn("COUNT", Sequelize.col("contacts.id")), "contactsCount"]
        ]
      },
      group: ["Tag.id"]
    });
    
    return tag!;
  } catch (error) {
    if (error.message !== "ERR_NO_TAG_FOUND") {
      console.error("Erro ao buscar tag com contagem:", error);
      const tagBasic = await Tag.findByPk(id);
      if (!tagBasic) {
        throw new AppError("ERR_NO_TAG_FOUND", 404);
      }
      return tagBasic;
    }
    throw error;
  }
};

export default TagService;
