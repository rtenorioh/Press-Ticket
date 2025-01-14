import { Router } from "express";
import uploadConfig from "../config/uploadConfig";
import * as PersonalizationController from "../controllers/PersonalizationController";
import isAuth from "../middleware/isAuth";

const personalizationRoutes = Router();

personalizationRoutes.get("/personalizations", PersonalizationController.list);
personalizationRoutes.delete(
  "/personalizations/:theme",
  isAuth,
  PersonalizationController.remove
);
personalizationRoutes.put(
  "/personalizations/:theme/company",
  isAuth,
  PersonalizationController.createOrUpdateCompany
);

personalizationRoutes.put(
  "/personalizations/:theme/logos",
  isAuth,
  uploadConfig.fields([
    { name: "favico", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "logoTicket", maxCount: 1 }
  ]),
  PersonalizationController.createOrUpdateLogos
);

personalizationRoutes.put(
  "/personalizations/:theme/colors",
  isAuth,
  PersonalizationController.createOrUpdateColors
);

personalizationRoutes.delete(
  "/personalizations/:theme/logos/:logoType",
  isAuth,
  PersonalizationController.deleteLogo
);

export default personalizationRoutes;
