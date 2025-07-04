import express from "express";
import isAuth from "../middleware/isAuth";
import * as SystemUpdateController from "../controllers/SystemUpdateController";

const systemUpdateRoutes = express.Router();

systemUpdateRoutes.get("/system-update/check", isAuth, SystemUpdateController.checkUpdates);
systemUpdateRoutes.post("/system-update/install", isAuth, SystemUpdateController.installUpdate);
systemUpdateRoutes.get("/system-update/status", isAuth, SystemUpdateController.getStatus);
systemUpdateRoutes.get("/system-update/backups", isAuth, SystemUpdateController.getBackups);
systemUpdateRoutes.post("/system-update/restore/:backupFileName", isAuth, SystemUpdateController.restoreFromBackup);

export default systemUpdateRoutes;
