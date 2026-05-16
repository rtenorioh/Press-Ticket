import express from "express";
import isAuth from "../middleware/isAuth";
import isMasterAdmin from "../middleware/isMasterAdmin";
import * as VersionCheckController from "../controllers/VersionCheckController";

const versionCheckRoutes = express.Router();

versionCheckRoutes.get(
  "/version-check",
  isAuth,
  isMasterAdmin,
  VersionCheckController.checkVersion
);
versionCheckRoutes.post(
  "/system-update",
  isAuth,
  isMasterAdmin,
  VersionCheckController.runSystemUpdate
);

export default versionCheckRoutes;
