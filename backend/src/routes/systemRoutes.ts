import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as sytemController from "../controllers/SystemController";
import * as diskSpaceController from "../controllers/DiskSpaceController";
import * as memoryUsageController from "../controllers/MemoryUsageController";

const systemRoutes = Router();

systemRoutes.post("/restartpm2", isAuth, sytemController.restartPm2);
systemRoutes.get("/disk-space", isAuth, diskSpaceController.getDiskSpace);
systemRoutes.get("/memory-usage", isAuth, memoryUsageController.getMemoryUsage);

export default systemRoutes;
