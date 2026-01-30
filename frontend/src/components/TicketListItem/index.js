import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import Done from '@mui/icons-material/Done';
import Facebook from '@mui/icons-material/Facebook';
import Group from '@mui/icons-material/Group';
import Instagram from '@mui/icons-material/Instagram';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Replay from '@mui/icons-material/Replay';
import Sms from '@mui/icons-material/Sms';
import Telegram from '@mui/icons-material/Telegram';
import Visibility from '@mui/icons-material/Visibility';
import WhatsApp from '@mui/icons-material/WhatsApp';
import {
	format,
	isSameDay,
	parseISO
} from "date-fns";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	useNavigate,
	useParams
} from "react-router-dom";
import receiveIcon from "../../assets/receive.png";
import sendIcon from "../../assets/send.png";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import AcceptTicketWithouSelectQueue from "../AcceptTicketWithoutQueueModal";
import ConfirmationModal from "../ConfirmationModal";
import openSocket from "../../services/socket-io";
import WhatsMarked from "react-whatsmarked";

const StyledListItem = styled(ListItem)(({ theme }) => ({
	position: "relative",
	cursor: "pointer",
	borderLeft: '4px solid transparent',
	borderRadius: theme.shape.borderRadius,
	margin: '1px 0',
	padding: '3px 4px',
	minHeight: '48px',
	transition: 'all 0.2s ease',
	backgroundColor: theme.palette.background.paper,
	boxShadow: theme.shadows[1],
	'&.Mui-selected': {
		borderLeft: `4px solid ${theme.palette.primary.main}`,
		backgroundColor: theme.palette.mode === 'dark' 
			? theme.palette.action.selected 
			: theme.palette.primary.light + '15',
		boxShadow: theme.shadows[2]
	},
	'&:hover': {
		backgroundColor: theme.palette.action.hover,
		transform: 'translateY(-1px)',
		boxShadow: theme.shadows[2]
	}
}));

const AvatarContainer = styled(ListItemAvatar)(({ theme }) => ({
	position: "relative",
	minWidth: '42px',
	marginLeft: theme.spacing(1),
	marginRight: theme.spacing(0.75)
}));

const TicketAvatar = styled(Avatar)(({ theme }) => ({
	width: "36px",
	height: "36px",
	borderRadius: "25%",
	transition: 'all 0.3s ease',
	border: `1.5px solid ${theme.palette.primary.light}`,
	boxShadow: theme.shadows[1],
	'&:hover': {
		transform: 'scale(1.05)',
		boxShadow: theme.shadows[2],
		border: `1.5px solid ${theme.palette.primary.main}`
	}
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
	color: "white",
	position: "absolute",
	top: "36px",
	right: "38px",
	transform: "translate(0, 0)",
	'& .MuiBadge-badge': {
		fontSize: '0.6rem',
		fontWeight: 'bold',
		minWidth: '15px',
		height: '15px',
		borderRadius: '7.5px',
		backgroundColor: theme.palette.success.main,
		boxShadow: `0 1px 2px rgba(0,0,0,0.2), 0 0 0 1.5px ${theme.palette.background.paper}`,
		animation: 'pulse 1.5s infinite',
		'@keyframes pulse': {
			'0%': {
				boxShadow: `0 0 0 0 ${theme.palette.success.light}`,
			},
			'70%': {
				boxShadow: `0 0 0 4px rgba(0, 0, 0, 0)`,
			},
			'100%': {
				boxShadow: `0 0 0 0 rgba(0, 0, 0, 0)`,
			},
		},
	}
}));

const GroupBadge = styled(Badge)(({ theme }) => ({
	backgroundColor: theme.palette.primary.dark,
	color: "white",
	position: "absolute",
	top: 0,
	left: 2,
	transform: "translate(0, 0)",
	'& .MuiBadge-badge': {
		backgroundColor: theme.palette.primary.main,
		minWidth: '15px',
		height: '15px',
		borderRadius: '7.5px',
		boxShadow: `0 0 0 1.5px ${theme.palette.background.paper}`,
		transition: 'all 0.3s ease',
		'&:hover': {
			transform: 'scale(1.1)'
		}
	}
}));

