import { Op, Sequelize } from "sequelize";
import Contact from "../../models/Contact";
import Tag from "../../models/Tag";
import ContactTag from "../../models/ContactTag";
import ContactCustomField from "../../models/ContactCustomField";

interface Request {
  searchParam?: string;
  tags?: number[];
  isGroup?: string;
  status?: string;
}

interface Response {
  contacts: Contact[];
}

const ExportContactsService = async ({
  searchParam = "",
  tags,
  isGroup,
  status
}: Request): Promise<Response> => {
  const whereCondition: any = {};
  
  if (searchParam) {
    whereCondition[Op.or] = [
      {
        name: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("Contact.name")),
          "LIKE",
          `%${searchParam.toLowerCase().trim()}%`
        )
      },
      {
        number: { [Op.like]: `%${searchParam.toLowerCase().trim()}%` }
      },
      {
        email: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("Contact.email")),
          "LIKE",
          `%${searchParam.toLowerCase().trim()}%`
        )
      }
    ];
  }

  if (isGroup !== undefined) {
    whereCondition.isGroup = isGroup === "true";
  }

  if (status) {
    whereCondition.status = status;
  }

  const includeCondition = [
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"],
      through: { attributes: [] },
      required: false
    },
    {
      model: ContactCustomField,
      as: "extraInfo",
      attributes: ["id", "name", "value"],
      required: false
    }
  ];
  
  if (Array.isArray(tags) && tags.length > 0) {
    const contactsWithTags = await ContactTag.findAll({
      where: {
        tagId: { [Op.in]: tags }
      },
      attributes: ["contactId"],
      raw: true
    });
    
    const contactIds = contactsWithTags.map(item => item.contactId);
    
    if (contactIds.length > 0) {
      whereCondition.id = { [Op.in]: contactIds };
    }
    
    includeCondition[0] = {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"],
      through: { attributes: [] },
      required: false
    };
  }

  const batchSize = 1000;
  let offset = 0;
  let allContacts: Contact[] = [];
  let hasMore = true;

  while (hasMore) {
    const contactsBatch = await Contact.findAll({
      where: whereCondition,
      include: includeCondition,
      order: [["name", "ASC"]],
      limit: batchSize,
      offset: offset,
      attributes: [
        "id", 
        "name", 
        "number", 
        "email", 
        "address",
        "birthdate",
        "gender",
        "status",
        "country",
        "zip",
        "addressNumber",
        "addressComplement",
        "neighborhood",
        "city",
        "state",
        "cpf",
        "profilePicUrl",
        "isGroup",
        "createdAt",
        "updatedAt",
        "lastContactAt"
      ]
    });

    if (contactsBatch.length > 0) {
      allContacts = [...allContacts, ...contactsBatch];
      offset += batchSize;
    } else {
      hasMore = false;
    }
  }

  return {
    contacts: allContacts
  };
};

export default ExportContactsService;
