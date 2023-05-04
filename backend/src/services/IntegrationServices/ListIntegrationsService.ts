import Integration from "../../models/Integration";

const ListIntegrationsService = async (): Promise<
  Integration[] | undefined
> => {
  const integrations = await Integration.findAll();

  return integrations;
};

export default ListIntegrationsService;
