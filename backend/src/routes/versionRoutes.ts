import express from "express";
import * as VersionController from "../controllers/VersionController";
import isAuth from "../middleware/isAuth";

const versionRoutes = express.Router();

versionRoutes.get("/version", isAuth, VersionController.getVersion);

export default versionRoutes;
