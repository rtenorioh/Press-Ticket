import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
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
import ContactTag from "../ContactTag";
import MarkdownWrapper from "../MarkdownWrapper";

const StyledListItem = styled(ListItem)(({ theme }) => ({
	position: "relative",
	cursor: "pointer",
	borderLeft: '5px solid transparent',
	'&.Mui-selected': {
		borderLeft: '5px solid #2196f3',
		backgroundColor: 'rgba(0, 0, 0, 0.04)'
	},
	'&:hover': {
		backgroundColor: 'rgba(0, 0, 0, 0.04)'
	}
  }));

const AvatarContainer = styled(ListItemAvatar)(({ theme }) => ({
	position: "relative",
}));

const TicketAvatar = styled(Avatar)(({ theme }) => ({
	width: "50px",
	height: "50px",
	borderRadius: "25%"
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
	color: "white",
	position: "absolute",
	top: "50px",
	right: "51px",
	transform: "translate(0, 0)",
	'& .MuiBadge-badge': {
		fontSize: '0.75rem',
		fontWeight: 'bold',
		minWidth: '20px',
		height: '20px',
		borderRadius: '10px',
		backgroundColor: "#4CAF50",
	}
  }));

const GroupBadge = styled(Badge)(({ theme }) => ({
	backgroundColor: "#5D5699",
	color: "white",
	position: "absolute",
	top: 0,
	left: 8,
	transform: "translate(0, 0)",
	'& .MuiBadge-badge': {
		backgroundColor: '#7e57c2',
		minWidth: '20px',
		height: '20px',
		borderRadius: '10px',
	}
}));

const ClosedBadge = styled(Badge)(({ theme }) => ({
	alignSelf: "center",
	justifySelf: "flex-end",
	marginRight: 70,
	marginLeft: "auto",
}));

const BottomButton = styled(IconButton)(({ theme }) => ({
	position: "relative",
	bottom: -25,
	padding: 5
}));

const ButtonContainer = styled('div')(({ theme }) => ({
	// position: "absolute",
	display: "flex",
	justifyContent: "flex-end",
	alignItems: "center",
}));

const TicketQueueColor = styled('span')(({ theme, color }) => ({
	flex: "none",
	width: "8px",
	height: "100%",
	position: "absolute",
	top: 0,
	left: 0,
}));

const ChipRadiusDot = styled(Chip)(({ theme }) => ({
	"& .MuiBadge-badge": {
		borderRadius: 2,
		position: "inherit",
		height: 10,
		margin: 2,
		padding: 3
	},
	"& .MuiBadge-anchorOriginTopRightRectangle": {
		transform: "scale(1) translate(0%, -40%)",
	},
}));

const SecondaryContentSecond = styled('span')(({ theme }) => ({
	display: 'flex',
	marginTop: 2,
	alignItems: "flex-start",
	flexWrap: "wrap",
	flexDirection: "row",
	alignContent: "flex-start",
}));

const ContactName = styled('span')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
}));

