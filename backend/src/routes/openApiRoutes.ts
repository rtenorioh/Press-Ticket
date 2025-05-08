import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as ApiController from "../controllers/ApiController";
import * as ContactController from "../controllers/ContactController";
import * as QueueController from "../controllers/QueueController";
import * as TagController from "../controllers/TagController";
import * as TicketController from "../controllers/TicketController";
import * as WhatsAppController from "../controllers/WhatsAppController";
import WhatsAppSessionController from "../controllers/WhatsAppSessionController";
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

// Rotas de filas
openApiRouter.get("/queue", isApiToken('read:queue'), QueueController.index);
openApiRouter.post("/queue", isApiToken('create:queue'), QueueController.store);
openApiRouter.get("/queue/:queueId", isApiToken('read:queue'), QueueController.show);
openApiRouter.put("/queue/:queueId", isApiToken('update:queue'), QueueController.update);
openApiRouter.delete("/queue/:queueId", isApiToken('delete:queue'), QueueController.remove);

// Rotas de tags
openApiRouter.get("/tags/list", isApiToken('read:tags'), TagController.list);
openApiRouter.get("/tags", isApiToken('read:tags'), TagController.index);
openApiRouter.post("/tags", isApiToken('create:tags'), TagController.store);
openApiRouter.put("/tags/:tagId", isApiToken('update:tags'), TagController.update);
openApiRouter.get("/tags/:tagId", isApiToken('read:tags'), TagController.show);
openApiRouter.delete("/tags/:tagId", isApiToken('delete:tags'), TagController.remove);
openApiRouter.post("/tags/sync", isApiToken('create:tags'), TagController.syncTags);

// Rotas de tickets
openApiRouter.get("/tickets", isApiToken('read:tickets'), TicketController.index);
openApiRouter.get("/tickets/:ticketId", isApiToken('read:tickets'), TicketController.show);
openApiRouter.post("/tickets", isApiToken('create:tickets'), TicketController.store);
openApiRouter.put("/tickets/:ticketId", isApiToken('update:tickets'), TicketController.update);
openApiRouter.delete("/tickets/:ticketId", isApiToken('delete:tickets'), TicketController.remove);
openApiRouter.get("/tickets/contact/:contactId/open", isApiToken('read:tickets'), TicketController.checkOpenTickets);
openApiRouter.put("/tickets/close-all", isApiToken('update:tickets'), TicketController.closeTickets);

// Rotas de WhatsApp
openApiRouter.get("/whatsapp", isApiToken('read:whatsapp'), WhatsAppController.index);
openApiRouter.post("/whatsapp", isApiToken('create:whatsapp'), WhatsAppController.store);
openApiRouter.get("/whatsapp/:whatsappId", isApiToken('read:whatsapp'), WhatsAppController.show);
openApiRouter.put("/whatsapp/:whatsappId", isApiToken('update:whatsapp'), WhatsAppController.update);
openApiRouter.delete("/whatsapp/:whatsappId", isApiToken('delete:whatsapp'), WhatsAppController.remove);
openApiRouter.post("/whatsapp/:whatsappId/restart", isApiToken('update:whatsapp'), WhatsAppController.restart);
openApiRouter.post("/whatsapp/:whatsappId/shutdown", isApiToken('update:whatsapp'), WhatsAppController.shutdown);

// Rotas de Sessão do WhatsApp
openApiRouter.post("/whatsappsession/:whatsappId", isApiToken('create:whatsappsession'), WhatsAppSessionController.store);
openApiRouter.put("/whatsappsession/:whatsappId", isApiToken('update:whatsappsession'), WhatsAppSessionController.update);
openApiRouter.delete("/whatsappsession/:whatsappId", isApiToken('delete:whatsappsession'), WhatsAppSessionController.remove);

export default openApiRouter;
