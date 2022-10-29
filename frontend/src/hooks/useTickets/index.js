import { useState, useEffect, useCallback } from "react";
import { getHoursCloseTicketsAuto } from "../../config";
import toastError from "../../errors/toastError";

import api from "../../services/api";

const useTickets = ({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    queueIds,
    withUnreadMessages,
}) => {
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [count, setCount] = useState(0);

    const getTicketsByStatus = useCallback(() => {
        const fetchTickets = async() => {
            try {
                const { data } = await api.get("/tickets", {
                    params: {
                        searchParam,
                        pageNumber,
                        status,
                        date,
                        showAll,
                        queueIds,
                        withUnreadMessages,
                    },
                })
                setTickets(data.tickets)

                let horasFecharAutomaticamente = getHoursCloseTicketsAuto(); 

                if (status === "open" && horasFecharAutomaticamente && horasFecharAutomaticamente !== "" &&
                    horasFecharAutomaticamente !== "0" && Number(horasFecharAutomaticamente) > 0) {

                    let dataLimite = new Date()
                    dataLimite.setHours(dataLimite.getHours() - Number(horasFecharAutomaticamente))

                    data.tickets.forEach(ticket => {
                        if (ticket.status !== "closed") {
                            let dataUltimaInteracaoChamado = new Date(ticket.updatedAt)
                            if (dataUltimaInteracaoChamado < dataLimite)
                                closeTicket(ticket)
                        }
                    })
                }

                setHasMore(data.hasMore)
                setCount(data.count)
                setLoading(false)
            } catch (err) {
                setLoading(false)
                toastError(err)
            }
        }

        const closeTicket = async(ticket) => {
            await api.put(`/tickets/${ticket.id}`, {
                status: "closed",
                userId: ticket.userId || null,
            })
        }

        fetchTickets()
    }, [
        searchParam,
        pageNumber,
        status,
        date,
        showAll,
        queueIds,
        withUnreadMessages,
    ])

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            getTicketsByStatus()
        }, 500)
        return () => clearTimeout(delayDebounceFn)
    }, [
        getTicketsByStatus,
        searchParam,
        pageNumber,
        status,
        date,
        showAll,
        queueIds,
        withUnreadMessages,
    ])

    useEffect(() => {
        setInterval(() => getTicketsByStatus(), 60 * 1000)
    }, [getTicketsByStatus])

    return { tickets, loading, hasMore, count };
};

export default useTickets;