import { Sequelize } from "sequelize-typescript";
import ActivityLog from "../models/ActivityLog";
import ApiToken from "../models/ApiToken";
import Contact from "../models/Contact";
import ContactCustomField from "../models/ContactCustomField";
import ContactTag from "../models/ContactTag";
import ErrorLog from "../models/ErrorLog";
import Integration from "../models/Integration";
import Message from "../models/Message";
import OldMessage from "../models/OldMessage";
import Personalization from "../models/Personalization";
import Queue from "../models/Queue";
import QuickAnswer from "../models/QuickAnswer";
import Setting from "../models/Setting";
import Tag from "../models/Tag";
import Ticket from "../models/Ticket";
import User from "../models/User";
import UserQueue from "../models/UserQueue";
import UserSession from "../models/UserSession";
import UserWhatsapp from "../models/UserWhatsapp";
import Video from "../models/Video";
import VideoUser from "../models/VideoUser";
import Whatsapp from "../models/Whatsapp";
import WhatsappNotification from "../models/WhatsappNotification";
import WhatsappQueue from "../models/WhatsappQueue";
import MessageReaction from "../models/MessageReaction";
import ClientStatus from "../models/ClientStatus";
import GroupEvent from "../models/GroupEvent";
import PollVote from "../models/PollVote";

// eslint-disable-next-line
const dbConfig = require("../config/database");

const sequelize = new Sequelize(dbConfig);

const models = [
  User,
  Contact,
  Ticket,
  Message,
  Whatsapp,
  WhatsappNotification,
  ContactCustomField,
  Setting,
  Queue,
  WhatsappQueue,
  UserQueue,
  UserWhatsapp,
  QuickAnswer,
  Tag,
  ContactTag,
  Integration,
  OldMessage,
  Personalization,
  UserSession,
  ApiToken,
  ErrorLog,
  ActivityLog,
  Video,
  VideoUser,
  MessageReaction,
  ClientStatus,
  GroupEvent,
  PollVote
];

sequelize.addModels(models);

export default sequelize;
