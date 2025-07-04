import express from "express";
import * as VersionController from "../controllers/VersionController";
import * as WhatsappLibController from "../controllers/WhatsappLibController";
import isAuth from "../middleware/isAuth";

const versionRoutes = express.Router();

versionRoutes.get("/version", isAuth, VersionController.getVersion);
versionRoutes.post("/whatsapp-lib/update", isAuth, WhatsappLibController.updateWhatsappLibrary);

export default versionRoutes;
