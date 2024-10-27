import React, { useContext, useEffect, useRef, useState } from "react";

import {
	useHistory,
	useParams
} from "react-router-dom";

import {
	format,
	isSameDay,
	parseISO
} from "date-fns";

import {
	Avatar,
	Badge,
	Divider,
	IconButton,
	ListItem,
	ListItemAvatar,
	ListItemText,
	makeStyles,
	Tooltip,
	Typography
} from "@material-ui/core";

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

import { green } from "@material-ui/core/colors";

import AcceptTicketWithouSelectQueue from "../AcceptTicketWithoutQueueModal";
import ContactTag from "../ContactTag";
import MarkdownWrapper from "../MarkdownWrapper";

import clsx from "clsx";
import receiveIcon from "../../assets/receive.png";
import sendIcon from "../../assets/send.png";
import { system } from "../../config.json";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";


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
		marginRight: 32,
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
		//marginLeft: "5px",
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

const TicketListItem = ({ ticket, userId, filteredTags }) => {
	const classes = useStyles();
	const history = useHistory();
	const [loading, setLoading] = useState(false);
	const { ticketId } = useParams();
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);
	const [acceptTicketWithouSelectQueueOpen, setAcceptTicketWithouSelectQueueOpen] = useState(false);
	const [tag, setTag] = useState([]);
	const [uName, setUserName] = useState(null);

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			const fetchTicket = async () => {
				try {
					const { data } = await api.get("/tickets/" + ticket.id);
					setTag(data?.contact?.tags);
				} catch (err) {
				}
			};
			fetchTicket();
		}, 500);
		return () => {
			if (delayDebounceFn !== null) {
				clearTimeout(delayDebounceFn);
			}
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
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
		if (isMounted.current) {
			setLoading(false);
		}
		history.push(`/tickets/${id}`);
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

	if (ticket.status === "pending") {

	} else {
		const fetchUserName = async () => {
			try {
				const { data } = await api.get("/users/" + ticket.userId, {
				});
				setUserName(data['name']);
			} catch (err) {
				toastError(err);
			}
		};
		fetchUserName();
	}

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
					title={ticket.queue?.name || (ticket)?.name || i18n.t("ticketsList.items.queueless")}
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
							{ticket.status === "closed" && (
								<Badge
									className={classes.closedBadge}
									badgeContent={"closed"}
									color="primary"
								/>
							)}
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
								<Tooltip title={i18n.t("ticketsList.items.connection")}>
									<Badge
										className={classes.Radiusdot}
										overlap="rectangular"
										style={{
											backgroundColor: system.color.lightTheme.palette.primary,
											height: 16,
											padding: "5px 5px",
											position: "inherit",
											borderRadius: "3px",
											color: "white",
											marginRight: "5px",
											marginBottom: "3px",

										}}
										badgeContent={ticket.whatsapp?.name || i18n.t("ticketsList.items.user")}

									/>

								</Tooltip>
							)}

							{ticket.queueId && (
								<Tooltip title={i18n.t("ticketsList.items.queue")}>
									<Badge
										className={classes.Radiusdot}
										overlap="rectangular"
										style={{
											backgroundColor: ticket.queue?.color || "#7C7C7C",
											height: 16,
											padding: "5px 5px",
											position: "inherit",
											borderRadius: "3px",
											color: "white",
											marginRight: "5px",
											marginBottom: "3px",

										}}
										badgeContent={ticket.queue?.name || "No sector"}
									/>
								</Tooltip>
							)}

							{uName && (
								<Tooltip title={i18n.t("ticketsList.items.user")}>
									<Badge
										className={classes.Radiusdot}
										overlap="rectangular"
										style={{
											backgroundColor: "black",
											height: 16,
											padding: "5px 5px",
											position: "inherit",
											borderRadius: "3px",
											color: "white",
											marginRight: "5px",
											marginBottom: "3px",

										}}
										badgeContent={uName}
									/>
								</Tooltip>
							)}

							<br></br>
							<Tooltip title={i18n.t("ticketsList.items.tags")}>
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
						<Tooltip title={i18n.t("ticketsList.items.accept")}>
							<IconButton
								className={classes.bottomButton}
								color="primary"
								onClick={e => handleOpenAcceptTicketWithouSelectQueue()}
								loading={loading}>
								<Done />
							</IconButton>
						</Tooltip>
					)}

					{ticket.status === "pending" && ticket.queue !== null && (
						<Tooltip title={i18n.t("ticketsList.items.accept")}>
							<IconButton
								className={classes.bottomButton}
								color="primary"
								onClick={e => handleAcepptTicket(ticket.id)} >
								<Done />
							</IconButton>
						</Tooltip>
					)}

					{ticket.status === "pending" && (
						<Tooltip title={i18n.t("ticketsList.items.spy")}>
							<IconButton
								className={classes.bottomButton}
								color="primary"
								onClick={e => handleViewTicket(ticket.id)} >
								<Visibility />
							</IconButton>
						</Tooltip>
					)}

					{ticket.status === "pending" && (
						<Tooltip title={i18n.t("ticketsList.items.close")}>
							<IconButton
								className={classes.bottomButton}
								color="primary"
								onClick={e => handleClosedTicket(ticket.id)} >
								<ClearOutlined />
							</IconButton>
						</Tooltip>
					)}

					{ticket.status === "open" && (
						<Tooltip title={i18n.t("ticketsList.items.return")}>
							<IconButton
								className={classes.bottomButton}
								color="primary"
								onClick={e => handleViewTicket(ticket.id)} >
								<Replay />
							</IconButton>
						</Tooltip>
					)}

					{ticket.status === "open" && (
						<Tooltip title={i18n.t("ticketsList.items.close")}>
							<IconButton
								className={classes.bottomButton}
								color="primary"
								onClick={e => handleClosedTicket(ticket.id)} >
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
		</React.Fragment>
	);
};

export default TicketListItem;