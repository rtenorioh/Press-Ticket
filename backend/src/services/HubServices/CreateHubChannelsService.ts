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
      type: channel.channel,
      qrcode: channel.id,
      status: "CONNECTED"
    };
  });

  const whatsapps = await Whatsapp.bulkCreate(channels);

  // for(const whatsapp of whatsapps){
  //   const connection = await Whatsapp.findOne({
  //     where: { qrcode: whatsapp.id }
  //   });
  //   const io = getIO();
  //   io.emit("whatsapp", {
  //     action: "update",
  //     connection
  //   });
  // }

  return { whatsapps };
};

export default CreateChannelsService;
