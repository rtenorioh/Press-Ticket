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

		newTickets.forEach((incoming) => {
			const ticketIndex = state.findIndex((t) => t.id === incoming.id);
			if (ticketIndex !== -1) {
				const existing = state[ticketIndex];
				const existingDate = existing.updatedAt ? new Date(existing.updatedAt) : null;
				const incomingDate = incoming.updatedAt ? new Date(incoming.updatedAt) : null;
				const useIncoming = !existingDate || !incomingDate || incomingDate >= existingDate;
				const merged = {
					...existing,
					...(useIncoming ? incoming : {}),
				};
				if (!useIncoming || !incoming.lastMessage) {
					merged.lastMessage = existing.lastMessage;
				}
				if (incoming.unreadMessages !== undefined) {
					merged.unreadMessages = incoming.unreadMessages;
				}
				state[ticketIndex] = merged;
				if (merged.unreadMessages > 0) {
					state.unshift(state.splice(ticketIndex, 1)[0]);
				}
			} else {
				state.push(incoming);
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
		const incoming = action.payload;

		const ticketIndex = state.findIndex((t) => t.id === incoming.id);
		if (ticketIndex !== -1) {
			const existing = state[ticketIndex];
			const merged = {
				...existing,
				...incoming,
				lastMessage: incoming.lastMessage || existing.lastMessage,
			};
			state[ticketIndex] = merged;
			if (merged.unreadMessages > 0) {
				state.unshift(state.splice(ticketIndex, 1)[0]);
			}
		} else {
			state.unshift(incoming);
		}

		return [...state];
	}

	if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
		const ticket = action.payload;
		const timestamp = new Date().toISOString();

		const ticketIndex = state.findIndex((t) => t.id === ticket.id);
		if (ticketIndex !== -1) {
			const oldTicket = state[ticketIndex];
			const updatedTicket = {
				...oldTicket,
				...ticket,
				lastMessage: ticket.lastMessage || oldTicket.lastMessage,
				unreadMessages: ticket.unreadMessages !== undefined ? ticket.unreadMessages : oldTicket.unreadMessages
			};
			
			state[ticketIndex] = updatedTicket;
			
			if (ticket.lastMessage && ticket.lastMessage !== oldTicket.lastMessage) {
				state.unshift(state.splice(ticketIndex, 1)[0]);
			} else {
				console.info(`[REDUCER_NO_MOVE][${timestamp}] Ticket ${ticket.id} não movido - mesma mensagem`);
			}
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

	if (action.type === "ADD_TICKET") {
		const ticket = action.payload;
		
		const ticketIndex = state.findIndex((t) => t.id === ticket.id);
		if (ticketIndex === -1) {
			state.unshift(ticket);
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
		isGroup,
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
	}, [status, searchParam, dispatch, showAll, selectedQueueIds, tags]);

	const { tickets, hasMore, loading } = useTickets({
		pageNumber,
		searchParam,
		status,
		showAll,
		tags: JSON.stringify(tags),
		queueIds: JSON.stringify(selectedQueueIds),
		isGroup,
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
		let filteredTickets = tickets.filter((t) => queueIds.indexOf(t.queueId) > -1);

		if (isGroup !== undefined) {
			if (isGroup === true) {
				filteredTickets = filteredTickets.filter((t) => t.contact?.isGroup === true);
			} else {
				filteredTickets = filteredTickets.filter((t) => !t.contact?.isGroup);
			}
		}

		const getSettingValue = key => {
			const { value } = settings.find(s => s.key === key);
			return value;
		};
		const allticket = settings && settings.length > 0 && getSettingValue("allTicket") === "enabled";

		if (allticket === true) {

			if (profile === "") {
				dispatch({ type: "LOAD_TICKETS", payload: filteredTickets });

			} else {
				let allTickets = tickets;
				if (isGroup !== undefined) {
					if (isGroup === true) {
						allTickets = allTickets.filter((t) => t.contact?.isGroup === true);
					} else {
						allTickets = allTickets.filter((t) => !t.contact?.isGroup);
					}
				}
				dispatch({ type: "LOAD_TICKETS", payload: allTickets });
			}
		} else {

			if (profile === "user") {
				dispatch({ type: "LOAD_TICKETS", payload: filteredTickets });

			} else {
				let allTickets = tickets;
				if (isGroup !== undefined) {
					if (isGroup === true) {
						allTickets = allTickets.filter((t) => t.contact?.isGroup === true);
					} else {
						allTickets = allTickets.filter((t) => !t.contact?.isGroup);
					}
				}
				dispatch({ type: "LOAD_TICKETS", payload: allTickets });
			}
		}
		// eslint-disable-next-line
	}, [tickets, status, searchParam, queues, profile, isGroup]);

	useEffect(() => {
		const socket = openSocket();
		if (!socket) {
			console.error("Não foi possível conectar ao socket");
			return;
		}

		const shouldUpdateTicket = (ticket) => {
			const matchesCurrentStatus = status === ticket.status;
			
			if (!matchesCurrentStatus) {
				return false;
			}

			if (isGroup !== undefined) {
				const isTicketGroup = !!ticket.contact?.isGroup;
				if (isGroup !== isTicketGroup) {
					return false;
				}
			}

			const isAdmin = user?.profile === "admin" || user?.profile === "masteradmin";
			
			
			if (status === "closed") {
				if (!isAdmin || (isAdmin && !showAll)) {
					const belongsToUser = ticket.userId === user?.id;
					const belongsToQueue = ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) > -1;
					const shouldShow = belongsToUser || belongsToQueue;
					return shouldShow;
				} else {
					return true;
				}
			} else if (status === "pending") {
				if (!isAdmin) {
					const belongsToUser = ticket.userId === user?.id;
					const belongsToQueue = !ticket.queueId || selectedQueueIds.indexOf(ticket.queueId) > -1;
					const shouldShow = belongsToUser || belongsToQueue;
					return shouldShow;
				} else {
					if (showAll) {
						return true;
					} else {
						const belongsToUser = ticket.userId === user?.id;
						const belongsToQueue = !ticket.queueId || selectedQueueIds.indexOf(ticket.queueId) > -1;
						const shouldShow = belongsToUser || belongsToQueue;
						return shouldShow;
					}
				}
			} else if (status === "open") {
				if (!isAdmin || (isAdmin && !showAll)) {
					const belongsToUser = ticket.userId === user?.id;
					const belongsToQueue = ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) > -1;
					const shouldShow = belongsToUser || belongsToQueue;
					return shouldShow;
				} else {
					return true;
				}
			}
			return false;
		};

		const notBelongsToUserQueues = (ticket) =>
			ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1;

		const registerSocketEvents = () => {
			socket.on("connect", () => {				
				socket.emit("joinTickets", "pending");
				
				if (status && status !== "pending") {
					socket.emit("joinTickets", status);
				}
				
				if (status && user?.id) {
					socket.emit("getTickets", { status, userId: user.id, showAll });
				} else {
					socket.emit("joinNotification");
				}
			});
			
			socket.on("reconnect", () => {
				socket.emit("joinTickets", "pending");
				
				if (status && status !== "pending") {
					socket.emit("joinTickets", status);
				}
				
				if (status && user?.id) {
					socket.emit("getTickets", { status, userId: user.id, showAll });
				} else {
					socket.emit("joinNotification");
				}
			});

			socket.on("reconnect", () => {
				
				socket.emit("joinTickets", "pending");
				
				if (status && status !== "pending") {
					socket.emit("joinTickets", status);
				}
				
				if (status && user?.id) {
					socket.emit("getTickets", { status, userId: user.id, showAll });
				} else {
					socket.emit("joinNotification");
				}
			});
			
			socket.on("ticket", (data) => {
				const timestamp = new Date().toISOString();
				
				if (data.action === "update") {
					if (isGroup !== undefined && data.ticket?.contact) {
						const isTicketGroup = !!data.ticket.contact.isGroup;
						if (isGroup !== isTicketGroup) {
							try {
								dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
							} catch (error) {
								console.error(`[FRONT_TICKET_ERRO][${timestamp}] Erro ao deletar ticket (filtro grupo):`, error);
							}
							return;
						}
					}

					if (status && data.ticket.status !== status) {
						try {
							dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
						} catch (error) {
							console.error(`[FRONT_TICKET_ERRO][${timestamp}] Erro ao deletar ticket (status mudou):`, error);
						}
						return;
					}

					if (data.ticket && shouldUpdateTicket(data.ticket)) {
						if (data.ticket.status === status || (data.ticket.status === "pending" && status !== "closed")) {
							try {
								dispatch({ type: "UPDATE_TICKET", payload: data.ticket });
							} catch (error) {
								console.error(`[FRONT_TICKET_ERRO][${timestamp}] Erro ao atualizar ticket:`, error);
							}
						}
					} else if (notBelongsToUserQueues(data.ticket)) {
						try {
							dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
						} catch (error) {
							console.error(`[FRONT_TICKET_ERRO][${timestamp}] Erro ao deletar ticket:`, error);
						}
					}
				}

				if (data.action === "create") {
					if (isGroup !== undefined && data.ticket?.contact) {
						const isTicketGroup = !!data.ticket.contact.isGroup;
						if (isGroup !== isTicketGroup) {
							return;
						}
					}

					if (data.ticket && shouldUpdateTicket(data.ticket)) {
						if (data.ticket.status === status || (data.ticket.status === "pending" && status !== "closed")) {
							try {
								dispatch({ type: "ADD_TICKET", payload: data.ticket });
							} catch (error) {
								console.error(`[FRONT_TICKET_ERRO][${timestamp}] Erro ao adicionar novo ticket:`, error);
							}
						}
					}
				}

				if (data.action === "delete") {
					try {
						dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
					} catch (error) {
						console.error(`[FRONT_TICKET_ERRO][${timestamp}] Erro ao deletar ticket:`, error);
					}
				}
			});

			socket.on("appMessage", (data) => {
				const timestamp = new Date().toISOString();
				
				
				if ((data.action === "create" || data.action === "update") && data.ticket) {
					if (isGroup !== undefined && data.ticket.contact) {
						const isTicketGroup = !!data.ticket.contact.isGroup;
						if (isGroup !== isTicketGroup) {
							return;
						}
					}

					if (shouldUpdateTicket(data.ticket)) {
						try {
							dispatch({
								type: "UPDATE_TICKET_UNREAD_MESSAGES",
								payload: data.ticket,
							});
						} catch (error) {
							console.error(`[FRONT_APP_MSG_UPDATE_ERROR][${timestamp}] Erro ao atualizar ticket:`, error);
						}
					}
				}
			});

			socket.on("contact", (data) => {
				if (data.action === "update") {
					dispatch({
						type: "UPDATE_TICKET_CONTACT",
						payload: data.contact,
					});
				}
			});
			socket.on("ticketList", (data) => {
				if (data && Array.isArray(data.tickets)) {
					let filteredTickets = status
						? data.tickets.filter((ticket) => ticket.status === status)
						: data.tickets;

					if (isGroup !== undefined) {
						if (isGroup === true) {
							filteredTickets = filteredTickets.filter((t) => t.contact?.isGroup === true);
						} else {
							filteredTickets = filteredTickets.filter((t) => !t.contact?.isGroup);
						}
					}

					if (filteredTickets.length > 0) {
						dispatch({ type: "LOAD_TICKETS", payload: filteredTickets });
					}
				}
			});
		};

		registerSocketEvents();

		if (!socket.connected) {
			socket.connect();
		}

		return () => {
			socket.off("connect");
			socket.off("reconnect");
			socket.off("ticket");
			socket.off("appMessage");
			socket.off("contact");
			socket.off("ticketList");
		};
	}, []);

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