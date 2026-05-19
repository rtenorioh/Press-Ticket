import { IChannel } from "../../controllers/ChannelHubController";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  channels: IChannel[];
}

interface Response {
  whatsapps: Whatsapp[];
}

const CreateChannelsService = async ({
  channels
}: Request): Promise<Response> => {
  // Build one Whatsapp instance per channel and persist via bulkCreate.
  // The spread is intentional: only the fields Whatsapp knows about are used.
  const records = channels.map(channel => {
    const w = Whatsapp.build({
      name: channel.name,
      type: channel.channel,
      qrcode: channel.id,
      status: "CONNECTED",
      isDefault: channel.isDefault ?? false
    });
    return w.dataValues;
  });

  const whatsapps = await Whatsapp.bulkCreate(records);

  return { whatsapps };
};

export default CreateChannelsService;
