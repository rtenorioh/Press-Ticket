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
  isRemoveTags?: string;
  startWork?: string;
  endWork?: string;
  viewConection?: string;
  viewSector?: string;
  viewName?: string;
  viewTags?: string;
  allTicket?: string;
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
    isRemoveTags: Yup.string(),
    viewConection: Yup.string(),
    viewSector: Yup.string(),
    viewName: Yup.string(),
    viewTags: Yup.string(),
    allTicket: Yup.string(),
    password: Yup.string()
  });

  const {
    email,
    password,
    profile,
    name,
    allHistoric,
    isRemoveTags,
    queueIds = [],
    whatsappId,
    startWork,
    endWork,
    viewConection,
    viewSector,
    viewName,
    viewTags,
    allTicket,
  } = userData;

  try {
    await schema.validate({
      email,
      password,
      profile,
      name,
      allHistoric,
      isRemoveTags,
      viewConection,
      viewSector,
      viewName,
      viewTags,
      allTicket,
    });
  } catch (err) {
    throw new AppError(err.message);
  }

  await user.update({
    email,
    password,
    profile,
    allHistoric,
    isRemoveTags,
    name,
    whatsappId: whatsappId || null,
    startWork,
    endWork,
    viewConection,
    viewSector,
    viewName,
    viewTags,
    allTicket,
  });

  await user.$set("queues", queueIds);

  await user.reload();

  return SerializeUser(user);
};

export default UpdateUserService;
