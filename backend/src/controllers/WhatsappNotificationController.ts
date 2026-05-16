import { Request, Response } from "express";
import WhatsappNotificationService from "../services/WhatsappServices/WhatsappNotificationService";
import AppError from "../errors/AppError";

export const notifyChannel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;

  if (!whatsappId || isNaN(Number(whatsappId))) {
    throw new AppError("ID do canal inválido", 400);
  }

  const notified = await WhatsappNotificationService.notifyIfNeeded({
    whatsappId: parseInt(whatsappId)
  });

  if (notified) {
    return res
      .status(200)
      .json({ message: "Notificação enviada com sucesso." });
  } else {
    return res.status(200).json({
      message:
        "Notificação não enviada. Tempo mínimo entre notificações não atingido."
    });
  }
};

export const notifyAllDisconnected = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const io = req.app.get("socketIO");

  io.emit("checkDisconnectedChannels");

  return res
    .status(200)
    .json({ message: "Verificação de canais desconectados iniciada" });
};
