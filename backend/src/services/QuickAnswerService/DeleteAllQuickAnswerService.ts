import QuickAnswer from "../../models/QuickAnswer";
import AppError from "../../errors/AppError";

const DeleteAllQuickAnswerService = async (): Promise<void> => {
  await QuickAnswer.findAll();

  if (!QuickAnswer) {
    throw new AppError("ERR_NO_QUICK_ANSWER_FOUND", 404);
  }

  await QuickAnswer.destroy({
    where: { }
  });
};

export default DeleteAllQuickAnswerService;