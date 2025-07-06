import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as VideoController from "../controllers/VideoController";

const videoRoutes = Router();

videoRoutes.get("/videos", isAuth, VideoController.index);
videoRoutes.get("/videos/:id", isAuth, VideoController.show);
videoRoutes.post("/videos", isAuth, VideoController.store);
videoRoutes.put("/videos/:id", isAuth, VideoController.update);
videoRoutes.delete("/videos/:id", isAuth, VideoController.remove);

export default videoRoutes;
