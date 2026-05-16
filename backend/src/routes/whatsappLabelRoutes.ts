import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as WhatsappLabelController from "../controllers/WhatsappLabelController";

const whatsappLabelRoutes = Router();

whatsappLabelRoutes.get(
  "/whatsapp-labels",
  isAuth,
  WhatsappLabelController.index
);
whatsappLabelRoutes.post(
  "/whatsapp-labels/sync",
  isAuth,
  WhatsappLabelController.sync
);

export default whatsappLabelRoutes;
