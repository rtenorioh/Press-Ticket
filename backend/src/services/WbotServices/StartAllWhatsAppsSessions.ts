import { setChannelWebhook } from "../../helpers/setChannelHubWebhook";
import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService";
import { StartWhatsAppSession } from "./StartWhatsAppSession";

export const StartAllWhatsAppsSessions = async (): Promise<void> => {
  const whatsapps = await ListWhatsAppsService();
  if (whatsapps.length > 0) {
    whatsapps.forEach(whatsapp => {
      if (whatsapp.type === "wwebjs") {
        StartWhatsAppSession(whatsapp);
      } else {
        setChannelWebhook(whatsapp, whatsapp.id.toString());
      }
    });
  }
};
