import * as Yup from "yup";

import AppError from "../../errors/AppError";
import ClientStatus from "../../models/ClientStatus";
import ShowService from "./ShowService";

interface ClientStatusData {
  id?: number;
  name?: string;
  color?: string;
}

interface Request {
  clientStatusData: ClientStatusData;
  id: string | number;
}

const UpdateService = async ({
  clientStatusData,
  id
}: Request): Promise<ClientStatus> => {
  try {
    const clientStatus = await ShowService(id);
    const { name, color } = clientStatusData;
    
    if (name) {
      const schema = Yup.object().shape({
        name: Yup.string().min(3, "O nome do status deve ter pelo menos 3 caracteres")
      });

      try {
        await schema.validate({ name });
      } catch (err: any) {
        throw new AppError(err.message, 400);
      }
    }

    const updateData: ClientStatusData = {};
    
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;

    await clientStatus.update(updateData);

    await clientStatus.reload();
    
    return clientStatus;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error("Erro ao atualizar status:", error);
    throw new AppError("Erro ao atualizar status. Verifique os dados e tente novamente.", 500);
  }
};

export default UpdateService;
