import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";

const DeleteAllContactService = async (): Promise<void> => {
  await Contact.findAll();

  if (!Contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  await Contact.destroy({where: {} })
};

export default DeleteAllContactService;