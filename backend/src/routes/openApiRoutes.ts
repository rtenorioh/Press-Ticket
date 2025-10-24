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
import * as UserController from "../controllers/UserController";
import * as QuickAnswerController from "../controllers/QuickAnswerController";
import * as GroupController from "../controllers/GroupController";
import * as ClientStatusController from "../controllers/ClientStatusController";
import * as MessageController from "../controllers/MessageController";
import isApiToken from "../middleware/isApiToken";

const upload = multer(uploadConfig);

const openApiRouter = express.Router();

/**
 * @swagger
 * /v1/messages/send:
 *   post:
 *     summary: Enviar Mensagem de Texto
 *     description: Envia uma mensagem de texto via WhatsApp
 *     tags: [Messages]
 *     security:
 *       - apiToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - body
 *               - userId
 *               - queueId
 *               - whatsappId
 *             properties:
 *               number:
 *                 type: string
 *                 description: Número do destinatário (formato 5511999999999)
 *                 example: "5511999999999"
 *               body:
 *                 type: string
 *                 description: Texto da mensagem
 *                 example: "Olá, esta é uma mensagem de teste!"
 *               userId:
 *                 type: integer
 *                 description: ID do usuário
 *                 example: 1
 *               queueId:
 *                 type: integer
 *                 description: ID do setor
 *                 example: 1
 *               whatsappId:
 *                 type: integer
 *                 description: ID da conexão WhatsApp
 *                 example: 1
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso
 *       401:
 *         description: Token inválido ou não fornecido
 *       403:
 *         description: Sem permissão create:messages
 *       500:
 *         description: Erro interno
 */
openApiRouter.post("/messages/send", isApiToken('create:messages'), ApiController.sendMessage);

/**
 * @swagger
 * /v1/messages/send-media:
 *   post:
 *     summary: Enviar Mensagem com Mídia
 *     description: Envia mensagem com arquivos (imagem, vídeo, áudio, documento)
 *     tags: [Messages]
 *     security:
 *       - apiToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - medias
 *               - userId
 *               - queueId
 *               - whatsappId
 *             properties:
 *               number:
 *                 type: string
 *                 example: "5511999999999"
 *               body:
 *                 type: string
 *                 description: Legenda (opcional)
 *                 example: "Veja esta imagem"
 *               medias:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               userId:
 *                 type: integer
 *                 example: 1
 *               queueId:
 *                 type: integer
 *                 example: 1
 *               whatsappId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Mídia enviada com sucesso
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 */
openApiRouter.post("/messages/send-media", isApiToken('create:messages'), upload.array("medias"), ApiController.sendMedia);

/**
 * @swagger
 * /v1/messages/{messageId}/media:
 *   get:
 *     summary: Obter Mídia em Base64
 *     description: Retorna a mídia de uma mensagem em formato base64
 *     tags: [Messages]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da mensagem
 *     responses:
 *       200:
 *         description: Mídia retornada com sucesso
 *       404:
 *         description: Mensagem ou mídia não encontrada
 */
openApiRouter.get("/messages/:messageId/media", isApiToken('read:messages'), ApiController.getMediaBase64);

// Rotas de contatos

/**
 * @swagger
 * /v1/contacts:
 *   get:
 *     summary: Listar Contatos
 *     description: Retorna lista de todos os contatos
 *     tags: [Contacts]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de contatos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão read:contacts
 */
openApiRouter.get("/contacts", isApiToken('read:contacts'), ContactController.index);

/**
 * @swagger
 * /v1/contacts:
 *   post:
 *     summary: Criar Contato
 *     description: Cria um novo contato
 *     tags: [Contacts]
 *     security:
 *       - apiToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - name
 *             properties:
 *               number:
 *                 type: string
 *                 example: "5511999999999"
 *               name:
 *                 type: string
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 example: "joao@example.com"
 *     responses:
 *       200:
 *         description: Contato criado
 *       400:
 *         description: Dados inválidos
 */
openApiRouter.post("/contacts", isApiToken('create:contacts'), ContactController.store);

/**
 * @swagger
 * /v1/contacts/{contactId}:
 *   get:
 *     summary: Obter Contato
 *     description: Retorna detalhes de um contato
 *     tags: [Contacts]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contato encontrado
 *       404:
 *         description: Contato não encontrado
 */
openApiRouter.get("/contacts/:contactId", isApiToken('read:contacts'), ContactController.show);

/**
 * @swagger
 * /v1/contacts/{contactId}:
 *   put:
 *     summary: Atualizar Contato
 *     description: Atualiza dados de um contato
 *     tags: [Contacts]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contato atualizado
 */
openApiRouter.put("/contacts/:contactId", isApiToken('update:contacts'), ContactController.update);

/**
 * @swagger
 * /v1/contacts/{contactId}:
 *   delete:
 *     summary: Excluir Contato
 *     description: Remove um contato
 *     tags: [Contacts]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contato excluído
 */
openApiRouter.delete("/contacts/:contactId", isApiToken('delete:contacts'), ContactController.remove);

/**
 * @swagger
 * /v1/contact:
 *   post:
 *     summary: Buscar Contato por Número
 *     description: Busca contato pelo número de telefone
 *     tags: [Contacts]
 *     security:
 *       - apiToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               number:
 *                 type: string
 *                 example: "5511999999999"
 *     responses:
 *       200:
 *         description: Contato encontrado
 */
openApiRouter.post("/contact", isApiToken('read:contacts'), ContactController.getContact);

/**
 * @swagger
 * /v1/contacts/{contactId}/tags:
 *   put:
 *     summary: Atualizar Tags do Contato
 *     description: Atualiza as tags associadas ao contato
 *     tags: [Contacts]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tags:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Tags atualizadas
 */
