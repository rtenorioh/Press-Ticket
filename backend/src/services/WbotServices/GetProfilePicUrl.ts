import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const GetProfilePicUrl = async (number: string): Promise<string> => {
  try {
    const defaultWhatsapp = await GetDefaultWhatsApp();
    const wbot = await getWbot(defaultWhatsapp.id);
    const profilePicUrl = await wbot.getProfilePicUrl(`${number}@c.us`);
    return profilePicUrl || "";
  } catch (err) {
    return "";
  }
};

export default GetProfilePicUrl;
