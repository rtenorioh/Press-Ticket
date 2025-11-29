import { Request, Response } from "express";
import ImportContactsService from "../services/WbotServices/ImportContactsService";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import GetClientIp from "../helpers/GetClientIp";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const userId:number = parseInt(req.user.id);
  const clientIp = GetClientIp(req);
  
  await ImportContactsService(userId);

  // LOG: Importar contatos do telefone
  try {
    await createActivityLog({
      userId,
      action: ActivityActions.IMPORT,
      description: `Contatos do telefone importados`,
      entityType: EntityTypes.CONTACT,
      entityId: 0,
      ip: clientIp,
      additionalData: {
        source: 'phone',
        userId
      }
    });
  } catch (error) {
    console.error('Erro ao criar log de importar contatos:', error);
  }

  return res.status(200).json({ message: "contacts imported" });
};