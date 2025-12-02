import React, { useState, useEffect, useCallback } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MessageIcon from "@mui/icons-material/Message";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SpeedIcon from "@mui/icons-material/Speed";
import AssignmentIcon from "@mui/icons-material/Assignment";
import OnlinePredictionIcon from "@mui/icons-material/OnlinePrediction";
import OfflineBoltIcon from "@mui/icons-material/OfflineBolt";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

import api from "../../services/api";
import MainHeader from "../../components/MainHeader";
import MainContainer from "../../components/MainContainer";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";

const RootContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(2),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  overflow: "auto",
  flexDirection: "column",
  borderRadius: theme.spacing(1),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  paddingBottom: 0,
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  paddingTop: 0,
}));

const RefreshButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(0.75),
  fontWeight: 500,
  padding: theme.spacing(1, 2),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
  fontWeight: 500,
  '& .MuiChip-label': {
    padding: theme.spacing(0.5, 1),
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: theme.spacing(1),
  overflow: "hidden",
  '& .MuiTableCell-root': {
    padding: theme.spacing(1.5),
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PageWrapper = styled('div')(({ theme }) => ({
  overflowY: 'auto',
  height: 'calc(100vh - 120px)',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5),
    height: 'calc(100vh - 100px)',
  },
}));

