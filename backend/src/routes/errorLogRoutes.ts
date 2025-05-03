import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ErrorLogController from "../controllers/ErrorLogController";

const errorLogRoutes = Router();

errorLogRoutes.post("/", ErrorLogController.store);
errorLogRoutes.get("/", isAuth, ErrorLogController.index);
errorLogRoutes.get("/:id", isAuth, ErrorLogController.show);
errorLogRoutes.delete("/cleanup", isAuth, ErrorLogController.cleanupOldLogs);

export default errorLogRoutes;
