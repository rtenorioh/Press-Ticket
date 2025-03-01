import { Op, Sequelize, fn } from "sequelize";
import Message from "../../models/Message";

interface Request {
  userId?: number;
  all?: string;
  startDate?: string;
  endDate?: string;
}

interface MessageCount {
  id: number | null;
  send: number;
  receive: number;
}

const CountMessagesService = async ({
  userId,
  all,
  startDate,
  endDate
}: Request = {}): Promise<MessageCount[]> => {
  let dateFilter: any = {};

  if (startDate && endDate) {
    dateFilter.createdAt = {
      [Op.between]: [
        new Date(startDate).toISOString(),
        new Date(endDate).toISOString()
      ]
    };
  } else if (startDate) {
    dateFilter.createdAt = {
      [Op.gte]: new Date(startDate).toISOString()
    };
  } else if (endDate) {
    dateFilter.createdAt = {
      [Op.lte]: new Date(endDate).toISOString()
    };
  }

  if (all === "true") {
    const allUserCounts = await Message.findAll({
      where: dateFilter,
      group: ["userId"],
      attributes: [
        ["userId", "id"],
        [
          fn(
            "COUNT",
            Sequelize.literal("CASE WHEN fromMe = true THEN 1 ELSE null END")
          ),
          "send"
        ],
        [
          fn(
            "COUNT",
            Sequelize.literal("CASE WHEN fromMe = false THEN 1 ELSE null END")
          ),
          "receive"
        ]
      ],
      raw: true
    });

    const formattedAllUserCounts = allUserCounts.map((count: any) => ({
      id: count.id ? parseInt(count.id as string) : null,
      send: count.send ? Number(count.send) : 0,
      receive: count.receive ? Number(count.receive) : 0
    }));

    return formattedAllUserCounts;
  }

  if (userId) {
    const userCounts = await Message.findAll({
      where: {
        [Op.or]: [
          { fromMe: true, userId },
          { fromMe: false, userId }
        ],
        ...dateFilter
      },
      group: ["userId"],
      attributes: [
        ["userId", "id"],
        [
          fn(
            "COUNT",
            Sequelize.literal("CASE WHEN fromMe = true THEN 1 ELSE null END")
          ),
          "send"
        ],
        [
          fn(
            "COUNT",
            Sequelize.literal("CASE WHEN fromMe = false THEN 1 ELSE null END")
          ),
          "receive"
        ]
      ],
      raw: true
    });

    const formattedUserCounts = userCounts.map((count: any) => ({
      id: count.id ? parseInt(count.id as string) : null,
      send: count.send ? Number(count.send) : 0,
      receive: count.receive ? Number(count.receive) : 0
    }));

    return formattedUserCounts;
  }

  const totalSend = await Message.count({
    where: {
      fromMe: true,
      ...dateFilter
    }
  });

  const totalReceive = await Message.count({
    where: {
      fromMe: false,
      ...dateFilter
    }
  });

  const totalCount: MessageCount = {
    id: null,
    send: totalSend,
    receive: totalReceive
  };

  return [totalCount];
};

export default CountMessagesService;
