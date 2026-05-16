import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";

interface Request {
  key: string;
}

const ListSettingsServiceOne = async ({
  key
}: Request): Promise<Setting | undefined> => {
  const setting = await Setting.findOne({
    where: { key }
  });

  if (!setting) {
    throw new AppError("ERR_NO_SETTING_FOUND", 404);
  }

  return setting;
};

export default ListSettingsServiceOne;
