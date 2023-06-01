import TicketTraking from "../../models/TicketTraking";

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

  const ticketTraking = await TicketTraking.findOne({
    where: {
      ticketId,
      finishedAt: null
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
