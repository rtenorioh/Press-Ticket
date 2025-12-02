import express from "express";
import * as VersionController from "../controllers/VersionController";
import * as WhatsappLibController from "../controllers/WhatsappLibController";
import isAuth from "../middleware/isAuth";
import isMasterAdmin from "../middleware/isMasterAdmin";

const versionRoutes = express.Router();

versionRoutes.get("/version", isAuth, isMasterAdmin, VersionController.getVersion);
versionRoutes.post("/whatsapp-lib/update", isAuth, isMasterAdmin, WhatsappLibController.updateWhatsappLibrary);
versionRoutes.post("/whatsapp-lib/update-git", isAuth, isMasterAdmin, WhatsappLibController.updateWhatsappLibraryFromGit);

export default versionRoutes;
