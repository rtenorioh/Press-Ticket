import { Op, WhereOptions } from "sequelize";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import EmitTicketCounterService from "./EmitTicketCounterService";
import { logger } from "../../utils/logger";

interface Request {
  status?: string;
  groupsOnly?: string;
}

interface Response {
  count: number;
}

// Exclusão em massa (destrutiva, irreversível) de tickets por filtro.
// Espelha o filtro do CloseTicketsService/close-all, mas em vez de fechar,
// apaga os tickets. NÃO envia nenhuma mensagem ao contato (diferente do
// fechar em massa, que pode enviar farewellMessage). Deleta em instância
// (ticket.destroy()) para acionar os mesmos hooks/cascata do delete unitário.
const DeleteAllTicketsService = async ({
  status,
  groupsOnly
}: Request): Promise<Response> => {
  let whereCondition: WhereOptions = {};

  if (status === "open") {
    whereCondition = { status: "open" };
  } else if (status === "pending") {
    whereCondition = { status: "pending" };
  } else {
    whereCondition = {
      status: {
        [Op.or]: ["open", "pending"]
      }
    };
  }

  if (groupsOnly === "true") {
    whereCondition.isGroup = true;
  } else if (groupsOnly === "false") {
    whereCondition.isGroup = false;
  }

  const tickets = await Ticket.findAll({
    where: whereCondition,
    include: [{ model: Contact, as: "contact" }]
  });

  let count = 0;
  for (const ticket of tickets) {
    try {
      await ticket.destroy();
      count += 1;
    } catch (err) {
      logger.error(
        `Erro ao excluir ticket ${ticket.id} em massa: ${err}`
      );
    }
  }

  try {
    await EmitTicketCounterService();
  } catch (err) {
    logger.error(`Erro ao emitir contadores após exclusão em massa: ${err}`);
  }

  return { count };
};

export default DeleteAllTicketsService;
