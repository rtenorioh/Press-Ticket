import { Op, Sequelize } from "sequelize";
import ClientStatus from "../../models/ClientStatus";
import Contact from "../../models/Contact";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  clientStatus: ClientStatus[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam,
  pageNumber = "1"
}: Request): Promise<Response> => {
  let whereCondition = {};
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  if (searchParam) {
    whereCondition = {
      [Op.or]: [
        { name: { [Op.like]: `%${searchParam}%` } },
        { color: { [Op.like]: `%${searchParam}%` } }
      ]
    };
  }

  const { count, rows: clientStatus } = await ClientStatus.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],
    attributes: {
      include: [
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM Contacts AS contact
            WHERE contact.status = ClientStatus.name
          )`),
          "contactsCount"
        ]
      ]
    }
  });

  const hasMore = count > offset + clientStatus.length;

  return {
    clientStatus,
    count,
    hasMore
  };
};

export default ListService;
