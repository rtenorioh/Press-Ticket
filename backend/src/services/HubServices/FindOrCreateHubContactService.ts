import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";

export interface HubContact {
  name: string;
  number: string;
  firstName: string;
  lastName: string;
  picture: string;
  from: string;
  group: {
    id: string;
    name: string;
  };
  isGroup?: boolean;
  whatsapp?: Whatsapp;
  channel: string;
}

const FindOrCreateContactService = async (
  contact: HubContact
): Promise<Contact> => {
  const { name, number, picture, firstName, lastName, from, group, channel } =
    contact;

  const io = getIO();

  let numberFb;
  let numberIg;
  let numberTg;
  let numberEm;
  let numberWc;
  let numberWct;
  let contactExists;
  let grupoExists;

  if (channel === "email") {
    numberEm = from;
    contactExists = await Contact.findOne({
      where: {
        email: from
      }
    });
  }

  if (channel === "telegram") {
    numberTg = from;
    contactExists = await Contact.findOne({
      where: {
        telegramId: from
      }
    });

    if (group.id) {
      grupoExists = await Contact.findOne({
        where: {
          telegramId: group.id
        }
      });
    }

    if (grupoExists) {
      await grupoExists.update({
        name: group.name,
        telegramId: group.id,
        isGroup: true,
        profilePicUrl: picture
      });
      io.emit("contact", {
        action: "update",
        contact
      });
    } else {
      grupoExists = await Contact.create({
        name: group.name,
        telegramId: group.id,
        isGroup: true,
        profilePicUrl: picture
      });

      io.emit("contact", {
        action: "create",
        contact
      });
    }
  }

  if (channel === "facebook") {
    numberFb = from;
    contactExists = await Contact.findOne({
      where: {
        messengerId: from
      }
    });
  }

  if (channel === "instagram") {
    numberIg = from;
    contactExists = await Contact.findOne({
      where: {
        instagramId: from
      }
    });
  }

  if (channel === "webchat") {
    numberWc = from;
    numberWct = number;
    contactExists = await Contact.findOne({
      where: {
        webchatId: from
      }
    });
  }

  if (contactExists) {
    await contactExists.update({
      name: name || firstName || "Name Unavailable",
      number: numberWct || null,
      firstName,
      lastName,
      isGroup: false,
      profilePicUrl: picture
    });
    io.emit("contact", {
      action: "update",
      contact
    });
    return contactExists;
  }

  const newContact = await Contact.create({
    name: name || firstName || "Name Unavailable",
    number: numberWct || null,
    profilePicUrl: picture,
    isGroup: false,
    messengerId: numberFb || null,
    instagramId: numberIg || null,
    telegramId: numberTg || null,
    webchatId: numberWc || null,
    email: numberEm || null
  });

  io.emit("contact", {
    action: "create",
    contact
  });

  return newContact;
};

export default FindOrCreateContactService;
