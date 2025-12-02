import express from "express";
import isAuth from "../middleware/isAuth";
import isMasterAdmin from "../middleware/isMasterAdmin";
import * as SystemUpdateController from "../controllers/SystemUpdateController";

const systemUpdateRoutes = express.Router();

systemUpdateRoutes.get("/system-update/check", isAuth, isMasterAdmin, SystemUpdateController.checkUpdates);
systemUpdateRoutes.post("/system-update/install", isAuth, isMasterAdmin, SystemUpdateController.installUpdate);
systemUpdateRoutes.get("/system-update/status", isAuth, isMasterAdmin, SystemUpdateController.getStatus);
systemUpdateRoutes.get("/system-update/backups", isAuth, isMasterAdmin, SystemUpdateController.getBackups);
systemUpdateRoutes.post("/system-update/restore/:backupFileName", isAuth, isMasterAdmin, SystemUpdateController.restoreFromBackup);

export default systemUpdateRoutes;