openApiRouter.put("/contacts/:contactId/tags", isApiToken('update:contacts'), ContactController.updateTags);

// Rotas de setores

/**
 * @swagger
 * /v1/queue:
 *   get:
 *     summary: Listar Setores
 *     description: Retorna lista de todos os setores/filas
 *     tags: [Setores]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de setores
 */
openApiRouter.get("/queue", isApiToken('read:queue'), QueueController.index);

/**
 * @swagger
 * /v1/queue:
 *   post:
 *     summary: Criar Setor
 *     description: Cria um novo setor/fila
 *     tags: [Setores]
 *     security:
 *       - apiToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Suporte"
 *               color:
 *                 type: string
 *                 example: "#FF0000"
 *     responses:
 *       200:
 *         description: Setor criado
 */
openApiRouter.post("/queue", isApiToken('create:queue'), QueueController.store);

/**
 * @swagger
 * /v1/queue/{queueId}:
 *   get:
 *     summary: Obter Setor
 *     description: Retorna detalhes de um setor
 *     tags: [Setores]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: queueId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Setor encontrado
 */
openApiRouter.get("/queue/:queueId", isApiToken('read:queue'), QueueController.show);

/**
 * @swagger
 * /v1/queue/{queueId}:
 *   put:
 *     summary: Atualizar Setor
 *     description: Atualiza dados de um setor
 *     tags: [Setores]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: queueId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Setor atualizado
 */
openApiRouter.put("/queue/:queueId", isApiToken('update:queue'), QueueController.update);

/**
 * @swagger
 * /v1/queue/{queueId}:
 *   delete:
 *     summary: Excluir Setor
 *     description: Remove um setor
 *     tags: [Setores]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: queueId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Setor excluído
 */
openApiRouter.delete("/queue/:queueId", isApiToken('delete:queue'), QueueController.remove);

// Rotas de tags

/**
 * @swagger
 * /v1/tags:
 *   get:
 *     summary: Listar Tags
 *     description: Retorna lista de todas as tags
 *     tags: [Tags]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de tags
 */
openApiRouter.get("/tags", isApiToken('read:tags'), TagController.index);

/**
 * @swagger
 * /v1/tags/list:
 *   get:
 *     summary: Listar Tags (Simplificado)
 *     description: Retorna lista simplificada de tags
 *     tags: [Tags]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de tags
 */
openApiRouter.get("/tags/list", isApiToken('read:tags'), TagController.list);

/**
 * @swagger
 * /v1/tags:
 *   post:
 *     summary: Criar Tag
 *     description: Cria uma nova tag
 *     tags: [Tags]
 *     security:
 *       - apiToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "VIP"
 *               color:
 *                 type: string
 *                 example: "#FFD700"
 *     responses:
 *       200:
 *         description: Tag criada
 */
openApiRouter.post("/tags", isApiToken('create:tags'), TagController.store);

/**
 * @swagger
 * /v1/tags/{tagId}:
 *   get:
 *     summary: Obter Tag
 *     description: Retorna detalhes de uma tag
 *     tags: [Tags]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tag encontrada
 */
openApiRouter.get("/tags/:tagId", isApiToken('read:tags'), TagController.show);

/**
 * @swagger
 * /v1/tags/{tagId}:
 *   put:
 *     summary: Atualizar Tag
 *     description: Atualiza uma tag
 *     tags: [Tags]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tag atualizada
 */
openApiRouter.put("/tags/:tagId", isApiToken('update:tags'), TagController.update);

/**
 * @swagger
 * /v1/tags/{tagId}:
 *   delete:
 *     summary: Excluir Tag
 *     description: Remove uma tag
 *     tags: [Tags]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tag excluída
 */
openApiRouter.delete("/tags/:tagId", isApiToken('delete:tags'), TagController.remove);

/**
 * @swagger
 * /v1/tags/sync:
 *   post:
 *     summary: Sincronizar Tags
 *     description: Sincroniza tags do sistema
 *     tags: [Tags]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Tags sincronizadas
 */
openApiRouter.post("/tags/sync", isApiToken('create:tags'), TagController.syncTags);

// Rotas de tickets

/**
 * @swagger
 * /v1/tickets:
 *   get:
 *     summary: Listar Tickets
 *     description: Retorna lista de tickets
 *     tags: [Tickets]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de tickets
 */
openApiRouter.get("/tickets", isApiToken('read:tickets'), TicketController.index);

/**
 * @swagger
 * /v1/tickets/count:
 *   get:
 *     summary: Contar Tickets
 *     description: Retorna contagem de tickets por status
 *     tags: [Tickets]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Contagem de tickets
 */
openApiRouter.get("/tickets/count", isApiToken('read:tickets'), TicketController.count);

/**
 * @swagger
 * /v1/tickets:
 *   post:
 *     summary: Criar Ticket
 *     description: Cria um novo ticket
 *     tags: [Tickets]
 *     security:
 *       - apiToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contactId:
 *                 type: integer
 *                 example: 1
 *               userId:
 *                 type: integer
 *                 example: 1
 *               queueId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Ticket criado
 */
openApiRouter.post("/tickets", isApiToken('create:tickets'), TicketController.store);

/**
 * @swagger
 * /v1/tickets/{ticketId}:
 *   get:
 *     summary: Obter Ticket
 *     description: Retorna detalhes de um ticket
 *     tags: [Tickets]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket encontrado
 */
openApiRouter.get("/tickets/:ticketId", isApiToken('read:tickets'), TicketController.show);

/**
 * @swagger
 * /v1/tickets/{ticketId}:
 *   put:
 *     summary: Atualizar Ticket
 *     description: Atualiza um ticket
 *     tags: [Tickets]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket atualizado
 */
