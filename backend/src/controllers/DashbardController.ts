import { Request, Response } from "express";

import DashboardDataService, {
  DashboardData,
  Params
} from "../services/ReportService/DashbardDataService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const params : Params = req.query;
  let daysInterval = 3;

  const dashboardData: DashboardData = await DashboardDataService(
    params
  );
  return res.status(200).json(dashboardData);
};
