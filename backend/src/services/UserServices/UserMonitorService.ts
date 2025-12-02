import { Op, fn, col, literal } from "sequelize";
import User from "../../models/User";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";

interface UserStats {
  id: number;
  name: string;
  email: string;
  profile: string;
  online: boolean;
  queues: Queue[];
  whatsapps: Whatsapp[];
  ticketStats: {
    open: number;
    pending: number;
    closed: number;
    total: number;
  };
  messageStats: {
    sent: number;
    sentToday: number;
    sentLast7Days: number;
  };
  performanceStats: {
    avgResponseTime: number;
    avgHandleTime: number;
    firstResponseTime: number;
    resolutionRate: number;
  };
  timeStats: {
    onlineTime: number;
    lastActivity: Date | null;
  };
}

interface UserMonitorResponse {
  users: UserStats[];
  summary: {
    totalUsers: number;
    usersOnline: number;
    totalTickets: number;
    totalMessages: number;
    avgResponseTime: number;
    avgResolutionRate: number;
  };
}

const UserMonitorService = async (userId?: number): Promise<UserMonitorResponse> => {
  try {
    const whereCondition: any = {
      profile: { [Op.ne]: "masteradmin" }
    };

    if (userId) {
      whereCondition.id = userId;
    }

    const users = await User.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "name",
        "email",
        "profile",
        "online",
        "createdAt",
        "updatedAt"
      ],
      include: [
        {
          model: Queue,
          as: "queues",
          attributes: ["id", "name", "color"]
        },
        {
          model: Whatsapp,
          as: "whatsapps",
          attributes: ["id", "name", "type", "color"]
        }
      ],
      order: [["name", "ASC"]]
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const userStats: UserStats[] = await Promise.all(
      users.map(async (user) => {
        const ticketStats = await Ticket.findAll({
          where: { userId: user.id },
          attributes: [
            "status",
            [fn("COUNT", col("id")), "count"]
          ],
          group: ["status"],
          raw: true
        });

        const ticketStatusCounts = {
          open: 0,
          pending: 0,
          closed: 0
        };

        ticketStats.forEach((stat: any) => {
          const status = stat.status as "open" | "pending" | "closed";
          if (status in ticketStatusCounts) {
            ticketStatusCounts[status] = parseInt(stat.count);
          }
        });

        const totalTickets: number = ticketStatusCounts.open + ticketStatusCounts.pending + ticketStatusCounts.closed;

        const messageSent = await Message.count({
          where: {
            fromMe: true,
            userId: user.id
          }
        });

        const messageSentToday = await Message.count({
          where: {
            fromMe: true,
            userId: user.id,
            createdAt: { [Op.gte]: today }
          }
        });

        const messageSentLast7Days = await Message.count({
          where: {
            fromMe: true,
            userId: user.id,
            createdAt: { [Op.gte]: last7Days }
          }
        });

        const userTickets = await Ticket.findAll({
          where: { userId: user.id },
          include: [
            {
              model: Message,
              as: "messages",
              attributes: ["createdAt", "fromMe"]
            }
          ]
        });

        let totalResponseTime = 0;
        let totalHandleTime = 0;
        let totalFirstResponseTime = 0;
        let responseCount = 0;
        let handleCount = 0;
        let firstResponseCount = 0;

        userTickets.forEach((ticket: any) => {
          const messages = ticket.messages || [];
          
          if (messages.length > 0) {
            const firstCustomerMessage = messages.find((m: any) => !m.fromMe);
            const firstAgentMessage = messages.find((m: any) => m.fromMe);

            if (firstCustomerMessage && firstAgentMessage) {
              const responseTime = new Date(firstAgentMessage.createdAt).getTime() - 
                                  new Date(firstCustomerMessage.createdAt).getTime();
              if (responseTime > 0) {
                totalFirstResponseTime += responseTime;
                firstResponseCount++;
              }
            }

            const agentMessages = messages.filter((m: any) => m.fromMe);
            if (agentMessages.length > 1) {
              for (let i = 1; i < agentMessages.length; i++) {
                const timeDiff = new Date(agentMessages[i].createdAt).getTime() - 
                               new Date(agentMessages[i - 1].createdAt).getTime();
                if (timeDiff > 0) {
                  totalResponseTime += timeDiff;
                  responseCount++;
                }
              }
            }
          }

          if (ticket.status === "closed" && ticket.createdAt && ticket.updatedAt) {
            const handleTime = new Date(ticket.updatedAt).getTime() - 
                              new Date(ticket.createdAt).getTime();
            if (handleTime > 0) {
              totalHandleTime += handleTime;
              handleCount++;
            }
          }
        });

        const avgResponseTime = responseCount > 0 
          ? Math.max(0, Math.round(totalResponseTime / responseCount / 1000 / 60))
          : 0;

        const avgHandleTime = handleCount > 0 
          ? Math.max(0, Math.round(totalHandleTime / handleCount / 1000 / 60))
          : 0;

        const firstResponseTime = firstResponseCount > 0 
          ? Math.max(0, Math.round(totalFirstResponseTime / firstResponseCount / 1000 / 60))
          : 0;

        const resolutionRate = totalTickets > 0 
          ? Math.max(0, Math.min(100, Math.round((ticketStatusCounts.closed / totalTickets) * 100)))
          : 0;

        const lastMessage = await Message.findOne({
          where: {
            fromMe: true,
            userId: user.id
          },
          order: [["createdAt", "DESC"]],
          attributes: ["createdAt"]
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          online: user.online,
          queues: user.queues || [],
          whatsapps: user.whatsapps || [],
          ticketStats: {
            open: ticketStatusCounts.open,
            pending: ticketStatusCounts.pending,
            closed: ticketStatusCounts.closed,
            total: totalTickets
          },
          messageStats: {
            sent: messageSent,
            sentToday: messageSentToday,
            sentLast7Days: messageSentLast7Days
          },
          performanceStats: {
            avgResponseTime,
            avgHandleTime,
            firstResponseTime,
            resolutionRate
          },
          timeStats: {
            onlineTime: 0,
            lastActivity: lastMessage ? lastMessage.createdAt : null
          }
        };
      })
    );

    const summary = {
      totalUsers: userStats.length,
      usersOnline: userStats.filter(u => u.online).length,
      totalTickets: userStats.reduce((sum, u) => sum + u.ticketStats.total, 0),
      totalMessages: userStats.reduce((sum, u) => sum + u.messageStats.sent, 0),
      avgResponseTime: userStats.length > 0
        ? Math.max(0, Math.round(userStats.reduce((sum, u) => sum + u.performanceStats.avgResponseTime, 0) / userStats.length))
        : 0,
      avgResolutionRate: userStats.length > 0
        ? Math.max(0, Math.min(100, Math.round(userStats.reduce((sum, u) => sum + u.performanceStats.resolutionRate, 0) / userStats.length)))
        : 0
    };

    return {
      users: userStats,
      summary
    };
  } catch (error) {
    console.error("[USER_MONITOR_SERVICE] Erro:", error);
    throw error;
  }
};

export default UserMonitorService;
