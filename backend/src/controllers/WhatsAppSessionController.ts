import { Request, Response } from "express";
import { getWbot } from "../libs/wbot";
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
    console.log("Recebendo solicitação de desconexão...");
    const { whatsappId } = req.params;
    const whatsapp = await ShowWhatsAppService(whatsappId);

    console.log("Obtendo instância do WhatsApp...");
    const wbot = getWbot(whatsapp.id);

    console.log("Executando logout...");
    if (wbot && typeof wbot.logout === "function") {
      await wbot.logout();
    }

    console.log("Logout concluído. Respondendo ao cliente...");
    return res.status(200).json({ message: "Session disconnected." });
  } catch (error) {
    console.error("Erro ao desconectar:", error);
    return res.status(500).json({ error: "Failed to disconnect session." });
  }
};

export default { store, remove, update };
