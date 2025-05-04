import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import React, { useContext, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import useTickets from "../../hooks/useTickets";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import TagsFilter from "../TagsFilter";
import TicketListItem from "../TicketListItem";
import TicketsListSkeleton from "../TicketsListSkeleton";

const TicketsListWrapper = styled(Paper)(({ theme }) => ({
	position: "relative",
	display: "flex",
	height: "100%",
	flexDirection: "column",
	overflow: "hidden",
	borderTopRightRadius: 0,
	borderBottomRightRadius: 0,
}));

const TicketsListStyled = styled(Paper)(({ theme }) => ({
	flex: 1,
	overflowY: "scroll",
	...theme.scrollbarStyles,
	borderTop: "2px solid rgba(0, 0, 0, 0.12)",
}));

const NoTicketsText = styled('p')(({ theme }) => ({
	textAlign: "center",
	color: "rgb(104, 121, 146)",
	fontSize: "14px",
	lineHeight: "1.4",
}));

const NoTicketsTitle = styled('span')(({ theme }) => ({
	textAlign: "center",
	fontSize: "16px",
	fontWeight: "600",
	margin: "0px",
}));

const NoTicketsDiv = styled('div')(({ theme }) => ({
	display: "flex",
	height: "100px",
	margin: 40,
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
}));

const reducer = (state, action) => {
	if (action.type === "LOAD_TICKETS") {
		const newTickets = action.payload;

		if (action.reset) {
			try {
				const ticketsStorage = localStorage.getItem('tickets') 
					? JSON.parse(localStorage.getItem('tickets')) 
					: {};
				
				ticketsStorage[action.status || 'all'] = newTickets;
				localStorage.setItem('tickets', JSON.stringify(ticketsStorage));
				console.log(`Salvando ${newTickets.length} tickets para status: ${action.status || 'all'}`);
			} catch (err) {
				console.error('Erro ao salvar tickets no localStorage:', err);
			}
			return [...newTickets];
		}

		const ticketsMap = new Map();

		state.forEach((ticket) => {
			ticketsMap.set(ticket.id, ticket);
		});

		newTickets.forEach((ticket) => {
			ticketsMap.set(ticket.id, ticket);
		});

		const allTickets = Array.from(ticketsMap.values());
		try {
			const ticketsStorage = localStorage.getItem('tickets') 
				? JSON.parse(localStorage.getItem('tickets')) 
				: {};
			
			ticketsStorage[action.status || 'all'] = allTickets;
			localStorage.setItem('tickets', JSON.stringify(ticketsStorage));
			console.log(`Atualizando ${allTickets.length} tickets para status: ${action.status || 'all'}`);
		} catch (err) {
			console.error('Erro ao atualizar tickets no localStorage:', err);
		}

		return allTickets;
	}

	if (action.type === "RESET_UNREAD") {
		const ticketId = action.payload;

		const ticketIndex = state.findIndex((t) => t.id === ticketId);
		if (ticketIndex !== -1) {
			state[ticketIndex].unreadMessages = 0;
		}

		return [...state];
	}

	if (action.type === "UPDATE_TICKET") {
		const ticket = action.payload;

		const ticketIndex = state.findIndex((t) => t.id === ticket.id);
		if (ticketIndex !== -1) {
			state[ticketIndex] = ticket;
		} else {
			state.unshift(ticket);
		}

		try {
			const ticketsStorage = localStorage.getItem('tickets') 
				? JSON.parse(localStorage.getItem('tickets')) 
				: {};
			
			ticketsStorage[action.status || 'all'] = [...state];
			localStorage.setItem('tickets', JSON.stringify(ticketsStorage));
		} catch (err) {
			console.error('Erro ao atualizar tickets no localStorage:', err);
		}

		return [...state];
	}

	if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
		const ticket = action.payload;

		const ticketIndex = state.findIndex((t) => t.id === ticket.id);
		if (ticketIndex !== -1) {
			state[ticketIndex] = ticket;
			state.unshift(state.splice(ticketIndex, 1)[0]);
		} else {
			state.unshift(ticket);
		}

		try {
			const ticketsStorage = localStorage.getItem('tickets') 
				? JSON.parse(localStorage.getItem('tickets')) 
				: {};
			
			ticketsStorage[action.status || 'all'] = [...state];
			localStorage.setItem('tickets', JSON.stringify(ticketsStorage));
		} catch (err) {
			console.error('Erro ao atualizar tickets no localStorage:', err);
		}

		return [...state];
	}

	if (action.type === "UPDATE_TICKET_CONTACT") {
		const contact = action.payload;
		const ticketIndex = state.findIndex((t) => t.contactId === contact.id);
		if (ticketIndex !== -1) {
			state[ticketIndex].contact = contact;
		}
		return [...state];
	}

	if (action.type === "DELETE_TICKET") {
		const ticketId = action.payload;
		const ticketIndex = state.findIndex((t) => t.id === ticketId);
		if (ticketIndex !== -1) {
			state.splice(ticketIndex, 1);
		}

		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const TicketsList = (props) => {
	const {
		status,
		searchParam,
		showAll,
		selectedQueueIds,
		updateCount,
		style,
		tags,
	} = props;
	const { t } = useTranslation();
	const [pageNumber, setPageNumber] = useState(1);
	const [ticketsList, dispatch] = useReducer(reducer, []);
	const { user } = useContext(AuthContext);
	const { profile, queues } = user || {};
	const [settings, setSettings] = useState([]);
	const [filteredTags, setFilteredTags] = useState([]);
	const [lastUpdate, setLastUpdate] = useState(Date.now());

	const handleTagFilter = (tags) => {
		setFilteredTags(tags);
	};

useEffect(() => {
		dispatch({ type: "RESET" });
		setPageNumber(1);
		setLastUpdate(Date.now());
	}, [status, searchParam, dispatch, showAll, selectedQueueIds, tags]);

	const { tickets, hasMore, loading } = useTickets({
		pageNumber,
		searchParam,
		status,
		showAll,
		tags: JSON.stringify(tags),
		queueIds: JSON.stringify(selectedQueueIds),
		lastUpdate,
	});

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const { data } = await api.get("/settings");
				setSettings(data);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, []);

	useEffect(() => {
		const queueIds = queues?.map((q) => q.id);
		const filteredTickets = tickets.filter((t) => queueIds.indexOf(t.queueId) > -1);

		const getSettingValue = key => {
			const { value } = settings.find(s => s.key === key);
			return value;
		};
		const allticket = settings && settings.length > 0 && getSettingValue("allTicket") === "enabled";

		if (tickets.length === 0 && ticketsList.length === 0) {
			console.log(`Nenhum ticket encontrado para status: ${status}, tentando carregar do localStorage`);
			
			try {
				const ticketsStorage = localStorage.getItem('tickets');
				if (ticketsStorage) {
					const parsedStorage = JSON.parse(ticketsStorage);
					if (parsedStorage[status] && parsedStorage[status].length > 0) {
						console.log(`Carregando ${parsedStorage[status].length} tickets do localStorage para status: ${status}`);
						dispatch({ 
							type: "LOAD_TICKETS", 
							payload: parsedStorage[status],
							reset: true,
							status: status
						});
						return;
					} else {
						console.log(`Nenhum ticket encontrado no localStorage para status: ${status}`);
					}
				}
			} catch (err) {
				console.error('Erro ao carregar tickets do localStorage:', err);
			}
		}

		if (allticket === true) {
			if (profile === "") {
				dispatch({ type: "LOAD_TICKETS", payload: filteredTickets, status: status });
			} else {
				dispatch({ type: "LOAD_TICKETS", payload: tickets, status: status });
			}
		} else {
			if (profile === "user") {
				dispatch({ type: "LOAD_TICKETS", payload: filteredTickets, status: status });
			} else {
				dispatch({ type: "LOAD_TICKETS", payload: tickets, status: status });
			}
		}
		// eslint-disable-next-line
	}, [tickets, status, searchParam, queues, profile, ticketsList, lastUpdate]);

	useEffect(() => {
		const socket = openSocket();
		if (!socket) {
			console.warn("Não foi possível conectar ao socket, tentando carregar tickets do localStorage");
			
			try {
				const ticketsStorage = localStorage.getItem('tickets');
				if (ticketsStorage) {
					const parsedStorage = JSON.parse(ticketsStorage);
					if (parsedStorage[status] && parsedStorage[status].length > 0) {
						console.log(`Carregando ${parsedStorage[status].length} tickets do localStorage para status: ${status}`);
						dispatch({ 
							type: "LOAD_TICKETS", 
							payload: parsedStorage[status],
							reset: true,
							status: status
						});
					}
				}
			} catch (err) {
				console.error('Erro ao carregar tickets do localStorage:', err);
			}
			
			return;
		}

		const shouldUpdateTicket = (ticket) =>
			(!ticket.userId || ticket.userId === user?.id || showAll) &&
			(!ticket.queueId || selectedQueueIds.indexOf(ticket.queueId) > -1);

		const notBelongsToUserQueues = (ticket) =>
			ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1;

		const joinTicketRooms = () => {
			console.log(`Entrando na sala de tickets: ${status || 'notification'}`);
			if (status) {
				socket.emit("joinTickets", status);
			} else {
				socket.emit("joinNotification");
			}
		};

		if (socket.connected) {
			joinTicketRooms();
		}
		const connectHandler = () => {
			console.log("Socket conectado, entrando nas salas de tickets");
			joinTicketRooms();
			setPageNumber(1);
			setLastUpdate(Date.now());
		};

		const ticketHandler = (data) => {
			console.log("Evento de ticket recebido:", data.action);
			if (data.action === "updateUnread") {
				dispatch({
					type: "RESET_UNREAD",
					payload: data.ticketId,
					status: status
				});
			}

			if (data.action === "update" && shouldUpdateTicket(data.ticket)) {
				dispatch({
					type: "UPDATE_TICKET",
					payload: data.ticket,
					status: status
				});
			}

			if (data.action === "update" && notBelongsToUserQueues(data.ticket)) {
				dispatch({ 
					type: "DELETE_TICKET", 
					payload: data.ticket.id,
					status: status
				});
			}

			if (data.action === "delete") {
				dispatch({ 
					type: "DELETE_TICKET", 
					payload: data.ticketId,
					status: status
				});
			}
		};

		const appMessageHandler = (data) => {
			if (data.action === "create" && shouldUpdateTicket(data.ticket)) {
				dispatch({
					type: "UPDATE_TICKET_UNREAD_MESSAGES",
					payload: data.ticket,
					status: status
				});
			}
		};

		const contactHandler = (data) => {
			if (data.action === "update") {
				dispatch({
					type: "UPDATE_TICKET_CONTACT",
					payload: data.contact,
					status: status
				});
			}
		};

		socket.on("connect", connectHandler);
		socket.on("ticket", ticketHandler);
		socket.on("appMessage", appMessageHandler);
		socket.on("contact", contactHandler);

		const reconnectInterval = setInterval(() => {
			if (socket.connected) {
				joinTicketRooms();
			} else {
				console.log("Socket desconectado, tentando reconectar...");
				socket.connect();
			}
		}, 10000);

		const handleSocketConnected = () => {
			console.log("Evento socketConnected recebido, recarregando tickets");
			setLastUpdate(Date.now());
		};
		
		const handleSocketDisconnected = (event) => {
			console.log("Evento socketDisconnected recebido, motivo:", event.detail?.reason);
			localStorage.setItem('lastTicketStatus', status);
		};
		
		window.addEventListener('socketConnected', handleSocketConnected);
		window.addEventListener('socketDisconnected', handleSocketDisconnected);
		
		return () => {
			console.log("Desmontando componente TicketsList, limpando listeners");
			clearInterval(reconnectInterval);
			socket.off("connect", connectHandler);
			socket.off("ticket", ticketHandler);
			socket.off("appMessage", appMessageHandler);
			socket.off("contact", contactHandler);
			
			window.removeEventListener('socketConnected', handleSocketConnected);
			window.removeEventListener('socketDisconnected', handleSocketDisconnected);
		};
	}, [status, showAll, user, selectedQueueIds, dispatch, pageNumber]);

	useEffect(() => {
		if (typeof updateCount === "function") {
			updateCount(ticketsList.length);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ticketsList]);

	const loadMore = () => {
		setPageNumber((prevState) => prevState + 1);
	};

	const handleScroll = (e) => {
		if (!hasMore || loading) return;

		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

		if (scrollHeight - (scrollTop + 100) < clientHeight) {
			loadMore();
		}
	};

	return (
		<TicketsListWrapper sx={style}>
			<TagsFilter onFiltered={handleTagFilter} />
			<TicketsListStyled
				square
				name="closed"
				elevation={0}
				onScroll={handleScroll}
			>
				<List sx={{ paddingTop: 0 }}>
					{ticketsList.length === 0 && !loading ? (
						<NoTicketsDiv>
							<NoTicketsTitle>
								{t("ticketsList.noTicketsTitle")}
							</NoTicketsTitle>
							<NoTicketsText>
								{t("ticketsList.noTicketsMessage")}
							</NoTicketsText>
						</NoTicketsDiv>
					) : (
						<>
							{ticketsList.map((ticket) => (
								<TicketListItem key={ticket.id} ticket={ticket} filteredTags={filteredTags} />
							))}
						</>
					)}
					{loading && <TicketsListSkeleton />}
				</List>
			</TicketsListStyled>
		</TicketsListWrapper>
	);
};

export default TicketsList;