openApiRouter.put("/tickets/:ticketId", isApiToken('update:tickets'), TicketController.update);

/**
 * @swagger
 * /v1/tickets/{ticketId}:
 *   delete:
 *     summary: Excluir Ticket
 *     description: Remove um ticket
 *     tags: [Tickets]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket excluído
 */
openApiRouter.delete("/tickets/:ticketId", isApiToken('delete:tickets'), TicketController.remove);

/**
 * @swagger
 * /v1/tickets/contact/{contactId}/open:
 *   get:
 *     summary: Verificar Tickets Abertos
 *     description: Verifica se contato tem tickets abertos
 *     tags: [Tickets]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status dos tickets
 */
openApiRouter.get("/tickets/contact/:contactId/open", isApiToken('read:tickets'), TicketController.checkOpenTickets);

/**
 * @swagger
 * /v1/tickets/close-all:
 *   put:
 *     summary: Fechar Todos os Tickets
 *     description: Fecha todos os tickets em lote
 *     tags: [Tickets]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Tickets fechados
 */
openApiRouter.put("/tickets/close-all", isApiToken('update:tickets'), TicketController.closeTickets);

// Rotas de WhatsApp

/**
 * @swagger
 * /v1/whatsapp:
 *   get:
 *     summary: Listar Conexões WhatsApp
 *     description: Retorna lista de todas as conexões WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de conexões
 */
openApiRouter.get("/whatsapp", isApiToken('read:whatsapp'), WhatsAppController.index);

/**
 * @swagger
 * /v1/whatsapp:
 *   post:
 *     summary: Criar Conexão WhatsApp
 *     description: Cria uma nova conexão WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - apiToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Atendimento"
 *     responses:
 *       200:
 *         description: Conexão criada
 */
openApiRouter.post("/whatsapp", isApiToken('create:whatsapp'), WhatsAppController.store);

/**
 * @swagger
 * /v1/whatsapp/{whatsappId}:
 *   get:
 *     summary: Obter Conexão WhatsApp
 *     description: Retorna detalhes de uma conexão
 *     tags: [WhatsApp]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: whatsappId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conexão encontrada
 */
openApiRouter.get("/whatsapp/:whatsappId", isApiToken('read:whatsapp'), WhatsAppController.show);

/**
 * @swagger
 * /v1/whatsapp/{whatsappId}:
 *   put:
 *     summary: Atualizar Conexão WhatsApp
 *     description: Atualiza uma conexão WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: whatsappId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conexão atualizada
 */
openApiRouter.put("/whatsapp/:whatsappId", isApiToken('update:whatsapp'), WhatsAppController.update);

/**
 * @swagger
 * /v1/whatsapp/{whatsappId}:
 *   delete:
 *     summary: Excluir Conexão WhatsApp
 *     description: Remove uma conexão WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: whatsappId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conexão excluída
 */
openApiRouter.delete("/whatsapp/:whatsappId", isApiToken('delete:whatsapp'), WhatsAppController.remove);

/**
 * @swagger
 * /v1/whatsapp/{whatsappId}/restart:
 *   post:
 *     summary: Reiniciar Conexão WhatsApp
 *     description: Reinicia uma conexão WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: whatsappId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conexão reiniciada
 */
openApiRouter.post("/whatsapp/:whatsappId/restart", isApiToken('update:whatsapp'), WhatsAppController.restart);

/**
 * @swagger
 * /v1/whatsapp/{whatsappId}/shutdown:
 *   post:
 *     summary: Desligar Conexão WhatsApp
 *     description: Desliga uma conexão WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: whatsappId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conexão desligada
 */
openApiRouter.post("/whatsapp/:whatsappId/shutdown", isApiToken('update:whatsapp'), WhatsAppController.shutdown);

/**
 * @swagger
 * /v1/whatsapp/{whatsappId}/qrcode:
 *   get:
 *     summary: Obter QR Code
 *     description: Retorna o QR Code para conexão
 *     tags: [WhatsApp]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: whatsappId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: QR Code retornado
 */
openApiRouter.get("/whatsapp/:whatsappId/qrcode", isApiToken('read:whatsapp'), WhatsAppController.getQrCode);

/**
 * @swagger
 * /v1/whatsapp/check-number:
 *   post:
 *     summary: Verificar Número WhatsApp
 *     description: Verifica se um número está registrado no WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - apiToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               number:
 *                 type: string
 *                 example: "5511999999999"
 *     responses:
 *       200:
 *         description: Número verificado
 */
openApiRouter.post("/whatsapp/check-number", isApiToken('read:whatsapp'), WhatsAppNumberController.checkNumber);

// Rotas de Sessão do WhatsApp

/**
 * @swagger
 * /v1/whatsappsession/{whatsappId}:
 *   post:
 *     summary: Criar Sessão WhatsApp
 *     description: Cria uma nova sessão WhatsApp
 *     tags: [WhatsAppSession]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: whatsappId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sessão criada
 */
openApiRouter.post("/whatsappsession/:whatsappId", isApiToken('create:whatsappsession'), WhatsAppSessionController.store);

/**
 * @swagger
 * /v1/whatsappsession/{whatsappId}:
 *   put:
 *     summary: Atualizar Sessão WhatsApp
 *     description: Atualiza uma sessão WhatsApp
 *     tags: [WhatsAppSession]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: whatsappId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sessão atualizada
 */
openApiRouter.put("/whatsappsession/:whatsappId", isApiToken('update:whatsappsession'), WhatsAppSessionController.update);

/**
 * @swagger
 * /v1/whatsappsession/{whatsappId}:
 *   delete:
 *     summary: Excluir Sessão WhatsApp
 *     description: Remove uma sessão WhatsApp
 *     tags: [WhatsAppSession]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: whatsappId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sessão excluída
 */
