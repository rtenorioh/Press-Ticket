import { Router } from "express";
import * as ApiTokenController from "../controllers/ApiTokenController";
import isAuth from "../middleware/isAuth";

const apiTokenRoutes = Router();

apiTokenRoutes.get("/api-tokens", isAuth, ApiTokenController.index);
apiTokenRoutes.get("/api-tokens/:id", isAuth, ApiTokenController.show);
apiTokenRoutes.post("/api-tokens", isAuth, ApiTokenController.store);
apiTokenRoutes.delete("/api-tokens/:id", isAuth, ApiTokenController.remove);

export default apiTokenRoutes;