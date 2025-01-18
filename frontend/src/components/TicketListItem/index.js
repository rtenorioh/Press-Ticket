import {
	Avatar,
	Badge,
	Chip,
	Divider,
	IconButton,
	ListItem,
	ListItemAvatar,
	ListItemText,
	makeStyles,
	Tooltip,
	Typography
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import {
	ClearOutlined,
	Done,
	Facebook,
	Group,
	Instagram,
	Replay,
	Sms,
	Telegram,
	Visibility,
	WhatsApp
} from "@material-ui/icons";
import clsx from "clsx";
import {
	format,
	isSameDay,
	parseISO
} from "date-fns";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	useHistory,
	useParams
} from "react-router-dom";
import receiveIcon from "../../assets/receive.png";
import sendIcon from "../../assets/send.png";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import AcceptTicketWithouSelectQueue from "../AcceptTicketWithoutQueueModal";
import ContactTag from "../ContactTag";
import MarkdownWrapper from "../MarkdownWrapper";
import ConfirmationModal from "../ConfirmationModal";

const useStyles = makeStyles(theme => ({
	ticket: {
		position: "relative",
	},
	avatarContainer: {
		position: "relative",
	},
	avatar: {
		width: "50px",
		height: "50px",
		borderRadius: "25%"
	},
	badgeStyle: {
		color: "white",
		backgroundColor: green[500],
		position: "absolute",
		bottom: 0,
		left: 0,
		transform: "translate(-25%, -50%)",
	},
	groupBadgeStyle: {
		backgroundColor: "#5D5699",
		color: "white",
		position: "absolute",
		bottom: 0,
		left: 0,
		transform: "translate(0, -320%)",
	},
	pendingTicket: {
		cursor: "unset",
	},
	noTicketsDiv: {
		display: "flex",
		height: "100px",
		margin: 40,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	},
	noTicketsText: {
		textAlign: "center",
		color: "rgb(104, 121, 146)",
		fontSize: "14px",
		lineHeight: "1.4",
	},
	noTicketsTitle: {
		textAlign: "center",
		fontSize: "16px",
		fontWeight: "600",
		margin: "0px",
	},
	contactNameWrapper: {
		display: "flex",
		justifyContent: "space-between",
	},
	lastMessageTime: {
		justifySelf: "flex-end",
	},
	closedBadge: {
		alignSelf: "center",
		justifySelf: "flex-end",
		marginRight: 70,
		marginLeft: "auto",
	},
	contactLastMessage: {
		paddingRight: 20,
	},
	newMessagesCount: {
		alignSelf: "center",
		marginRight: 8,
		marginLeft: "auto",
	},
	bottomButton: {
		position: "relative",
		bottom: -25,
		padding: 5
	},
	buttonContainer: {
		position: "relative",
		display: "flex",
		justifyContent: "flex-end",
		alignItems: "center",
	},
	acceptButton: {
		position: "absolute",
		left: "50%",
	},
	ticketQueueColor: {
		flex: "none",
		width: "8px",
		height: "100%",
		position: "absolute",
		top: "0%",
		left: "0%",
	},
	userTag: {
		position: "absolute",
		marginRight: 5,
		right: 10,
		bottom: 30,
		backgroundColor: theme.palette.background.default,
		color: theme.palette.primary.main,
		border: "1px solid #CCC",
		padding: 1,
		paddingLeft: 5,
		paddingRight: 5,
		borderRadius: 10,
		fontSize: "0.9em"
	},
	Radiusdot: {
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
	},
	secondaryContentSecond: {
		display: 'flex',
		marginTop: 2,
		alignItems: "flex-start",
		flexWrap: "wrap",
		flexDirection: "row",
		alignContent: "flex-start",
	},
	contactIcon: {
		marginRight: theme.spacing(1),
	},
	contactName: {
		display: 'flex',
		alignItems: 'center',
	},
}));

