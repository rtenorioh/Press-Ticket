import { Request, Response } from "express";

import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import UpdateIntegrationService from "../services/IntegrationServices/UpdateIntegrationService";
import ListIntegrationsService from "../services/IntegrationServices/ListIntegrationsService";

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
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { integrationKey: key } = req.params;
  const { value } = req.body;

  const integration = await UpdateIntegrationService({
    key,
    value
  });

  const io = getIO();
  io.emit("integrations", {
    action: "update",
    integration
  });

  return res.status(200).json(integration);
};
