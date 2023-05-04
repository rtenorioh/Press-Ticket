import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as IntegrationController from "../controllers/IntegrationController";

const integrationRoutes = Router();

integrationRoutes.get("/integrations", isAuth, IntegrationController.index);

integrationRoutes.put(
  "/integrations/:integrationKey",
  isAuth,
  IntegrationController.update
);

export default integrationRoutes;
