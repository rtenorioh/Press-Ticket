import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import AssignmentIcon from "@material-ui/icons/Assignment";
import ChatIcon from "@material-ui/icons/Chat";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import PeopleIcon from "@material-ui/icons/People";
import SendIcon from "@material-ui/icons/Send";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Can } from "../../components/Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import useMessages from "../../hooks/useMessages";
import useTickets from "../../hooks/useTickets";
import useUsers from "../../hooks/useUsers";
import Chart from "./Chart";
import ChartMessages from "./ChartMessages";
import ChartPerConnection from "./ChartPerConnection";
import ChartPerUser from "./ChartPerUser";
import ChartPerQueue from "./ChatsPerQueue";
import ContactsWithTicketsChart from "./ContactsWithTicketsChart";
import NewContactsChart from "./NewContactsChart";
import TagCloud from "./TagCloud";

const useStyles = makeStyles(theme => ({
	container: {
		paddingTop: theme.spacing(4),
		paddingBottom: theme.spacing(4),
	},
	fixedHeightPaperCard: {
		padding: theme.spacing(1),
		backgroundColor: theme.palette.background.paper,
		display: "flex",
		overflow: "auto",
		flexDirection: "column",
		height: 120,
		alignItems: "center",
		justifyContent: "center",
	},
	fixedHeightPaper: {
		padding: theme.spacing(2),
		backgroundColor: theme.palette.background.paper,
		display: "flex",
		overflow: "auto",
		flexDirection: "column",
		height: 240,
	},
	customFixedHeightPaper: {
		padding: theme.spacing(2),
		display: "flex",
		overflow: "none",
		flexDirection: "column",
		height: 120,
	},
	largeHeightPaper: {
		padding: theme.spacing(2),
		display: "flex",
		overflow: "auto",
		flexDirection: "column",
		height: 400,
	},
	icon: {
		fontSize: 32,
		color: theme.palette.primary.main,
	},
	cardText: {
		fontSize: "1.2rem",
		marginLeft: theme.spacing(1),
	},
	arrowIcon: {
		marginLeft: theme.spacing(0.5),
		fontSize: "1rem",
	},
	cardTitle: {
		fontSize: "0.9rem",
		color: theme.palette.primary.dark,
		marginTop: theme.spacing(1),
	},
}));

