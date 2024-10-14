import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as WebhookController from "../controllers/WebhookHubController";

const hubWebhookRoutes = express.Router();
const upload = multer(uploadConfig);

hubWebhookRoutes.post(
  "/hub-webhook/:channelId",
  upload.array("medias"),
  WebhookController.listen
);

export default hubWebhookRoutes;
