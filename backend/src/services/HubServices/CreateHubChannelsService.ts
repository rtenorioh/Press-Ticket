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
  channels = channels.map(channel => {
    return {
      ...channel,
      id: undefined,
      type: channel.channel,
      qrcode: channel.id,
      status: "CONNECTED"
    };
  });

  const whatsapps = await Whatsapp.bulkCreate(channels);

  return { whatsapps };
};

export default CreateChannelsService;
