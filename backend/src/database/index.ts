import { Sequelize } from "sequelize-typescript";
import Contact from "../models/Contact";
import ContactCustomField from "../models/ContactCustomField";
import ContactTag from "../models/ContactTag";
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
import Whatsapp from "../models/Whatsapp";
import WhatsappQueue from "../models/WhatsappQueue";
import ApiToken from "../models/ApiToken";

// eslint-disable-next-line
const dbConfig = require("../config/database");

const sequelize = new Sequelize(dbConfig);

const models = [
  User,
  Contact,
  Ticket,
  Message,
  Whatsapp,
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
  ApiToken,
  OldMessage,
  Personalization,
  UserSession
];

sequelize.addModels(models);

export default sequelize;
