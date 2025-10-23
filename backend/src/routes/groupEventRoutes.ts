import express from "express";
import isAuth from "../middleware/isAuth";
import * as GroupEventController from "../controllers/GroupEventController";

const groupEventRoutes = express.Router();

groupEventRoutes.get("/group-events", isAuth, GroupEventController.listEvents);
groupEventRoutes.get("/group-events/:eventId", isAuth, GroupEventController.getEvent);
groupEventRoutes.delete("/group-events/:eventId", isAuth, GroupEventController.deleteEvent);
groupEventRoutes.post("/group-events/cleanup", isAuth, GroupEventController.deleteOldEvents);
groupEventRoutes.get("/group-events/stats/group/:groupId", isAuth, GroupEventController.getGroupStats);
groupEventRoutes.get("/group-events/stats/whatsapp/:whatsappId", isAuth, GroupEventController.getWhatsappStats);

export default groupEventRoutes;
