import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import React, { useContext, useEffect, useReducer, useRef, useState } from "react";
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
			
			const oldMsg = typeof oldTicket.lastMessage === 'string' ? oldTicket.lastMessage : JSON.stringify(oldTicket.lastMessage);
			const newMsg = typeof ticket.lastMessage === 'string' ? ticket.lastMessage : JSON.stringify(ticket.lastMessage);
			
			if (ticket.lastMessage && newMsg !== oldMsg) {
				state.unshift(state.splice(ticketIndex, 1)[0]);
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
		selectedChannelIds,
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
	
	const statusRef = useRef(status);
	const userRef = useRef(user);
	const selectedQueueIdsRef = useRef(selectedQueueIds);
	const isGroupRef = useRef(isGroup);
	const showAllRef = useRef(showAll);
	
	useEffect(() => {
		statusRef.current = status;
		userRef.current = user;
		selectedQueueIdsRef.current = selectedQueueIds;
		isGroupRef.current = isGroup;
		showAllRef.current = showAll;
	}, [status, user, selectedQueueIds, isGroup, showAll]);

	const handleTagFilter = (tags) => {
		setFilteredTags(tags);
	};

	useEffect(() => {
		dispatch({ type: "RESET" });
		setPageNumber(1);
	}, [status, searchParam, dispatch, showAll, selectedQueueIds, selectedChannelIds, tags]);

	const queueIdsToSend = selectedQueueIds && selectedQueueIds.length > 0 
		? selectedQueueIds 
		: queues?.map(q => q.id) || [];

	const { tickets, hasMore, loading } = useTickets({
		pageNumber,
		searchParam,
		status,
		showAll,
		tags: JSON.stringify(tags),
		queueIds: JSON.stringify(queueIdsToSend),
		channelIds: JSON.stringify(selectedChannelIds),
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
		
		dispatch({ type: "LOAD_TICKETS", payload: tickets });
		// eslint-disable-next-line
	}, [tickets]);

	useEffect(() => {
		const socket = openSocket();
		if (!socket) {
			console.error("Não foi possível conectar ao socket");
			return;
		}

		const shouldUpdateTicket = (ticket) => {
			const currentStatus = statusRef.current;
			const currentUser = userRef.current;
			const currentQueueIds = selectedQueueIdsRef.current;
			const currentIsGroup = isGroupRef.current;
			const currentShowAll = showAllRef.current;
			
			if (currentStatus !== ticket.status) {
				return false;
			}

			if (currentIsGroup !== undefined) {
				const isTicketGroup = !!ticket.contact?.isGroup;
				if (currentIsGroup !== isTicketGroup) {
					return false;
				}
			}

			const queueIdsToCheck = currentQueueIds && currentQueueIds.length > 0 
				? currentQueueIds 
				: currentUser?.queues?.map(q => q.id) || [];

			if (queueIdsToCheck.length > 0 && ticket.queueId) {
				if (queueIdsToCheck.indexOf(ticket.queueId) === -1) {
					return false;
				}
			}

			return true;
		};

		const notBelongsToUserQueues = (ticket) => {
			const currentQueueIds = selectedQueueIdsRef.current;
			const currentUser = userRef.current;
			
			const queueIdsToCheck = currentQueueIds && currentQueueIds.length > 0 
				? currentQueueIds 
				: currentUser?.queues?.map(q => q.id) || [];
			
			if (queueIdsToCheck.length === 0) {
				return false;
			}
			
			return ticket.queueId && queueIdsToCheck.indexOf(ticket.queueId) === -1;
		};

		const registerSocketEvents = () => {
			const handleConnect = () => {
				const currentStatus = statusRef.current;
				const currentUser = userRef.current;
				const currentShowAll = showAllRef.current;
				
				socket.emit("joinTickets", "pending");
				
				if (currentStatus && currentStatus !== "pending") {
					socket.emit("joinTickets", currentStatus);
				}
				
				if (currentStatus && currentUser?.id) {
					socket.emit("getTickets", { status: currentStatus, userId: currentUser.id, showAll: currentShowAll });
				} else {
					socket.emit("joinNotification");
				}
			};
			
			socket.on("connect", handleConnect);
			socket.on("reconnect", handleConnect);
			
			socket.on("ticket", (data) => {
				try {
					if (data.action === "update") {
						if (isGroup !== undefined && data.ticket?.contact) {
							const isTicketGroup = !!data.ticket.contact.isGroup;
							if (isGroup !== isTicketGroup) {
								dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
								return;
							}
						}

						if (status && data.ticket.status !== status) {
							dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
							return;
						}

						if (data.ticket && shouldUpdateTicket(data.ticket)) {
							if (data.ticket.status === status || (data.ticket.status === "pending" && status !== "closed")) {
								dispatch({ type: "UPDATE_TICKET", payload: data.ticket });
							}
						} else if (notBelongsToUserQueues(data.ticket)) {
							dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
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
								dispatch({ type: "ADD_TICKET", payload: data.ticket });
							}
						}
					}

					if (data.action === "delete") {
						dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
					}
				} catch (error) {
					console.error("Erro ao processar evento ticket:", error);
				}
			});

			socket.on("appMessage", (data) => {
				try {
					if ((data.action === "create" || data.action === "update") && data.ticket) {
						if (isGroup !== undefined && data.ticket.contact) {
							const isTicketGroup = !!data.ticket.contact.isGroup;
							if (isGroup !== isTicketGroup) {
								return;
							}
						}

						if (shouldUpdateTicket(data.ticket)) {
							dispatch({
								type: "UPDATE_TICKET_UNREAD_MESSAGES",
								payload: data.ticket,
							});
						}
					}
				} catch (error) {
					console.error("Erro ao processar evento appMessage:", error);
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