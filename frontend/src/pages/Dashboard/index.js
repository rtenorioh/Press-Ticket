import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChatIcon from "@mui/icons-material/Chat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PeopleIcon from "@mui/icons-material/People";
import SendIcon from "@mui/icons-material/Send";
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
import ClientStatusPieChart from "./ClientStatusPieChart";
import ClientStatusBarChart from "./ClientStatusBarChart";

const StyledContainer = styled(Container)(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingBottom: theme.spacing(2),
	[theme.breakpoints.down('sm')]: {
		paddingTop: theme.spacing(1),
		paddingBottom: theme.spacing(1),
		paddingLeft: theme.spacing(1),
		paddingRight: theme.spacing(1),
	},
}));

const DashboardSection = styled('div')(({ theme }) => ({
	marginBottom: theme.spacing(4),
	[theme.breakpoints.down('sm')]: {
		marginBottom: theme.spacing(2),
	},
}));

const FixedHeightPaperCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5, 2),
  background: theme.palette.mode === 'dark' 
    ? theme.palette.background.paper
    : `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.background.paper} 100%)`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 18,
  boxShadow: theme.palette.mode === 'dark'
    ? "0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 2px 8px 0 rgba(0, 0, 0, 0.3)"
    : "0 8px 32px 0 rgba(80, 80, 160, 0.12), 0 2px 8px 0 rgba(80, 80, 160, 0.08)",
  minHeight: 130,
  border: theme.palette.mode === 'dark' 
    ? `2px solid ${theme.palette.divider}` 
    : `1px solid ${theme.palette.grey[200]}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? "0 12px 40px 0 rgba(0, 0, 0, 0.6), 0 4px 12px 0 rgba(0, 0, 0, 0.4)"
      : "0 12px 40px 0 rgba(80, 80, 160, 0.16), 0 4px 12px 0 rgba(80, 80, 160, 0.12)",
  },
  [theme.breakpoints.down('sm')]: {
    minHeight: 100,
    padding: theme.spacing(1.5, 1),
  },
}));

const CardIconCircle = styled('div')(({ theme, bgcolor }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: '50%',
  background: bgcolor || theme.palette.primary.main,
  boxShadow: '0 2px 8px 0 rgba(80, 80, 160, 0.10)',
  marginBottom: theme.spacing(1),
}));

const CardText = styled(Typography)(({ theme }) => ({
	fontSize: "1.2rem",
	marginLeft: theme.spacing(1),
	[theme.breakpoints.down('sm')]: {
		fontSize: "1rem",
		marginLeft: theme.spacing(0.5),
	},
}));

const CardTitle = styled(Typography)(({ theme }) => ({
	fontSize: "0.9rem",
	color: theme.palette.primary.dark,
	marginTop: theme.spacing(1),
	[theme.breakpoints.down('sm')]: {
		fontSize: "0.8rem",
		marginTop: theme.spacing(0.5),
		textAlign: "center",
	},
}));

const CardContent = styled('div')({
	display: 'flex',
	alignItems: 'center',
});

const Dashboard = () => {
	const { t } = useTranslation();
	const { user } = useContext(AuthContext);
	const { count: usersCount, online: onlineUsers } = useUsers();
	const { sent: sentMessages, received: receivedMessages } = useMessages();
	const userQueueIds = user?.queues?.map(q => q.id) || [];
	const isAdmin = user?.profile === 'admin';

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
					sx={{ marginLeft: 0.5, fontSize: "1rem", color: "green" }}
				/>
			);
		} else if (current < previous) {
			return (
				<ArrowDownwardIcon
					sx={{ marginLeft: 0.5, fontSize: "1rem", color: "red" }}
				/>
			);
		}

		if (current !== previous) {
			console.log("Nenhuma mudança significativa");
		}

		return null;
	};

	return (
		<StyledContainer maxWidth="lg">
			<DashboardSection>
				<Grid container spacing={3}>
					<Grid item xs={12} sm={4}>
						<FixedHeightPaperCard>
							<CardContent sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
								<CardIconCircle bgcolor="#6c63ff20">
									<AssignmentIcon sx={{ fontSize: 28, color: theme => theme.palette.primary.main }} />
								</CardIconCircle>
								<CardText component="h1" variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
									{ticketsInAttendance.count}
									{renderChangeIcon(
										ticketsInAttendance.count,
										previousCounts.inAttendance
									)}
								</CardText>
							</CardContent>
							<CardTitle component="h3" sx={{ color: 'text.primary' }}>
								{t("dashboard.messages.inAttendance.title")}
							</CardTitle>
						</FixedHeightPaperCard>
					</Grid>

					<Grid item xs={12} sm={4}>
						<FixedHeightPaperCard>
							<CardContent sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
								<CardIconCircle bgcolor="#ffd60030">
									<HourglassEmptyIcon sx={{ fontSize: 28, color: theme => theme.palette.warning.main }} />
								</CardIconCircle>
								<CardText component="h1" variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
									{ticketsWaiting.count}
									{renderChangeIcon(
										ticketsWaiting.count,
										previousCounts.waiting
									)}
								</CardText>
							</CardContent>
							<CardTitle component="h3" sx={{ color: 'text.primary' }}>
								{t("dashboard.messages.waiting.title")}
							</CardTitle>
						</FixedHeightPaperCard>
					</Grid>

					<Grid item xs={12} sm={4}>
						<FixedHeightPaperCard>
							<CardContent sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
								<CardIconCircle bgcolor="#4caf5020">
									<CheckCircleIcon sx={{ fontSize: 28, color: theme => theme.palette.success.main }} />
								</CardIconCircle>
								<CardText component="h1" variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
									{ticketsClosed.count}
									{renderChangeIcon(
										ticketsClosed.count,
										previousCounts.closed
									)}
								</CardText>
							</CardContent>
							<CardTitle component="h3" sx={{ color: 'text.primary' }}>
								{t("dashboard.messages.closed.title")}
							</CardTitle>
						</FixedHeightPaperCard>
					</Grid>
				</Grid>
			</DashboardSection>
			<DashboardSection>
				<Grid container spacing={3}>
					<Grid item xs={12} sm={4}>
						<FixedHeightPaperCard>
							<CardContent sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
								<CardIconCircle bgcolor="#2196f320">
									<PeopleIcon sx={{ fontSize: 28, color: theme => theme.palette.info.main }} />
								</CardIconCircle>
								<CardText component="h1" variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
									{onlineUsers}/{usersCount}
									{renderChangeIcon(usersCount, previousCounts.users)}
								</CardText>
							</CardContent>
							<CardTitle component="h3" sx={{ color: 'text.primary' }}>
								{t("dashboard.users.title")}
							</CardTitle>
						</FixedHeightPaperCard>
					</Grid>

					<Grid item xs={12} sm={4}>
						<FixedHeightPaperCard>
							<CardContent sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
								<CardIconCircle bgcolor="#3f51b520">
									<SendIcon sx={{ fontSize: 28, color: theme => theme.palette.primary.main }} />
								</CardIconCircle>
								<CardText component="h1" variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
									{sentMessages}
								</CardText>
							</CardContent>
							<CardTitle component="h3" sx={{ color: 'text.primary' }}>
								{isAdmin ? (
									t("dashboard.messages.sent.titleAdmin")
								) : (
									t("dashboard.messages.sent.title")
								)}
							</CardTitle>
						</FixedHeightPaperCard>
					</Grid>

					<Grid item xs={12} sm={4}>
						<FixedHeightPaperCard>
							<CardContent sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
								<CardIconCircle bgcolor="#7c4dff20">
									<ChatIcon sx={{ fontSize: 28, color: theme => theme.palette.secondary.main }} />
								</CardIconCircle>
								<CardText component="h1" variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
									{receivedMessages}
								</CardText>
							</CardContent>
							<CardTitle component="h3" sx={{ color: 'text.primary' }}>
								{isAdmin ? (
									t("dashboard.messages.received.titleAdmin")
								) : (
									t("dashboard.messages.received.title")
								)}
							</CardTitle>
						</FixedHeightPaperCard>
					</Grid>
				</Grid>
			</DashboardSection>

			<DashboardSection>
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<Chart tickets={ticketsInAttendance.tickets} />
					</Grid>
				</Grid>
			</DashboardSection>

			<DashboardSection>
				
					
				<Grid container spacing={3}>
					<Grid item xs={12} sm={6}>
						<ChartPerQueue
							queueIds={userQueueIds}
							withUnreadMessages={false}
						/>
					</Grid>

					<Grid item xs={12} sm={6}>
						<ChartPerConnection ticketsByConnection={ticketsInAttendance.tickets} />
					</Grid>
				</Grid>
			</DashboardSection>

			<Can
				role={user?.profile}
				perform="dashboard-admin-items:view"
				yes={() => (
					<>
						<DashboardSection>
							<Grid container spacing={3}>
								<Grid item xs={12}>
									<ChartMessages />
								</Grid>
							</Grid>
						</DashboardSection>

						<DashboardSection>
							<Grid container spacing={3}>
								<Grid item xs={12}>
									<ChartPerUser ticketsByUser={ticketsInAttendance.tickets} />
								</Grid>
							</Grid>
						</DashboardSection>

						<DashboardSection>
							<Grid container spacing={3}>
								<Grid item xs={12} sm={6}>
									<NewContactsChart />
								</Grid>
								<Grid item xs={12} sm={6}>
									<ContactsWithTicketsChart />
								</Grid>
							</Grid>
						</DashboardSection>
					</>
				)}
			/>

			<DashboardSection>
				<Grid container spacing={3}>
					<Grid item xs={12} sm={6}>
						<ClientStatusPieChart />
					</Grid>
					<Grid item xs={12} sm={6}>
						<ClientStatusBarChart />
					</Grid>
				</Grid>
			</DashboardSection>

			<DashboardSection>
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<TagCloud />
					</Grid>
				</Grid>
			</DashboardSection>
		</StyledContainer>
	);
};

export default Dashboard;
