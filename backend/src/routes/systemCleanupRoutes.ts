import express from "express";
import isAuth from "../middleware/isAuth";
import * as SystemCleanupController from "../controllers/SystemCleanupController";

const systemCleanupRoutes = express.Router();

systemCleanupRoutes.get("/system-cleanup", isAuth, SystemCleanupController.index);
systemCleanupRoutes.post("/system-cleanup", isAuth, SystemCleanupController.store);
systemCleanupRoutes.post("/system-cleanup/execute", isAuth, SystemCleanupController.execute);

export default systemCleanupRoutes;
