import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";

const ShowUserService = async (id: string | number): Promise<User> => {
  const user = await User.findByPk(id, {
    attributes: [
      "id",
      "name",
      "online",
      "email",
      "profile",
      "isTricked",
      "tokenVersion",
      "startWork",
      "endWork"
    ],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
      { model: Whatsapp, as: "whatsapps", attributes: ["id", "name", "color"] }
    ],
    order: [
      [{ model: Queue, as: "queues" }, "name", "asc"],
      [{ model: Whatsapp, as: "whatsapps" }, "name", "asc"]
    ]
  });
  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  return user;
};

export default ShowUserService;
