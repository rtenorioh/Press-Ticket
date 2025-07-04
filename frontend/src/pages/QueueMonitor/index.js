import React, { useState, useEffect, useCallback } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Badge from "@mui/material/Badge";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MessageIcon from "@mui/icons-material/Message";
import WarningIcon from "@mui/icons-material/Warning";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import TodayIcon from "@mui/icons-material/Today";
import {
  Facebook,
  Instagram,
  Telegram,
  Email,
  Sms
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

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

const FixedHeightPaper = styled(StyledPaper)(({ theme }) => ({
  minHeight: 150,
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  paddingBottom: 0,
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  paddingTop: 0,
}));

const QueueCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
}));

const QueueTitle = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1, 0),
}));

const QueueNameContainer = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const ColorBadge = styled('div')(({ theme }) => ({
  width: 18,
  height: 18,
  borderRadius: "50%",
  marginRight: theme.spacing(1),
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
}));

const TicketInfo = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginRight: theme.spacing(2),
  gap: theme.spacing(0.5),
}));

const TicketInfoIcon = styled('span')(({ theme }) => ({
  marginRight: theme.spacing(0.5),
  display: "flex",
  alignItems: "center",
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

const WhatsappStatus = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const StatusIcon = styled('span')(({ theme }) => ({
  marginRight: theme.spacing(0.5),
  display: "flex",
  alignItems: "center",
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

const TimeInfo = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

const TimeIcon = styled('span')(({ theme }) => ({
  marginRight: theme.spacing(0.5),
  display: "flex",
  alignItems: "center",
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(0.5, 0),
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

const QueueMonitor = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [queueData, setQueueData] = useState({
    queues: [],
    summary: {
      totalQueues: 0,
      totalTickets: 0,
      waitingTickets: 0,
      pendingTickets: 0,
      activeTickets: 0,
      totalMessages: 0,
      messagesLast24Hours: 0,
      messagesLast7Days: 0,
      avgWaitTime: 0,
      oldestTicketTime: 0,
      oldestTicketQueueId: null,
      oldestTicketId: null,
    },
    whatsapps: [],
  });

  const fetchQueueMonitorData = useCallback(async () => {
    const pageWrapperRef = document.querySelector('[class*="PageWrapper"]');
    const scrollPosition = pageWrapperRef ? pageWrapperRef.scrollTop : 0;
    
    setLoading(true);
    try {
      const { data } = await api.get("/queue-monitor");
      setQueueData(data);
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
  }, []);

  useEffect(() => {
    fetchQueueMonitorData();
    const interval = setInterval(fetchQueueMonitorData, 60000);
    return () => clearInterval(interval);
  }, [fetchQueueMonitorData]);

  const handleRefresh = () => {
    fetchQueueMonitorData();
    toast.success(t("queueMonitor.refreshSuccess"));
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
    const diff = now - timestamp;
    
    if (diff < 60000) return t("queueMonitor.justNow");
    
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return t("queueMonitor.minutesAgo", { minutes });
    }
    
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return t("queueMonitor.hoursAgo", { hours });
    }
    
    const days = Math.floor(diff / 86400000);
    return t("queueMonitor.daysAgo", { days });
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case "facebook":
        return <Facebook sx={{ color: "#3b5998" }} />;
      case "instagram":
        return <Instagram sx={{ color: "#cd486b" }} />;
      case "telegram":
        return <Telegram sx={{ color: "#85b2ff" }} />;
      case "email":
        return <Email sx={{ color: "#004f9f" }} />;
      case "webchat":
        return <Sms sx={{ color: "#EB6D58" }} />;
      case null:
      case "wwebjs":
      default:
        return <WhatsAppIcon sx={{ color: "#075e54" }} />;
    }
  };

  const renderWhatsAppStatus = (status) => {
    switch (status) {
      case "CONNECTED":
        return (
          <WhatsappStatus>
            <StatusIcon>
              <CheckCircleIcon style={{ color: "green" }} />
            </StatusIcon>
            {t("queueMonitor.connected")}
          </WhatsappStatus>
        );
      case "DISCONNECTED":
        return (
          <WhatsappStatus>
            <StatusIcon>
              <ErrorIcon style={{ color: "red" }} />
            </StatusIcon>
            {t("queueMonitor.disconnected")}
          </WhatsappStatus>
        );
      case "LOADING":
        return (
          <WhatsappStatus>
            <StatusIcon>
              <HourglassEmptyIcon style={{ color: "orange" }} />
            </StatusIcon>
            {t("queueMonitor.loading")}
          </WhatsappStatus>
        );
      default:
        return status;
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{t("queueMonitor.title")}</Title>
      </MainHeader>
      <PageWrapper>
      <RootContainer maxWidth="lg">
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
            t("queueMonitor.refresh")
          )}
        </RefreshButton>

        <SummaryCard>
          <StyledCardHeader
            title={t("queueMonitor.summary")}
          />
          <StyledCardContent>
              <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StyledPaper elevation={3}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    {t("queueMonitor.totalTickets")}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {queueData.summary.totalTickets}
                  </Typography>
                </StyledPaper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StyledPaper elevation={3}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    {t("queueMonitor.waitingTickets")}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: "#ff9800" }}>
                    {queueData.summary.waitingTickets}
                  </Typography>
                </StyledPaper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StyledPaper elevation={3}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    {t("queueMonitor.avgWaitTime")}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {formatTime(queueData.summary.avgWaitTime)}
                  </Typography>
                </StyledPaper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StyledPaper elevation={3}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                    {t("queueMonitor.messagesLast24Hours")}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {queueData.summary.messagesLast24Hours}
                  </Typography>
                </StyledPaper>
              </Grid>
            </Grid>
          </StyledCardContent>
        </SummaryCard>

        <QueueCard>
          <StyledCardHeader
            title={t("queueMonitor.whatsappConnections")}
          />
          <StyledCardContent>
            <StyledTableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("queueMonitor.name")}</TableCell>
                    <TableCell>{t("queueMonitor.type")}</TableCell>
                    <TableCell>{t("queueMonitor.status")}</TableCell>
                    <TableCell>{t("queueMonitor.queues")}</TableCell>
                    <TableCell>{t("queueMonitor.pendingMessages")}</TableCell>
                    <TableCell>{t("queueMonitor.last24Hours")}</TableCell>
                    <TableCell>{t("queueMonitor.last7Days")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {queueData.whatsapps.map((whatsapp) => (
                    <TableRow key={whatsapp.id}>
                      <TableCell>
                        <WhatsappStatus>
                          <StatusIcon>
                            {getChannelIcon(whatsapp.type)}
                          </StatusIcon>
                          {whatsapp.name}
                        </WhatsappStatus>
                      </TableCell>
                      <TableCell>
                        {whatsapp.type || "wwebjs"}
                      </TableCell>
                      <TableCell>{renderWhatsAppStatus(whatsapp.status)}</TableCell>
                      <TableCell>
                      {whatsapp.queues.map((queueId) => {
                          const queue = queueData.queues.find((q) => q.id === queueId);
                          return queue ? (
                            <StyledChip
                            key={queueId}
                            label={queue.name}
                            style={{
                              backgroundColor: queue.color || "#2196f3",
                              color: "white",
                            }}
                            size="small"
                          />
                        ) : null
                      })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          badgeContent={whatsapp.unreadMessages}
                          color="secondary"
                          sx={{
                            "& .MuiBadge-badge": {
                              right: -10,
                              padding: "0 4px",
                            },
                          }}
                        >
                          <MessageIcon />
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          badgeContent={whatsapp.messagesToday}
                          color="primary"
                          sx={{
                            "& .MuiBadge-badge": {
                              right: -10,
                              padding: "0 4px",
                            },
                          }}
                        >
                          <TodayIcon />
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          badgeContent={whatsapp.messagesLast7Days}
                          color="info"
                          sx={{
                            "& .MuiBadge-badge": {
                              right: -10,
                              padding: "0 4px",
                            },
                          }}
                        >
                          <MessageIcon />
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </StyledCardContent>
        </QueueCard>

        {queueData.queues.map((queue) => (
          <QueueCard key={queue.id}>
            <StyledCardHeader
              title={
                <QueueTitle>
                  <QueueNameContainer>
                    <ColorBadge
                      style={{ backgroundColor: queue.color }}
                    />
                    <Typography variant="h6">{queue.name}</Typography>
                  </QueueNameContainer>
                  <div>
                    <TicketInfo>
                      <PeopleIcon
                        sx={{ marginRight: 0.5 }}
                        fontSize="small"
                      />
                      <Typography variant="body2">
                        {t("queueMonitor.users")}: {queue.usersOnline}/{queue.usersTotal}
                      </Typography>
                    </TicketInfo>
                  </div>
                </QueueTitle>
              }
            />
            <StyledCardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledPaper elevation={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {t("queueMonitor.waitingTickets")}
                    </Typography>
                    <Typography variant="h5" style={{ color: "#ff9800" }}>
                      {queue.waitingTickets}
                    </Typography>
                  </StyledPaper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledPaper elevation={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {t("queueMonitor.pendingTickets")}
                    </Typography>
                    <Typography variant="h5" style={{ color: "#0277bd" }}>
                      {queue.pendingTickets}
                    </Typography>
                  </StyledPaper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledPaper elevation={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {t("queueMonitor.activeTickets")}
                    </Typography>
                    <Typography variant="h5" style={{ color: "#388e3c" }}>
                      {queue.activeTickets}
                    </Typography>
                  </StyledPaper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledPaper elevation={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {t("queueMonitor.totalTickets")}
                    </Typography>
                    <Typography variant="h5">
                      {queue.totalTickets}
                    </Typography>
                  </StyledPaper>
                </Grid>
              </Grid>

              <StyledDivider />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TimeInfo>
                    <AccessTimeIcon
                      sx={{ marginRight: 0.5 }}
                      fontSize="small"
                      color="action"
                    />
                    <Typography variant="body2">
                      {t("queueMonitor.avgWaitTime")}: {formatTime(queue.avgWaitTime)}
                    </Typography>
                  </TimeInfo>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TimeInfo>
                    <AccessTimeIcon
                      sx={{ marginRight: 0.5 }}
                      fontSize="small"
                      color="action"
                    />
                    <Typography variant="body2">
                      {t("queueMonitor.avgHandleTime")}: {formatTime(queue.avgHandleTime)}
                    </Typography>
                  </TimeInfo>
                </Grid>
                {queue.oldestTicketTime > 0 && (
                  <Grid item xs={12} sm={6} md={4}>
                    <TimeInfo>
                      <WarningIcon
                        sx={{ marginRight: 0.5 }}
                        fontSize="small"
                        color="error"
                      />
                      <Typography variant="body2">
                        {t("queueMonitor.oldestTicket")}: {formatRelativeTime(queue.oldestTicketTime)}
                      </Typography>
                    </TimeInfo>
                  </Grid>
                )}
              </Grid>

              <StyledDivider />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TimeInfo>
                    <MessageIcon
                      sx={{ marginRight: 0.5 }}
                      fontSize="small"
                      color="action"
                    />
                    <Typography variant="body2">
                      {t("queueMonitor.totalMessages")}: {queue.messagesCount.total}
                    </Typography>
                  </TimeInfo>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TimeInfo>
                    <MessageIcon
                      sx={{ marginRight: 0.5 }}
                      fontSize="small"
                      color="action"
                    />
                    <Typography variant="body2">
                      {t("queueMonitor.last24Hours")}: {queue.messagesCount.last24Hours}
                    </Typography>
                  </TimeInfo>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TimeInfo>
                    <TodayIcon
                      sx={{ marginRight: 0.5 }}
                      fontSize="small"
                      color="action"
                    />
                    <Typography variant="body2">
                      {t("queueMonitor.today")}: {queue.messagesCount.today}
                    </Typography>
                  </TimeInfo>
                </Grid>
              </Grid>
            </StyledCardContent>
          </QueueCard>
        ))}
      </RootContainer>
      </PageWrapper>
    </MainContainer>
  );
};

export default QueueMonitor;
