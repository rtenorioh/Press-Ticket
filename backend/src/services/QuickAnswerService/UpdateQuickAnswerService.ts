import QuickAnswer from "../../models/QuickAnswer";
import AppError from "../../errors/AppError";

interface QuickAnswerData {
  shortcut?: string;
  message?: string;
  mediaPath?: string;
}

interface Request {
  quickAnswerData: QuickAnswerData;
  quickAnswerId: string;
}

const UpdateQuickAnswerService = async ({
  quickAnswerData,
  quickAnswerId
}: Request): Promise<QuickAnswer> => {
  const { shortcut, message, mediaPath } = quickAnswerData;

  const quickAnswer = await QuickAnswer.findOne({
    where: { id: quickAnswerId },
    attributes: ["id", "shortcut", "message", "mediaPath"]
  });

  if (!quickAnswer) {
    throw new AppError("ERR_NO_QUICK_ANSWERS_FOUND", 404);
  }
  
  const updateData: any = {};
  if (shortcut !== undefined) updateData.shortcut = shortcut;
  if (message !== undefined) updateData.message = message;
  if (mediaPath !== undefined) updateData.mediaPath = mediaPath;
  
  await quickAnswer.update(updateData);

  await quickAnswer.reload({
    attributes: ["id", "shortcut", "message", "mediaPath"]
  });

  return quickAnswer;
};

export default UpdateQuickAnswerService;
