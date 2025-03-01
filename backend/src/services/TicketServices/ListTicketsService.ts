import { endOfDay, parseISO, startOfDay } from "date-fns";
import { col, fn, Includeable, Op, where } from "sequelize";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import ListSettingsServiceOne from "../SettingServices/ListSettingsServiceOne";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  showAll?: string;
  isAdmin?: boolean;
  userId: string;
  withUnreadMessages?: string;
  queueIds: number[];
  all?: string;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  status,
  startDate,
  endDate,
  showAll,
  isAdmin,
  userId,
  withUnreadMessages,
  queueIds,
  all
}: Request): Promise<Response> => {
  let whereCondition: any = {
    [Op.or]: [{ userId }, { status: "pending" }],
    queueId: { [Op.or]: [queueIds, null] }
  };

  let includeCondition: Includeable[] = [
    {
      model: Contact,
      as: "contact",
      attributes: [
        "id",
        "name",
        "number",
        "address",
        "email",
        "profilePicUrl",
        "messengerId",
        "instagramId",
        "telegramId",
        "webchatId"
      ]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["id", "name", "type", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name", "online"]
    }
  ];

  if (showAll === "true") {
    whereCondition = { queueId: { [Op.or]: [queueIds, null] } };
  }

  const allTickets = await ListSettingsServiceOne({ key: "allTicket" });
  const allTicketsEnabled = allTickets?.value === "enabled";

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  }

  if (searchParam) {
    const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();

    includeCondition = [
      ...includeCondition,
      {
        model: Message,
        as: "messages",
        attributes: ["id", "body"],
        where: {
          body: where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        required: false,
        duplicating: false
      }
    ];

    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          "$contact.name$": where(
            fn("LOWER", col("contact.name")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
        {
          "$message.body$": where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        }
      ]
    };
  }

  if (startDate && endDate) {
    whereCondition = {
      ...whereCondition,
      createdAt: {
        [Op.between]: [
          startOfDay(parseISO(startDate)),
          endOfDay(parseISO(endDate))
        ]
      }
    };
  }

  if (!isAdmin && !allTicketsEnabled) {
    whereCondition = {
      ...whereCondition,
      userId
    };
  }

  if (withUnreadMessages === "true") {
    whereCondition = {
      ...whereCondition,
      unreadMessages: { [Op.gt]: 0 }
    };
  }

  const defaultLimit = 20;
  const limit = all === "true" ? undefined : defaultLimit;
  const offset = all === "true" ? 0 : defaultLimit * (+(pageNumber || "1") - 1);

  const listSettingsService = await ListSettingsServiceOne({ key: "ASC" });
  const settingASC = listSettingsService?.value === "enabled" ? "ASC" : "DESC";

  const listSettingsService2 = await ListSettingsServiceOne({ key: "created" });
  const settingCreated =
    listSettingsService2?.value === "enabled" ? "createdAt" : "updatedAt";

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [[settingCreated, settingASC]]
  });

  const hasMore = !(all === "true") && count > offset + defaultLimit;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;
