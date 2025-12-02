import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as UserMonitorController from "../controllers/UserMonitorController";

const userMonitorRoutes = Router();

userMonitorRoutes.get("/user-monitor", isAuth, UserMonitorController.index);

export default userMonitorRoutes;
