import { getIO } from "../../libs/socket";
import GroupEvent from "../../models/GroupEvent";
import { logger } from "../../utils/logger";

interface GroupEventData {
  whatsappId: number;
  groupId: string;
  eventType: string;
  participantId?: string;
  participantName?: string;
  oldValue?: string;
  newValue?: string;
  performedBy?: string;
  performedByName?: string;
}

class GroupEventsService {
  private static instance: GroupEventsService;
  private activeListeners: Map<number, boolean> = new Map();

  private constructor() {}

  public static getInstance(): GroupEventsService {
    if (!GroupEventsService.instance) {
      GroupEventsService.instance = new GroupEventsService();
    }
    return GroupEventsService.instance;
  }

  public async registerEvent(data: GroupEventData): Promise<void> {
    try {
      const event = await GroupEvent.create({
        whatsappId: data.whatsappId,
        groupId: data.groupId,
        eventType: data.eventType,
        participantId: data.participantId,
        participantName: data.participantName,
        oldValue: data.oldValue,
        newValue: data.newValue,
        performedBy: data.performedBy,
        performedByName: data.performedByName,
        timestamp: new Date()
      });

      await this.createSystemMessage(data);

      const io = getIO();
      const eventPayload = {
        action: "create",
        groupEvent: {
          id: event.id,
          whatsappId: event.whatsappId,
          groupId: event.groupId,
          eventType: event.eventType,
          participantId: event.participantId,
          participantName: event.participantName,
          oldValue: event.oldValue,
          newValue: event.newValue,
          performedBy: event.performedBy,
          performedByName: event.performedByName,
          createdAt: event.createdAt
        }
      };
      
      io.emit(`whatsapp-${data.whatsappId}:groupEvent`, eventPayload);

      logger.info(`[GROUP_EVENT] ${data.eventType} registered for group ${data.groupId}`);
    } catch (error) {
      logger.error(`[GROUP_EVENT] Error registering event: ${error}`);
    }
  }

  private async createSystemMessage(data: GroupEventData): Promise<void> {
    try {
      const Message = (await import("../../models/Message")).default;
      const Contact = (await import("../../models/Contact")).default;
      const Ticket = (await import("../../models/Ticket")).default;
      const Whatsapp = (await import("../../models/Whatsapp")).default;

      const whatsapp = await Whatsapp.findByPk(data.whatsappId);
      if (!whatsapp) {
        logger.warn(`[GROUP_EVENT] WhatsApp ${data.whatsappId} not found`);
        return;
      }

      let contact = await Contact.findOne({
        where: {
          number: data.groupId,
          isGroup: true
        }
      });

      if (!contact) {
        contact = await Contact.create({
          name: data.groupId,
          number: data.groupId,
          isGroup: true,
          profilePicUrl: ""
        });
      }

      let ticket = await Ticket.findOne({
        where: {
          contactId: contact.id,
          whatsappId: data.whatsappId
        }
      });

      if (!ticket) {
        ticket = await Ticket.create({
          contactId: contact.id,
          whatsappId: data.whatsappId,
          status: "pending",
          isGroup: true
        });
      }

      const messageBody = this.formatEventMessage(data);
      
      const fiveSecondsAgo = new Date(Date.now() - 5000);
      const existingMessage = await Message.findOne({
        where: {
          ticketId: ticket.id,
          body: messageBody,
          mediaType: "event",
          createdAt: {
            [require("sequelize").Op.gte]: fiveSecondsAgo
          }
        }
      });

      if (existingMessage) {
        logger.warn(`[GROUP_EVENT] Mensagem duplicada detectada e ignorada: "${messageBody}"`);
        return;
      }

      logger.info(`[GROUP_EVENT] Criando mensagem de sistema: "${messageBody}"`);
      
      const messageId = `${data.groupId}_${Date.now()}_event`;

      const message = await Message.create({
        id: messageId,
        body: messageBody,
        fromMe: false,
        read: true,
        mediaType: "event",
        ticketId: ticket.id,
        timestamp: new Date(),
        isGroup: true,
        ack: 0
      });
      
      ticket.lastMessage = messageBody;
      await ticket.save();

      await ticket.reload({
        include: [
          { model: Contact, as: "contact" },
          { model: (await import("../../models/Queue")).default, as: "queue" },
          { model: (await import("../../models/User")).default, as: "user" },
          { model: (await import("../../models/Whatsapp")).default, as: "whatsapp" }
        ]
      });

      const io = getIO();
      
      io.to(ticket.id.toString())
        .to(`ticket-${ticket.id}`)
        .to("notification")
        .emit(`appMessage`, {
          action: "create",
          message,
          ticket,
          contact
        });

      io.to(ticket.status)
        .to("notification")
        .emit(`ticket`, {
          action: "update",
          ticket
        });

    } catch (error) {
      logger.error(`[GROUP_EVENT] Error creating system message: ${error}`);
    }
  }

