import { Op } from "sequelize";
import ContactTag from "../../models/ContactTag";
import Tag from "../../models/Tag";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
}

interface TagWithUsageCount extends Tag {
  usageCount: number;
}

interface Response {
  tags: TagWithUsageCount[];
  count: number;
  hasMore: boolean;
}

const ListServiceCount = async ({
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
    order: [["name", "ASC"]]
  });

  const tagsWithUsageCount: TagWithUsageCount[] = await Promise.all(
    tags.map(async tag => {
      const usageCount = await ContactTag.count({
        where: { tagId: tag.id }
      });
      return {
        ...tag.toJSON(),
        usageCount
      } as TagWithUsageCount;
    })
  );

  const hasMore = count > offset + tags.length;

  return {
    tags: tagsWithUsageCount,
    count,
    hasMore
  };
};

export default ListServiceCount;
