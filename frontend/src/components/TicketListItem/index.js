import React, { useState, useEffect, useRef, useContext } from "react";

import {
	useHistory,
	useParams
} from "react-router-dom";

import {
	parseISO,
	format,
	isSameDay
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
	Typography,
	Tooltip
} from "@material-ui/core";

import {
	ClearOutlined,
	Done,
	Replay,
	Visibility
} from "@material-ui/icons";

import { green } from "@material-ui/core/colors";

import AcceptTicketWithouSelectQueue from "../AcceptTicketWithoutQueueModal";
import MarkdownWrapper from "../MarkdownWrapper";
import ContactTag from "../ContactTag";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import clsx from "clsx";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

import { system } from "../../config.json"


const useStyles = makeStyles(theme => ({
	ticket: {
		position: "relative",
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
	},
	badgeStyle: {
		color: "white",
		backgroundColor: green[500],
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
	}
}));

const TicketListItem = ({ ticket, userId }) => {
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

	// const userName = selectedUserName => {
	// 	let userName = null;
	// 	user.queues.forEach(userId => {
	// 		if (userId === selectedUserName.userId) {
	// 			userName = userId.name;
	// 		}
	// 	});
	// 	return {
	// 		userName
	// 	};
	// }

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
					[classes.pendingTicket]: (ticket.status === "pending"),
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
				<ListItemAvatar>
					<Avatar
						style={{
							width: "50px",
							height: "50px",
						}}
						src={ticket?.contact?.profilePicUrl} />
				</ListItemAvatar>

				<ListItemText
					disableTypography
					primary={
						<span>
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
							<Typography
								noWrap
								component="span"
								variant="body2"
								color="textPrimary"
							>
								{ticket.contact.name}
							</Typography>
							<br></br>
						</span>
					}
					secondary={
						<span>
							<Typography
								className={classes.contactLastMessage}
								noWrap
								component="span"
								variant="body2"
								color="textSecondary"
							>
								{ticket.lastMessage ? (
									<MarkdownWrapper>{ticket.lastMessage.slice(0, 20) + (ticket.lastMessage.length > 20 ? " ..." : "")}</MarkdownWrapper>
								) : (
									<br />
								)}
							</Typography>

							<Badge
								className={classes.newMessagesCount}
								badgeContent={ticket.unreadMessages}
								overlap="rectangular"
								max={9999}
								classes={{
									badge: classes.badgeStyle,
								}}
							/>

							<br></br>
							{ticket.whatsappId && (
								<Tooltip title={i18n.t("ticketsList.items.connection")}>
									<Badge
										className={classes.Radiusdot}
										// overlap="rectangular"
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
										// overlap="rectangular"
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
										// overlap="rectangular"
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
						</span>
					}
				/>

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
			</ListItem>
			<Divider variant="inset" component="li" />
		</React.Fragment>
	);
};

export default TicketListItem;