openApiRouter.delete("/whatsappsession/:whatsappId", isApiToken('delete:whatsappsession'), WhatsAppSessionController.remove);

// Rotas de Logs de Atividade

/**
 * @swagger
 * /v1/activity-logs:
 *   get:
 *     summary: Listar Logs de Atividade
 *     description: Retorna lista de logs de atividade
 *     tags: [ActivityLogs]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de logs
 */
openApiRouter.get("/activity-logs", isApiToken('read:activity-logs'), ActivityLogController.index);

/**
 * @swagger
 * /v1/activity-logs/actions:
 *   get:
 *     summary: Listar Ações
 *     description: Retorna lista de ações disponíveis
 *     tags: [ActivityLogs]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de ações
 */
openApiRouter.get("/activity-logs/actions", isApiToken('read:activity-logs'), ActivityLogController.actions);

/**
 * @swagger
 * /v1/activity-logs/entities:
 *   get:
 *     summary: Listar Entidades
 *     description: Retorna lista de entidades
 *     tags: [ActivityLogs]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de entidades
 */
openApiRouter.get("/activity-logs/entities", isApiToken('read:activity-logs'), ActivityLogController.entities);

/**
 * @swagger
 * /v1/activity-logs/{id}/details:
 *   get:
 *     summary: Detalhes do Log
 *     description: Retorna detalhes de um log específico
 *     tags: [ActivityLogs]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes do log
 */
openApiRouter.get("/activity-logs/:id/details", isApiToken('read:activity-logs'), ActivityLogController.show);

// Rotas de Backup

/**
 * @swagger
 * /v1/backups:
 *   get:
 *     summary: Listar Backups
 *     description: Retorna lista de backups disponíveis
 *     tags: [Backups]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de backups
 */
openApiRouter.get("/backups", isApiToken('read:backups'), BackupController.index);

/**
 * @swagger
 * /v1/backups:
 *   post:
 *     summary: Criar Backup
 *     description: Cria um novo backup do sistema
 *     tags: [Backups]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Backup criado
 */
openApiRouter.post("/backups", isApiToken('create:backups'), BackupController.store);

/**
 * @swagger
 * /v1/backups/{filename}:
 *   get:
 *     summary: Obter Backup
 *     description: Retorna detalhes de um backup
 *     tags: [Backups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Backup encontrado
 */
openApiRouter.get("/backups/:filename", isApiToken('read:backups'), BackupController.show);

/**
 * @swagger
 * /v1/backups/{filename}/restore:
 *   post:
 *     summary: Restaurar Backup
 *     description: Restaura o sistema a partir de um backup
 *     tags: [Backups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Backup restaurado
 */
openApiRouter.post("/backups/:filename/restore", isApiToken('update:backups'), BackupController.update);

/**
 * @swagger
 * /v1/backups/{filename}:
 *   delete:
 *     summary: Excluir Backup
 *     description: Remove um backup
 *     tags: [Backups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Backup excluído
 */
openApiRouter.delete("/backups/:filename", isApiToken('delete:backups'), BackupController.remove);

// Rotas de Logs de Erro

/**
 * @swagger
 * /v1/error-logs:
 *   post:
 *     summary: Criar Log de Erro
 *     description: Registra um novo log de erro
 *     tags: [ErrorLogs]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Log criado
 */
openApiRouter.post("/error-logs", isApiToken('create:error-logs'), ErrorLogController.store);

/**
 * @swagger
 * /v1/error-logs:
 *   get:
 *     summary: Listar Logs de Erro
 *     description: Retorna lista de logs de erro
 *     tags: [ErrorLogs]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de logs
 */
openApiRouter.get("/error-logs", isApiToken('read:error-logs'), ErrorLogController.index);

/**
 * @swagger
 * /v1/error-logs/{id}:
 *   get:
 *     summary: Obter Log de Erro
 *     description: Retorna detalhes de um log de erro
 *     tags: [ErrorLogs]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Log encontrado
 */
openApiRouter.get("/error-logs/:id", isApiToken('read:error-logs'), ErrorLogController.show);

/**
 * @swagger
 * /v1/error-logs/cleanup:
 *   delete:
 *     summary: Limpar Logs Antigos
 *     description: Remove logs de erro antigos
 *     tags: [ErrorLogs]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Logs limpos
 */
openApiRouter.delete("/error-logs/cleanup", isApiToken('delete:error-logs'), ErrorLogController.cleanupOldLogs);

// Rotas de Monitoramento de Rede

/**
 * @swagger
 * /v1/network-status:
 *   get:
 *     summary: Status da Rede
 *     description: Retorna status da rede
 *     tags: [NetworkMonitor]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Status da rede
 */
openApiRouter.get("/network-status", isApiToken('read:network-status'), NetworkMonitorController.index);

// Rotas de Monitoramento de Setores

/**
 * @swagger
 * /v1/queue-monitor:
 *   get:
 *     summary: Monitorar Setores
 *     description: Retorna monitoramento dos setores
 *     tags: [QueueMonitor]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Status dos setores
 */
openApiRouter.get("/queue-monitor", isApiToken('read:queue-monitor'), QueueMonitorController.index);

// Rotas de Atualização do Sistema

/**
 * @swagger
 * /v1/system-update/check:
 *   get:
 *     summary: Verificar Atualizações
 *     description: Verifica se há atualizações disponíveis
 *     tags: [SystemUpdate]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Status de atualizações
 */
openApiRouter.get("/system-update/check", isApiToken('read:system-update'), SystemUpdateController.checkUpdates);

/**
 * @swagger
 * /v1/system-update/install:
 *   post:
 *     summary: Instalar Atualização
 *     description: Instala atualização do sistema
 *     tags: [SystemUpdate]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Atualização instalada
 */
