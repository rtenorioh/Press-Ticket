import Tag from "../../models/Tag";
import Contact from "../../models/Contact";
import ContactTag from "../../models/ContactTag";
import AppError from "../../errors/AppError";

interface Request {
  tags: number[] | Tag[];
  contactId: number;
}

const SyncTags = async (data: Request): Promise<Contact | null> => {
  try {
    if (!data.contactId) {
      throw new AppError("ID do contato não fornecido", 400);
    }

    const contact = await Contact.findByPk(data.contactId, { include: [Tag] });
    if (!contact) {
      throw new AppError("Contato não encontrado", 404);
    }

    if (!data.tags || !Array.isArray(data.tags)) {
      throw new AppError("Lista de tags inválida", 400);
    }

    const tagIds = data.tags.map(tag => {
      if (typeof tag === 'number') {
        return tag;
      }
      else if (typeof tag === 'object' && tag !== null && 'id' in tag) {
        return tag.id;
      }
      return null;
    }).filter(id => id !== null) as number[];

    const existingTags = await Tag.findAll({
      where: {
        id: tagIds
      }
    });

    if (existingTags.length !== tagIds.length) {
      throw new AppError("Uma ou mais tags não existem", 404);
    }

    const tagList = tagIds.map(tagId => ({ tagId, contactId: data.contactId }));


    await ContactTag.destroy({ where: { contactId: data.contactId } });
    
    await ContactTag.bulkCreate(tagList);

    await contact.reload({ include: [Tag] });

    return contact;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error("Erro ao sincronizar tags:", error);
    throw new AppError("Erro ao sincronizar tags", 500);
  }
};

export default SyncTags;
