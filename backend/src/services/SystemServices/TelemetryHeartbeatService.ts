import axios from "axios";
import { Op } from "sequelize";
import Setting from "../../models/Setting";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import { systemVersion } from "../../config/version";

const TELEMETRY_URL = "https://pressticket.com.br/telemetry.php";

interface TelemetryPayload {
  installation_id: string;
  version: string;
  stats: {
    total_messages: number;
    total_tickets: number;
    active_users: number;
    active_channels: {
      wwebjs: number;
      webchat: number;
      facebook: number;
      instagram: number;
      telegram: number;
      email: number;
    };
  };
}

export const TelemetryHeartbeatService = async (): Promise<void> => {
  if (process.env.ALLOW_TELEMETRY !== "true") {
    return;
  }

  const setting = await Setting.findOne({ where: { key: "userApiToken" } });

  if (!setting || !setting.value) {
    return;
  }

  const installationId: string = setting.value;

  const totalMessages: number = await Message.count();
  const totalTickets: number = await Ticket.count();
  const activeUsers: number = await User.count({
    where: { profile: { [Op.ne]: "masteradmin" } }
  });
  const wwebjsChannels: number = await Whatsapp.count({
    where: { type: "wwebjs" }
  });
  const webchatChannels: number = await Whatsapp.count({
    where: { type: "webchat" }
  });
  const facebookChannels: number = await Whatsapp.count({
    where: { type: "facebook" }
  });
  const instagramChannels: number = await Whatsapp.count({
    where: { type: "instagram" }
  });
  const telegramChannels: number = await Whatsapp.count({
    where: { type: "telegram" }
  });
  const emailChannels: number = await Whatsapp.count({
    where: { type: "email" }
  });

  const payload: TelemetryPayload = {
    installation_id: installationId,
    version: systemVersion,
    stats: {
      total_messages: totalMessages,
      total_tickets: totalTickets,
      active_users: activeUsers,
      active_channels: {
        wwebjs: wwebjsChannels,
        webchat: webchatChannels,
        facebook: facebookChannels,
        instagram: instagramChannels,
        telegram: telegramChannels,
        email: emailChannels
      }
    }
  };

  try {
    await axios.post(TELEMETRY_URL, payload, { timeout: 5000 });
  } catch {
    // Silenciosamente ignora erros de rede
  }
};
