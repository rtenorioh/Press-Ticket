import { Sequelize, Op, Filterable, Includeable } from "sequelize";
import { intersection } from "lodash";
import Contact from "../../models/Contact";
import Tag from "../../models/Tag";
import ContactTag from "../../models/ContactTag";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  tags?: number[];
}

interface Response {
  contacts: Contact[];
  count: number;
  hasMore: boolean;
}

const ListContactsService = async ({
  searchParam = "",
  pageNumber = "1",
  tags
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"] = {
    [Op.or]: [
      {
        name: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("name")),
          "LIKE",
          `%${searchParam.toLowerCase().trim()}%`
        )
      },
      { number: { [Op.like]: `%${searchParam.toLowerCase().trim()}%` } },
      {
        email: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("email")),
          "LIKE",
          `%${searchParam.toLowerCase().trim()}%`
        )
      }
    ]
  };

  let includeCondition: Includeable[];
  includeCondition = [
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"]
    }
  ];

  if (Array.isArray(tags) && tags.length > 0) {
    const contactsTagFilter = [];
    for (const tag of tags) {
      const contactTags = await ContactTag.findAll({ where: { tagId: tag } });
      if (contactTags) {
        contactsTagFilter.push(contactTags.map(t => t.contactId));
      }
    }

    const contactsIntersection: number[] = intersection(...contactsTagFilter);

    whereCondition = {
      id: {
        [Op.in]: contactsIntersection
      }
    };
  }

  const limit = 200;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: contacts } = await Contact.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]]
  });

  const hasMore = count > offset + contacts.length;

  return {
    contacts,
    count,
    hasMore
  };
};

export default ListContactsService;
