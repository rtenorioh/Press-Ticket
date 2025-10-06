import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  address?: string;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
  birthdate?: Date | string;
  gender?: string;
  status?: string;
  lastContactAt?: Date | string;
  country?: string;
  zip?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cpf?: string;
}

const CreateContactService = async ({
  name,
  number,
  address = "",
  email = "",
  extraInfo = [],
  birthdate,
  gender = "",
  status = "",
  lastContactAt,
  country = "",
  zip = "",
  addressNumber = "",
  addressComplement = "",
  neighborhood = "",
  city = "",
  state = "",
  cpf = ""
}: Request): Promise<Contact> => {
  const numberExists = await Contact.findOne({
    where: { number }
  });

  if (numberExists) {
    throw new AppError("ERR_DUPLICATED_CONTACT");
  }

  const contact = await Contact.create(
    {
      name,
      number,
      address,
      email,
      extraInfo,
      birthdate: birthdate && birthdate !== "" ? new Date(birthdate) : null,
      gender,
      status,
      lastContactAt: lastContactAt && lastContactAt !== "" ? new Date(lastContactAt) : null,
      country,
      zip,
      addressNumber,
      addressComplement,
      neighborhood,
      city,
      state,
      cpf
    },
    {
      include: ["extraInfo"]
    }
  );

  return contact;
};

export default CreateContactService;
