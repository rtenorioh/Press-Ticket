import { Op, Sequelize } from "sequelize";
import Tag from "../../models/Tag";
import Contact from "../../models/Contact";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  tags: Tag[];
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

  const { count, rows: tags } = await Tag.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],
    include: [
      {
        model: Contact,
        as: "contacts",
        attributes: [],
        required: false
      }
    ],
    attributes: {
      include: [
        [Sequelize.fn("COUNT", Sequelize.col("contacts.id")), "contactsCount"]
      ]
    },
    group: [
      "Tag.id",
      "contacts.ContactTag.tagId",
      "contacts.ContactTag.contactId",
      "contacts.ContactTag.createdAt",
      "contacts.ContactTag.updatedAt"
    ],
    subQuery: false
  });
  const hasMore = count > offset + tags.length;

  return {
    tags,
    count,
    hasMore
  };
};

export default ListService;
