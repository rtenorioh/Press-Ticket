import { Request, Response } from "express";
import { getWbot, removeWbot } from "../libs/wbot";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await ShowWhatsAppService(whatsappId);

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  const { whatsapp } = await UpdateWhatsAppService({
    whatsappId,
    whatsappData: { session: "" }
  });

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { whatsappId } = req.params;
    const whatsapp = await ShowWhatsAppService(whatsappId);

    try {
      const wbot = getWbot(whatsapp.id);
      if (wbot && typeof wbot.logout === "function") {
        await wbot.logout();
      }
    } catch (wbotError) {
      console.log("Sessão não encontrada ou já desconectada, continuando...");
    }

    removeWbot(whatsapp.id);

    await UpdateWhatsAppService({
      whatsappId,
      whatsappData: { 
        status: "DISCONNECTED",
        qrcode: "",
        session: "",
        number: ""
      }
    });

    return res.status(200).json({ message: "Session disconnected." });
  } catch (error) {
    console.error("Erro ao desconectar:", error);
    return res.status(500).json({ error: "Failed to disconnect session." });
  }
};

export default { store, remove, update };
