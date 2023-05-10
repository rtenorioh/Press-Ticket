import { Op } from "sequelize";
import TicketTraking from "../../models/TicketTraking";
import { isEmpty, isNull } from "lodash";

interface Params {
  ticketId: string | number;
  whatsappId?: string | number;
  userId?: string | number;
}

const FindOrCreateATicketTrakingService = async ({
  ticketId,
  whatsappId,
  userId
  }: Params): Promise<TicketTraking > => {
  console.log("FINDORCREATE_one antes")
  const ticketTraking = await TicketTraking.findOne({
    where: {
      ticketId
    }
  });

  if (ticketTraking) {
    return ticketTraking;
  }

  const newRecord = await TicketTraking.create({
    ticketId,
    whatsappId,
    userId
  });

  return newRecord;
};

export default FindOrCreateATicketTrakingService;
