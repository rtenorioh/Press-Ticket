import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";

const CheckOpenTicketsService = async (
  contactId: number
): Promise<Ticket | null> => {
  try {
    const openTicket = await Ticket.findOne({
      where: {
        contactId,
        status: "open"
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "online"]
        },
        {
          model: Whatsapp,
          as: "whatsapp",
          attributes: ["id", "name"]
        }
      ]
    });

    return openTicket;
  } catch (err) {
    logger.error(`Erro ao verificar tickets abertos: ${err.message}`);
    throw new Error("Erro ao verificar tickets abertos");
  }
};

export default CheckOpenTicketsService;
