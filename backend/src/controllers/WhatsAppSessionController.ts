import { Request, Response } from "express";
import { getWbot, removeWbot } from "../libs/wbot";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import GetClientIp from "../helpers/GetClientIp";

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);
  const whatsapp = await ShowWhatsAppService(whatsappId);

  StartWhatsAppSession(whatsapp);

  // LOG: Sessão iniciada
  try {
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.START,
      description: `Sessão do WhatsApp "${whatsapp.name}" iniciada`,
      entityType: EntityTypes.WHATSAPP,
      entityId: whatsapp.id,
      ip: clientIp,
      additionalData: {
        whatsappName: whatsapp.name,
        status: whatsapp.status
      }
    });
  } catch (error) {
    console.error('Erro ao criar log de iniciar sessão:', error);
  }

  return res.status(200).json({ message: "Starting session." });
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);

  const { whatsapp } = await UpdateWhatsAppService({
    whatsappId,
    whatsappData: { session: "" }
  });

  StartWhatsAppSession(whatsapp);

  // LOG: Sessão reconectada
  try {
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.CONNECT,
      description: `Sessão do WhatsApp "${whatsapp.name}" reconectada`,
      entityType: EntityTypes.WHATSAPP,
      entityId: whatsapp.id,
      ip: clientIp,
      additionalData: {
        whatsappName: whatsapp.name,
        action: 'reconnect'
      }
    });
  } catch (error) {
    console.error('Erro ao criar log de reconectar sessão:', error);
  }

  return res.status(200).json({ message: "Starting session." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { whatsappId } = req.params;
    const logUserId = req.user?.id || 1;
    const clientIp = GetClientIp(req);
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

    // LOG: Sessão desconectada
    try {
      await createActivityLog({
        userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
        action: ActivityActions.DISCONNECT,
        description: `Sessão do WhatsApp "${whatsapp.name}" desconectada`,
        entityType: EntityTypes.WHATSAPP,
        entityId: whatsapp.id,
        ip: clientIp,
        additionalData: {
          whatsappName: whatsapp.name,
          previousStatus: whatsapp.status,
          number: whatsapp.number
        }
      });
    } catch (error) {
      console.error('Erro ao criar log de desconectar sessão:', error);
    }

    return res.status(200).json({ message: "Session disconnected." });
  } catch (error) {
    console.error("Erro ao desconectar:", error);
    return res.status(500).json({ error: "Failed to disconnect session." });
  }
};

export default { store, remove, update };
