import AppError from "../../errors/AppError";
import Integration from "../../models/Integration";

interface Request {
  key: string;
  value: string;
}

const UpdateIntegrationService = async ({
  key,
  value
}: Request): Promise<Integration | undefined> => {
  const integration = await Integration.findOne({
    where: { key }
  });

  if (!integration) {
    throw new AppError("ERR_NO_INTEGRATION_FOUND", 404);
  }

  await integration.update({ value });

  return integration;
};

export default UpdateIntegrationService;
