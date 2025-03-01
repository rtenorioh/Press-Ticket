import { useEffect, useState } from "react";
import { getHoursCloseTicketsAuto } from "../../config";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useTickets = ({
    searchParam,
    pageNumber,
    status,
    startDate,
    endDate,
    showAll,
    userId,
    queueIds,
    withUnreadMessages,
    all
}) => {
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [count, setCount] = useState(0);
    const [ticketsByUser, setTicketsByUser] = useState({});
    const [ticketsByConnection, setTicketsByConnection] = useState({});
    const [newContactsByDay, setNewContactsByDay] = useState({});
    const [contactsWithTicketsByDay, setContactsWithTicketsByDay] = useState([]);

    const formatDateToDDMMYYYY = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchTickets = async () => {
                try {
                    const { data } = await api.get("/tickets", {
                        params: {
                            searchParam,
                            pageNumber,
                            status,
                            startDate,
                            endDate,
                            showAll,
                            userId,
                            queueIds,
                            withUnreadMessages,
                            all
                        },
                    });
                    setTickets(data.tickets);

                    const contactsByDay = data.tickets.reduce((acc, ticket) => {
                        const contactName = ticket.contact?.name || "Contato desconhecido";
                        const createdAtDate = new Date(ticket.createdAt).toLocaleDateString();

                        if (!acc[createdAtDate]) {
                            acc[createdAtDate] = new Set();
                        }
                        acc[createdAtDate].add(contactName);

                        return acc;
                    }, {});

                    const contactsWithTicketsByDay = Object.entries(contactsByDay).map(
                        ([date, contacts]) => ({
                            date,
                            count: contacts.size,
                        })
                    );

                    setContactsWithTicketsByDay(contactsWithTicketsByDay);

                    const contactsPerDay = data.tickets.reduce((acc, ticket) => {
                        const createdDate = new Date(ticket.createdAt).toLocaleDateString();
                        acc[createdDate] = acc[createdDate] ? acc[createdDate] + 1 : 1;
                        return acc;
                    }, {});
                    setNewContactsByDay(contactsPerDay);

                    const ticketsCountByConnection = data.tickets.reduce((acc, ticket) => {
                        const connectionName = ticket.whatsapp?.name || "Conexão desconhecida";
                        const createdDate = formatDateToDDMMYYYY(ticket.createdAt);

                        if (!acc[connectionName]) {
                            acc[connectionName] = {};
                        }

                        if (!acc[connectionName][createdDate]) {
                            acc[connectionName][createdDate] = 0;
                        }

                        acc[connectionName][createdDate] += 1;

                        return acc;
                    }, {});

                    setTicketsByConnection(ticketsCountByConnection);

                    const ticketsCountByUser = data.tickets.reduce((acc, ticket) => {
                        const userID = ticket.userId;
                        const createdDate = new Date(ticket.createdAt).toISOString().split("T")[0];

                        if (!acc[userID]) {
                            acc[userID] = {};
                        }

                        acc[userID][createdDate] = acc[userID][createdDate] ? acc[userID][createdDate] + 1 : 1;

                        return acc;
                    }, {});

                    setTicketsByUser(ticketsCountByUser);

                    let horasFecharAutomaticamente = getHoursCloseTicketsAuto();
                    if (
                        status === "open" &&
                        horasFecharAutomaticamente &&
                        horasFecharAutomaticamente !== "" &&
                        horasFecharAutomaticamente !== "0" &&
                        Number(horasFecharAutomaticamente) > 0
                    ) {
                        let dataLimite = new Date();
                        dataLimite.setHours(dataLimite.getHours() - Number(horasFecharAutomaticamente));

                        data.tickets.forEach(ticket => {
                            if (ticket.status !== "closed") {
                                let dataUltimaInteracaoChamado = new Date(ticket.updatedAt);
                                if (dataUltimaInteracaoChamado < dataLimite)
                                    closeTicket(ticket);
                            }
                        });
                    }

                    setHasMore(data.hasMore);
                    setCount(data.count);
                    setLoading(false);
                } catch (err) {
                    setLoading(false);
                    toastError(err);
                }
            };

            const closeTicket = async (ticket) => {
                await api.put(`/tickets/${ticket.id}`, {
                    status: "closed",
                    userId: ticket.userId || null,
                    queueId: null,
                });
            };

            fetchTickets();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [
        searchParam,
        pageNumber,
        status,
        startDate,
        endDate,
        showAll,
        userId,
        queueIds,
        withUnreadMessages,
        all
    ]);

    return {
        tickets,
        loading,
        hasMore,
        count,
        ticketsByUser,
        ticketsByConnection,
        formatDateToDDMMYYYY,
        newContactsByDay,
        contactsWithTicketsByDay,
    };
};

export default useTickets;