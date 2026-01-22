import { Request, Response } from "express";

import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

import ListSettingsService from "../services/SettingServices/ListSettingsService";
import UpdateSettingService from "../services/SettingServices/UpdateSettingService";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import GetClientIp from "../helpers/GetClientIp";
import EmailService from "../services/EmailService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile === "") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const settings = await ListSettingsService();

  return res.status(200).json(settings);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin" && req.user.profile !== "masteradmin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { settingKey: key } = req.params;
  const { value } = req.body;

  const setting = await UpdateSettingService({
    key,
    value
  });

  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);
  
  if (setting) {
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.UPDATE,
      description: `Configuração "${key}" atualizada`,
      entityType: EntityTypes.SETTING,
      entityId: setting.id,
      ip: clientIp,
      additionalData: {
        key: setting.key,
        value: setting.value
      }
    });

    const emailSettings = ["emailUser", "emailPass", "emailHost", "emailPort"];
    if (emailSettings.includes(key)) {
      const emailService = EmailService.getInstance();
      await emailService.reloadTransporter();
    }
  }

  const io = getIO();
  io.emit("settings", {
    action: "update",
    setting
  });

  return res.status(200).json(setting);
};
