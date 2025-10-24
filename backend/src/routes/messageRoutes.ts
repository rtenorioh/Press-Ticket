import { Router } from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import isAuth from "../middleware/isAuth";

import * as MessageController from "../controllers/MessageController";

const messageRoutes = Router();

const upload = multer(uploadConfig);

messageRoutes.get("/messages/count", isAuth, MessageController.count);
messageRoutes.get("/messages/:ticketId", isAuth, MessageController.index);
messageRoutes.post("/messages/:ticketId", isAuth, upload.array("medias"), MessageController.store);
messageRoutes.post("/messages/:ticketId/contacts", isAuth, MessageController.sendContacts);
messageRoutes.post("/messages/:ticketId/poll", isAuth, MessageController.sendPoll);
messageRoutes.post("/messages/:ticketId/forward", isAuth, MessageController.forwardMessages);
messageRoutes.post("/messages/edit/:messageId", isAuth, MessageController.edit);
messageRoutes.delete("/messages/:messageId", isAuth, MessageController.remove);
messageRoutes.post("/messages/:ticketId/read", isAuth, MessageController.markAsRead);
messageRoutes.post("/messages/:messageId/reactions", isAuth, MessageController.reactMessage);
messageRoutes.get("/messages/:messageId/reactions", isAuth, MessageController.getReactions);

// Rotas de controle de presença
messageRoutes.post("/messages/:ticketId/presence/typing", isAuth, MessageController.sendTypingIndicator);
messageRoutes.post("/messages/:ticketId/presence/recording", isAuth, MessageController.sendRecordingIndicator);
messageRoutes.post("/messages/:ticketId/presence/available", isAuth, MessageController.setAvailablePresence);

export default messageRoutes;
