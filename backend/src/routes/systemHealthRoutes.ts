import express from "express";
import isAuth from "../middleware/isAuth";
import * as SystemHealthController from "../controllers/SystemHealthController";

const systemHealthRoutes = express.Router();

systemHealthRoutes.get("/system-health", isAuth, SystemHealthController.index);

export default systemHealthRoutes;
