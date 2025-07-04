import ActivityLog from "../../models/ActivityLog";
import User from "../../models/User";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  entityType?: string;
  entityId?: number;
}

const GetActivityLogDetailsService = async ({
  id,
  entityType,
  entityId
}: Request): Promise<any> => {
  const activityLog = await ActivityLog.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ["id", "name"]
      }
    ]
  });

  if (!activityLog) {
    throw new AppError("Activity log not found", 404);
  }

  if (!entityType || !entityId) {
    return activityLog;
  }
  let entityDetails = null;

  switch (entityType.toLowerCase()) {
    case "ticket":
      entityDetails = await Ticket.findByPk(entityId, {
        attributes: ["id", "status", "unreadMessages", "queueId", "userId"],
        include: [
          {
            model: Contact,
            attributes: ["id", "name", "number"]
          }
        ]
      });
      break;
    case "contact":
      entityDetails = await Contact.findByPk(entityId, {
        attributes: ["id", "name", "number", "email"]
      });
      break;
    case "user":
      entityDetails = await User.findByPk(entityId, {
        attributes: ["id", "name", "email", "profile"]
      });
      break;
    case "whatsapp":
      entityDetails = await Whatsapp.findByPk(entityId, {
        attributes: ["id", "name", "status", "isDefault"]
      });
      break;
    case "queue":
      entityDetails = await Queue.findByPk(entityId, {
        attributes: ["id", "name", "color"]
      });
      break;
    case "tag":
      entityDetails = await Tag.findByPk(entityId, {
        attributes: ["id", "name", "color"]
      });
      break;
    default:
      entityDetails = { message: "Entity details not available" };
  }

  return entityDetails || { message: "Entity not found" };
};

export default GetActivityLogDetailsService;
