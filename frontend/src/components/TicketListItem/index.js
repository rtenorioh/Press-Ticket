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
import IconButton from '@material-ui/core/IconButton';
import { i18n } from "../../translate/i18n";
import DoneIcon from '@material-ui/icons/Done';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ReplayIcon from '@material-ui/icons/Replay';
import api from "../../services/api";
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import AcceptTicketWithouSelectQueue from "../AcceptTicketWithoutQueueModal";

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
		top: "12px",
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
}));

const TicketListItem = ({ ticket }) => {
	const classes = useStyles();
	const history = useHistory();
	const [loading, setLoading] = useState(false);
	const { ticketId } = useParams();
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);
	const [acceptTicketWithouSelectQueueOpen, setAcceptTicketWithouSelectQueueOpen] = useState(false);

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
					title={ticket.queue?.name || queueName(ticket)?.name || i18n.t("ticketsList.items.queueless")}
				>
					<span
						style={{ backgroundColor: ticket.queue?.color || queueName(ticket)?.color || "#7C7C7C" }}
						className={classes.ticketQueueColor}
					></span>
				</Tooltip>
				<ListItemAvatar>
					<Avatar src={ticket?.contact?.profilePicUrl} />
				</ListItemAvatar>
				<ListItemText
					disableTypography
					primary={
						<span className={classes.contactNameWrapper}>
							<Typography
								noWrap
								component="span"
								variant="body2"
								color="textPrimary"
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
							{ticket.whatsappId && (
								<div className={classes.userTag} title={i18n.t("ticketsList.connectionTitle")}>{ticket.whatsapp?.name}</div>
							)}
						</span>
					}
					secondary={
						<span className={classes.contactNameWrapper}>
							<Typography
								className={classes.contactLastMessage}
								noWrap
								component="span"
								variant="body2"
								color="textSecondary"
							>
								{ticket.lastMessage ? (
									<MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
								) : (
									<br />
								)}
							</Typography>

							<Badge
								className={classes.newMessagesCount}
								badgeContent={ticket.unreadMessages}
								classes={{
									badge: classes.badgeStyle,
								}}
							/>
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
				{ticket.status === "pending" && (
					<Tooltip title={i18n.t("ticketsList.items.spy")}>
						<IconButton
							className={classes.bottomButton}
							color="primary"
							onClick={e => handleViewTicket(ticket.id)} >
							<VisibilityIcon />
						</IconButton>
					</Tooltip>
				)}
				{ticket.status === "pending" && (
					<Tooltip title={i18n.t("ticketsList.items.close")}>
						<IconButton
							className={classes.bottomButton}
							color="primary"
							onClick={e => handleClosedTicket(ticket.id)} >
							<ClearOutlinedIcon />
						</IconButton>
					</Tooltip>
				)}
				{ticket.status === "open" && (
					<Tooltip title={i18n.t("ticketsList.items.return")}>
						<IconButton
							className={classes.bottomButton}
							color="primary"
							onClick={e => handleViewTicket(ticket.id)} >
							<ReplayIcon />
						</IconButton>
					</Tooltip>
				)}
				{ticket.status === "open" && (
					<Tooltip title={i18n.t("ticketsList.items.close")}>
						<IconButton
							className={classes.bottomButton}
							color="primary"
							onClick={e => handleClosedTicket(ticket.id)} >
							<ClearOutlinedIcon />
						</IconButton>
					</Tooltip>
				)}
				{ticket.status === "closed" && (
					<IconButton
						className={classes.bottomButton}
						color="primary"
						onClick={e => handleReopenTicket(ticket.id)} >
						<ReplayIcon />
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