const TicketListItem = ({ ticket, filteredTags }) => {
	const classes = useStyles();
	const { t } = useTranslation();
	const history = useHistory();
	const [loading, setLoading] = useState(false);
	const { ticketId } = useParams();
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);
	const [acceptTicketWithouSelectQueueOpen, setAcceptTicketWithouSelectQueueOpen] = useState(false);
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [tag, setTag] = useState([]);

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
	}, [ticket.id, user, history]);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
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
			history.push(`/tickets/${id}`);
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

	const handleReopenTicket = async id => {
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
		history.push(`/tickets/${id}`);
	};

	const handleViewTicket = async id => {
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
		history.push(`/tickets/${id}`);
	};

	const handleClosedTicket = async id => {
		setLoading(true);
		try {
			await api.put(`/tickets/${id}`, {
				status: "closed",
				userId: user?.id,
				queueId: null,
			});
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
		if (isMounted.current) {
			setLoading(false);
		}
		history.push(`/tickets/${id}`);
	};

	const handleSelectTicket = id => {
		history.push(`/tickets/${id}`);
	};

	const handleOpenConfirmationModal = () => {
		setConfirmationOpen(true);
	};

	const handleConfirmClose = () => {
		handleClosedTicket(ticket.id);
	};

	return (
		<React.Fragment key={ticket.id}>
			<AcceptTicketWithouSelectQueue
				modalOpen={acceptTicketWithouSelectQueueOpen}
				onClose={(e) => setAcceptTicketWithouSelectQueueOpen(false)}
				ticketId={ticket.id}
			/>
			<ListItem
				dense
				button
				onClick={e => {
					if (ticket.status === "pending") return;
					handleSelectTicket(ticket.id);
				}}
				selected={ticketId && +ticketId === ticket.id}
				className={clsx(classes.ticket, {
					[classes.pendingTicket]: ticket.status === "pending",
				})}
			>
				<Tooltip
					arrow
					placement="right"
					title={ticket.queue?.name || (ticket)?.name || t("ticketsList.items.queueless")}
				>
					<span
						style={{ backgroundColor: ticket.queue?.color || queueName(ticket)?.color || "#7C7C7C" }}
						className={classes.ticketQueueColor}
					></span>
				</Tooltip>

				<ListItemAvatar className={classes.avatarContainer}>
					<>
						<Avatar
							className={classes.avatar}
							src={ticket?.contact?.profilePicUrl}
							alt="contact_image"
						/>
						<Badge
							className={classes.badgeStyle}
							badgeContent={ticket.unreadMessages}
							overlap="rectangular"
							max={9999}
							classes={{
								badge: classes.badgeStyle,
							}}
						/>
						{ticket.isGroup && (
							<Badge
								className={classes.groupBadgeStyle}
								overlap="rectangular"
								badgeContent={<Group style={{ fontSize: '1rem' }} />}
								classes={{
									badge: classes.groupBadgeStyle,
								}}
							/>
						)}
					</>
				</ListItemAvatar>

				<ListItemText
					disableTypography
					primary={
						<span className={classes.contactName}>
							<div>
								{ticket.whatsappId && (
									<Typography
										// classNames={classes.Radiusdot}
										component="span"
										variant="body2"
										color="textSecondary"
										style={{
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
									<Telegram fontSize="small" style={{ color: "#85b2ff" }} className={classes.contactIcon} />
								</Tooltip>

							)}
							{ticket.contact.messengerId && (
								<Tooltip title="Facebook" arrow placement="right" >
									<Facebook fontSize="small" style={{ color: "#3b5998" }} className={classes.contactIcon} />
								</Tooltip>

							)}
							{ticket.contact.instagramId && (
								<Tooltip title="Instagram" arrow placement="right" >
									<Instagram fontSize="small" style={{ color: "#cd486b" }} className={classes.contactIcon} />
								</Tooltip>
							)}
							{ticket.contact.webchatId && (
								<Tooltip title="Webchat" arrow placement="right" >
									<Sms fontSize="small" style={{ color: "#EB6D58" }} className={classes.contactIcon} />
								</Tooltip>
							)}
							{ticket.contact.number && (
								<Tooltip title="wwebjs" arrow placement="right" >
									<WhatsApp fontSize="small" style={{ color: "#075e54" }} className={classes.contactIcon} />
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
								<Badge
									className={classes.closedBadge}
									overlap="rectangular"
									badgeContent={"closed"}
									color="primary"
								/>
							)}
						</span>
					}
					secondary={
						<div>
							<Typography
								className={classes.contactLastMessage}
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
									<MarkdownWrapper>{ticket.lastMessage.slice(0, 45).replace("🢇", "")
										.replace("🢅", "") + (ticket.lastMessage.length > 45 ? " ..." : "").replace("🢇", "")
											.replace("🢅", "")}</MarkdownWrapper>
								) : (
									<br />
								)}
							</Typography>

							<br></br>
							{ticket.whatsappId && (
								<Tooltip title={t("ticketsList.items.connection")}>
									<Chip
										className={classes.Radiusdot}
										style={{
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
								<Tooltip title={t("ticketsList.items.user")}>
									<Chip
										className={classes.Radiusdot}
										style={{
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
							<Tooltip title={t("ticketsList.items.tags")}>
								<span className={classes.secondaryContentSecond}>
									{
										tag?.map((tag) => {
											return (
												<ContactTag tag={tag} key={`ticket-contact-tag-${ticket.id}-${tag.id}`} />
											);
										})
									}
								</span>
							</Tooltip>
						</div>
					}
				/>
				<div className={classes.buttonContainer}>
					{(ticket.status === "pending" && (ticket.queue === null || ticket.queue === undefined)) && (
						<Tooltip title={t("ticketsList.items.accept")}>
							<IconButton
								className={classes.bottomButton}
								color="primary"
								onClick={e => handleOpenAcceptTicketWithouSelectQueue()}
								loading={loading ? "true" : undefined}
							>
								<Done />
							</IconButton>
						</Tooltip>
					)}

					{ticket.status === "pending" && ticket.queue !== null && (
						<Tooltip title={t("ticketsList.items.accept")}>
							<IconButton
								className={classes.bottomButton}
								color="primary"
								onClick={e => handleAcepptTicket(ticket.id)} >
								<Done />
							</IconButton>
						</Tooltip>
					)}

					{ticket.status === "pending" && (
						<Tooltip title={t("ticketsList.items.spy")}>
							<IconButton
								className={classes.bottomButton}
								color="primary"
								onClick={e => handleViewTicket(ticket.id)} >
								<Visibility />
							</IconButton>
						</Tooltip>
					)}

					{ticket.status === "pending" && (
						<Tooltip title={t("ticketsList.items.close")}>
							<IconButton
								className={classes.bottomButton}
								color="primary"
								onClick={handleOpenConfirmationModal} >
								<ClearOutlined />
							</IconButton>
						</Tooltip>
					)}

					{ticket.status === "open" && (
						<Tooltip title={t("ticketsList.items.return")}>
							<IconButton
								className={classes.bottomButton}
								color="primary"
								onClick={e => handleViewTicket(ticket.id)} >
								<Replay />
							</IconButton>
						</Tooltip>
					)}

					{ticket.status === "open" && (
						<Tooltip title={t("ticketsList.items.close")}>
							<IconButton
								className={classes.bottomButton}
								color="primary"
								onClick={handleOpenConfirmationModal} >
								<ClearOutlined />
							</IconButton>
						</Tooltip>
					)}

					{ticket.status === "closed" && (
						<IconButton
							className={classes.bottomButton}
							color="primary"
							onClick={e => handleReopenTicket(ticket.id)} >
							<Replay />
						</IconButton>
					)}

					{ticket.status === "closed" && (
						<IconButton
							className={classes.bottomButton}
							color="primary" >
						</IconButton>
					)}
				</div>
			</ListItem>
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