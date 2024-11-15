import { Router } from "express";
import uploadConfig from "../config/uploadConfig";
import * as PersonalizationController from "../controllers/PersonalizationController";
import isAuth from "../middleware/isAuth";

const personalizationRoutes = Router();

personalizationRoutes.get("/personalizations", PersonalizationController.list);
personalizationRoutes.put(
  "/personalizations/:theme",
  isAuth,
  uploadConfig.fields([
    { name: "favico", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "logoTicket", maxCount: 1 }
  ]),
  PersonalizationController.createOrUpdate
);
personalizationRoutes.delete(
  "/personalizations/:theme",
  isAuth,
  PersonalizationController.remove
);

export default personalizationRoutes;
