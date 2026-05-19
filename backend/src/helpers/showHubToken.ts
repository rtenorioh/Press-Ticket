import Setting from "../models/Integration";

export const showHubToken = async (): Promise<string> => {
  const notificameHubToken = await Setting.findOne({
    where: {
      key: "hubToken"
    }
  });

  if (!notificameHubToken) {
    throw new Error("Notificame Hub token not found");
  }

  return notificameHubToken.value.trim().replace(/[\r\n]/g, "");
};
