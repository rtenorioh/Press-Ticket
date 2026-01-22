import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import { Op } from "sequelize";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  address?: string;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  address = "",
  email = "",
  extraInfo = []
}: Request): Promise<Contact> => {
  const io = getIO();
  const digits = String(rawNumber || "").replace(/\D/g, "");
  const groupJid = rawNumber && rawNumber.includes("@g.us") ? rawNumber : `${digits}@g.us`;

  if (isGroup) {
    const candidates = await Contact.findAll({
      where: { number: { [Op.in]: [groupJid, digits] } }
    });

    let primary: Contact | null = null;
    if (candidates.length) {
      candidates.sort((a, b) => Number(b.number.includes("@g.us")) - Number(a.number.includes("@g.us")) || Number(b.isGroup) - Number(a.isGroup));
      primary = candidates[0];
      for (const dup of candidates.slice(1)) {
        if (dup.id !== primary.id) {
          try { await dup.destroy(); } catch {}
        }
      }
    }

    if (primary) {
      const updatedData: Partial<Contact> = {} as any;
      if (name && name.trim() && primary.name !== name.trim() && !primary.nameManuallyEdited) {
        (updatedData as any).name = name.trim();
      }
      if (!primary.isGroup) {
        (updatedData as any).isGroup = true;
      }
      if (profilePicUrl && primary.profilePicUrl !== profilePicUrl) {
        (updatedData as any).profilePicUrl = profilePicUrl;
      }
      if (primary.number !== groupJid) {
        (updatedData as any).number = groupJid;
      }
      if (address !== undefined && primary.address !== address) {
        (updatedData as any).address = address;
      }
      if (email !== undefined && primary.email !== email) {
        (updatedData as any).email = email;
      }
      if (Object.keys(updatedData).length) {
        await primary.update(updatedData);
        io.emit("contact", { action: "update", contact: primary });
      }
      return primary;
    }

    const created = await Contact.create({
      name,
      number: groupJid,
      profilePicUrl,
      address,
      email,
      isGroup: true,
      extraInfo
    } as any);
    io.emit("contact", { action: "create", contact: created });
    return created;
  }

  let contact = await Contact.findOne({ where: { number: digits } });
  if (contact) {
    const updatedData: Partial<Contact> = {} as any;
    if (name && name.trim() && contact.name !== name.trim() && !contact.nameManuallyEdited) {
      (updatedData as any).name = name.trim();
    }
    if (profilePicUrl && contact.profilePicUrl !== profilePicUrl) {
      (updatedData as any).profilePicUrl = profilePicUrl;
    }
    if (address !== undefined && contact.address !== address) {
      (updatedData as any).address = address;
    }
    if (email !== undefined && contact.email !== email) {
      (updatedData as any).email = email;
    }
    if (Object.keys(updatedData).length) {
      await contact.update(updatedData);
      io.emit("contact", { action: "update", contact });
    }
    return contact;
  }

  contact = await Contact.create({
    name,
    number: digits,
    profilePicUrl,
    address,
    email,
    isGroup: false,
    extraInfo
  } as any);
  io.emit("contact", { action: "create", contact });
  return contact;
};

export default CreateOrUpdateContactService;
