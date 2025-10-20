import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";
import GetDefaultWhatsAppByUser from "./GetDefaultWhatsAppByUser";

const GetDefaultWhatsApp = async (
  userId?: number
): Promise<Whatsapp> => {
  if(userId) {
    const whatsappByUser = await GetDefaultWhatsAppByUser(userId);
    if(whatsappByUser !== null) {
      return whatsappByUser;
    }
  }

  let defaultWhatsapp = await Whatsapp.findOne({
    where: { isDefault: true, type: "wwebjs" }
  });

  if (!defaultWhatsapp) {
    defaultWhatsapp = await Whatsapp.findOne({
      where: { 
        status: "CONNECTED",
        type: "wwebjs"
      }
    });
  }

  if (!defaultWhatsapp) {
    throw new AppError("ERR_NO_DEF_WAPP_FOUND");
  }

  return defaultWhatsapp;
};

export default GetDefaultWhatsApp;