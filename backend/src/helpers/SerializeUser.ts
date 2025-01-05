import Queue from "../models/Queue";
import User from "../models/User";
import Whatsapp from "../models/Whatsapp";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  queues: Queue[];
  whatsapps: Whatsapp[];
  startWork: string;
  endWork: string;
  isTricked: string;
}

export const SerializeUser = (user: User): SerializedUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    queues: user.queues,
    whatsapps: user.whatsapps,
    startWork: user.startWork,
    endWork: user.endWork,
    isTricked: user.isTricked
  };
};