const TagBadge = styled(Badge)(({ theme }) => ({
	position: "absolute",
	bottom: 0,
	left: 30,
	transform: "translate(0, 0)",
	'& .MuiBadge-badge': {
		backgroundColor: theme.palette.warning.main,
		minWidth: '15px',
		height: '15px',
		borderRadius: '7.5px',
		boxShadow: `0 0 0 1.5px ${theme.palette.background.paper}`,
		transition: 'all 0.3s ease',
		cursor: 'pointer',
		'&:hover': {
			transform: 'scale(1.1)',
			backgroundColor: theme.palette.warning.dark
		}
	}
}));

const ClosedBadge = styled(Badge)(({ theme }) => ({
	alignSelf: "center",
	justifySelf: "flex-end",
	marginRight: 50,
	marginLeft: "auto",
	'& .MuiBadge-badge': {
		backgroundColor: theme.palette.grey[500],
		color: theme.palette.common.white,
		fontSize: '0.65rem',
		fontWeight: 'bold',
		borderRadius: theme.shape.borderRadius,
		boxShadow: theme.shadows[1],
		transition: 'all 0.2s ease',
		'&:hover': {
			backgroundColor: theme.palette.grey[700]
		}
	}
}));

const BottomButton = styled(IconButton)(({ theme }) => ({
	position: "relative",
	padding: 4,
	transition: 'all 0.2s ease',
	backgroundColor: theme.palette.background.paper,
	boxShadow: theme.shadows[1],
	'& .MuiSvgIcon-root': {
		fontSize: '1.1rem'
	},
	'&:hover': {
		backgroundColor: theme.palette.action.hover,
		transform: 'scale(1.05)',
		boxShadow: theme.shadows[2]
	}
}));

const ButtonContainer = styled('div')(({ theme }) => ({
	display: "flex",
	justifyContent: "flex-end",
	alignItems: "center",
	gap: theme.spacing(0.5),
	marginLeft: 'auto',
	paddingLeft: theme.spacing(1)
}));

const TicketQueueColor = styled('span')(({ theme, color }) => ({
	flex: "none",
	width: "8px",
	height: "100%",
	position: "absolute",
	top: 0,
	left: 0,
	borderTopLeftRadius: theme.shape.borderRadius,
	borderBottomLeftRadius: theme.shape.borderRadius,
	transition: 'width 0.2s ease',
	[`${StyledListItem}:hover &`]: {
		width: "10px"
	}
}));

const ChipRadiusDot = styled(Chip)(({ theme }) => ({
	"& .MuiBadge-badge": {
		borderRadius: theme.shape.borderRadius,
		position: "inherit",
		height: 10,
		margin: 2,
		padding: 3
	},
	"& .MuiBadge-anchorOriginTopRightRectangle": {
		transform: "scale(1) translate(0%, -40%)",
	},
	transition: 'all 0.2s ease',
	'&:hover': {
		transform: 'translateY(-1px)',
		boxShadow: theme.shadows[1]
	}
}));

const ContactName = styled('span')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	fontWeight: 500,
	color: theme.palette.text.primary,
	'& .MuiTypography-root': {
		fontWeight: 'bold',
		transition: 'color 0.2s ease',
		'&:hover': {
			color: theme.palette.primary.main
		}
	}
}));

const CustomTooltip = styled(Tooltip)(({ theme }) => ({
	maxWidth: 800,
	maxHeight: 700,
	overflow: "none",
	whiteSpace: "pre-wrap",
	'& .MuiTooltip-tooltip': {
		backgroundColor: theme.palette.background.paper,
		color: theme.palette.text.primary,
		borderRadius: theme.shape.borderRadius,
		boxShadow: theme.shadows[3],
		border: `1px solid ${theme.palette.divider}`,
		padding: theme.spacing(1.5),
		fontSize: '0.75rem'
	},
	'& .MuiTooltip-arrow': {
		color: theme.palette.background.paper
	}
}));

