import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";

const ListWhatsAppsService = async (): Promise<Whatsapp[]> => {
  const whatsapps = await Whatsapp.findAll({
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: [
          "id",
          "name",
          "color",
          "greetingMessage",
          "startWork",
          "endWork",
          "absenceMessage"
        ]
      }
    ]
  });

  return whatsapps;
};

export default ListWhatsAppsService;
