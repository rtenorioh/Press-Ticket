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
import * as WhatsAppNumberController from "../controllers/WhatsAppNumberController";
import * as ActivityLogController from "../controllers/ActivityLogController";
import * as BackupController from "../controllers/BackupController";
import * as ErrorLogController from "../controllers/ErrorLogController";
import * as NetworkMonitorController from "../controllers/NetworkMonitorController";
import * as QueueMonitorController from "../controllers/QueueMonitorController";
import * as SystemUpdateController from "../controllers/SystemUpdateController";
import * as VersionController from "../controllers/VersionController";
import * as WhatsappLibController from "../controllers/WhatsappLibController";
import * as SystemController from "../controllers/SystemController";
import * as DiskSpaceController from "../controllers/DiskSpaceController";
import * as MemoryUsageController from "../controllers/MemoryUsageController";
import * as CpuUsageController from "../controllers/CpuUsageController";
import * as DatabaseMonitorController from "../controllers/DatabaseMonitorController";
import * as VideoController from "../controllers/VideoController";
import isApiToken from "../middleware/isApiToken";

const upload = multer(uploadConfig);

const openApiRouter = express.Router();

// Rotas de mensagens
openApiRouter.post("/messages/send", isApiToken('create:messages'), ApiController.sendMessage);
openApiRouter.post("/messages/send-media", isApiToken('create:messages'), upload.array("medias"), ApiController.sendMedia);
openApiRouter.get("/messages/:messageId/media", isApiToken('read:messages'), ApiController.getMediaBase64);

// Rotas de contatos
openApiRouter.get("/contacts", isApiToken('read:contacts'), ContactController.index);
openApiRouter.post("/contacts", isApiToken('create:contacts'), ContactController.store);
openApiRouter.get("/contacts/:contactId", isApiToken('read:contacts'), ContactController.show);
openApiRouter.put("/contacts/:contactId", isApiToken('update:contacts'), ContactController.update);
openApiRouter.delete("/contacts/:contactId", isApiToken('delete:contacts'), ContactController.remove);
openApiRouter.post("/contact", isApiToken('read:contacts'), ContactController.getContact);
openApiRouter.put("/contacts/:contactId/tags", isApiToken('update:contacts'), ContactController.updateTags);

// Rotas de setores
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
openApiRouter.get("/whatsapp/:whatsappId/qrcode", isApiToken('read:whatsapp'), WhatsAppController.getQrCode);
openApiRouter.post("/whatsapp/check-number", isApiToken('read:whatsapp'), WhatsAppNumberController.checkNumber);

// Rotas de Sessão do WhatsApp
openApiRouter.post("/whatsappsession/:whatsappId", isApiToken('create:whatsappsession'), WhatsAppSessionController.store);
openApiRouter.put("/whatsappsession/:whatsappId", isApiToken('update:whatsappsession'), WhatsAppSessionController.update);
openApiRouter.delete("/whatsappsession/:whatsappId", isApiToken('delete:whatsappsession'), WhatsAppSessionController.remove);

// Rotas de Logs de Atividade
openApiRouter.get("/activity-logs", isApiToken('read:activity-logs'), ActivityLogController.index);
openApiRouter.get("/activity-logs/actions", isApiToken('read:activity-logs'), ActivityLogController.actions);
openApiRouter.get("/activity-logs/entities", isApiToken('read:activity-logs'), ActivityLogController.entities);
openApiRouter.get("/activity-logs/:id/details", isApiToken('read:activity-logs'), ActivityLogController.show);

// Rotas de Backup
openApiRouter.get("/backups", isApiToken('read:backups'), BackupController.index);
openApiRouter.post("/backups", isApiToken('create:backups'), BackupController.store);
openApiRouter.get("/backups/:filename", isApiToken('read:backups'), BackupController.show);
openApiRouter.post("/backups/:filename/restore", isApiToken('update:backups'), BackupController.update);
openApiRouter.delete("/backups/:filename", isApiToken('delete:backups'), BackupController.remove);

// Rotas de Logs de Erro
openApiRouter.post("/error-logs", isApiToken('create:error-logs'), ErrorLogController.store);
openApiRouter.get("/error-logs", isApiToken('read:error-logs'), ErrorLogController.index);
openApiRouter.get("/error-logs/:id", isApiToken('read:error-logs'), ErrorLogController.show);
openApiRouter.delete("/error-logs/cleanup", isApiToken('delete:error-logs'), ErrorLogController.cleanupOldLogs);

// Rotas de Monitoramento de Rede
openApiRouter.get("/network-status", isApiToken('read:network-status'), NetworkMonitorController.index);

// Rotas de Monitoramento de Setores
openApiRouter.get("/queue-monitor", isApiToken('read:queue-monitor'), QueueMonitorController.index);

// Rotas de Atualização do Sistema
openApiRouter.get("/system-update/check", isApiToken('read:system-update'), SystemUpdateController.checkUpdates);
openApiRouter.post("/system-update/install", isApiToken('write:system-update'), SystemUpdateController.installUpdate);
openApiRouter.get("/system-update/status", isApiToken('read:system-update'), SystemUpdateController.getStatus);
openApiRouter.get("/system-update/backups", isApiToken('read:system-update'), SystemUpdateController.getBackups);
openApiRouter.post("/system-update/restore/:backupFileName", isApiToken('write:system-update'), SystemUpdateController.restoreFromBackup);

// Rotas de Versão e Biblioteca WhatsApp
openApiRouter.get("/version", isApiToken('read:version'), VersionController.getVersion);
openApiRouter.post("/whatsapp-lib/update", isApiToken('write:whatsapp-lib'), WhatsappLibController.updateWhatsappLibrary);

// Rotas de Sistema
openApiRouter.post("/restartpm2", isApiToken('write:system'), SystemController.restartPm2);
openApiRouter.get("/disk-space", isApiToken('read:system-resources'), DiskSpaceController.getDiskSpace);
openApiRouter.get("/memory-usage", isApiToken('read:system-resources'), MemoryUsageController.getMemoryUsage);
openApiRouter.get("/cpu-usage", isApiToken('read:system-resources'), CpuUsageController.cpuUsage);
openApiRouter.get("/database-status", isApiToken('read:system-resources'), DatabaseMonitorController.getDatabaseStatus);

// Rotas de Vídeo
openApiRouter.get("/videos", isApiToken('read:videos'), VideoController.index);
openApiRouter.get("/videos/:id", isApiToken('read:videos'), VideoController.show);
openApiRouter.post("/videos", isApiToken('write:videos'), VideoController.store);
openApiRouter.put("/videos/:id", isApiToken('write:videos'), VideoController.update);
openApiRouter.delete("/videos/:id", isApiToken('write:videos'), VideoController.remove);

export default openApiRouter;
