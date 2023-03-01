import { Op } from "sequelize";
import Tag from "../../models/Tag";
import ContactTag from "../../models/ContactTag";
import Contact from "../../models/Contact"; // Add dados de contacts

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
  const limit = 9999; //Aumenta o limite de apresentações dos dados
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
      { model: ContactTag, attributes: ["tagId"] },
      { model: Contact, through: { attributes: [] } } //Add funcition que busca também o contato vinculado a tag
    ]
  });

  const hasMore = count > offset + tags.length;

  return {
    tags,
    count,
    hasMore
  };
};

export default ListService;
