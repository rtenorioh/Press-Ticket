import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import * as BackupController from "../controllers/BackupController";

const backupRoutes = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.sql') || file.originalname.endsWith('.sql.gz')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos .sql ou .sql.gz são permitidos'));
    }
  }
});

backupRoutes.get("/backups", isAuth, BackupController.index);
backupRoutes.post("/backups", isAuth, BackupController.store);
backupRoutes.post("/backups/upload", isAuth, upload.single('file'), BackupController.upload);
backupRoutes.get("/backups/:filename", isAuth, BackupController.show);
backupRoutes.post("/backups/:filename/restore", isAuth, BackupController.update);
backupRoutes.delete("/backups/:filename", isAuth, BackupController.remove);

export default backupRoutes;
