import ErrorLog from "../../models/ErrorLog";

interface ErrorLogData {
  source: string;
  message: string;
  stack?: string;
  userId?: number;
  username?: string;
  url?: string;
  userAgent?: string;
  component?: string;
  severity?: string;
}

const CreateErrorLogService = async (data: ErrorLogData): Promise<ErrorLog> => {
  const errorLog = await ErrorLog.create({
    source: data.source,
    message: data.message,
    stack: data.stack,
    userId: data.userId,
    username: data.username,
    url: data.url || "",
    userAgent: data.userAgent || "",
    component: data.component || "",
    severity: data.severity || "error"
  });

  return errorLog;
};

export default CreateErrorLogService;
