import { Op } from "sequelize";
import Queue from "../../models/Queue";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import { logger } from "../../utils/logger";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";

interface QueueStats {
  id: number;
  name: string;
  color: string;
  totalTickets: number;
  waitingTickets: number;
  pendingTickets: number;
  activeTickets: number;
  avgWaitTime: number; 
  avgHandleTime: number; 
  oldestTicketTime: number; 
  oldestTicketId: number | null;
  messagesCount: {
    total: number;
    last24Hours: number;
    last7Days: number;
  };
  usersOnline: number;
  usersTotal: number;
}

interface QueueMonitorData {
  queues: QueueStats[];
  summary: {
    totalQueues: number;
    totalTickets: number;
    waitingTickets: number;
    pendingTickets: number;
    activeTickets: number;
    totalMessages: number;
    messagesLast24Hours: number;
    messagesLast7Days: number;
    avgWaitTime: number; 
    oldestTicketTime: number; 
    oldestTicketQueueId: number | null;
    oldestTicketId: number | null;
  };
  whatsapps: {
    id: number;
    name: string;
    status: string;
    type: string;
    queues: number[];
    unreadMessages: number;
    messagesToday: number;
    messagesLast7Days: number;
  }[];
}

const calculateAvgWaitTime = async (queueId: number): Promise<number> => {
  try {
    const tickets = await Ticket.findAll({
      where: {
        queueId,
        status: {
          [Op.in]: ["open", "pending"]
        },
        createdAt: {
          [Op.ne]: null as any
        }
      },
      attributes: ["id", "createdAt", "updatedAt"]
    });

    if (tickets.length === 0) return 0;

    const now = new Date();
    const totalWaitTime = tickets.reduce((sum, ticket) => {
      const createdAt = new Date(ticket.createdAt);
      const waitTime = (now.getTime() - createdAt.getTime()) / (1000 * 60); 
      return sum + waitTime;
    }, 0);

    return Math.round(totalWaitTime / tickets.length);
  } catch (error) {
    logger.error("Erro ao calcular tempo médio de espera:", error);
    return 0;
  }
};

const calculateAvgHandleTime = async (queueId: number): Promise<number> => {
  try {
    const closedTickets = await Ticket.findAll({
      where: {
        queueId,
        status: "closed",
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
        }
      },
      attributes: ["id", "createdAt", "updatedAt"]
    });

    if (closedTickets.length === 0) return 0;

    const totalHandleTime = closedTickets.reduce((sum, ticket) => {
      const createdAt = new Date(ticket.createdAt);
      const closedAt = new Date(ticket.updatedAt);
      const handleTime = (closedAt.getTime() - createdAt.getTime()) / (1000 * 60); 
      return sum + handleTime;
    }, 0);

    return Math.round(totalHandleTime / closedTickets.length);
  } catch (error) {
    logger.error("Erro ao calcular tempo médio de atendimento:", error);
    return 0;
  }
};

const getOldestTicket = async (queueId: number): Promise<{ time: number; id: number | null }> => {
  try {
    const oldestTicket = await Ticket.findOne({
      where: {
        queueId,
        status: {
          [Op.in]: ["open", "pending"]
        }
      },
      order: [["createdAt", "ASC"]],
      attributes: ["id", "createdAt"]
    });

    if (!oldestTicket) return { time: 0, id: null };

    return {
      time: new Date(oldestTicket.createdAt).getTime(),
      id: oldestTicket.id
    };
  } catch (error) {
    logger.error("Erro ao buscar ticket mais antigo:", error);
    return { time: 0, id: null };
  }
};

const countMessages = async (queueId: number): Promise<{ total: number; last24Hours: number; last7Days: number }> => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const ticketIds = (await Ticket.findAll({
      where: { queueId },
      attributes: ["id"]
    })).map(t => t.id);

    if (ticketIds.length === 0) {
      return { total: 0, last24Hours: 0, last7Days: 0 };
    }

    const total = await Message.count({
      where: {
        ticketId: {
          [Op.in]: ticketIds
        }
      }
    });

    const last24Hours = await Message.count({
      where: {
        ticketId: {
          [Op.in]: ticketIds
        },
        createdAt: {
          [Op.gte]: oneDayAgo
        }
      }
    });

    const last7Days = await Message.count({
      where: {
        ticketId: {
          [Op.in]: ticketIds
        },
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });

    return { total, last24Hours, last7Days };
  } catch (error) {
    logger.error("Erro ao contar mensagens:", error);
    return { total: 0, last24Hours: 0, last7Days: 0 };
  }
};

const countUsersOnline = async (queueId: number): Promise<{ online: number; total: number }> => {
  try {
    const total = await User.count({
      include: [
        {
          model: Queue,
          where: { id: queueId },
          required: true
        }
      ]
    });

    const online = await User.count({
      where: {
        online: true
      },
      include: [
        {
          model: Queue,
          where: { id: queueId },
          required: true
        }
      ]
    });

    return { online, total };
  } catch (error) {
    logger.error("Erro ao contar usuários online:", error);
    return { online: 0, total: 0 };
  }
};

