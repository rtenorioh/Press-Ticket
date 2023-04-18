import * as Yup from "yup";

import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser";
import User from "../../models/User";

interface Request {
  email: string;
  password: string;
  name: string;
  queueIds?: number[];
  profile?: string;
  allHistoric?: string;
  isRemoveTags?: string;
  whatsappId?: number;
  startWork?: string;
  endWork?: string;
  viewConection?: string;
  viewSector?: string;
  viewName?: string;
  viewTags?: string;
  allTicket?:string;
}

interface Response {
  email: string;
  name: string;
  id: number;
  profile: string;
}

const CreateUserService = async ({
  email,
  password,
  name,
  queueIds = [],
  profile = "admin",
  allHistoric,
  isRemoveTags,
  whatsappId,
  startWork,
  endWork,
  viewConection,
  viewSector,
  viewName,
  viewTags,
  allTicket,
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    allHistoric: Yup.string(),
    isRemoveTags: Yup.string(),
    name: Yup.string().required().min(2),
    email: Yup.string()
      .email()
      .required()
      .test(
        "Check-email",
        "An user with this email already exists.",
        async value => {
          if (!value) return false;
          const emailExists = await User.findOne({
            where: { email: value }
          });
          return !emailExists;
        }
      ),
    password: Yup.string().required().min(5)
  });

  try {
    await schema.validate({ 
      email, 
      password, 
      name});

  } catch (err) {
    throw new AppError(err.message);
  }

  const user = await User.create(
    {
      email,
      password,
      name,
      profile,
      allHistoric,
      isRemoveTags,
      whatsappId: whatsappId || null,
      startWork,
      endWork,
      viewConection,
      viewSector,
      viewName,
      viewTags,
      allTicket,
    },
    { include: ["queues", "whatsapp"] }
  );

  await user.$set("queues", queueIds);

  await user.reload();

  return SerializeUser(user);
};

export default CreateUserService;
