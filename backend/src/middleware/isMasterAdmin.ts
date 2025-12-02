import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

const isMasterAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const { profile } = req.user;

  if (profile?.toUpperCase() !== "MASTERADMIN") {
    throw new AppError("ERR_ACCESS_DENIED: Only Master Admin can access this resource", 403);
  }

  return next();
};

export default isMasterAdmin;
