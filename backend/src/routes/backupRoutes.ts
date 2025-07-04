import express from "express";
import isAuth from "../middleware/isAuth";
import * as BackupController from "../controllers/BackupController";

const backupRoutes = express.Router();

backupRoutes.get("/backups", isAuth, BackupController.index);
backupRoutes.post("/backups", isAuth, BackupController.store);
backupRoutes.get("/backups/:filename", isAuth, BackupController.show);
backupRoutes.post("/backups/:filename/restore", isAuth, BackupController.update);
backupRoutes.delete("/backups/:filename", isAuth, BackupController.remove);

export default backupRoutes;