const CustomTooltip = styled(Tooltip)(({ theme }) => ({
	maxWidth: 800,
	maxHeight: 700,
	overflow: "none",
	whiteSpace: "pre-wrap",
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
	const defaultImage = '/default-profile.png';

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
						toastError(err);
					}
				}
			};
			fetchTicket();
		}, 500);

		return () => {
			isMounted.current = false;
		};
	}, [ticket.id, user, navigate]);

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
	};

	if (!filterTicketByTags()) {
		return null;
	}

	const handleAcepptTicket = async id => {
		setLoading(true);
		try {
			await api.put(`/tickets/${id}`, {
				status: "open",
				userId: user?.id,
			});
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
		user.queues.forEach(userQueue => {
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
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
		if (isMounted.current) {
			setLoading(false);
		}
		navigate(`/tickets/${id}`);
	};

	const handleViewTicket = async (id) => {
		setLoading(true);
		try {
			await api.put(`/tickets/${id}`, {
				status: "pending",
			});
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
		if (isMounted.current) {
			setLoading(false);
		}
		navigate(`/tickets/${id}`);
	};

	const handleClosedTicket = async id => {
		setLoading(true);
		try {
			await api.put(`/tickets/${id}`, {
				status: "closed",
				userId: user?.id,
			});
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
		if (isMounted.current) {
			setLoading(false);
		}
		navigate(`/tickets/${id}`);
	};

	const handleSelectTicket = id => {
		navigate(`/tickets/${id}`);
	};

	const handleOpenConfirmationModal = () => {
		setConfirmationOpen(true);
	};

	const handleConfirmClose = () => {
		handleClosedTicket(ticket.id);
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
											right: 15,
											top: 13,
											height: 16,
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
									<Telegram fontSize="small" sx={{ color: "#85b2ff", marginRight: theme.spacing(1) }} />
								</Tooltip>

							)}
							{ticket.contact.messengerId && (
								<Tooltip title="Facebook" arrow placement="right" >
									<Facebook fontSize="small" sx={{ color: "#3b5998", marginRight: theme.spacing(1) }} />
								</Tooltip>

							)}
							{ticket.contact.instagramId && (
								<Tooltip title="Instagram" arrow placement="right" >
									<Instagram fontSize="small" sx={{ color: "#cd486b", marginRight: theme.spacing(1) }} />
								</Tooltip>
							)}
							{ticket.contact.webchatId && (
								<Tooltip title="Webchat" arrow placement="right" >
									<Sms fontSize="small" sx={{ color: "#EB6D58", marginRight: theme.spacing(1) }} />
								</Tooltip>
							)}
							{ticket.contact.number && (
								<Tooltip title="wwebjs" arrow placement="right" >
									<WhatsApp fontSize="small" sx={{ color: "#075e54", marginRight: theme.spacing(1) }} />
								</Tooltip>

							)}
							<Typography
								noWrap
								component="span"
								variant="body2"
								color="textPrimary"
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
						<div>
							<CustomTooltip
								title={
									<Typography>
										<MarkdownWrapper sx={{ wordBreak: 'break-word' }}>
											{ticket.lastMessage
												? ticket.lastMessage.replace("🢇", "").replace("🢅", "")
												: ""}
										</MarkdownWrapper>
									</Typography>
								}
								placement="bottom"
								arrow
							>
								<Typography
									sx={{ paddingRight: 20}}
									noWrap
									component="span"
									variant="body2"
									color="textSecondary"
								>
									{(() => {
										if (ticket.lastMessage) {
											if (ticket.lastMessage.includes("🢅") === true) {
												return (
													<img src={sendIcon} alt="Msg Enviada" width="12px" />
												)
											} else if (ticket.lastMessage.includes("🢇") === true) {

												return (
													<img src={receiveIcon} alt="Msg Recebida" width="12px" />
												)
											}
										}
									})()}
									{ticket.lastMessage ? (
											<MarkdownWrapper sx={{ wordBreak: 'break-word', display: 'inline-block', width: '100%' }}>{ticket.lastMessage.slice(0, 35).replace("🢇", "")
												.replace("🢅", "") + (ticket.lastMessage.length > 35 ? " ..." : "").replace("🢇", "")
													.replace("🢅", "")}
											</MarkdownWrapper>
									) : (
										<br />
									)}
								</Typography>
							</CustomTooltip>
							<br></br>
							{ticket.whatsappId && (
								<Tooltip title={t("ticketsList.items.connection")} placement="bottom" arrow>
									<ChipRadiusDot
										sx={{
											backgroundColor: ticket.whatsapp?.color || "#F7F7F7",
											fontSize: "0.8em",
											fontWeight: "bold",
											height: 16,
											padding: "5px 0px",
											position: "inherit",
											borderRadius: "3px",
											color: "white",
											marginRight: "5px",
											marginBottom: "3px",
										}}
										label={(ticket.whatsapp?.name || t("ticketsList.items.user")).toUpperCase()}
									/>
								</Tooltip>
							)}
							{ticket.status !== "pending" && ticket?.user?.name && (
								<Tooltip title={t("ticketsList.items.user")} placement="bottom" arrow>
									<ChipRadiusDot
										sx={{
											backgroundColor: "black",
											fontSize: "0.8em",
											fontWeight: "bold",
											height: 16,
											padding: "5px 0px",
											position: "inherit",
											borderRadius: "3px",
											color: "white",
											marginRight: "5px",
											marginBottom: "3px",
										}}
										label={ticket?.user?.name.toUpperCase()}
									/>
								</Tooltip>
							)}

							<br></br>
							<Tooltip title={t("ticketsList.items.tags")} placement="bottom" arrow>
								<SecondaryContentSecond>
									{
										tag?.map((tag) => {
											return (
												<ContactTag
													tag={tag}
													key={`ticket-contact-tag-${ticket.id}-${tag.id}`}
												/>
											);
										})
									}
								</SecondaryContentSecond>
							</Tooltip>
						</div>
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
								onClick={e => handleAcepptTicket(ticket.id)} >
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
								onClick={e => handleViewTicket(ticket.id)} >
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
			<Divider variant="inset" component="li" />
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