const getWhatsappStats = async (): Promise<{
  id: number;
  name: string;
  status: string;
  type: string;
  queues: number[];
  unreadMessages: number;
  messagesToday: number;
  messagesLast7Days: number;
}[]> => {
  try {
    const whatsapps = await Whatsapp.findAll({
      include: [
        {
          model: Queue,
          as: "queues",
          attributes: ["id"]
        }
      ]
    });

    const whatsappStats = [];

    for (const whatsapp of whatsapps) {
      const pendingMessages = await Message.count({
        where: {
          ack: 0,
          fromMe: true
        },
        include: [
          {
            model: Ticket,
            where: {
              whatsappId: whatsapp.id
            },
            required: true
          }
        ]
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const messagesToday = await Message.count({
        where: {
          createdAt: {
            [Op.gte]: today
          }
        },
        include: [
          {
            model: Ticket,
            where: {
              whatsappId: whatsapp.id
            },
            required: true
          }
        ]
      });

      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      last7Days.setHours(0, 0, 0, 0);
      
      const messagesLast7Days = await Message.count({
        where: {
          createdAt: {
            [Op.gte]: last7Days
          }
        },
        include: [
          {
            model: Ticket,
            where: {
              whatsappId: whatsapp.id
            },
            required: true
          }
        ]
      });

      whatsappStats.push({
        id: whatsapp.id,
        name: whatsapp.name,
        status: whatsapp.status,
        type: whatsapp.type,
        queues: whatsapp.queues ? whatsapp.queues.map(q => q.id) : [],
        unreadMessages: pendingMessages,
        messagesToday,
        messagesLast7Days
      });
    }

    return whatsappStats;
  } catch (error) {
    logger.error("Erro ao obter estatísticas de WhatsApp:", error);
    return [];
  }
};

export const getQueueMonitorData = async (): Promise<QueueMonitorData> => {
  try {
    const queues = await Queue.findAll();
    
    const queueStats: QueueStats[] = [];
    let totalTickets = 0;
    let waitingTickets = 0;
    let pendingTickets = 0;
    let activeTickets = 0;
    let totalMessages = 0;
    let messagesLast24Hours = 0;
    let messagesLast7Days = 0;
    let oldestTicketTime = 0;
    let oldestTicketQueueId = null;
    let oldestTicketId = null;
    let totalWaitTime = 0;
    let queuesWithTickets = 0;

    for (const queue of queues) {
      const [
        totalTicketsQueue,
        waitingTicketsQueue,
        pendingTicketsQueue,
        activeTicketsQueue
      ] = await Promise.all([
        Ticket.count({ where: { queueId: queue.id } }),
        Ticket.count({ where: { queueId: queue.id, status: "open" } }),
        Ticket.count({ where: { queueId: queue.id, status: "pending" } }),
        Ticket.count({ where: { queueId: queue.id, status: "open", userId: { [Op.ne]: null as any } } })
      ]);

      const avgWaitTime = await calculateAvgWaitTime(queue.id);
      const avgHandleTime = await calculateAvgHandleTime(queue.id);

      const oldestTicket = await getOldestTicket(queue.id);

      const messagesCount = await countMessages(queue.id);

      const usersCount = await countUsersOnline(queue.id);

      totalTickets += totalTicketsQueue;
      waitingTickets += waitingTicketsQueue;
      pendingTickets += pendingTicketsQueue;
      activeTickets += activeTicketsQueue;
      totalMessages += messagesCount.total;
      messagesLast24Hours += messagesCount.last24Hours;
      messagesLast7Days += messagesCount.last7Days;

      if (oldestTicket.time > 0 && (oldestTicket.time < oldestTicketTime || oldestTicketTime === 0)) {
        oldestTicketTime = oldestTicket.time;
        oldestTicketQueueId = queue.id;
        oldestTicketId = oldestTicket.id;
      }

      if (totalTicketsQueue > 0) {
        totalWaitTime += avgWaitTime;
        queuesWithTickets++;
      }

      queueStats.push({
        id: queue.id,
        name: queue.name,
        color: queue.color,
        totalTickets: totalTicketsQueue,
        waitingTickets: waitingTicketsQueue,
        pendingTickets: pendingTicketsQueue,
        activeTickets: activeTicketsQueue,
        avgWaitTime,
        avgHandleTime,
        oldestTicketTime: oldestTicket.time,
        oldestTicketId: oldestTicket.id,
        messagesCount,
        usersOnline: usersCount.online,
        usersTotal: usersCount.total
      });
    }

    const whatsapps = await getWhatsappStats();

    const avgWaitTime = queuesWithTickets > 0 ? Math.round(totalWaitTime / queuesWithTickets) : 0;

    return {
      queues: queueStats,
      summary: {
        totalQueues: queues.length,
        totalTickets,
        waitingTickets,
        pendingTickets,
        activeTickets,
        totalMessages,
        messagesLast24Hours,
        messagesLast7Days,
        avgWaitTime,
        oldestTicketTime,
        oldestTicketQueueId,
        oldestTicketId
      },
      whatsapps
    };
  } catch (error) {
    logger.error("Erro ao obter dados de monitoramento de filas:", error);
    
    return {
      queues: [],
      summary: {
        totalQueues: 0,
        totalTickets: 0,
        waitingTickets: 0,
        pendingTickets: 0,
        activeTickets: 0,
        totalMessages: 0,
        messagesLast24Hours: 0,
        messagesLast7Days: 0,
        avgWaitTime: 0,
        oldestTicketTime: 0,
        oldestTicketQueueId: null,
        oldestTicketId: null
      },
      whatsapps: []
    };
  }
};
