import ErrorLog from "../../models/ErrorLog";
import { Op } from "sequelize";

const DeleteOldErrorLogsService = async (daysToKeep = 30): Promise<number> => {
  const date = new Date();
  date.setDate(date.getDate() - daysToKeep);

  const result = await ErrorLog.destroy({
    where: {
      createdAt: {
        [Op.lt]: date
      }
    }
  });

  return result;
};

export default DeleteOldErrorLogsService;