  private formatEventMessage(data: GroupEventData): string {
    const { eventType, participantName, newValue, performedByName, performedBy } = data;

    switch (eventType) {
      case "PARTICIPANT_ADDED":
        if (performedBy === "link") {
          return `${participantName} entrou usando o link do grupo`;
        }
        return performedByName 
          ? `${performedByName} adicionou ${participantName}`
          : `${participantName} foi adicionado`;
      
      case "PARTICIPANT_REMOVED":
        return performedByName
          ? `${performedByName} removeu ${participantName}`
          : `${participantName} saiu do grupo`;
      
      case "PARTICIPANT_PROMOTED":
        return performedByName
          ? `${performedByName} promoveu ${participantName} a administrador`
          : `${participantName} agora é administrador`;
      
      case "PARTICIPANT_DEMOTED":
        return performedByName
          ? `${performedByName} rebaixou ${participantName}`
          : `${participantName} não é mais administrador`;
      
      case "GROUP_NAME_CHANGED":
        return performedByName
          ? `${performedByName} mudou o nome do grupo para "${newValue}"`
          : `Nome do grupo mudou para "${newValue}"`;
      
      case "GROUP_DESCRIPTION_CHANGED":
        return performedByName
          ? `${performedByName} mudou a descrição do grupo`
          : `Descrição do grupo foi alterada`;
      
      case "GROUP_PICTURE_CHANGED":
        return performedByName
          ? `${performedByName} mudou a imagem do grupo`
          : `Imagem do grupo foi alterada`;
      
      case "GROUP_ANNOUNCE_CHANGED":
        return newValue === "true"
          ? "Apenas administradores podem enviar mensagens"
          : "Todos podem enviar mensagens";
      
      case "GROUP_RESTRICT_CHANGED":
        return newValue === "true"
          ? "Apenas administradores podem editar informações do grupo"
          : "Todos podem editar informações do grupo";
      
      case "GROUP_MEMBER_ADD_MODE_CHANGED":
        return newValue === "admin_add"
          ? "Apenas administradores podem adicionar participantes"
          : "Todos os membros podem adicionar participantes";
      
      case "GROUP_JOINED":
        return "Você entrou no grupo";
      
      case "GROUP_LEFT":
        return "Você saiu do grupo";
      
      default:
        return `Evento: ${eventType}`;
    }
  }

