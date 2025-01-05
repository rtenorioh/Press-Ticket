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
import UserWhatsapp from "../models/UserWhatsapp";
import Whatsapp from "../models/Whatsapp";
import WhatsappQueue from "../models/WhatsappQueue";

// eslint-disable-next-line
const dbConfig = require("../config/database");
// import dbConfig from "../config/database";

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
  OldMessage,
  Personalization
];

sequelize.addModels(models);

export default sequelize;
