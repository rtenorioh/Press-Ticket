import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const CheckContactNumber = async (number: string): Promise<string> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = getWbot(defaultWhatsapp.id);

  const validNumber: any = await wbot.getNumberId(`${number}@c.us`);
  return validNumber ? validNumber.user : number;
};

export default CheckContactNumber;
