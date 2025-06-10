import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";

interface Response {
  exists: boolean;
  number: string;
  message: string;
}

const CheckWhatsAppNumberService = async (number: string): Promise<Response> => {
  try {
    const defaultWhatsapp = await GetDefaultWhatsApp();
    const wbot = getWbot(defaultWhatsapp.id);

    // Verifica se o número está no formato correto
    if (!number.match(/^\d+$/)) {
      return {
        exists: false,
        number,
        message: "Formato de número inválido. Apenas números são permitidos."
      };
    }

    // Verifica se o número está registrado no WhatsApp
    const isRegistered = await wbot.isRegisteredUser(`${number}@c.us`);
    
    return {
      exists: isRegistered,
      number,
      message: isRegistered 
        ? "Número registrado no WhatsApp" 
        : "Número não registrado no WhatsApp"
    };
  } catch (error) {
    console.error("Erro ao verificar número no WhatsApp:", error);
    throw new AppError("Erro ao verificar número no WhatsApp. Verifique se há uma conexão ativa.");
  }
};

export default CheckWhatsAppNumberService;