const TicketListItem = ({ ticket, filteredTags }) => {
	const theme = useTheme();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const { ticketId } = useParams();
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);
	const [acceptTicketWithouSelectQueueOpen, setAcceptTicketWithouSelectQueueOpen] = useState(false);
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [tag, setTag] = useState([]);
	const [settings, setSettings] = useState([]);
	const [spy, setSpy] = useState([]);
	const [currentTicket, setCurrentTicket] = useState(ticket);
	const defaultImage = '/default-profile.png';
	
	useEffect(() => {
		setCurrentTicket(ticket);
	}, [ticket.id, ticket.lastMessage, ticket.unreadMessages, ticket.status, ticket.userId]);

	useEffect(() => {
		const socket = openSocket();
		if (!socket) return;

		const handleAppMessage = (data) => {
			if (data.action === "create" || data.action === "update") {
				if (data.ticket && data.ticket.id === ticket.id) {
					setCurrentTicket(prevTicket => {
						const updated = {
							...prevTicket,
							...data.ticket,
							lastMessage: data.ticket.lastMessage || prevTicket.lastMessage,
							unreadMessages: data.ticket.unreadMessages !== undefined ? data.ticket.unreadMessages : prevTicket.unreadMessages
						};
						
						return updated;
					});
				}
			}
		};

		const handleContactUpdate = (data) => {
			if (data.action === "update" && data.contact) {
				if (data.contact.id === ticket.contactId || data.contact.id === ticket.contact?.id) {
					if (data.contact.tags) {
						setTag(data.contact.tags);
					}
				}
			}
		};

		socket.on("appMessage", handleAppMessage);
		socket.on("contact", handleContactUpdate);
		
		return () => {
			socket.off("appMessage", handleAppMessage);
			socket.off("contact", handleContactUpdate);
		};
	}, [ticket.id, ticket.contactId, ticket.contact]);

	useEffect(() => {
		isMounted.current = true;

		setTimeout(() => {
			const fetchTicket = async () => {
				try {
					const { data } = await api.get("/tickets/" + ticket.id);
					if (isMounted.current) {
						setTag(data?.contact?.tags);
					}
				} catch (err) {
					if (isMounted.current) {
						toastError(err, t);
					}
				}
			};
			fetchTicket();
		}, 500);

		return () => {
			isMounted.current = false;
		};
	}, [ticket.id, user, navigate, t]);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		const fetchSettings = async () => {
		  try {
			const { data } = await api.get("/settings");
			setSettings(data);
			setSpy(data);
		  } catch (err) {
			console.error(err);
			toastError(err);
			setSettings([]);
			setSpy([]);
		  }
		};
		fetchSettings();
	  }, []);

	const filterTicketByTags = () => {
		if (!filteredTags || filteredTags.length === 0) return true;
		if (!tag || tag.length === 0) return false;

		return filteredTags.every(filterTag => tag.some(t => t.id === filterTag.id));
	}

	if (!filterTicketByTags()) {
		return null;
	}

	const handleAcceptTicket = async (id) => {
		setLoading(true);
		try {			
			await api.put(`/tickets/${id}`, {
				status: "open",
				userId: user?.id,
			});
			const isGroup = ticket?.contact?.isGroup || currentTicket?.contact?.isGroup;
			const targetTab = isGroup ? "groups" : "open";
			localStorage.setItem("pressticket:changeTab", targetTab);
			
			navigate(`/tickets/${id}`);
		} catch (err) {
			if (isMounted.current) {
				toastError(err);
			}
		} finally {
			if (isMounted.current) {
				setLoading(false);
			}
		}
	};

	const queueName = selectedTicket => {
		let name = null;
		let color = null;
		user?.queues?.forEach(userQueue => {
			if (userQueue.id === selectedTicket.queueId) {
				name = userQueue.name;
				color = userQueue.color;
			}
		});
		return {
			name,
			color
		};
	}

	const handleOpenAcceptTicketWithouSelectQueue = () => {
		setAcceptTicketWithouSelectQueueOpen(true);
	};

	const handleReopenTicket = async (id) => {
		setLoading(true);
		try {
			
			await api.put(`/tickets/${id}`, {
				status: "open",
				userId: user?.id,
			});
			const isGroup = ticket?.contact?.isGroup || currentTicket?.contact?.isGroup;
			const targetTab = isGroup ? "groups" : "open";
			localStorage.setItem("pressticket:changeTab", targetTab);
			
			navigate(`/tickets/${id}`);
		} catch (err) {
			toastError(err);
		} finally {
			if (isMounted.current) {
				setLoading(false);
			}
		}
	};

	const handleViewTicket = async (id) => {
		setLoading(true);
		try {
			localStorage.setItem("pressticket:changeTab", "pending");
			
			navigate(`/tickets/${id}`);
		} catch (err) {
			toastError(err);
		} finally {
			if (isMounted.current) {
				setLoading(false);
			}
		}
	};

	const handleMoveTicket = async (id) => {
		setLoading(true);
		try {
			await api.put(`/tickets/${id}`, {
				status: "pending",
				userId: null
			});
			
			localStorage.setItem("pressticket:changeTab", "open");
			navigate(`/tickets`);
		} catch (err) {
			toastError(err);
		} finally {
			if (isMounted.current) {
				setLoading(false);
			}
		}
	};

	const handleClosedTicket = async (id, status) => { 
		setLoading(true);
		try {
			
			await api.put(`/tickets/${id}`, {
				status: "closed",
				userId: user?.id,
				queueId: ticket?.queueId || null,
			});
			
			
			navigate("/tickets");
		} catch (err) {
			toastError(err, t);
		} finally {
			if (isMounted.current) {
				setLoading(false);
			}
		}
	};

	const handleSelectTicket = id => {
		navigate(`/tickets/${id}`);
	};

	const handleOpenConfirmationModal = () => {
		setConfirmationOpen(true);
	};

	const handleConfirmClose = () => {
		handleClosedTicket(ticket.id, "closed");
	};

	const canTabsSettings = (ts) => {
		return (
			(settings && settings.some(s => s.key === ts && s.value === "enabled")) ||
			(user && user.profile === "admin")
		);
	};

	const canSpy = (cs) => {
		return (
			(spy && spy.some(s => s.key === cs && s.value === "enabled")) ||
			(user && user.profile === "admin")
		);
	};

	return (
		<React.Fragment key={ticket.id}>
			<AcceptTicketWithouSelectQueue
				modalOpen={acceptTicketWithouSelectQueueOpen}
				onClose={(e) => setAcceptTicketWithouSelectQueueOpen(false)}
				ticketId={ticket.id}
			/>
			<StyledListItem
				dense
				button
				onClick={(e) => {
					if (ticket.status === "pending") return;
					handleSelectTicket(ticket.id);
				}}
				selected={ticketId && +ticketId === ticket.id}
			>
				<Tooltip
					arrow
					placement="right"
					title={ticket.queue?.name || (ticket)?.name || t("ticketsList.items.queueless")}
				>
					<TicketQueueColor
						sx={{ backgroundColor: ticket.queue?.color || queueName(ticket)?.color || "#7C7C7C" }}
					></TicketQueueColor>
				</Tooltip>

				<AvatarContainer>
					<>
						<TicketAvatar
							src={ticket?.contact?.profilePicUrl || defaultImage}
							alt="contact_image"
						/>
						{ticket.unreadMessages > 0 && (
							<StyledBadge
								badgeContent={ticket.unreadMessages}
								overlap="circular"
								max={999999}
								anchorOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
								color="success"
							/>
						)}
						{ticket.isGroup && (
							<GroupBadge
								badgeContent={<Group sx={{ fontSize: '0.9rem' }} />}
								anchorOrigin={{
									vertical: 'top',
									horizontal: 'left',
								}}
								color="primary"
								overlap="circular"
							/>
						)}
						{tag && tag.length > 0 && (
							<Tooltip 
								title={
									<Box sx={{ minWidth: '180px' }}>
										<Box sx={{ 
											padding: '8px 12px', 
											borderBottom: `1px solid ${theme.palette.divider}`,
											marginBottom: '8px',
										}}>
											<Typography sx={{ 
												fontSize: '0.75rem', 
												fontWeight: 600,
												color: theme.palette.text.primary,
												textTransform: 'uppercase',
												letterSpacing: '0.5px'
											}}>
												<LocalOfferIcon sx={{ fontSize: '0.75rem' }} />Tags
											</Typography>
										</Box>
										<Box sx={{ padding: '0 12px 8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
											{tag.map((t, index) => (
												<Box 
													key={index} 
													sx={{ 
														display: 'flex', 
														alignItems: 'center', 
														gap: '10px',
														padding: '6px 8px',
														borderRadius: '20px',
														cursor: 'pointer',
														transition: 'background-color 0.2s ease',
														'&:hover': {
															backgroundColor: theme.palette.mode === 'dark' 
																? 'rgba(255, 255, 255, 0.08)' 
																: 'rgba(0, 0, 0, 0.04)'
														}
													}}
												>
													<Box
														sx={{
															width: '10px',
															height: '10px',
															borderRadius: '50%',
															backgroundColor: t.color,
															flexShrink: 0
														}}
													/>
													<Typography sx={{ fontSize: '0.85rem', color: theme.palette.text.primary }}>{t.name}</Typography>
												</Box>
											))}
										</Box>
									</Box>
								}
								placement="right" 
								arrow
								componentsProps={{
									tooltip: {
										sx: {
											bgcolor: theme.palette.background.paper,
											color: theme.palette.text.primary,
											boxShadow: theme.shadows[3],
											border: `1px solid ${theme.palette.divider}`,
											borderRadius: '8px',
											padding: 0,
											'& .MuiTooltip-arrow': {
												color: theme.palette.background.paper,
												'&::before': {
													border: `1px solid ${theme.palette.divider}`
												}
											}
										}
									}
								}}
							>
								<TagBadge
									badgeContent={<LocalOfferIcon sx={{ fontSize: '0.65rem' }} />}
									anchorOrigin={{
										vertical: 'bottom',
										horizontal: 'left',
										marginLeft: '30px'
									}}
									color="warning"
									overlap="circular"
								/>
							</Tooltip>
						)}
					</>
				</AvatarContainer>

				<ListItemText
					disableTypography
					primary={
						<ContactName>
							<div>
								{ticket.whatsappId && (
									<Typography
										component="span"
										variant="body2"
										color="textSecondary"
										sx={{
											position: "absolute",
											right: 6,
											top: 4,
											height: 12,
											fontSize: '0.65rem',
											whiteSpace: "nowrap",
											overflow: "hidden",
										}}
									>
										{isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
											<>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
										) : (
											<>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
										)}
									</Typography>
								)}
							</div>
							{ticket.contact.telegramId && (
								<Tooltip title="Telegram" arrow placement="right" >
									<Telegram sx={{ fontSize: '0.9rem', color: theme.palette.mode === 'dark' ? theme.palette.info.light : "#85b2ff", marginRight: theme.spacing(0.5) }} />
								</Tooltip>
							)}
							{ticket.contact.messengerId && (
								<Tooltip title="Facebook" arrow placement="right" >
									<Facebook sx={{ fontSize: '0.9rem', color: theme.palette.mode === 'dark' ? theme.palette.primary.light : "#3b5998", marginRight: theme.spacing(0.5) }} />
								</Tooltip>
							)}
							{ticket.contact.instagramId && (
								<Tooltip title="Instagram" arrow placement="right" >
									<Instagram sx={{ fontSize: '0.9rem', color: theme.palette.mode === 'dark' ? theme.palette.secondary.light : "#cd486b", marginRight: theme.spacing(0.5) }} />
								</Tooltip>
							)}
							{ticket.contact.webchatId && (
								<Tooltip title="Webchat" arrow placement="right" >
									<Sms sx={{ fontSize: '0.9rem', color: theme.palette.mode === 'dark' ? theme.palette.warning.light : "#EB6D58", marginRight: theme.spacing(0.5) }} />
								</Tooltip>
							)}
							{ticket.contact.number && (
								<Tooltip title="wwebjs" arrow placement="right" >
									<WhatsApp sx={{ fontSize: '0.9rem', color: theme.palette.mode === 'dark' ? theme.palette.success.light : "#075e54", marginRight: theme.spacing(0.5) }} />
								</Tooltip>
							)}
							<Typography
								noWrap
								component="span"
								variant="body2"
								color="textPrimary"
								sx={{ fontSize: '0.8rem', fontWeight: 500 }}
							>
								{ticket.contact.name}
							</Typography>
							{ticket.status === "closed" && (
								<ClosedBadge
									overlap="rectangular"
									badgeContent={"closed"}
									color="primary"
									max={999999}
								/>
							)}
						</ContactName>
					}
					secondary={
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
							<CustomTooltip
								title={
									<Typography>
										<WhatsMarked sx={{ wordBreak: 'break-word' }}>
											{currentTicket.lastMessage
												? currentTicket.lastMessage.replace("🢇", "").replace("🢅", "")
												: ""}
										</WhatsMarked>
									</Typography>
								}
								arrow
							>
								<Typography
									sx={{ paddingRight: 12, fontSize: '0.75rem' }}
									noWrap
									component="span"
									variant="body2"
									color="textSecondary"
								>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
										{(() => {
											if (currentTicket.lastMessage) {
												if (currentTicket.lastMessage.includes("🢅") === true) {
													return (
														<img src={sendIcon} alt="Msg Enviada" width="9px" style={{ flexShrink: 0 }} />
													)
												} else if (currentTicket.lastMessage.includes("🢇") === true) {
													return (
														<img src={receiveIcon} alt="Msg Recebida" width="9px" style={{ flexShrink: 0 }} />
													)
												}
											}
											return null;
										})()}
										{currentTicket.lastMessage && (
											<WhatsMarked sx={{ wordBreak: 'break-word', display: 'inline', fontSize: '0.75rem' }}>
												{currentTicket.lastMessage.slice(0, 40).replace("🢇", "").replace("🢅", "") + 
												(currentTicket.lastMessage.length > 40 ? "..." : "").replace("🢇", "").replace("🢅", "")}
											</WhatsMarked>
										)}
									</Box>
								</Typography>
							</CustomTooltip>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
								{ticket.whatsappId && (
									<Tooltip title={t("ticketsList.items.connection")} placement="bottom" arrow>
										<ChipRadiusDot
											sx={{
												backgroundColor: ticket.whatsapp?.color || theme.palette.grey[300],
												fontSize: "0.6em",
												fontWeight: "bold",
												height: 12,
												padding: "2px 0px",
												position: "inherit",
												borderRadius: theme.shape.borderRadius,
												color: theme.palette.getContrastText(ticket.whatsapp?.color || theme.palette.grey[300]),
												marginRight: "3px",
												boxShadow: 'none'
											}}
											label={(ticket.whatsapp?.name || t("ticketsList.items.user")).toUpperCase()}
										/>
									</Tooltip>
								)}
								{ticket.status !== "pending" && ticket?.user?.name && (
									<Tooltip title={t("ticketsList.items.user")} placement="bottom" arrow>
										<ChipRadiusDot
											sx={{
												background: theme.palette.mode === 'dark' 
													? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
													: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
												fontSize: "0.6em",
												fontWeight: "bold",
												height: 12,
												padding: "2px 0px",
												position: "inherit",
												borderRadius: theme.shape.borderRadius,
												color: theme.palette.common.white,
												marginRight: "3px",
												boxShadow: 'none'
											}}
											label={ticket?.user?.name.toUpperCase()}
										/>
									</Tooltip>
								)}
							</Box>
						</Box>
					}
				/>
				<ButtonContainer>
					{(ticket.status === "pending" && (ticket.queue === null || ticket.queue === undefined)) && (
						<Tooltip title={t("ticketsList.items.accept")} placement="bottom" arrow>
							<BottomButton
								color="primary"
								onClick={e => handleOpenAcceptTicketWithouSelectQueue()}
								loading={loading ? "true" : undefined}
							>
								<Done />
							</BottomButton>
						</Tooltip>
					)}

					{ticket.status === "pending" && ticket.queue !== null && (
						<Tooltip title={t("ticketsList.items.accept")} placement="bottom" arrow>
							<BottomButton
								color="primary"
								onClick={e => handleAcceptTicket(ticket.id)} >
								<Done />
							</BottomButton>
						</Tooltip>
					)}

					{canSpy("listItemSpy") && ticket.status === "pending" && (
						<Tooltip title={t("ticketsList.items.spy")} placement="bottom" arrow>
							<BottomButton
								color="primary"
								onClick={e => handleViewTicket(ticket.id)} >
								<Visibility />
							</BottomButton>
						</Tooltip>
					)}

					{ticket.status === "pending" && (
						<Tooltip title={t("ticketsList.items.close")} placement="bottom" arrow>
							<BottomButton
								color="primary"
								onClick={handleOpenConfirmationModal} >
								<ClearOutlined />
							</BottomButton>
						</Tooltip>
					)} 

					{canTabsSettings("tabsPending") && ticket.status === "open" && (
						<Tooltip title={t("ticketsList.items.return")} placement="bottom" arrow>
							<BottomButton
								color="primary"
								onClick={e => handleMoveTicket(ticket.id)} >
								<Replay />
							</BottomButton>
						</Tooltip>
					)}

					{ticket.status === "open" && (
						<Tooltip title={t("ticketsList.items.close")} placement="bottom" arrow>
							<BottomButton
								color="primary"
								onClick={handleOpenConfirmationModal} >
								<ClearOutlined />
							</BottomButton>
						</Tooltip>
					)}

					{ticket.status === "closed" && (
						<BottomButton
							color="primary"
							onClick={e => handleReopenTicket(ticket.id)} >
							<Replay />
						</BottomButton>
					)}
				</ButtonContainer>
			</StyledListItem>
			<ConfirmationModal
				title={t("tickets.confirmationModal.closeTicket.title")}
				open={confirmationOpen}
				onClose={() => setConfirmationOpen(false)}
				onConfirm={handleConfirmClose}
			>
				{t("tickets.confirmationModal.closeTicket.message")}
			</ConfirmationModal>
		</React.Fragment>
	);
};

export default TicketListItem;