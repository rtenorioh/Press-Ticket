import Mustache from "mustache";
import { getWbot } from "../../libs/wbot";
import User from "../../models/User";
import Ticket from "../../models/Ticket";
import Queue from "../../models/Queue";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import Setting from "../../models/Setting";
import { msgsd, hour, date, control } from "../../helpers/Mustache";

const DEFAULT_TEMPLATE =
  "🔔 *Press Ticket - Novo Atendimento*\n\n{{ms}}, *{{user_name}}*!\nUm novo ticket foi direcionado para seu setor.\n\n*Ticket:* #{{ticket_id}}\n*Setor:* {{queue}}\n*Contato:* {{contact}}\n*Data:* {{date}} {{hour}}\n*Link:* {{link}}";

export const NotifyQueueUsersService = async (
  ticket: Ticket
): Promise<void> => {
  try {
    const { queueId, whatsappId } = ticket;

    if (!queueId || !whatsappId) return;

    const fullTicket = await Ticket.findByPk(ticket.id, {
      include: [
        { model: Queue, as: "queue", attributes: ["id", "name"] },
        { model: Contact, as: "contact", attributes: ["id", "name", "number"] },
        { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] }
      ]
    });

    if (!fullTicket) return;

    const users = await User.findAll({
      include: [
        {
          model: Queue,
          as: "queues",
          where: { id: queueId },
          attributes: []
        }
      ],
      attributes: ["id", "name", "whatsappNumber"]
    });

    if (users.length === 0) return;

    let template = DEFAULT_TEMPLATE;
    try {
      const setting = await Setting.findOne({
        where: { key: "notifyQueueUsersMessage" }
      });
      if (setting && setting.value && setting.value.trim() !== "") {
        template = setting.value;
      }
    } catch {
      // usa template padrão se falhar
    }

    const wbot = getWbot(whatsappId);

    for (const user of users) {
      if (user.whatsappNumber) {
        const cleanNumber = user.whatsappNumber.replace(/\D/g, "");

        if (cleanNumber.length >= 10) {
          const jid = `${cleanNumber}@c.us`;

          const frontendUrl = process.env.FRONTEND_URL || "";
          const ticketLink = frontendUrl
            ? `${frontendUrl}/tickets/${fullTicket.id}`
            : "";

          const view = {
            user_name: user.name || "",
            ticket_id: fullTicket.id,
            queue: fullTicket.queue?.name || "",
            contact: fullTicket.contact?.name || "",
            connection: fullTicket.whatsapp?.name || "",
            ms: msgsd(),
            hour: hour(),
            date: date(),
            protocol: `${control()}${fullTicket.id}`,
            status: fullTicket.status || "pending",
            link: ticketLink
          };

          Mustache.escape = (text: string) => text;
          const message = Mustache.render(template, view);

          await wbot.sendMessage(jid, message).catch(err => {
            console.error(
              `Erro ao notificar usuário ${user.id} no WhatsApp ${cleanNumber}:`,
              err.message
            );
          });
        }
      }
    }
  } catch (err) {
    console.error("Erro crítico no NotifyQueueUsersService:", err);
  }
};
