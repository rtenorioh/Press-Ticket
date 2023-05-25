import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';
import { i18n } from "../../translate/i18n";
import DoneIcon from '@material-ui/icons/Done';
import ReplayIcon from '@material-ui/icons/Replay';
import { IconButton } from "@material-ui/core";
import api from "../../services/api";
import CancelIcon from '@material-ui/icons/Cancel';
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import AcceptTicketWithouSelectQueue from "../AcceptTicketWithoutQueueModal";
import { system } from "../../config.json";
import { Can } from "../../components/Can";
import receiveIcon from "../../assets/receive.png";
import sendIcon from "../../assets/send.png";

const useStyles = makeStyles(theme => ({
	ticket: {
		position: "relative",
		display: "flex",
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
		marginRight: -60,
	},

	closedBadge: {
		alignSelf: "center",
		justifySelf: "flex-end",
		marginRight: 32,
		marginLeft: "auto",
	},

	contactLastMessage: {
		flexWrap: "wrap",
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
		width: "5px",
		height: "100%",
		position: "absolute",
		top: "0%",
		left: "0%",
	}, Tag: {
		position: "absolute",
		marginRight: 5,
		right: 20,
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
			borderRadius: 6,
			position: "inherit",
			height: 14,
			margin: 4,
			padding: 3,
			whiteSpace: "nowrap",
		},
		"& .MuiBadge-anchorOriginTopRightRectangle": {
			transform: "scale(1) translate(0%, -40%)",
		},

	}
}));

