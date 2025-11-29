import { Request, Response } from "express";

import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

import ListIntegrationsService from "../services/IntegrationServices/ListIntegrationsService";
import UpdateIntegrationService from "../services/IntegrationServices/UpdateIntegrationService";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import GetClientIp from "../helpers/GetClientIp";

export const index = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile === "") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const integrations = await ListIntegrationsService();

  return res.status(200).json(integrations);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin" && req.user.profile !== "masteradmin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { integrationKey: key } = req.params;
  const { value } = req.body;

  const integration = await UpdateIntegrationService({
    key,
    value
  });

  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);
  
  if (integration) {
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.UPDATE,
      description: `Integração "${key}" atualizada`,
      entityType: EntityTypes.INTEGRATION,
      entityId: integration.id,
      ip: clientIp,
      additionalData: {
        key: integration.key,
        value: integration.value
      }
    });
  }

  const io = getIO();
  io.emit("integrations", {
    action: "update",
    integration
  });

  return res.status(200).json(integration);
};
