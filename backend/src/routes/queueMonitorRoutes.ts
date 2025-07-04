import express from "express";
import isAuth from "../middleware/isAuth";
import * as QueueMonitorController from "../controllers/QueueMonitorController";

const queueMonitorRoutes = express.Router();

queueMonitorRoutes.get("/queue-monitor", isAuth, QueueMonitorController.index);

export default queueMonitorRoutes;
