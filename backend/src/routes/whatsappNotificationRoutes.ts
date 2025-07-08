import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as WhatsappNotificationController from "../controllers/WhatsappNotificationController";

const whatsappNotificationRoutes = Router();

whatsappNotificationRoutes.post(
  "/whatsapp-notification/:whatsappId",
  isAuth,
  WhatsappNotificationController.notifyChannel
);

whatsappNotificationRoutes.post(
  "/whatsapp-notification/check/all",
  isAuth,
  WhatsappNotificationController.notifyAllDisconnected
);

export default whatsappNotificationRoutes;
