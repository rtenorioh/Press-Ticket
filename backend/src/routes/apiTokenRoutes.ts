import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ApiTokenController from "../controllers/ApiTokenController";

const apiTokenRoutes = Router();

apiTokenRoutes.get("/api-tokens", isAuth, ApiTokenController.index);
apiTokenRoutes.get("/api-tokens/:id", isAuth, ApiTokenController.show);
apiTokenRoutes.post("/api-tokens", isAuth, ApiTokenController.store);
apiTokenRoutes.delete("/api-tokens/:id", isAuth, ApiTokenController.remove);

export default apiTokenRoutes;
