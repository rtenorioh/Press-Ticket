import { Op } from "sequelize";
import AppError from "../errors/AppError";
import Ticket from "../models/Ticket";
import User from "../models/User";
import { logger } from "../utils/logger";

const CheckContactOpenTickets = async (
  contactId: number,
  whatsappId: number
): Promise<void> => {
  const ticket = await Ticket.findOne({
    where: {
      contactId,
      whatsappId,
      status: {
        [Op.or]: ["open", "pending"]
      }
    },
    include: [{ model: User, as: "user" }] // associação com o modelo User
  });

  if (ticket) {
    const userName = ticket.user?.name; // acessa o nome do usuário através do objeto ticket

    logger.info('Debug chamado ja Aberto ' + (userName ? userName : 'Sem Nome'));

    if (userName) {
      throw new AppError(`Já existe um chamado aberto para este contato com ${userName}`);
    } else {
      logger.info('Debug Ticket ja Aberto ' + 'Sem Nome');
      throw new AppError("Já existe um chamado aberto para este contato com Sem Nome");
    }
  }
};

export default CheckContactOpenTickets;