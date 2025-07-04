import ActivityLog from "../../models/ActivityLog";
import User from "../../models/User";

interface Request {
  userId: number;
  action: string;
  description: string;
  entityType?: string;
  entityId?: number;
  additionalData?: object;
}

const CreateActivityLogService = async ({
  userId,
  action,
  description,
  entityType,
  entityId,
  additionalData
}: Request): Promise<ActivityLog> => {
  const activityLog = await ActivityLog.create({
    userId,
    action,
    description,
    entityType,
    entityId,
    additionalData
  });

  return activityLog;
};

export default CreateActivityLogService;
