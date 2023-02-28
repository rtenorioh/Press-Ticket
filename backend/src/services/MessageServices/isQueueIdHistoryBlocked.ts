import Setting from "../../models/Setting";
import User from "../../models/User";

const isQueueIdHistoryBlocked = async (): Promise<boolean> => {
  const setting = await Setting.findOne({ where: { key: "allHistoric" } });
  return setting?.value === "enabled";
};

// console.log(isQueueIdHistoryBlocked)
export default isQueueIdHistoryBlocked;
