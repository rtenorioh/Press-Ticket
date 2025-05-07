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

		newTickets.forEach((ticket) => {
			const ticketIndex = state.findIndex((t) => t.id === ticket.id);
			if (ticketIndex !== -1) {
				state[ticketIndex] = ticket;
				if (ticket.unreadMessages > 0) {
					state.unshift(state.splice(ticketIndex, 1)[0]);
				}
			} else {
				state.push(ticket);
			}
		});

		return [...state];
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

	const handleTagFilter = (tags) => {
		setFilteredTags(tags);
	};

	useEffect(() => {
		dispatch({ type: "RESET" });
		setPageNumber(1);
		
		// Tentar carregar tickets do localStorage enquanto aguarda a resposta da API
		try {
			const cachedTicketsData = localStorage.getItem(`tickets_${status}`);
			if (cachedTicketsData) {
				const { tickets: cachedTickets, timestamp } = JSON.parse(cachedTicketsData);
				
				// Verificar se os dados em cache não são muito antigos (menos de 30 minutos)
				const now = new Date().getTime();
				const thirtyMinutesInMs = 30 * 60 * 1000;
				
				if (now - timestamp < thirtyMinutesInMs && Array.isArray(cachedTickets) && cachedTickets.length > 0) {
					console.log(`Carregando ${cachedTickets.length} tickets do cache para status ${status}`);
					dispatch({ type: "LOAD_TICKETS", payload: cachedTickets });
				}
			}
		} catch (err) {
			console.error("Erro ao carregar tickets do cache", err);
		}
	}, [status, searchParam, dispatch, showAll, selectedQueueIds, tags]);

	const { tickets, hasMore, loading } = useTickets({
		pageNumber,
		searchParam,
		status,
		showAll,
		tags: JSON.stringify(tags),
		queueIds: JSON.stringify(selectedQueueIds),
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

		if (allticket === true) {

			if (profile === "") {
				dispatch({ type: "LOAD_TICKETS", payload: filteredTickets });

			} else {
				dispatch({ type: "LOAD_TICKETS", payload: tickets });
			}
		} else {

			if (profile === "user") {
				dispatch({ type: "LOAD_TICKETS", payload: filteredTickets });

			} else {
				dispatch({ type: "LOAD_TICKETS", payload: tickets });
			}
		}
		// eslint-disable-next-line
	}, [tickets, status, searchParam, queues, profile]);

	useEffect(() => {
		// Obter uma instância do socket
		const socket = openSocket();
		if (!socket) {
			console.error("Não foi possível conectar ao socket");
			return;
		}

		// Funções auxiliares para verificar permissões de tickets
		const shouldUpdateTicket = (ticket) =>
			(!ticket.userId || ticket.userId === user?.id || showAll) &&
			(!ticket.queueId || selectedQueueIds.indexOf(ticket.queueId) > -1);

		const notBelongsToUserQueues = (ticket) =>
			ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1;

		// Função para registrar todos os eventos do socket
		const registerSocketEvents = () => {
			// Evento de conexão
			socket.on("connect", () => {
				console.log("Socket conectado no TicketsList");
				
				// Entrar na sala de tickets com base no status
				if (status) {
					socket.emit("joinTickets", status);
					
					// Solicitar tickets atualizados após conexão
					if (user?.id) {
						socket.emit("getTickets", { status, userId: user.id, showAll });
					}
				} else {
					socket.emit("joinNotification");
				}
			});
			
			// Evento de reconexão
			socket.on("reconnect", () => {
				console.log("Socket reconectado no TicketsList");
				
				// Entrar na sala de tickets novamente após reconexão
				if (status) {
					socket.emit("joinTickets", status);
					
					// Solicitar tickets atualizados após reconexão
					if (user?.id) {
						socket.emit("getTickets", { status, userId: user.id, showAll });
					}
				} else {
					socket.emit("joinNotification");
				}
			});

			// Evento de atualização de ticket
			socket.on("ticket", (data) => {
				if (data.action === "updateUnread") {
					dispatch({
						type: "RESET_UNREAD",
						payload: data.ticketId,
					});
				}

				if (data.action === "update" && shouldUpdateTicket(data.ticket)) {
					dispatch({
						type: "UPDATE_TICKET",
						payload: data.ticket,
					});
				}

				if (data.action === "update" && notBelongsToUserQueues(data.ticket)) {
					dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
				}

				if (data.action === "delete") {
					dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
				}
			});

			// Evento de nova mensagem
			socket.on("appMessage", (data) => {
				if (data.action === "create" && shouldUpdateTicket(data.ticket)) {
					dispatch({
						type: "UPDATE_TICKET_UNREAD_MESSAGES",
						payload: data.ticket,
					});
				}
			});

			// Evento de atualização de contato
			socket.on("contact", (data) => {
				if (data.action === "update") {
					dispatch({
						type: "UPDATE_TICKET_CONTACT",
						payload: data.contact,
					});
				}
			});
			
			// Evento de sincronização de tickets (novo evento)
			socket.on("ticketList", (data) => {
				if (data && Array.isArray(data.tickets)) {
					console.log("Recebendo lista de tickets atualizada", data.tickets.length);
					
					// Filtrar tickets pelo status atual se necessário
					const filteredTickets = status 
						? data.tickets.filter(ticket => ticket.status === status)
						: data.tickets;
					
					if (filteredTickets.length > 0) {
						console.log(`Carregando ${filteredTickets.length} tickets com status ${status}`);
						dispatch({ type: "LOAD_TICKETS", payload: filteredTickets });
						
						// Salvar os tickets no localStorage para persistência
						try {
							const ticketsToStore = {
								tickets: filteredTickets,
								status,
								timestamp: new Date().getTime()
							};
							localStorage.setItem(`tickets_${status}`, JSON.stringify(ticketsToStore));
						} catch (err) {
							console.error("Erro ao salvar tickets no localStorage", err);
						}
					}
				}
			});
			};

		// Registrar eventos do socket
		registerSocketEvents();

		// Verificar se o socket está conectado, caso contrário, tentar reconectar
		if (!socket.connected) {
			console.log("Socket não está conectado, tentando reconectar...");
			socket.connect();
		}

		// Limpar eventos ao desmontar o componente
		return () => {
			console.log("Limpando eventos do socket no TicketsList");
			socket.off("connect");
			socket.off("reconnect");
			socket.off("ticket");
			socket.off("appMessage");
			socket.off("contact");
			socket.off("ticketList");
			// Não desconectar o socket aqui, apenas remover os listeners
			// para evitar problemas com outros componentes que usam o mesmo socket
		};
	}, [status, showAll, user, selectedQueueIds]);

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