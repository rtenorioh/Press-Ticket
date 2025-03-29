import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as ApiController from "../controllers/ApiController";
import * as ContactController from "../controllers/ContactController";
import isApiToken from "../middleware/isApiToken";

const upload = multer(uploadConfig);

const openApiRouter = express.Router();

// Rotas de mensagens
openApiRouter.post("/messages/send", isApiToken('create:messages'), ApiController.sendMessage);
openApiRouter.post("/messages/send-media", isApiToken('create:messages'), upload.array("medias"), ApiController.sendMedia);

// Rotas de contatos
openApiRouter.get("/contacts", isApiToken('read:contacts'), ContactController.index);
openApiRouter.post("/contacts", isApiToken('create:contacts'), ContactController.store);
openApiRouter.get("/contacts/:contactId", isApiToken('read:contacts'), ContactController.show);
openApiRouter.put("/contacts/:contactId", isApiToken('update:contacts'), ContactController.update);
openApiRouter.delete("/contacts/:contactId", isApiToken('delete:contacts'), ContactController.remove);
openApiRouter.post("/contact", isApiToken('create:contacts'), ContactController.getContact);

export default openApiRouter;
