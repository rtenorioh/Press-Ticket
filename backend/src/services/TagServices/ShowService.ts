import { Sequelize } from "sequelize";
import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";

const TagService = async (id: string | number): Promise<Tag> => {
  const tag = await Tag.findByPk(id, {
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
    include: [
      {
        model: Contact,
        as: "contacts",
        attributes: []
      }
    ]
  });

  if (!tag) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }

  return tag;
};

export default TagService;
