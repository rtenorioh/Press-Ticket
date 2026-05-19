import { Sequelize } from "sequelize";
import ActivityLog from "../../models/ActivityLog";

const ListActionsService = async (): Promise<string[]> => {
  const rawActions = (await ActivityLog.findAll({
    attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("action")), "action"]],
    raw: true
  })) as unknown as Record<string, unknown>[];

  if (rawActions.length === 0) {
    return [
      "login",
      "logout",
      "create",
      "update",
      "delete",
      "transfer",
      "accept",
      "close",
      "reopen"
    ];
  }

  return rawActions.map(item => item.action as string);
};

export default ListActionsService;
