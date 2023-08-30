import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as sytemController from "../controllers/SystemController";

const systemRoutes = Router();

systemRoutes.post("/restartpm2", isAuth, sytemController.restartPm2);

export default systemRoutes;
