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
        let isMounted = true;
        const controller = new AbortController();

        const fetchTickets = async () => {
            try {
                const params = {
                    pageNumber,
                    status,
                    startDate,
                    endDate,
                    showAll,
                    userId,
                    withUnreadMessages,
                    all
                };

                if (searchParam) params.searchParam = searchParam;
                if (queueIds) params.queueIds = queueIds;

                const { data } = await api.get("/tickets", {
                    params,
                    signal: controller.signal,
                    paramsSerializer: params => {
                        return Object.entries(params)
                            .filter(([_, value]) => value !== undefined && value !== null)
                            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                            .join('&');
                    }
                });

                if (!isMounted) return;

                if (data && Array.isArray(data.tickets)) {
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

                    setHasMore(data.hasMore || false);
                    setCount(data.count || 0);
                } else {
                    console.error('useTickets - Dados inválidos recebidos:', data);
                    setTickets([]);
                    setHasMore(false);
                    setCount(0);
                }
            } catch (err) {
                console.error('useTickets - Erro na requisição:', err);
                if (!isMounted) return;
                toastError(err);
                setTickets([]);
                setHasMore(false);
                setCount(0);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        setLoading(true);
        fetchTickets();

        return () => {
            isMounted = false;
            controller.abort();
        };
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

    const closeTicket = async (ticket) => {
        await api.put(`/tickets/${ticket.id}`, {
            status: "closed",
            userId: ticket.userId || null,
            queueId: null,
        });
    };

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