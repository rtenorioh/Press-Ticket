import express from "express";
import * as WhatsAppController from "../controllers/WhatsAppController";
import isAuth from "../middleware/isAuth";

const whatsappRoutes = express.Router();

whatsappRoutes.get("/whatsapp/", isAuth, WhatsAppController.index);

whatsappRoutes.post("/whatsapp/", isAuth, WhatsAppController.store);

whatsappRoutes.get("/whatsapp/:whatsappId", isAuth, WhatsAppController.show);

whatsappRoutes.put("/whatsapp/:whatsappId", isAuth, WhatsAppController.update);

whatsappRoutes.delete(
  "/whatsapp/:whatsappId",
  isAuth,
  WhatsAppController.remove
);

whatsappRoutes.post(
  "/whatsapp/:whatsappId/restart",
  isAuth,
  WhatsAppController.restart
);

whatsappRoutes.post(
  "/whatsapp/:whatsappId/shutdown",
  isAuth,
  WhatsAppController.shutdown
);

export default whatsappRoutes;
