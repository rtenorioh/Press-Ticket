import Ticket from "../../models/Ticket";
import User from "../../models/User";

const CheckOpenTicketsService = async (contactId: number): Promise<Ticket | null> => {
    try {
        const openTicket = await Ticket.findOne({
            where: {
                contactId,
                status: "open"
            },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name", "email", "online"]
                }
            ]
        });

        return openTicket;
    } catch (err) {
        console.error("Erro ao verificar tickets abertos:", err.message);
        throw new Error("Erro ao verificar tickets abertos");
    }
};

export default CheckOpenTicketsService;
