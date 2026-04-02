import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

export interface NumberCheckResult {
  number: string;
  numberLid: string | null;
}

const CheckContactNumber = async (number: string): Promise<NumberCheckResult> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = await getWbot(defaultWhatsapp.id);

  const validNumber: any = await (wbot as any).getNumberId(`${number}@c.us`);

  if (!validNumber) {
    return { number, numberLid: null };
  }

  const returnedUser: string = validNumber.user || number;
  const serialized: string = validNumber._serialized || "";
  const server: string = validNumber.server || "c.us";

  const isLid = server === "lid" || serialized.endsWith("@lid");

  if (isLid) {
    return { number, numberLid: returnedUser };
  }

  return { number: returnedUser, numberLid: null };
};

export default CheckContactNumber;