const Dashboard = () => {
	const classes = useStyles();
	const { t } = useTranslation();
	const { user } = useContext(AuthContext);
	const { count: usersCount, online: onlineUsers } = useUsers();
	const { sent: sentMessages, received: receivedMessages } = useMessages();
	const userQueueIds = user.queues.map(q => q.id) || [];
	const isAdmin = user.profile === 'admin';

	const [previousCounts, setPreviousCounts] = useState({
		inAttendance: 0,
		waiting: 0,
		closed: 0,
		users: 0,
	});

	const ticketsInAttendance = useTickets({
		status: "open",
		withUnreadMessages: "false",
		queueIds: JSON.stringify(userQueueIds),
		all: "false"
	});

	const ticketsWaiting = useTickets({
		status: "pending",
		withUnreadMessages: "false",
		queueIds: JSON.stringify(userQueueIds),
		all: "false"
	});

	const ticketsClosed = useTickets({
		status: "closed",
		withUnreadMessages: "false",
		queueIds: JSON.stringify(userQueueIds),
		all: "false"
	});

	useEffect(() => {
		if (
			ticketsInAttendance.count !== previousCounts.inAttendance ||
			ticketsWaiting.count !== previousCounts.waiting ||
			ticketsClosed.count !== previousCounts.closed ||
			usersCount !== previousCounts.users
		) {
			setPreviousCounts({
				inAttendance: ticketsInAttendance.count,
				waiting: ticketsWaiting.count,
				closed: ticketsClosed.count,
				users: usersCount,
			});
		}
	}, [
		ticketsInAttendance.count,
		ticketsWaiting.count,
		ticketsClosed.count,
		usersCount,
		previousCounts,
	]);

	const renderChangeIcon = (current, previous) => {
		if (current > previous) {
			return (
				<ArrowUpwardIcon
					className={classes.arrowIcon}
					style={{ color: "green" }}
				/>
			);
		} else if (current < previous) {
			return (
				<ArrowDownwardIcon
					className={classes.arrowIcon}
					style={{ color: "red" }}
				/>
			);
		}

		if (current !== previous) {
			console.log("Nenhuma mudança significativa");
		}

		return null;
	};

	return (
		<Container maxWidth="lg" className={classes.container}>
			<Grid container spacing={3}>
				<Grid item xs={4}>
					<Paper className={classes.fixedHeightPaperCard}>
						<div className={classes.cardContent}>
							<AssignmentIcon className={classes.icon} />
							<Typography
								component="h1"
								variant="h5"
								className={classes.cardText}
							>
								{ticketsInAttendance.count}
								{renderChangeIcon(
									ticketsInAttendance.count,
									previousCounts.inAttendance
								)}
							</Typography>
						</div>
						<Typography component="h3" className={classes.cardTitle}>
							{t("dashboard.messages.inAttendance.title")}
						</Typography>
					</Paper>
				</Grid>

				<Grid item xs={4}>
					<Paper className={classes.fixedHeightPaperCard}>
						<div className={classes.cardContent}>
							<HourglassEmptyIcon className={classes.icon} />
							<Typography
								component="h1"
								variant="h5"
								className={classes.cardText}
							>
								{ticketsWaiting.count}
								{renderChangeIcon(
									ticketsWaiting.count,
									previousCounts.waiting
								)}
							</Typography>
						</div>
						<Typography component="h3" className={classes.cardTitle}>
							{t("dashboard.messages.waiting.title")}
						</Typography>
					</Paper>
				</Grid>

				<Grid item xs={4}>
					<Paper className={classes.fixedHeightPaperCard}>
						<div className={classes.cardContent}>
							<CheckCircleIcon className={classes.icon} />
							<Typography
								component="h1"
								variant="h5"
								className={classes.cardText}
							>
								{ticketsClosed.count}
								{renderChangeIcon(
									ticketsClosed.count,
									previousCounts.closed
								)}
							</Typography>
						</div>
						<Typography component="h3" className={classes.cardTitle}>
							{t("dashboard.messages.closed.title")}
						</Typography>
					</Paper>
				</Grid>
			</Grid>

			<Grid container spacing={3}>
				<Grid item xs={4}>
					<Paper className={classes.fixedHeightPaperCard}>
						<div className={classes.cardContent}>
							<PeopleIcon className={classes.icon} />
							<Typography component="h1" variant="h5" className={classes.cardText}>
								{onlineUsers}/{usersCount}
								{renderChangeIcon(usersCount, previousCounts.users)}
							</Typography>
						</div>
						<Typography component="h3" className={classes.cardTitle}>
							{t("dashboard.users.title")}
						</Typography>
					</Paper>
				</Grid>

				<Grid item xs={4}>
					<Paper className={classes.fixedHeightPaperCard}>
						<div className={classes.cardContent}>
							<SendIcon className={classes.icon} />
							<Typography component="h1" variant="h5" className={classes.cardText}>
								{sentMessages}
							</Typography>
						</div>
						<Typography component="h3" className={classes.cardTitle}>
							{isAdmin ? (
								t("dashboard.messages.sent.titleAdmin")
							) : (
								t("dashboard.messages.sent.title")
							)}
						</Typography>
					</Paper>
				</Grid>

				<Grid item xs={4}>
					<Paper className={classes.fixedHeightPaperCard}>
						<div className={classes.cardContent}>
							<ChatIcon className={classes.icon} />
							<Typography component="h1" variant="h5" className={classes.cardText}>
								{receivedMessages}
							</Typography>
						</div>
						<Typography component="h3" className={classes.cardTitle}>
							{isAdmin ? (
								t("dashboard.messages.received.titleAdmin")
							) : (
								t("dashboard.messages.received.title")
							)}
						</Typography>
					</Paper>
				</Grid>
			</Grid>

			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Paper className={classes.fixedHeightPaper} style={{ height: 300 }}>
						<Chart tickets={ticketsInAttendance.tickets} />
					</Paper>
				</Grid>
			</Grid>

			<Grid container spacing={2}>
				<Grid item xs={6}>
					<Paper className={classes.largeHeightPaper}>
						<ChartPerQueue
							queueIds={userQueueIds}
							withUnreadMessages={false}
						/>
					</Paper>
				</Grid>

				<Grid item xs={6}>
					<Paper className={classes.largeHeightPaper}>
						<ChartPerConnection ticketsByConnection={ticketsInAttendance.tickets} />
					</Paper>
				</Grid>
			</Grid>
			<Can
				role={user.profile}
				perform="dashboard-admin-items:view"
				yes={() => (
					<>
						<Grid container spacing={2}>
							<Grid item xs={12} md={12}>
								<Paper className={classes.fixedHeightPaper} style={{ height: 450 }}>
									<ChartMessages />
								</Paper>
							</Grid>
						</Grid>

						<Grid container spacing={3}>
							<Grid item xs={12}>
								<Paper className={classes.fixedHeightPaper} style={{ height: 300 }}>
									<ChartPerUser ticketsByUser={ticketsInAttendance.tickets} />
								</Paper>
							</Grid>
						</Grid>
						<Grid container spacing={3}>
							<Grid item xs={12} sm={6}>
								<Paper className={classes.fixedHeightPaper}>
									<NewContactsChart />
								</Paper>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Paper className={classes.fixedHeightPaper}>
									<ContactsWithTicketsChart />
								</Paper>
							</Grid>
						</Grid>
					</>
				)}
			/>
			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Paper className={classes.fixedHeightPaper}>
						<TagCloud />
					</Paper>
				</Grid>
			</Grid>
		</Container>
	);
};

export default Dashboard;