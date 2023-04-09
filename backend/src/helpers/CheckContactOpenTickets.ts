import { Op } from "sequelize";
import AppError from "../errors/AppError";
import Ticket from "../models/Ticket";
import User from "../models/User";

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
    include: [{ model: User, as: "user" }]
  });

  if (ticket) {
    const userName = ticket.user?.name;

    if (userName) {
      throw new AppError(`ERR_OPEN_USER_TICKET ${userName}`);
    } else {
      throw new AppError("ERR_NONE_USER_TICKET");
    }
  }
};

export default CheckContactOpenTickets;
