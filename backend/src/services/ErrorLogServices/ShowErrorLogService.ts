import ErrorLog from "../../models/ErrorLog";
import AppError from "../../errors/AppError";

const ShowErrorLogService = async (id: number): Promise<ErrorLog> => {
  const errorLog = await ErrorLog.findByPk(id);
  
  if (!errorLog) {
    throw new AppError("Log de erro não encontrado", 404);
  }
  
  return errorLog;
};

export default ShowErrorLogService;