  public setupGroupListeners(wbot: any, whatsappId: number): void {
    if (this.activeListeners.has(whatsappId)) {
      logger.warn(`[GROUP_EVENT] Listeners already active for WhatsApp ${whatsappId}, skipping...`);
      return;
    }

    logger.info(`[GROUP_EVENT] Setting up group listeners for WhatsApp ${whatsappId}`);
    
    wbot.removeAllListeners("group_update");
    wbot.removeAllListeners("group_join");
    wbot.removeAllListeners("group_leave");
    
    this.activeListeners.set(whatsappId, true);

    wbot.on("group_update", async (notification: any) => {
      logger.info(`[GROUP_EVENT] group_update received for WhatsApp ${whatsappId}, type: ${notification.type}`);

      try {
        const chat = await notification.getChat();
        const groupId = chat.id._serialized;

        if (notification.type === "subject") {
          await this.registerEvent({
            whatsappId,
            groupId,
            eventType: "GROUP_NAME_CHANGED",
            newValue: notification.body,
            performedBy: notification.author,
            performedByName: notification.author
          });

          try {
            const Contact = (await import("../../models/Contact")).default;
            const groupContact = await Contact.findOne({
              where: {
                number: groupId,
                isGroup: true
              }
            });

            if (groupContact) {
              await groupContact.update({ name: notification.body });
              
              const { getIO } = require("../../libs/socket");
              const io = getIO();
              io.emit("contact", {
                action: "update",
                contact: groupContact
              });

              logger.info(`[GROUP_EVENT] Nome do grupo atualizado: ${groupId} -> ${notification.body}`);
            }
          } catch (err) {
            logger.error(`[GROUP_EVENT] Erro ao atualizar nome do contato: ${err}`);
          }
        } else if (notification.type === "description") {
          await this.registerEvent({
            whatsappId,
            groupId,
            eventType: "GROUP_DESCRIPTION_CHANGED",
            performedBy: notification.author,
            performedByName: notification.author
          });
        } else if (notification.type === "picture") {
          await this.registerEvent({
            whatsappId,
            groupId,
            eventType: "GROUP_PICTURE_CHANGED",
            performedBy: notification.author,
            performedByName: notification.author
          });
        } else if (notification.type === "announce") {
          await this.registerEvent({
            whatsappId,
            groupId,
            eventType: "GROUP_ANNOUNCE_CHANGED",
            newValue: notification.body === "on" ? "true" : "false"
          });
        } else if (notification.type === "restrict") {
          await this.registerEvent({
            whatsappId,
            groupId,
            eventType: "GROUP_RESTRICT_CHANGED",
            newValue: notification.body === "on" ? "true" : "false"
          });
        } else if (notification.type === "member_add_mode") {
          const isAdminOnly = chat.groupMetadata?.memberAddMode === "admin_add";
          await this.registerEvent({
            whatsappId,
            groupId,
            eventType: "GROUP_MEMBER_ADD_MODE_CHANGED",
            newValue: isAdminOnly ? "admin_add" : "all_member_add"
          });
        } else if (notification.type === "add") {
          for (const participantId of notification.recipientIds) {
            let participantName = participantId;
            try {
              const contact = await wbot.getContactById(participantId);
              participantName = contact?.name || contact?.pushname || participantId;
            } catch (e) {
              logger.warn(`[GROUP_EVENT] Could not get participant name: ${participantId}`);
            }

            await this.registerEvent({
              whatsappId,
              groupId,
              eventType: "PARTICIPANT_ADDED",
              participantId,
              participantName,
              performedBy: notification.author,
              performedByName: notification.author
            });
          }
        } else if (notification.type === "remove") {
          for (const participantId of notification.recipientIds) {
            let participantName = participantId;
            try {
              const contact = await wbot.getContactById(participantId);
              participantName = contact?.name || contact?.pushname || participantId;
            } catch (e) {
              logger.warn(`[GROUP_EVENT] Could not get participant name: ${participantId}`);
            }

            await this.registerEvent({
              whatsappId,
              groupId,
              eventType: "PARTICIPANT_REMOVED",
              participantId,
              participantName,
              performedBy: notification.author,
              performedByName: notification.author
            });
          }
        } else if (notification.type === "promote") {
          for (const participantId of notification.recipientIds) {
            let participantName = participantId;
            try {
              const contact = await wbot.getContactById(participantId);
              participantName = contact?.name || contact?.pushname || participantId;
            } catch (e) {
              logger.warn(`[GROUP_EVENT] Could not get participant name: ${participantId}`);
            }

            await this.registerEvent({
              whatsappId,
              groupId,
              eventType: "PARTICIPANT_PROMOTED",
              participantId,
              participantName,
              performedBy: notification.author,
              performedByName: notification.author
            });
          }
        } else if (notification.type === "demote") {
          for (const participantId of notification.recipientIds) {
            let participantName = participantId;
            try {
              const contact = await wbot.getContactById(participantId);
              participantName = contact?.name || contact?.pushname || participantId;
            } catch (e) {
              logger.warn(`[GROUP_EVENT] Could not get participant name: ${participantId}`);
            }

            await this.registerEvent({
              whatsappId,
              groupId,
              eventType: "PARTICIPANT_DEMOTED",
              participantId,
              participantName,
              performedBy: notification.author,
              performedByName: notification.author
            });
          }
        }
      } catch (error) {
        logger.error(`[GROUP_EVENT] Error handling group_update: ${error}`);
      }
    });

    wbot.on("group_join", async (notification: any) => {
      try {
        const groupId = notification.chatId;
        
        for (const participantId of notification.recipientIds || []) {
          let participantName = participantId;
          try {
            const contact = await wbot.getContactById(participantId);
            participantName = contact?.name || contact?.pushname || participantId;
          } catch (e) {
            logger.warn(`[GROUP_EVENT] Could not get participant name: ${participantId}`);
          }

          await this.registerEvent({
            whatsappId,
            groupId,
            eventType: "PARTICIPANT_ADDED",
            participantId,
            participantName,
            performedBy: "link",
            performedByName: "Link de convite"
          });
        }
      } catch (error) {
        logger.error(`[GROUP_EVENT] Error handling group_join: ${error}`);
      }
    });

    wbot.on("group_leave", async (notification: any) => {
      try {
        const groupId = notification.chatId;
        
        for (const participantId of notification.recipientIds || []) {
          let participantName = participantId;
          try {
            const contact = await wbot.getContactById(participantId);
            participantName = contact?.name || contact?.pushname || participantId;
          } catch (e) {
            logger.warn(`[GROUP_EVENT] Could not get participant name: ${participantId}`);
          }

          await this.registerEvent({
            whatsappId,
            groupId,
            eventType: "PARTICIPANT_REMOVED",
            participantId,
            participantName
          });
        }
      } catch (error) {
        logger.error(`[GROUP_EVENT] Error handling group_leave: ${error}`);
      }
    });

    logger.info(`[GROUP_EVENT] Group listeners setup completed for WhatsApp ${whatsappId}`);
  }
}

export default GroupEventsService.getInstance();
