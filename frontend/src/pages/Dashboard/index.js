import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import AssignmentIcon from "@material-ui/icons/Assignment";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import Chart from "./Chart";
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
	const { user } = useContext(AuthContext);
	const userQueueIds = user.queues.map(q => q.id) || [];
	const [previousCounts, setPreviousCounts] = useState({
		inAttendance: 0,
		waiting: 0,
		closed: 0,
	});

	const ticketsInAttendance = useTickets({
		status: "open",
		showAll: "true",
		withUnreadMessages: "false",
		queueIds: JSON.stringify(userQueueIds),
	});

	const ticketsWaiting = useTickets({
		status: "pending",
		showAll: "true",
		withUnreadMessages: "false",
		queueIds: JSON.stringify(userQueueIds),
	});
	const ticketsClosed = useTickets({
		status: "closed",
		showAll: "true",
		withUnreadMessages: "false",
		queueIds: JSON.stringify(userQueueIds),
	});

	useEffect(() => {
		if (
			ticketsInAttendance.count !== previousCounts.inAttendance ||
			ticketsWaiting.count !== previousCounts.waiting ||
			ticketsClosed.count !== previousCounts.closed
		) {
			setPreviousCounts({
				inAttendance: ticketsInAttendance.count,
				waiting: ticketsWaiting.count,
				closed: ticketsClosed.count,
			});
		}
	}, [ticketsInAttendance.count, ticketsWaiting.count, ticketsClosed.count, previousCounts]);

	const renderChangeIcon = (current, previous) => {
		if (current > previous) {
			return <ArrowUpwardIcon className={classes.arrowIcon} style={{ color: "green" }} />;
		} else if (current < previous) {
			return <ArrowDownwardIcon className={classes.arrowIcon} style={{ color: "red" }} />;
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
							<Typography component="h1" variant="h5" className={classes.cardText}>
								{ticketsInAttendance.count}
								{renderChangeIcon(ticketsInAttendance.count, previousCounts.inAttendance)}
							</Typography>
						</div>
						<Typography component="h3" className={classes.cardTitle}>
							{i18n.t("dashboard.messages.inAttendance.title")}
						</Typography>
					</Paper>
				</Grid>

				<Grid item xs={4}>
					<Paper className={classes.fixedHeightPaperCard}>
						<div className={classes.cardContent}>
							<HourglassEmptyIcon className={classes.icon} />
							<Typography component="h1" variant="h5" className={classes.cardText}>
								{ticketsWaiting.count}
								{renderChangeIcon(ticketsWaiting.count, previousCounts.waiting)}
							</Typography>
						</div>
						<Typography component="h3" className={classes.cardTitle}>
							{i18n.t("dashboard.messages.waiting.title")}
						</Typography>
					</Paper>
				</Grid>

				<Grid item xs={4}>
					<Paper className={classes.fixedHeightPaperCard}>
						<div className={classes.cardContent}>
							<CheckCircleIcon className={classes.icon} />
							<Typography component="h1" variant="h5" className={classes.cardText}>
								{ticketsClosed.count}
								{renderChangeIcon(ticketsClosed.count, previousCounts.closed)}
							</Typography>
						</div>
						<Typography component="h3" className={classes.cardTitle}>
							{i18n.t("dashboard.messages.closed.title")}
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
						<ChartPerConnection ticketsByConnection={ticketsInAttendance.tickets} />
					</Paper>
				</Grid>
				<Grid item xs={6}>
					<Paper className={classes.largeHeightPaper}>
						<ChartPerQueue ticketsByQueue={ticketsInAttendance.tickets} />
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

			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Paper className={classes.fixedHeightPaper}>
						<TagCloud />
					</Paper>
				</Grid>
			</Grid>
		</Container >
	);
};

export default Dashboard;