openApiRouter.post("/system-update/install", isApiToken('write:system-update'), SystemUpdateController.installUpdate);

/**
 * @swagger
 * /v1/system-update/status:
 *   get:
 *     summary: Status da Atualização
 *     description: Retorna status da atualização
 *     tags: [SystemUpdate]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Status da atualização
 */
openApiRouter.get("/system-update/status", isApiToken('read:system-update'), SystemUpdateController.getStatus);

/**
 * @swagger
 * /v1/system-update/backups:
 *   get:
 *     summary: Listar Backups de Atualização
 *     description: Retorna backups de atualização
 *     tags: [SystemUpdate]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de backups
 */
openApiRouter.get("/system-update/backups", isApiToken('read:system-update'), SystemUpdateController.getBackups);

/**
 * @swagger
 * /v1/system-update/restore/{backupFileName}:
 *   post:
 *     summary: Restaurar Backup de Atualização
 *     description: Restaura sistema de um backup
 *     tags: [SystemUpdate]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: backupFileName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Backup restaurado
 */
openApiRouter.post("/system-update/restore/:backupFileName", isApiToken('write:system-update'), SystemUpdateController.restoreFromBackup);

// Rotas de Versão e Biblioteca WhatsApp

/**
 * @swagger
 * /v1/version:
 *   get:
 *     summary: Obter Versão
 *     description: Retorna versão do sistema
 *     tags: [Version]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Versão do sistema
 */
openApiRouter.get("/version", isApiToken('read:version'), VersionController.getVersion);

/**
 * @swagger
 * /v1/whatsapp-lib/update:
 *   post:
 *     summary: Atualizar Biblioteca WhatsApp
 *     description: Atualiza a biblioteca do WhatsApp
 *     tags: [WhatsAppLibrary]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Biblioteca atualizada
 */
openApiRouter.post("/whatsapp-lib/update", isApiToken('write:whatsapp-lib'), WhatsappLibController.updateWhatsappLibrary);

// Rotas de Sistema

/**
 * @swagger
 * /v1/restartpm2:
 *   post:
 *     summary: Reiniciar PM2
 *     description: Reinicia o gerenciador de processos PM2
 *     tags: [System]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: PM2 reiniciado
 */
openApiRouter.post("/restartpm2", isApiToken('write:system'), SystemController.restartPm2);

/**
 * @swagger
 * /v1/disk-space:
 *   get:
 *     summary: Espaço em Disco
 *     description: Retorna informações de espaço em disco
 *     tags: [System]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Espaço em disco
 */
openApiRouter.get("/disk-space", isApiToken('read:system-resources'), DiskSpaceController.getDiskSpace);

/**
 * @swagger
 * /v1/memory-usage:
 *   get:
 *     summary: Uso de Memória
 *     description: Retorna uso de memória do sistema
 *     tags: [System]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Uso de memória
 */
openApiRouter.get("/memory-usage", isApiToken('read:system-resources'), MemoryUsageController.getMemoryUsage);

/**
 * @swagger
 * /v1/cpu-usage:
 *   get:
 *     summary: Uso de CPU
 *     description: Retorna uso de CPU do sistema
 *     tags: [System]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Uso de CPU
 */
openApiRouter.get("/cpu-usage", isApiToken('read:system-resources'), CpuUsageController.cpuUsage);

/**
 * @swagger
 * /v1/database-status:
 *   get:
 *     summary: Status do Banco de Dados
 *     description: Retorna status do banco de dados
 *     tags: [System]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Status do banco
 */
openApiRouter.get("/database-status", isApiToken('read:system-resources'), DatabaseMonitorController.getDatabaseStatus);

// Rotas de Vídeo

/**
 * @swagger
 * /v1/videos:
 *   get:
 *     summary: Listar Vídeos
 *     description: Retorna lista de vídeos
 *     tags: [Videos]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de vídeos
 */
openApiRouter.get("/videos", isApiToken('read:videos'), VideoController.index);

/**
 * @swagger
 * /v1/videos/{id}:
 *   get:
 *     summary: Obter Vídeo
 *     description: Retorna detalhes de um vídeo
 *     tags: [Videos]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vídeo encontrado
 */
openApiRouter.get("/videos/:id", isApiToken('read:videos'), VideoController.show);

/**
 * @swagger
 * /v1/videos:
 *   post:
 *     summary: Criar Vídeo
 *     description: Adiciona um novo vídeo
 *     tags: [Videos]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Vídeo criado
 */
openApiRouter.post("/videos", isApiToken('write:videos'), VideoController.store);

/**
 * @swagger
 * /v1/videos/{id}:
 *   put:
 *     summary: Atualizar Vídeo
 *     description: Atualiza um vídeo
 *     tags: [Videos]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vídeo atualizado
 */
openApiRouter.put("/videos/:id", isApiToken('write:videos'), VideoController.update);

/**
 * @swagger
 * /v1/videos/{id}:
 *   delete:
 *     summary: Excluir Vídeo
 *     description: Remove um vídeo
 *     tags: [Videos]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vídeo excluído
 */
openApiRouter.delete("/videos/:id", isApiToken('write:videos'), VideoController.remove);

// Rotas de Usuários

/**
 * @swagger
 * /v1/users:
 *   get:
 *     summary: Listar Usuários
 *     description: Retorna a lista de todos os usuários do sistema
 *     tags: [Users]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "João Silva"
 *                   email:
 *                     type: string
 *                     example: "joao@example.com"
 *                   profile:
 *                     type: string
 *                     enum: [admin, user]
 *                     example: "user"
 *       401:
 *         description: Token inválido ou não fornecido
 *       403:
 *         description: Sem permissão read:users
 *       500:
 *         description: Erro interno
 */
