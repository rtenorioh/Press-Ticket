// frontend/src/pages/Dashboard/index.js

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { useContext } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import Chart from "./Chart";
import TagCloud from "./TagCloud";

const useStyles = makeStyles(theme => ({
	container: {
		paddingTop: theme.spacing(4),
		paddingBottom: theme.spacing(4),
	},
	fixedHeightPaper: {
		padding: theme.spacing(2),
		display: "flex",
		overflow: "auto",
		flexDirection: "column",
		height: 240,
		borderRadius: "12px",
		backgroundColor: "#f9fafc",
	},
	customFixedHeightPaper: {
		padding: theme.spacing(2),
		display: "flex",
		overflow: "none",
		flexDirection: "column",
		height: 120,
		borderRadius: "12px",
		backgroundColor: "#f9fafc",
		boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
	},
	customFixedHeightPaperLg: {
		padding: theme.spacing(2),
		display: "flex",
		overflow: "auto",
		flexDirection: "column",
		height: "100%",
		borderRadius: "12px",
		backgroundColor: "#f9fafc",
	},
}));

const Dashboard = () => {
	const classes = useStyles();
	const { user } = useContext(AuthContext);
	var userQueueIds = [];

	if (user.queues && user.queues.length > 0) {
		userQueueIds = user.queues.map(q => q.id);
	}

	const GetTickets = (status, showAll, withUnreadMessages) => {
		const { count } = useTickets({
			status: status,
			showAll: showAll,
			withUnreadMessages: withUnreadMessages,
			queueIds: JSON.stringify(userQueueIds)
		});
		return count;
	};

	return (
		<div>
			<Container maxWidth="lg" className={classes.container}>
				<Grid container spacing={3}>
					<Grid item xs={12} sm={6} md={4}>
						<Paper className={classes.customFixedHeightPaper}>
							<Typography component="h3" variant="h6" color="primary" paragraph>
								{i18n.t("dashboard.messages.inAttendance.title")}
							</Typography>
							<Grid item>
								<Typography component="h1" variant="h4">
									{GetTickets("open", "true", "false")}
								</Typography>
							</Grid>
						</Paper>
					</Grid>
					<Grid item xs={12} sm={6} md={4}>
						<Paper className={classes.customFixedHeightPaper}>
							<Typography component="h3" variant="h6" color="primary" paragraph>
								{i18n.t("dashboard.messages.waiting.title")}
							</Typography>
							<Grid item>
								<Typography component="h1" variant="h4">
									{GetTickets("pending", "true", "false")}
								</Typography>
							</Grid>
						</Paper>
					</Grid>
					<Grid item xs={12} sm={6} md={4}>
						<Paper className={classes.customFixedHeightPaper}>
							<Typography component="h3" variant="h6" color="primary" paragraph>
								{i18n.t("dashboard.messages.closed.title")}
							</Typography>
							<Grid item>
								<Typography component="h1" variant="h4">
									{GetTickets("closed", "true", "false")}
								</Typography>
							</Grid>
						</Paper>
					</Grid>
					<Grid item xs={12}>
						<Paper className={classes.fixedHeightPaper}>
							<Chart />
						</Paper>
					</Grid>
					<Grid item xs={12}>
						<Paper className={classes.fixedHeightPaper}>
							<TagCloud />
						</Paper>
					</Grid>
				</Grid>
			</Container>
		</div>
	);
};

export default Dashboard;