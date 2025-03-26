import { Router } from "express";

import apiRoutes from "./apiRoutes";
import authRoutes from "./authRoutes";
import contactRoutes from "./contactRoutes";
import hubChannelRoutes from "./hubChannelRoutes";
import hubMessageRoutes from "./hubMessageRoutes";
import hubWebhookRoutes from "./hubWebhookRoutes";
import integrationRoutes from "./integrationRoutes";
import messageRoutes from "./messageRoutes";
import personalizationRoutes from "./personalizationRoutes";
import queueRoutes from "./queueRoutes";
import quickAnswerRoutes from "./quickAnswerRoutes";
import settingRoutes from "./settingRoutes";
import systemRoutes from "./systemRoutes";
import tagRoutes from "./tagRoutes";
import ticketRoutes from "./ticketRoutes";
import userRoutes from "./userRoutes";
import whatsappRoutes from "./whatsappRoutes";
import whatsappSessionRoutes from "./whatsappSessionRoutes";

const routes = Router();

routes.use(userRoutes);
routes.use("/auth", authRoutes);
routes.use(settingRoutes);
routes.use(contactRoutes);
routes.use(ticketRoutes);
routes.use(whatsappRoutes);
routes.use(messageRoutes);
routes.use(whatsappSessionRoutes);
routes.use(queueRoutes);
routes.use(quickAnswerRoutes);
routes.use("/api/messages", apiRoutes);
routes.use(tagRoutes);
routes.use(integrationRoutes);
routes.use(hubChannelRoutes);
routes.use(hubMessageRoutes);
routes.use(hubWebhookRoutes);
routes.use(systemRoutes);
routes.use(personalizationRoutes);

export default routes;