openApiRouter.get("/users", isApiToken('read:users'), UserController.index);

/**
 * @swagger
 * /v1/users:
 *   post:
 *     summary: Criar Usuário
 *     description: Cria um novo usuário no sistema
 *     tags: [Users]
 *     security:
 *       - apiToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - profile
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome completo do usuário
 *                 example: "Maria Santos"
 *               email:
 *                 type: string
 *                 description: Email do usuário (deve ser único)
 *                 example: "maria@example.com"
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *                 example: "senha123"
 *               profile:
 *                 type: string
 *                 enum: [admin, user]
 *                 description: Perfil de acesso do usuário
 *                 example: "user"
 *               queueIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs dos setores associados ao usuário
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos ou email já cadastrado
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão create:users
 *       500:
 *         description: Erro interno
 */
openApiRouter.post("/users", isApiToken('create:users'), UserController.store);

/**
 * @swagger
 * /v1/users/{userId}:
 *   get:
 *     summary: Obter Usuário
 *     description: Retorna os detalhes de um usuário específico
 *     tags: [Users]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "João Silva"
 *                 email:
 *                   type: string
 *                   example: "joao@example.com"
 *                 profile:
 *                   type: string
 *                   example: "user"
 *                 queues:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão read:users
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno
 */
openApiRouter.get("/users/:userId", isApiToken('read:users'), UserController.show);

/**
 * @swagger
 * /v1/users/{userId}:
 *   put:
 *     summary: Atualizar Usuário
 *     description: Atualiza os dados de um usuário existente
 *     tags: [Users]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome completo do usuário
 *                 example: "João Silva Atualizado"
 *               email:
 *                 type: string
 *                 description: Email do usuário
 *                 example: "joao.novo@example.com"
 *               password:
 *                 type: string
 *                 description: Nova senha (opcional)
 *                 example: "novaSenha123"
 *               profile:
 *                 type: string
 *                 enum: [admin, user]
 *                 description: Perfil de acesso
 *                 example: "admin"
 *               queueIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs dos setores
 *                 example: [1, 3, 5]
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão update:users
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno
 */
openApiRouter.put("/users/:userId", isApiToken('update:users'), UserController.update);

/**
 * @swagger
 * /v1/users/{userId}:
 *   delete:
 *     summary: Excluir Usuário
 *     description: Remove um usuário do sistema
 *     tags: [Users]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário a ser excluído
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão delete:users
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno
 */
openApiRouter.delete("/users/:userId", isApiToken('delete:users'), UserController.remove);

// Rotas de Respostas Rápidas

/**
 * @swagger
 * /v1/quickAnswers:
 *   get:
 *     summary: Listar Respostas Rápidas
 *     description: Retorna lista de respostas rápidas
 *     tags: [Quick Answers]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de respostas rápidas
 */
openApiRouter.get("/quickAnswers", isApiToken('read:quickAnswers'), QuickAnswerController.index);

/**
 * @swagger
 * /v1/quickAnswers:
 *   post:
 *     summary: Criar Resposta Rápida
 *     description: Cria uma nova resposta rápida
 *     tags: [Quick Answers]
 *     security:
 *       - apiToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shortcut:
 *                 type: string
 *                 example: "/ola"
 *               message:
 *                 type: string
 *                 example: "Olá! Como posso ajudar?"
 *     responses:
 *       200:
 *         description: Resposta rápida criada
 */
openApiRouter.post("/quickAnswers", isApiToken('create:quickAnswers'), QuickAnswerController.store);

/**
 * @swagger
 * /v1/quickAnswers/{quickAnswerId}:
 *   get:
 *     summary: Obter Resposta Rápida
 *     description: Retorna detalhes de uma resposta rápida
 *     tags: [Quick Answers]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: quickAnswerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resposta rápida encontrada
 */
openApiRouter.get("/quickAnswers/:quickAnswerId", isApiToken('read:quickAnswers'), QuickAnswerController.show);

/**
 * @swagger
 * /v1/quickAnswers/{quickAnswerId}:
 *   put:
 *     summary: Atualizar Resposta Rápida
 *     description: Atualiza uma resposta rápida
 *     tags: [Quick Answers]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: quickAnswerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resposta rápida atualizada
 */
openApiRouter.put("/quickAnswers/:quickAnswerId", isApiToken('update:quickAnswers'), QuickAnswerController.update);

/**
 * @swagger
 * /v1/quickAnswers/{quickAnswerId}:
 *   delete:
 *     summary: Excluir Resposta Rápida
 *     description: Remove uma resposta rápida
 *     tags: [Quick Answers]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: quickAnswerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resposta rápida excluída
 */
openApiRouter.delete("/quickAnswers/:quickAnswerId", isApiToken('delete:quickAnswers'), QuickAnswerController.remove);

/**
 * @swagger
 * /v1/quickAnswers:
 *   delete:
 *     summary: Excluir Todas as Respostas Rápidas
 *     description: Remove todas as respostas rápidas
 *     tags: [Quick Answers]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Todas as respostas rápidas excluídas
 */
openApiRouter.delete("/quickAnswers", isApiToken('delete:quickAnswers'), QuickAnswerController.removeAll);

// Rotas de Grupos do WhatsApp - Participantes

/**
 * @swagger
 * /v1/groups/{groupId}/participants/add:
 *   post:
 *     summary: Adicionar Participantes ao Grupo
 *     description: Adiciona um ou mais participantes a um grupo do WhatsApp
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do grupo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["5511999999999@c.us"]
 *     responses:
 *       200:
 *         description: Participantes adicionados
 */
openApiRouter.post("/groups/:groupId/participants/add", isApiToken('write:groups'), GroupController.addParticipants);

