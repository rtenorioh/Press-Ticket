import Tag from "../../models/Tag";
import Contact from "../../models/Contact";
import ContactTag from "../../models/ContactTag";

interface Request {
  tags: Tag[];
  contactId: number;
}

const SyncTags = async ({
  tags,
  contactId
}: Request): Promise<Contact | null> => {
  const contact = await Contact.findByPk(contactId, { include: [Tag] });

  const tagList = tags.map(t => ({ tagId: t.id, contactId }));

  await ContactTag.destroy({ where: { contactId } });
  await ContactTag.bulkCreate(tagList);

  contact?.reload();

  return contact;
};

export default SyncTags;
