import { Sequelize } from "sequelize";
import ClientStatus from "../../models/ClientStatus";
import AppError from "../../errors/AppError";

const ShowService = async (id: string | number): Promise<ClientStatus> => {
  try {
    const statusExists = await ClientStatus.findByPk(id);
    
    if (!statusExists) {
      throw new AppError("ERR_NO_CLIENT_STATUS_FOUND", 404);
    }
    
    const clientStatus = await ClientStatus.findByPk(id, {
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM Contacts AS contact
              WHERE contact.status = ClientStatus.name
            )`),
            "contactsCount"
          ]
        ]
      }
    });
    
    return clientStatus!;
  } catch (error) {
    if (error.message !== "ERR_NO_CLIENT_STATUS_FOUND") {
      console.error("Erro ao buscar status com contagem:", error);
      const statusBasic = await ClientStatus.findByPk(id);
      if (!statusBasic) {
        throw new AppError("ERR_NO_CLIENT_STATUS_FOUND", 404);
      }
      return statusBasic;
    }
    throw error;
  }
};

export default ShowService;
