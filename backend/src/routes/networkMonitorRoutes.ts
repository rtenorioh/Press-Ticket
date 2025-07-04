import express from "express";
import isAuth from "../middleware/isAuth";
import * as NetworkMonitorController from "../controllers/NetworkMonitorController";

const networkMonitorRoutes = express.Router();

networkMonitorRoutes.get("/network-status", isAuth, NetworkMonitorController.index);

export default networkMonitorRoutes;
