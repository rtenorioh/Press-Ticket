import * as Yup from "yup";

import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser";
import ShowUserService from "./ShowUserService";

interface UserData {
  email?: string;
  password?: string;
  name?: string;
  profile?: string;
  queueIds?: number[];
  whatsappId?: number;
  allHistoric?: string;
  startWork?: string;
  endWork?: string;
}

interface Request {
  userData: UserData;
  userId: string | number;
}

interface Response {
  id: number;
  name: string;
  email: string;
  profile: string;
  
}

const UpdateUserService = async ({
  userData,
  userId
}: Request): Promise<Response | undefined> => {
  const user = await ShowUserService(userId);

  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    email: Yup.string().email(),
    profile: Yup.string(),
    allHistoric: Yup.string(),
    password: Yup.string()
  });

  const {
    email,
    password,
    profile,
    name,
    allHistoric,
    queueIds = [],
    whatsappId,
    startWork,
    endWork
  } = userData;

  try {
    await schema.validate({ email, password, profile, name, allHistoric });
  } catch (err) {
    throw new AppError(err.message);
  }

  await user.update({
    email,
    password,
    profile,
    allHistoric,
    name,
    whatsappId: whatsappId || null,
    startWork,
    endWork
  });

  await user.$set("queues", queueIds);

  await user.reload();

  return SerializeUser(user);
};

export default UpdateUserService;
