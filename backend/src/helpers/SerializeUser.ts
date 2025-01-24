import User from "../models/User";
import Queue from "../models/Queue";
import Whatsapp from "../models/Whatsapp";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  online: boolean;
  isTricked: boolean;
  startWork: string;
  endWork: string;
  createdAt: Date;
  whatsapps: Whatsapp[];
  queues: Queue[];
}

export const SerializeUser = async (user: User): Promise<SerializedUser> => {

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    online: user.online,
    isTricked: user.isTricked,
    startWork: user.startWork,
    endWork: user.endWork,
    createdAt: user.createdAt,
    whatsapps: user.whatsapps,
    queues: user.queues,
  };
};