const TicketListItem = ({ ticket }) => {
	const classes = useStyles();
	const history = useHistory();
	const [loading, setLoading] = useState(false);
	const { ticketId } = useParams();
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);
	const [acceptTicketWithouSelectQueueOpen, setAcceptTicketWithouSelectQueueOpen] = useState(false);
	const [tag, setTag] = useState([]);

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
	}, [ticketId, user, history]);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const ContactTag = ({ tag }) => {

		return (
			<span className={classes.Radiusdot}>
				<Badge
					style={{
						backgroundColor: tag.color,
						height: 20,
						padding: 3,
						marginRight: 3,
						marginTop: "2px",
						position: "inherit",
						borderRadius: 4,
						border: "2px solid #CCC",
						color: "white"
					}}
					badgeContent={tag.name} />
			</span>
		)
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
	}; const queueName = selectedTicket => {
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

	// Nome do atendente
	const [uName, setUserName] = useState(null);

	if (ticket.status === "pending" || ticket.status === "closed") {

	} else {

		const fetchUserName = async () => {
			try {
				const { data } = await api.get("/users/" + ticket.userId, {
				});
				setUserName(data['name']);
			} catch (err) {
				// toastError(err);
			}
		};
		fetchUserName();
	};

	const viewConection = user.viewConection === 'enabled';
	const viewSector = user.viewSector === 'enabled';
	const viewName = user.viewName === 'enabled';
	const viewTags = user.viewTags === 'enabled';

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
					// if (ticket.status === "pending") return;
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
					title={ticket.queue?.name || queueName(ticket)?.name || i18n.t("ticketsList.items.queueless")}
				>
					<span
						style={{ backgroundColor: ticket.queue?.color || queueName(ticket)?.color || "#7C7C7C" }}
						className={classes.ticketQueueColor}
					></span>
				</Tooltip>
				<ListItemAvatar>
					<Avatar style={{
						height: 75,
						width: 75,
						borderRadius: 4,
						marginLeft: -5,
						marginRight: 5
					}}
						src={ticket?.contact?.profilePicUrl} />
				</ListItemAvatar>
				<ListItemText
					disableTypography
					primary={
						<span className={classes.contactNameWrapper}>
							<Typography
								noWrap
								component="span"
								variant="body2"
								color="textSecondary"
								style={{
									fontWeight: "bold",
								}}
							>
								{ticket.contact.name}
							</Typography>
							{ticket.lastMessage && (
								<Typography
									className={classes.lastMessageTime}
									component="span"
									variant="body2"
									color="textSecondary"
								>
									{isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
										<>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
									) : (
										<>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
									)}
								</Typography>
							)}
						</span>
					}
					secondary={
						<>	<span className={classes.contactNameWrapper}>
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
									<MarkdownWrapper>{ticket.lastMessage
										.replace("🢇", "")
										.replace("🢅", "")}</MarkdownWrapper>
								) : (
									<p></p>	// <MarkdownWrapper>{ticket.lastMessage.slice(0, 20) + (ticket.lastMessage.length > 20 ? " ..." : "")}</MarkdownWrapper>
								)}
							</Typography>

							<Badge
								className={classes.newMessagesCount}
								badgeContent={ticket.unreadMessages}
								overlap="rectangular"
								classes={{
									badge: classes.badgeStyle,
								}} />
						</span>
							<span className={classes.Radiusdot}>
								{viewConection ? (
									<>
										{ticket.whatsappId && (
											<Tooltip title={i18n.t("messageVariablesPicker.vars.connection")}>
												<Badge
													className={classes.Radiusdot}
													style={{
														backgroundColor: system.color.lightTheme.palette.primary,
														height: 20,
														padding: 3,
														marginRight: 5,
														position: "inherit",
														borderRadius: 4,
														border: "2px solid #CCC",
														color: "white"

													}}
													badgeContent={ticket.whatsapp?.name || i18n.t("userModal.form.user")}

												/>

											</Tooltip>
										)}
									</>
								) : null}

								{viewSector ? (
									<>
										{
											ticket.queueId && (
												<Tooltip title={i18n.t("messageVariablesPicker.vars.queue")}>
													<Badge
														className={classes.Radiusdot}
														style={{
															backgroundColor: ticket.queue?.color || "#7C7C7C",
															height: 20,
															padding: 3,
															marginRight: 3,
															marginTop: "2px",
															position: "inherit",
															borderRadius: 4,
															border: "2px solid #CCC",
															color: "white"

														}}
														badgeContent={ticket.queue?.name || "No sector"}
													/>
												</Tooltip>
											)
										}
									</>

								) : null}

								{viewName ? (
									<Can
										role={user.profile}
										perform="drawer-admin-items:view"
										yes={() => (
											<>
												{uName && uName !== "" && (
													<Tooltip title={i18n.t("messageVariablesPicker.vars.user")}>
														<Badge
															className={classes.Radiusdot}
															style={{
																backgroundColor: "#000",
																height: 20,
																padding: 3,
																marginRight: 5,
																position: "inherit",
																borderRadius: 4,
																border: "2px solid #CCC",
																color: "white",
															}}
															badgeContent={uName}
														/>
													</Tooltip>
												)}
											</>
										)}
									/>

								) : null}


							</span>

							<br></br>
							{viewTags ? (
								<span>
									<Tooltip title={"Tags"}>
										<span className={classes.Radiusdot}>
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
							) : null}
						</>
					}
				/>
				{(ticket.status === "pending" && (ticket.queue === null || ticket.queue === undefined)) && (
					<Tooltip title={i18n.t("ticketsList.items.accept")}>
						<IconButton
							className={classes.bottomButton}
							color="primary"
							onClick={e => handleOpenAcceptTicketWithouSelectQueue()}
							loading={loading}>
							<DoneIcon />
						</IconButton>
					</Tooltip>
				)}
				{ticket.status === "pending" && ticket.queue !== null && (
					<Tooltip title={i18n.t("ticketsList.items.accept")}>
						<IconButton
							className={classes.bottomButton}
							color="primary"
							onClick={e => handleAcepptTicket(ticket.id)} >
							<DoneIcon />
						</IconButton>
					</Tooltip>
				)}
				{/* {ticket.status === "pending" && (
					<Tooltip title={i18n.t("ticketsList.items.spy")}>
						<IconButton
							className={classes.bottomButton}
							color="primary"
							onClick={e => handleViewTicket(ticket.id)} >
							<VisibilityIcon />
						</IconButton>
					</Tooltip>
				)} */}
				{/* {ticket.status === "pending" && (
					<Tooltip title={i18n.t("ticketsList.items.close")}>
						<IconButton
							className={classes.bottomButton}
							color="primary"
							onClick={e => handleClosedTicket(ticket.id)} >
							<CancelIcon />
						</IconButton>
					</Tooltip>
				)} */}
				{ticket.status === "open" && (
					<Tooltip title={i18n.t("ticketsList.items.return")}>
						<IconButton
							className={classes.bottomButton}
							color="primary"
							onClick={e => handleViewTicket(ticket.id)} >
							<UndoRoundedIcon />
						</IconButton>
					</Tooltip>
				)}
				{ticket.status === "open" && (
					<Tooltip title={i18n.t("ticketsList.items.close")}>
						<IconButton
							className={classes.bottomButton}
							color="primary"
							onClick={e => handleClosedTicket(ticket.id)} >
							<CancelIcon />
						</IconButton>
					</Tooltip>
				)}
				{ticket.status === "closed" && (
					<IconButton
						className={classes.bottomButton}
						color="primary"
						onClick={e => handleReopenTicket(ticket.id)} >
						<UndoRoundedIcon />
					</IconButton>
				)}
			</ListItem>
			<Divider variant="middle" component="li" />
		</React.Fragment>
	);
};

export default TicketListItem;