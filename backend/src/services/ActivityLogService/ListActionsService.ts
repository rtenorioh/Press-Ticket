import { Sequelize } from "sequelize";
import ActivityLog from "../../models/ActivityLog";

const ListActionsService = async (): Promise<string[]> => {
  const actions = await ActivityLog.findAll({
    attributes: [
      [Sequelize.fn("DISTINCT", Sequelize.col("action")), "action"]
    ],
    raw: true
  });

  if (actions.length === 0) {
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

  return actions.map((item: any) => item.action);
};

export default ListActionsService;
