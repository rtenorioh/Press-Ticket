import express from "express";
import isAuth from "../middleware/isAuth";
import * as ActivityLogController from "../controllers/ActivityLogController";

const activityLogRoutes = express.Router();

activityLogRoutes.get("/activity-logs/stats", isAuth, ActivityLogController.stats);
activityLogRoutes.get("/activity-logs/actions", isAuth, ActivityLogController.actions);
activityLogRoutes.get("/activity-logs/entities", isAuth, ActivityLogController.entities);
activityLogRoutes.get("/activity-logs/entity-types", isAuth, ActivityLogController.entities);
activityLogRoutes.get("/activity-logs/:id/details", isAuth, ActivityLogController.show);
activityLogRoutes.get("/activity-logs", isAuth, ActivityLogController.index);

export default activityLogRoutes;
