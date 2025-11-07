import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Speed,
  Message,
  Schedule,
  SignalCellular4Bar,
  SignalCellularConnectedNoInternet0Bar,
} from "@mui/icons-material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import openSocket from "../../services/socket-io";
import { useTranslation } from "react-i18next";

const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  overflowY: "auto",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  ...theme.scrollbarStyles,
}));

const StyledCard = styled(Card)(({ theme, status }) => ({
  height: "100%",
  borderLeft: `4px solid ${
    status === "CONNECTED"
      ? theme.palette.success.main
      : status === "OPENING"
      ? theme.palette.warning.main
      : theme.palette.error.main
  }`,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const StatBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
}));

const HealthCheck = () => {
  const { t } = useTranslation();
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHealthData = async () => {
    try {
      const { data } = await api.get("/health-check");
      setHealthData(data);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    const socket = openSocket();

    socket.on("whatsappSession", (data) => {
      if (data.action === "update") {
        fetchHealthData();
      }
    });

    const interval = setInterval(() => {
      fetchHealthData();
    }, 30000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (state) => {
    switch (state) {
      case "CONNECTED":
        return "success";
      case "OPENING":
        return "warning";
      default:
        return "error";
    }
  };

  const getStatusIcon = (state) => {
    switch (state) {
      case "CONNECTED":
        return <CheckCircle color="success" />;
      case "OPENING":
        return <Warning color="warning" />;
      default:
        return <Error color="error" />;
    }
  };

  const getLatencyColor = (latency) => {
    if (latency < 0) return "error";
    if (latency < 100) return "success";
    if (latency < 300) return "warning";
    return "error";
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{t("healthCheck.title")}</Title>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title={t("healthCheck.tooltips.refresh")}>
            <IconButton onClick={fetchHealthData} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </MainHeader>

      <MainPaper>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {healthData.length === 0 ? (
              <Grid item xs={12}>
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                  }}
                >
                  <SignalCellularConnectedNoInternet0Bar
                    sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="textSecondary">
                    {t("healthCheck.noChannels")}
                  </Typography>
                </Box>
              </Grid>
            ) : (
              healthData.map((health) => (
                <Grid item xs={12} md={6} lg={4} key={health.whatsappId}>
                  <StyledCard status={health.state}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {getStatusIcon(health.state)}
                          <Typography variant="h6" component="div">
                            {health.name}
                          </Typography>
                        </Box>
                        <Chip
                          label={health.state || "DISCONNECTED"}
                          color={getStatusColor(health.state)}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          {t("healthCheck.number")}: {health.number}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {t("healthCheck.pushname")}: {health.pushname}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {t("healthCheck.platform")}: {health.platform}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {t("healthCheck.wwebVersion")}: {health.wwebVersion}
                        </Typography>
                      </Box>

                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <StatBox>
                            <Schedule fontSize="small" color="primary" />
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                {t("healthCheck.uptime")}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {formatUptime(health.uptime)}
                              </Typography>
                            </Box>
                          </StatBox>
                        </Grid>

                        <Grid item xs={6}>
                          <StatBox>
                            <Message fontSize="small" color="primary" />
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                {t("healthCheck.messages")}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {health.messagesProcessed}
                              </Typography>
                            </Box>
                          </StatBox>
                        </Grid>

                        <Grid item xs={6}>
                          <StatBox>
                            <Speed fontSize="small" color={getLatencyColor(health.latency)} />
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                {t("healthCheck.latency")}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {health.latency >= 0 ? `${health.latency}ms` : "N/A"}
                              </Typography>
                            </Box>
                          </StatBox>
                        </Grid>

                        <Grid item xs={6}>
                          <StatBox>
                            <Error
                              fontSize="small"
                              color={health.errors > 0 ? "error" : "disabled"}
                            />
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                {t("healthCheck.errors")}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {health.errors}
                              </Typography>
                            </Box>
                          </StatBox>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="textSecondary">
                          {t("healthCheck.lastActivity")}:{" "}
                          {format(new Date(health.lastActivity), "dd/MM/yyyy HH:mm:ss", {
                            locale: ptBR,
                          })}
                        </Typography>
                      </Box>

                      {health.isConnected && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="textSecondary" gutterBottom>
                            {t("healthCheck.connectionStatus")}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={health.latency < 0 ? 0 : Math.max(0, 100 - health.latency / 10)}
                            color={
                              health.latency < 100
                                ? "success"
                                : health.latency < 300
                                ? "warning"
                                : "error"
                            }
                          />
                        </Box>
                      )}
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </MainPaper>
    </MainContainer>
  );
};

export default HealthCheck;
