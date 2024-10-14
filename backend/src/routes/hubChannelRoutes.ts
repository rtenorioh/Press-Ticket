import express from "express";

import * as ChannelController from "../controllers/ChannelHubController";
import isAuth from "../middleware/isAuth";

const hubChannelRoutes = express.Router();

hubChannelRoutes.post("/hub-channel/", isAuth, ChannelController.store);
hubChannelRoutes.get("/hub-channel/", isAuth, ChannelController.index);

export default hubChannelRoutes;
