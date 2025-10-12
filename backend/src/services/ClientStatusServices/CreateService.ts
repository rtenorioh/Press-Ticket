import * as Yup from "yup";

import AppError from "../../errors/AppError";
import ClientStatus from "../../models/ClientStatus";

interface Request {
  name: string;
  color: string;
}

const CreateService = async ({
  name,
  color = "#000000"
}: Request): Promise<ClientStatus> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(3)
      .test("Check-unique-name", "ERR_CLIENT_STATUS_NAME_ALREADY_EXISTS", async value => {
        if (value) {
          const statusWithSameName = await ClientStatus.findOne({
            where: { name: value }
          });

          return !statusWithSameName;
        }
        return false;
      })
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const [clientStatus] = await ClientStatus.findOrCreate({
    where: { name, color },
    defaults: { name, color }
  });

  await clientStatus.reload();

  return clientStatus;
};

export default CreateService;