/**
 * @swagger
 * /v1/groups/{groupId}/participants/remove:
 *   post:
 *     summary: Remover Participantes do Grupo
 *     description: Remove um ou mais participantes de um grupo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["5511999999999@c.us"]
 *     responses:
 *       200:
 *         description: Participantes removidos
 */
openApiRouter.post("/groups/:groupId/participants/remove", isApiToken('write:groups'), GroupController.removeParticipants);

/**
 * @swagger
 * /v1/groups/{groupId}/participants/promote:
 *   post:
 *     summary: Promover Participantes a Admin
 *     description: Promove participantes a administradores do grupo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["5511999999999@c.us"]
 *     responses:
 *       200:
 *         description: Participantes promovidos
 */
openApiRouter.post("/groups/:groupId/participants/promote", isApiToken('write:groups'), GroupController.promoteParticipants);

/**
 * @swagger
 * /v1/groups/{groupId}/participants/demote:
 *   post:
 *     summary: Rebaixar Admin a Participante
 *     description: Remove privilégios de administrador de participantes
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["5511999999999@c.us"]
 *     responses:
 *       200:
 *         description: Participantes rebaixados
 */
openApiRouter.post("/groups/:groupId/participants/demote", isApiToken('write:groups'), GroupController.demoteParticipants);

/**
 * @swagger
 * /v1/groups/{groupId}/participants:
 *   get:
 *     summary: Listar Participantes do Grupo
 *     description: Retorna lista de participantes de um grupo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de participantes
 */
openApiRouter.get("/groups/:groupId/participants", isApiToken('read:groups'), GroupController.listParticipants);

// Rotas de Grupos do WhatsApp - Convites

/**
 * @swagger
 * /v1/groups/{groupId}/invite:
 *   get:
 *     summary: Obter Link de Convite
 *     description: Retorna o link de convite do grupo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Link de convite
 */
openApiRouter.get("/groups/:groupId/invite", isApiToken('read:groups'), GroupController.getInvite);

/**
 * @swagger
 * /v1/groups/{groupId}/invite/revoke:
 *   post:
 *     summary: Revogar Link de Convite
 *     description: Revoga o link de convite atual e gera um novo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Link revogado
 */
openApiRouter.post("/groups/:groupId/invite/revoke", isApiToken('write:groups'), GroupController.revokeInvite);

// Rotas de Grupos do WhatsApp - Permissões

/**
 * @swagger
 * /v1/groups/{groupId}/settings/memberAddMode:
 *   post:
 *     summary: Configurar Modo de Adicionar Membros
 *     description: Define quem pode adicionar membros ao grupo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mode:
 *                 type: string
 *                 enum: [all_members, admins_only]
 *                 example: "admins_only"
 *     responses:
 *       200:
 *         description: Configuração atualizada
 */
openApiRouter.post("/groups/:groupId/settings/memberAddMode", isApiToken('write:groups'), GroupController.setMemberAddMode);

/**
 * @swagger
 * /v1/groups/{groupId}/settings/announcement:
 *   post:
 *     summary: Configurar Modo Anúncio
 *     description: Define se apenas admins podem enviar mensagens
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Modo anúncio configurado
 */
openApiRouter.post("/groups/:groupId/settings/announcement", isApiToken('write:groups'), GroupController.setAnnouncement);

/**
 * @swagger
 * /v1/groups/{groupId}/settings/restrict:
 *   post:
 *     summary: Restringir Edição de Info do Grupo
 *     description: Define se apenas admins podem editar informações do grupo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Restrição configurada
 */
openApiRouter.post("/groups/:groupId/settings/restrict", isApiToken('write:groups'), GroupController.setRestrict);

// Rotas de Grupos do WhatsApp - Informações

/**
 * @swagger
 * /v1/groups/{groupId}/subject:
 *   post:
 *     summary: Alterar Nome do Grupo
 *     description: Altera o nome/assunto do grupo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Novo Nome do Grupo"
 *     responses:
 *       200:
 *         description: Nome alterado
 */
openApiRouter.post("/groups/:groupId/subject", isApiToken('write:groups'), GroupController.setSubject);

/**
 * @swagger
 * /v1/groups/{groupId}/description:
 *   post:
 *     summary: Alterar Descrição do Grupo
 *     description: Altera a descrição do grupo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Descrição do grupo"
 *     responses:
 *       200:
 *         description: Descrição alterada
 */
openApiRouter.post("/groups/:groupId/description", isApiToken('write:groups'), GroupController.setDescription);

/**
 * @swagger
 * /v1/groups/{groupId}/picture:
 *   post:
 *     summary: Alterar Foto do Grupo
 *     description: Altera a foto do grupo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Foto alterada
 */
openApiRouter.post("/groups/:groupId/picture", isApiToken('write:groups'), GroupController.setPicture);

/**
 * @swagger
 * /v1/groups/{groupId}/picture:
 *   delete:
 *     summary: Remover Foto do Grupo
 *     description: Remove a foto do grupo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Foto removida
 */
openApiRouter.delete("/groups/:groupId/picture", isApiToken('write:groups'), GroupController.deletePicture);

// Rotas de Grupos do WhatsApp - Solicitações de Entrada

/**
 * @swagger
 * /v1/groups/{groupId}/membership/requests:
 *   get:
 *     summary: Listar Solicitações de Entrada
 *     description: Retorna lista de solicitações pendentes para entrar no grupo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de solicitações
 */
openApiRouter.get("/groups/:groupId/membership/requests", isApiToken('read:groups'), GroupController.listMembershipRequests);

/**
 * @swagger
 * /v1/groups/{groupId}/membership/approve:
 *   post:
 *     summary: Aprovar Solicitações de Entrada
 *     description: Aprova solicitações de entrada no grupo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["5511999999999@c.us"]
 *     responses:
 *       200:
 *         description: Solicitações aprovadas
 */
