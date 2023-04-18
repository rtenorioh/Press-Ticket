import Queue from "../models/Queue";
import User from "../models/User";
import Whatsapp from "../models/Whatsapp";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  queues: Queue[];
  whatsapp: Whatsapp;
  allHistoric: string,
  isRemoveTags: string,
  viewConection: string,
  viewSector: string,
  viewName: string,
  viewTags: string,
  allTicket: string,
  startWork: string;
  endWork: string;
}

export const SerializeUser = (user: User): SerializedUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    queues: user.queues,
    whatsapp: user.whatsapp,
    allHistoric: user.allHistoric,
    isRemoveTags: user.isRemoveTags,
    viewConection: user.viewConection,
    viewSector: user.viewSector,
    viewName: user.viewName,
    viewTags: user.viewTags,
    allTicket: user.allTicket,
    startWork: user.startWork,
    endWork: user.endWork
  };
};