const FilterContainer = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StatIcon = styled('span')(({ theme }) => ({
  marginRight: theme.spacing(1),
  display: "flex",
  alignItems: "center",
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const UserMonitor = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userData, setUserData] = useState({
    users: [],
    summary: {
      totalUsers: 0,
      usersOnline: 0,
      totalTickets: 0,
      totalMessages: 0,
      avgResponseTime: 0,
      avgResolutionRate: 0
    }
  });

  const fetchUserMonitorData = useCallback(async () => {
    const pageWrapperRef = document.querySelector('[class*="PageWrapper"]');
    const scrollPosition = pageWrapperRef ? pageWrapperRef.scrollTop : 0;
    
    setLoading(true);
    try {
      const params = selectedUserId ? { userId: selectedUserId } : {};
      const { data } = await api.get("/user-monitor", { params });
      setUserData(data);
      setTimeout(() => {
        if (pageWrapperRef) {
          pageWrapperRef.scrollTop = scrollPosition;
        }
      }, 100);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    fetchUserMonitorData();
    const interval = setInterval(fetchUserMonitorData, 60000);
    return () => clearInterval(interval);
  }, [fetchUserMonitorData]);

  const handleRefresh = () => {
    fetchUserMonitorData();
    toast.success(t("userMonitor.refreshSuccess"));
  };

  const formatTime = (minutes) => {
    if (minutes === 0) return "0 min";
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "-";
    
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    
    if (diff < 60000) return t("userMonitor.justNow");
    
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return t("userMonitor.minutesAgo", { minutes });
    }
    
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return t("userMonitor.hoursAgo", { hours });
    }
    
    const days = Math.floor(diff / 86400000);
    return t("userMonitor.daysAgo", { days });
  };

  const ticketChartData = userData.users.map(user => ({
    name: user.name.split(' ')[0],
    abertos: user.ticketStats.open,
    pendentes: user.ticketStats.pending,
    fechados: user.ticketStats.closed
  }));

  const messageChartData = userData.users.map(user => ({
    name: user.name.split(' ')[0],
    mensagens: user.messageStats.sent,
    hoje: user.messageStats.sentToday,
    ultimos7Dias: user.messageStats.sentLast7Days
  }));

  const performanceChartData = userData.users.map(user => ({
    name: user.name.split(' ')[0],
    tempoResposta: user.performanceStats.avgResponseTime,
    tempoAtendimento: user.performanceStats.avgHandleTime,
    taxaResolucao: user.performanceStats.resolutionRate
  }));

  const statusPieData = [
    { name: t("userMonitor.usersOnline"), value: userData.summary.usersOnline },
    { name: t("userMonitor.usersOffline"), value: userData.summary.totalUsers - userData.summary.usersOnline }
  ];

  return (
    <MainContainer>
      <MainHeader>
        <Title>{t("userMonitor.title")}</Title>
      </MainHeader>
      <PageWrapper>
        <RootContainer maxWidth="lg">
          <FilterContainer>
            <FormControl fullWidth variant="outlined">
              <InputLabel>{t("userMonitor.selectUser")}</InputLabel>
              <Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                label={t("userMonitor.selectUser")}
              >
                <MenuItem value="">
                  <em>{t("userMonitor.allUsers")}</em>
                </MenuItem>
                {userData.users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FilterContainer>

          <RefreshButton
            variant="contained"
            color="primary"
            fullWidth
            startIcon={loading ? null : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t("userMonitor.refresh")
            )}
          </RefreshButton>

          <StyledCard>
            <StyledCardHeader
              title={t("userMonitor.summary")}
            />
            <StyledCardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledPaper elevation={3}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <StatIcon><PeopleIcon /></StatIcon>
                      {t("userMonitor.totalUsers")}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {userData.summary.totalUsers}
                    </Typography>
                  </StyledPaper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledPaper elevation={3}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <StatIcon><OnlinePredictionIcon style={{ color: "#4caf50" }} /></StatIcon>
                      {t("userMonitor.usersOnline")}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: "#4caf50" }}>
                      {userData.summary.usersOnline}
                    </Typography>
                  </StyledPaper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledPaper elevation={3}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <StatIcon><AssignmentIcon /></StatIcon>
                      {t("userMonitor.totalTickets")}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {userData.summary.totalTickets}
                    </Typography>
                  </StyledPaper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledPaper elevation={3}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <StatIcon><MessageIcon /></StatIcon>
                      {t("userMonitor.totalMessages")}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {userData.summary.totalMessages}
                    </Typography>
                  </StyledPaper>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <StyledPaper elevation={3}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <StatIcon><SpeedIcon /></StatIcon>
                      {t("userMonitor.avgResponseTime")}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {formatTime(userData.summary.avgResponseTime)}
                    </Typography>
                  </StyledPaper>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <StyledPaper elevation={3}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <StatIcon><TrendingUpIcon /></StatIcon>
                      {t("userMonitor.avgResolutionRate")}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {userData.summary.avgResolutionRate}%
                    </Typography>
                  </StyledPaper>
                </Grid>
              </Grid>
            </StyledCardContent>
          </StyledCard>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <StyledCardHeader title={t("userMonitor.ticketsByUser")} />
                <StyledCardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ticketChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="abertos" fill="#388e3c" name={t("userMonitor.open")} />
                      <Bar dataKey="pendentes" fill="#0277bd" name={t("userMonitor.pending")} />
                      <Bar dataKey="fechados" fill="#757575" name={t("userMonitor.closed")} />
                    </BarChart>
                  </ResponsiveContainer>
                </StyledCardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledCard>
                <StyledCardHeader title={t("userMonitor.messagesByUser")} />
                <StyledCardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={messageChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="mensagens" stroke="#8884d8" name={t("userMonitor.total")} />
                      <Line type="monotone" dataKey="hoje" stroke="#82ca9d" name={t("userMonitor.today")} />
                      <Line type="monotone" dataKey="ultimos7Dias" stroke="#ffc658" name={t("userMonitor.last7Days")} />
                    </LineChart>
                  </ResponsiveContainer>
                </StyledCardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledCard>
                <StyledCardHeader title={t("userMonitor.performanceMetrics")} />
                <StyledCardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="tempoResposta" fill="#ff9800" name={t("userMonitor.responseTime")} />
                      <Bar dataKey="tempoAtendimento" fill="#2196f3" name={t("userMonitor.handleTime")} />
                    </BarChart>
                  </ResponsiveContainer>
                </StyledCardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledCard>
                <StyledCardHeader title={t("userMonitor.userStatus")} />
                <StyledCardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </StyledCardContent>
              </StyledCard>
            </Grid>
          </Grid>

          <StyledCard>
            <StyledCardHeader
              title={t("userMonitor.detailedStats")}
            />
            <StyledCardContent>
              <StyledTableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("userMonitor.user")}</TableCell>
                      <TableCell>{t("userMonitor.profile")}</TableCell>
                      <TableCell>{t("userMonitor.status")}</TableCell>
                      <TableCell>{t("userMonitor.queues")}</TableCell>
                      <TableCell>{t("userMonitor.tickets")}</TableCell>
                      <TableCell>{t("userMonitor.messages")}</TableCell>
                      <TableCell>{t("userMonitor.avgResponseTime")}</TableCell>
                      <TableCell>{t("userMonitor.resolutionRate")}</TableCell>
                      <TableCell>{t("userMonitor.lastActivity")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userData.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <StatIcon>
                              <PersonIcon />
                            </StatIcon>
                            <div>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {user.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {user.email}
                              </Typography>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StyledChip
                            label={t(`userMonitor.profiles.${user.profile}`)}
                            size="small"
                            color={user.profile === "admin" ? "primary" : "default"}
                          />
                        </TableCell>
                        <TableCell>
                          {user.online ? (
                            <StyledChip
                              icon={<OnlinePredictionIcon />}
                              label={t("userMonitor.online")}
                              size="small"
                              style={{ backgroundColor: "#4caf50", color: "white" }}
                            />
                          ) : (
                            <StyledChip
                              icon={<OfflineBoltIcon />}
                              label={t("userMonitor.offline")}
                              size="small"
                              style={{ backgroundColor: "#757575", color: "white" }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {user.queues.map((queue) => (
                            <StyledChip
                              key={queue.id}
                              label={queue.name}
                              size="small"
                              style={{
                                backgroundColor: queue.color || "#2196f3",
                                color: "white",
                              }}
                            />
                          ))}
                          {user.queues.length === 0 && <Typography variant="caption">-</Typography>}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.ticketStats.total}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            A:{user.ticketStats.open} P:{user.ticketStats.pending} F:{user.ticketStats.closed}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.messageStats.sent}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Hoje: {user.messageStats.sentToday}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {formatTime(user.performanceStats.avgResponseTime)}
                        </TableCell>
                        <TableCell>
                          <StyledChip
                            label={`${user.performanceStats.resolutionRate}%`}
                            size="small"
                            style={{
                              backgroundColor: user.performanceStats.resolutionRate >= 70 ? "#4caf50" : 
                                             user.performanceStats.resolutionRate >= 50 ? "#ff9800" : "#f44336",
                              color: "white"
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatRelativeTime(user.timeStats.lastActivity)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </StyledCardContent>
          </StyledCard>
        </RootContainer>
      </PageWrapper>
    </MainContainer>
  );
};

export default UserMonitor;
