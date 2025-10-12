import ClientStatus from "../../models/ClientStatus";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string | number): Promise<void> => {
  const clientStatus = await ClientStatus.findOne({
    where: { id }
  });

  if (!clientStatus) {
    throw new AppError("ERR_NO_CLIENT_STATUS_FOUND", 404);
  }

  await clientStatus.destroy();
};

export default DeleteService;
