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
				// Preservar lastMessage quando o recebido vier vazio ou atrasado
				if (!useIncoming || !incoming.lastMessage) {
					merged.lastMessage = existing.lastMessage;
				}
				// UnreadMessages deve refletir o backend quando vier definido
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
			// Se o ticket tem mensagens não lidas, mover para o topo
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
		console.log(`[REDUCER_UPDATE_UNREAD][${timestamp}] Processando ticket ${ticket.id}:`, {
			lastMessage: ticket.lastMessage,
			unreadMessages: ticket.unreadMessages
		});

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
			
			// Mover para o topo apenas se houver nova mensagem diferente
			if (ticket.lastMessage && ticket.lastMessage !== oldTicket.lastMessage) {
				console.log(`[REDUCER_MOVE_TOP][${timestamp}] Movendo ticket ${ticket.id} para o topo`);
				state.unshift(state.splice(ticketIndex, 1)[0]);
			} else {
				console.log(`[REDUCER_NO_MOVE][${timestamp}] Ticket ${ticket.id} não movido - mesma mensagem`);
			}
		} else {
			console.log(`[REDUCER_ADD_NEW][${timestamp}] Adicionando novo ticket ${ticket.id}`);
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
		
		// Verificar se o ticket já existe
		const ticketIndex = state.findIndex((t) => t.id === ticket.id);
		if (ticketIndex === -1) {
			// Adicionar novo ticket no topo da lista
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

		// Filtrar por tipo de conversa (grupo ou individual)
		if (isGroup !== undefined) {
			if (isGroup === true) {
				// Mostrar apenas tickets de grupos
				filteredTickets = filteredTickets.filter((t) => t.contact?.isGroup === true);
			} else {
				// Mostrar apenas tickets individuais (não grupos)
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
				// Aplicar filtro de grupo também nos tickets gerais
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
				// Aplicar filtro de grupo também nos tickets gerais
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
			// Adicionar logs para depuração
			console.log(`[FRONT_TICKET_FILTER][${new Date().toISOString()}] Verificando ticket:`, {
				id: ticket.id,
				status: ticket.status,
				userId: ticket.userId,
				queueId: ticket.queueId,
				currentStatus: status,
				showAll: showAll,
				currentUser: user?.id,
				userProfile: user?.profile
			});
		
			// Verificar se o status do ticket corresponde ao status da aba atual
			const matchesCurrentStatus = status === ticket.status;
			
			// Se o status não corresponde à aba atual, não exibir
			if (!matchesCurrentStatus) {
				console.log(`[FRONT_TICKET_STATUS][${new Date().toISOString()}] Ticket ${ticket.id} com status diferente da aba atual: Não exibir`);
				return false;
			}
		
			// Verificar se o usuário é admin ou masteradmin
			const isAdmin = user?.profile === "admin" || user?.profile === "masteradmin";
			
			// Se for admin/masteradmin e showAll estiver ativo, mostrar todos os tickets DA ABA ATUAL
			if (isAdmin && showAll && matchesCurrentStatus) {
				console.log(`[FRONT_TICKET_ADMIN][${new Date().toISOString()}] Admin/Master com 'Todos' ativo: exibir ticket ${ticket.id}`);
				return true;
			}
		
			// Tickets pendentes (aguardando) com status "pending"
			if (ticket.status === "pending") {
				// Se o ticket tem setor atribuído, verificar se o usuário pertence ao setor
				if (ticket.queueId) {
					const belongsToQueue = selectedQueueIds.indexOf(ticket.queueId) > -1;
					const shouldShow = belongsToQueue;
					console.log(`[FRONT_TICKET_PENDING_QUEUE][${new Date().toISOString()}] Ticket pendente ${ticket.id} com setor: ${shouldShow ? 'Exibir' : 'Não exibir'}`);
					return shouldShow;
				}
				
				// Se não tem setor atribuído, mostrar para todos
				console.log(`[FRONT_TICKET_PENDING][${new Date().toISOString()}] Ticket pendente ${ticket.id} sem setor: Exibir`);
				return true;
			}
			
			// Para tickets com status "open" (Atendimento):
			if (ticket.status === "open") {
				// Verificar se o ticket tem usuário atribuído
				if (ticket.userId) {
					// Se o ticket foi aceito pelo usuário atual, sempre exibir
					const belongsToUser = ticket.userId === user?.id;
					console.log(`[FRONT_TICKET_USER_OPEN][${new Date().toISOString()}] Ticket em atendimento ${ticket.id} atribuído ao usuário: ${belongsToUser ? 'Exibir' : 'Não exibir'}`);
					return belongsToUser;
				}
				
				// Se tem apenas setor (queue) atribuído, mostrar para todos usuários desse setor
				if (ticket.queueId) {
					const belongsToQueue = selectedQueueIds.indexOf(ticket.queueId) > -1;
					console.log(`[FRONT_TICKET_QUEUE_OPEN][${new Date().toISOString()}] Ticket em atendimento ${ticket.id} com setor atribuído: ${belongsToQueue ? 'Exibir' : 'Não exibir'}`);
					return belongsToQueue;
				}
				
				// Se não tem nem usuário nem setor atribuído, mostrar para todos
				console.log(`[FRONT_TICKET_DEFAULT_OPEN][${new Date().toISOString()}] Ticket em atendimento ${ticket.id} sem usuário/setor: Exibir`);
				return true;
			}
			
			// Para outros status (closed, etc):
			
			// Verificar se o ticket tem usuário atribuído
			if (ticket.userId) {
				// Regra 2: Se tem usuário atribuído, mostrar apenas para esse usuário
				const belongsToUser = ticket.userId === user?.id;
				console.log(`[FRONT_TICKET_USER][${new Date().toISOString()}] Ticket ${ticket.id} tem usuário atribuído: ${belongsToUser ? 'Exibir' : 'Não exibir'}`);
				return belongsToUser;
			}
			
			// Regra 1: Se tem apenas setor (queue) atribuído, mostrar para todos usuários desse setor
			if (ticket.queueId) {
				const belongsToQueue = selectedQueueIds.indexOf(ticket.queueId) > -1;
				console.log(`[FRONT_TICKET_QUEUE][${new Date().toISOString()}] Ticket ${ticket.id} tem apenas setor atribuído: ${belongsToQueue ? 'Exibir' : 'Não exibir'}`);
				return belongsToQueue;
			}
			
			// Se não tem nem usuário nem setor atribuído, mostrar para todos
			console.log(`[FRONT_TICKET_DEFAULT][${new Date().toISOString()}] Ticket ${ticket.id} sem usuário/setor: Exibir`);
			return true;
		};

		const notBelongsToUserQueues = (ticket) =>
			ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1;

		const registerSocketEvents = () => {
			socket.on("connect", () => {
				console.log("Socket conectado no TicketsList");
				
				// Sempre se inscrever no canal "pending" para receber notificações de novas mensagens
				// independentemente da aba atual
				console.log("Inscrevendo-se no canal 'pending' para receber notificações de novas mensagens");
				socket.emit("joinTickets", "pending");
				
				// Se inscrever no canal correspondente à aba atual
				if (status && status !== "pending") {
					console.log(`Inscrevendo-se no canal '${status}' (aba atual)`);
					socket.emit("joinTickets", status);
				}
				
				// Solicitar tickets para a aba atual
				if (status && user?.id) {
					console.log(`Solicitando tickets com status '${status}'`);
					socket.emit("getTickets", { status, userId: user.id, showAll });
				} else {
					socket.emit("joinNotification");
				}
			});
			
			socket.on("reconnect", () => {
				console.log("Socket reconectado no TicketsList");
				
				// Sempre se inscrever no canal "pending" para receber notificações de novas mensagens
				// independentemente da aba atual
				console.log("Inscrevendo-se no canal 'pending' para receber notificações de novas mensagens");
				socket.emit("joinTickets", "pending");
				
				// Se inscrever no canal correspondente à aba atual
				if (status && status !== "pending") {
					console.log(`Inscrevendo-se no canal '${status}' (aba atual)`);
					socket.emit("joinTickets", status);
				}
				
				// Solicitar tickets para a aba atual
				if (status && user?.id) {
					console.log(`Solicitando tickets com status '${status}'`);
					socket.emit("getTickets", { status, userId: user.id, showAll });
				} else {
					socket.emit("joinNotification");
				}
			});

			socket.on("ticket", (data) => {
				const timestamp = new Date().toISOString();
				console.log(`[FRONT_TICKET_EVENTO][${timestamp}] Evento de ticket recebido: Ação=${data.action}, TicketId=${data.ticketId || data.ticket?.id}`);
				
				if (data.ticket) {
					console.log(`[FRONT_TICKET_DETALHES][${timestamp}] Detalhes do ticket:`, {
						id: data.ticket.id,
						status: data.ticket.status,
						queueId: data.ticket.queueId,
						userId: data.ticket.userId,
						unreadMessages: data.ticket.unreadMessages
					});
				}
				
				if (data.action === "updateUnread") {
					console.log(`[FRONT_TICKET_UNREAD][${timestamp}] Resetando contador de não lidas para o ticket ${data.ticketId}`);
					try {
						dispatch({
							type: "RESET_UNREAD",
							payload: data.ticketId,
						});
						console.log(`[FRONT_TICKET_DISPATCH][${timestamp}] Dispatch RESET_UNREAD realizado com sucesso`);
					} catch (error) {
						console.error(`[FRONT_TICKET_ERRO][${timestamp}] Erro ao resetar contador de não lidas:`, error);
					}
				}

				if (data.action === "update") {
					console.log(`[FRONT_TICKET_UPDATE][${timestamp}] Processando atualização do ticket: ${data.ticket.id}`);
					
					// Verificar se o ticket deve ser removido da lista atual
					if (status && data.ticket.status !== status) {
						console.log(`[FRONT_TICKET_STATUS_CHANGE][${timestamp}] Status do ticket mudou (${data.ticket.status} != ${status}). Removendo ticket ${data.ticket.id} da lista atual`);
						try {
							dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
							console.log(`[FRONT_TICKET_DISPATCH][${timestamp}] Dispatch DELETE_TICKET realizado com sucesso`);
						} catch (error) {
							console.error(`[FRONT_TICKET_ERRO][${timestamp}] Erro ao deletar ticket:`, error);
						}
						return; // Importante: sair da função após remover o ticket
					}
					
					// Se o ticket deve ser adicionado/atualizado na lista atual
					if (shouldUpdateTicket(data.ticket)) {
						console.log(`[FRONT_TICKET_UPDATE_SAME_STATUS][${timestamp}] Atualizando ticket ${data.ticket.id} na lista atual`);
						try {
							dispatch({
								type: "UPDATE_TICKET",
								payload: data.ticket,
							});
							console.log(`[FRONT_TICKET_DISPATCH][${timestamp}] Dispatch UPDATE_TICKET realizado com sucesso`);
						} catch (error) {
							console.error(`[FRONT_TICKET_ERRO][${timestamp}] Erro ao atualizar ticket:`, error);
						}
					}
					// Se o ticket não pertence mais às filas do usuário, remover
					else if (notBelongsToUserQueues(data.ticket)) {
						console.log(`[FRONT_TICKET_QUEUE_CHANGE][${timestamp}] Ticket ${data.ticket.id} não pertence mais às filas do usuário. Removendo da lista`);
						try {
							dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
							console.log(`[FRONT_TICKET_DISPATCH][${timestamp}] Dispatch DELETE_TICKET realizado com sucesso`);
						} catch (error) {
							console.error(`[FRONT_TICKET_ERRO][${timestamp}] Erro ao deletar ticket:`, error);
						}
					}
				}

				if (data.action === "create") {
					console.log(`[FRONT_TICKET_CREATE][${timestamp}] Novo ticket criado: ${data.ticket.id}`);
					
					if (data.ticket && shouldUpdateTicket(data.ticket)) {
						// Se o ticket deve aparecer na lista atual, adicionar
						if (data.ticket.status === status || (data.ticket.status === "pending" && status !== "closed")) {
							console.log(`[FRONT_TICKET_CREATE_ADD][${timestamp}] Adicionando novo ticket ${data.ticket.id} à lista`);
							try {
								dispatch({
									type: "ADD_TICKET",
									payload: data.ticket,
								});
								console.log(`[FRONT_TICKET_DISPATCH][${timestamp}] Dispatch ADD_TICKET realizado com sucesso`);
							} catch (error) {
								console.error(`[FRONT_TICKET_ERRO][${timestamp}] Erro ao adicionar novo ticket:`, error);
							}
						}
					}
				}


				if (data.action === "delete") {
					console.log(`[FRONT_TICKET_DELETE][${timestamp}] Recebido comando para deletar ticket ${data.ticketId}`);
					try {
						dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
						console.log(`[FRONT_TICKET_DISPATCH][${timestamp}] Dispatch DELETE_TICKET realizado com sucesso`);
					} catch (error) {
						console.error(`[FRONT_TICKET_ERRO][${timestamp}] Erro ao deletar ticket:`, error);
					}
				}
			});

			socket.on("appMessage", (data) => {
				const timestamp = new Date().toISOString();
				console.log(`[FRONT_APP_MSG_EVENTO][${timestamp}] Evento appMessage recebido: Ação=${data.action}, MessageId=${data.message?.id}`);
				
				if (data.message) {
					console.log(`[FRONT_APP_MSG_DETALHES][${timestamp}] Detalhes da mensagem:`, {
						id: data.message.id,
						ticketId: data.message.ticketId,
						body: data.message.body?.substring(0, 30),
						ack: data.message.ack,
						fromMe: data.message.fromMe
					});
				}
				
				if (data.ticket) {
					console.log(`[FRONT_APP_MSG_TICKET][${timestamp}] Ticket:`, {
						id: data.ticket.id,
						status: data.ticket.status,
						unreadMessages: data.ticket.unreadMessages,
						userId: data.ticket.userId,
						queueId: data.ticket.queueId,
						lastMessage: data.ticket.lastMessage
					});
				}
				
				if ((data.action === "create" || data.action === "update") && data.ticket && shouldUpdateTicket(data.ticket)) {
					try {
						dispatch({
							type: "UPDATE_TICKET_UNREAD_MESSAGES",
							payload: data.ticket,
						});
						console.log(`[FRONT_APP_MSG_UPDATE_TICKET][${timestamp}] Ticket ${data.ticket.id} atualizado via '${data.action}'`);
					} catch (error) {
						console.error(`[FRONT_APP_MSG_UPDATE_ERROR][${timestamp}] Erro ao atualizar ticket:`, error);
					}
				}

				if (data.action === "update") {
					console.log(`[FRONT_APP_MSG_ACK_UPDATE][${timestamp}] Atualização de ACK recebida: MessageId=${data.message?.id}, ACK=${data.message?.ack}`);
				}
			});

			// Atualizações de contato
			socket.on("contact", (data) => {
				if (data.action === "update") {
					dispatch({
						type: "UPDATE_TICKET_CONTACT",
						payload: data.contact,
					});
				}
			});
			
			// Lista consolidada de tickets vinda do backend
			socket.on("ticketList", (data) => {
				if (data && Array.isArray(data.tickets)) {
					console.log("Recebendo lista de tickets atualizada", data.tickets.length);
					const filteredTickets = status 
						? data.tickets.filter(ticket => ticket.status === status)
						: data.tickets;
					if (filteredTickets.length > 0) {
						console.log(`Carregando ${filteredTickets.length} tickets com status ${status}`);
						dispatch({ type: "LOAD_TICKETS", payload: filteredTickets });
					}
				}
			});
		};

		registerSocketEvents();

		if (!socket.connected) {
			console.log("Socket não está conectado, tentando reconectar...");
			socket.connect();
		}

		return () => {
			console.log("Limpando eventos do socket no TicketsList");
			socket.off("connect");
			socket.off("reconnect");
			socket.off("ticket");
			socket.off("appMessage");
			socket.off("contact");
			socket.off("ticketList");
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