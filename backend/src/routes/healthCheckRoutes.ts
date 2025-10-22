import express from "express";
import isAuth from "../middleware/isAuth";
import * as HealthCheckController from "../controllers/HealthCheckController";

const healthCheckRoutes = express.Router();

healthCheckRoutes.get("/health-check", isAuth, HealthCheckController.index);
healthCheckRoutes.get("/health-check/:whatsappId", isAuth, HealthCheckController.show);

export default healthCheckRoutes;
