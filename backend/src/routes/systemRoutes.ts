import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as sytemController from "../controllers/SystemController";
import * as diskSpaceController from "../controllers/DiskSpaceController";
import * as memoryUsageController from "../controllers/MemoryUsageController";
import * as cpuUsageController from "../controllers/CpuUsageController";
import * as databaseMonitorController from "../controllers/DatabaseMonitorController";

const systemRoutes = Router();

systemRoutes.post("/restartpm2", isAuth, sytemController.restartPm2);
systemRoutes.get("/disk-space", isAuth, diskSpaceController.getDiskSpace);
systemRoutes.get("/folder-contents", isAuth, diskSpaceController.getFolderContent);
systemRoutes.get("/memory-usage", isAuth, memoryUsageController.getMemoryUsage);
systemRoutes.get("/cpu-usage", isAuth, cpuUsageController.cpuUsage);
systemRoutes.get("/database-status", isAuth, databaseMonitorController.getDatabaseStatus);

export default systemRoutes;