openApiRouter.post("/groups/:groupId/membership/approve", isApiToken('write:groups'), GroupController.approveMembershipRequests);

/**
 * @swagger
 * /v1/groups/{groupId}/membership/reject:
 *   post:
 *     summary: Rejeitar Solicitações de Entrada
 *     description: Rejeita solicitações de entrada no grupo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["5511999999999@c.us"]
 *     responses:
 *       200:
 *         description: Solicitações rejeitadas
 */
openApiRouter.post("/groups/:groupId/membership/reject", isApiToken('write:groups'), GroupController.rejectMembershipRequests);

// Rotas de Grupos do WhatsApp - Outros

/**
 * @swagger
 * /v1/groups/{groupId}/leave:
 *   post:
 *     summary: Sair do Grupo
 *     description: Faz o bot sair do grupo
 *     tags: [WhatsApp Groups]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Saiu do grupo
 */
openApiRouter.post("/groups/:groupId/leave", isApiToken('write:groups'), GroupController.leaveGroup);

// Rotas de Status de Clientes

/**
 * @swagger
 * /v1/client-status:
 *   get:
 *     summary: Listar Status de Clientes
 *     description: Retorna lista de status de clientes
 *     tags: [Client Status]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Lista de status
 */
openApiRouter.get("/client-status", isApiToken('read:client-status'), ClientStatusController.index);

/**
 * @swagger
 * /v1/client-status:
 *   post:
 *     summary: Criar Status de Cliente
 *     description: Cria um novo status de cliente
 *     tags: [Client Status]
 *     security:
 *       - apiToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ativo"
 *               color:
 *                 type: string
 *                 example: "#00FF00"
 *     responses:
 *       200:
 *         description: Status criado
 */
openApiRouter.post("/client-status", isApiToken('create:client-status'), ClientStatusController.store);

/**
 * @swagger
 * /v1/client-status/statistics:
 *   get:
 *     summary: Obter Estatísticas de Status de Clientes
 *     description: Retorna estatísticas completas sobre distribuição de contatos por status
 *     tags: [Client Status]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       color:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 withoutStatus:
 *                   type: integer
 *                 total:
 *                   type: integer
 */
openApiRouter.get("/client-status/statistics", isApiToken('read:client-status'), ClientStatusController.statistics);

/**
 * @swagger
 * /v1/client-status/{clientStatusId}:
 *   get:
 *     summary: Obter Status de Cliente
 *     description: Retorna detalhes de um status
 *     tags: [Client Status]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: clientStatusId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status encontrado
 */
openApiRouter.get("/client-status/:clientStatusId", isApiToken('read:client-status'), ClientStatusController.show);

/**
 * @swagger
 * /v1/client-status/{clientStatusId}:
 *   put:
 *     summary: Atualizar Status de Cliente
 *     description: Atualiza um status
 *     tags: [Client Status]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: clientStatusId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status atualizado
 */
openApiRouter.put("/client-status/:clientStatusId", isApiToken('update:client-status'), ClientStatusController.update);

/**
 * @swagger
 * /v1/client-status/{clientStatusId}:
 *   delete:
 *     summary: Excluir Status de Cliente
 *     description: Remove um status
 *     tags: [Client Status]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: clientStatusId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status excluído
 */
openApiRouter.delete("/client-status/:clientStatusId", isApiToken('delete:client-status'), ClientStatusController.remove);

/**
 * @swagger
 * /v1/client-status:
 *   delete:
 *     summary: Excluir Todos os Status
 *     description: Remove todos os status de clientes
 *     tags: [Client Status]
 *     security:
 *       - apiToken: []
 *     responses:
 *       200:
 *         description: Todos os status excluídos
 */
openApiRouter.delete("/client-status", isApiToken('delete:client-status'), ClientStatusController.removeAll);

// Rotas de Presença (Indicadores de Digitação/Gravação)

/**
 * @swagger
 * /v1/presence/typing/{ticketId}:
 *   post:
 *     summary: Enviar Indicador de Digitação
 *     description: Simula indicador "digitando..." no WhatsApp
 *     tags: [Presence]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ticket
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duration:
 *                 type: integer
 *                 description: Duração em milissegundos (padrão 3000ms)
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Indicador enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão write:presence
 *       500:
 *         description: Erro ao enviar indicador
 */
openApiRouter.post("/presence/typing/:ticketId", isApiToken('write:presence'), MessageController.sendTypingIndicator);

/**
 * @swagger
 * /v1/presence/recording/{ticketId}:
 *   post:
 *     summary: Enviar Indicador de Gravação
 *     description: Simula indicador "gravando áudio..." no WhatsApp
 *     tags: [Presence]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ticket
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duration:
 *                 type: integer
 *                 description: Duração em milissegundos (padrão 5000ms)
 *                 example: 8000
 *     responses:
 *       200:
 *         description: Indicador enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão write:presence
 *       500:
 *         description: Erro ao enviar indicador
 */
openApiRouter.post("/presence/recording/:ticketId", isApiToken('write:presence'), MessageController.sendRecordingIndicator);

/**
 * @swagger
 * /v1/presence/available/{ticketId}:
 *   post:
 *     summary: Definir Presença como Disponível
 *     description: Remove indicadores de digitação/gravação
 *     tags: [Presence]
 *     security:
 *       - apiToken: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ticket
 *     responses:
 *       200:
 *         description: Presença definida como disponível
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão write:presence
 *       500:
 *         description: Erro ao definir presença
 */
openApiRouter.post("/presence/available/:ticketId", isApiToken('write:presence'), MessageController.setAvailablePresence);

export default openApiRouter;
