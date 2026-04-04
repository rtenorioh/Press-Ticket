import Setting from "../../models/Setting";

interface Request {
  key: string;
  value: string;
}

const UpdateSettingService = async ({
  key,
  value
}: Request): Promise<Setting | undefined> => {
  const setting = await Setting.findOne({ where: { key } });

  if (setting) {
    await setting.update({ value });
    return setting;
  }

  const newSetting = await Setting.create({ key, value });
  return newSetting;
};

export default UpdateSettingService;
