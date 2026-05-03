import Tag from "../../models/Tag";
import Contact from "../../models/Contact";
import ContactTag from "../../models/ContactTag";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface Request {
  contactId: number;
  tagId: number;
}

const RemoveTagFromContactService = async ({
  contactId,
  tagId
}: Request): Promise<Contact> => {
  try {
    const contact = await Contact.findByPk(contactId, { include: [Tag] });
    if (!contact) {
      throw new AppError("Contato não encontrado", 404);
    }

    const tagLinked = await ContactTag.findOne({
      where: { contactId, tagId }
    });
    if (!tagLinked) {
      throw new AppError("Tag não encontrada no contato", 404);
    }

    await ContactTag.destroy({ where: { contactId, tagId } });

    await contact.reload({ include: [Tag] });

    return contact;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error(`Erro ao remover tag do contato: ${error}`);
    throw new AppError("Erro ao remover tag do contato", 500);
  }
};

export default RemoveTagFromContactService;
