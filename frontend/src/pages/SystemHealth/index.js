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
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import MemoryIcon from "@mui/icons-material/Memory";
import StorageIcon from "@mui/icons-material/Storage";
import DnsIcon from "@mui/icons-material/Dns";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import MessageIcon from "@mui/icons-material/Message";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import DataUsageIcon from "@mui/icons-material/DataUsage";
import SpeedIcon from "@mui/icons-material/Speed";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import MainContainer from "../../components/MainContainer";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";

const Root = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(2),
  height: "100%",
  overflow: "auto",
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  paddingBottom: 0,
  '& .MuiCardHeader-title': {
    fontWeight: 600,
    fontSize: '1.1rem',
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  paddingTop: theme.spacing(1),
}));

const StatusCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  },
}));

const RefreshButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const ProgressContainer = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(1),
}));

const ProgressLabel = styled(Typography)(({ theme }) => ({
  minWidth: 100,
  marginRight: theme.spacing(2),
  fontWeight: 500,
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  flexGrow: 1,
  height: 10,
  borderRadius: 5,
}));

const ProgressValue = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  fontWeight: 500,
  minWidth: 50,
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const InfoIconWrapper = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1),
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
}));

const InfoText = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const InfoValue = styled(Typography)(({ theme, color }) => ({
  fontWeight: 500,
  color: color === "error" ? theme.palette.error.main : 
         color === "warning" ? theme.palette.warning.main : 
         color === "success" ? theme.palette.success.main : 
         color ? theme.palette[color].main : theme.palette.primary.main,
  marginLeft: theme.spacing(0.5),
}));

const SectionDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
}));

const ChipSuccess = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.success.contrastText,
}));

const ChipWarning = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.warning.main,
  color: theme.palette.warning.contrastText,
}));

const ChipError = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
}));


const SystemHealth = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState({
    status: "loading",
    timestamp: Date.now(),
    uptime: 0,
    cpu: {
      usage: 0,
      cores: 0,
      model: "",
      loadAvg: [0, 0, 0],
    },
    memory: {
      total: 0,
      free: 0,
      used: 0,
      percentUsed: 0,
    },
    disk: {
      total: 0,
      free: 0,
      used: 0,
      percentUsed: 0,
    },
    database: {
      status: "loading",
      responseTime: 0,
      activeConnections: 0,
      version: "",
    },
    whatsapp: {
      total: 0,
      connected: 0,
      disconnected: 0,
      pendingMessages: 0,
    },
    application: {
      version: "",
      nodeVersion: "",
      activeUsers: 0,
      openTickets: 0,
      pendingTickets: 0,
      messagesLast24h: 0,
      errors: 0,
    },
    alerts: [],
  });

  const fetchHealthData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/system-health");
      setHealthData(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 60000);
    return () => clearInterval(interval);
  }, [fetchHealthData]);

  const handleRefresh = () => {
    fetchHealthData();
    toast.success(t("systemHealth.refreshSuccess"));
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    let result = "";
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    result += `${minutes}m`;
    
    return result;
  };

  const renderStatus = (status) => {
    switch (status) {
      case "healthy":
        return (
          <ChipSuccess
            label={t("systemHealth.statusHealthy")}
            icon={<CheckCircleIcon style={{ color: "white" }} />}
          />
        );
      case "warning":
        return (
          <ChipWarning
            label={t("systemHealth.statusWarning")}
            icon={<WarningIcon style={{ color: "white" }} />}
          />
        );
      case "critical":
        return (
          <ChipError
            label={t("systemHealth.statusCritical")}
            icon={<ErrorIcon style={{ color: "white" }} />}
          />
        );
      default:
        return (
          <Chip
            label={t("systemHealth.statusLoading")}
            color="primary"
            icon={<CircularProgress size={16} color="inherit" />}
          />
        );
    }
  };

  const renderProgressBar = (value, label, customColor) => {
    let color = customColor || "primary";
    if (!customColor) {
      if (value > 90) {
        color = "error";
      } else if (value > 70) {
        color = "warning";
      }
    }

    return (
      <ProgressContainer>
        <ProgressLabel variant="body2">
          {label}
        </ProgressLabel>
        <ProgressBar
          variant="determinate"
          value={value}
          color={color}
        />
        <ProgressValue variant="body2" color={color === "error" ? "error" : color === "warning" ? "warning" : "primary"}>
          {value}%
        </ProgressValue>
      </ProgressContainer>
    );
  };

  const renderAlertIcon = (level) => {
    switch (level) {
      case "critical":
        return <ErrorIcon color="error" />;
      case "warning":
        return <WarningIcon color="warning" />;
      case "info":
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{t("systemHealth.title")}</Title>
      </MainHeader>
      <Container component={Root} maxWidth="lg" sx={{ height: 'calc(100vh - 100px)', overflow: 'auto' }}>
        <RefreshButton
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            t("systemHealth.refresh")
          )}
        </RefreshButton>

        <StatusCard>
          <StyledCardHeader
            title={t("systemHealth.whatsappConnections")}
            action={
              <Chip
                label={`${healthData.whatsapp.connected}/${healthData.whatsapp.total}`}
                size="small"
                color={
                  healthData.whatsapp.connected === healthData.whatsapp.total
                    ? "success"
                    : "warning"
                }
                variant="outlined"
              />
            }
          />
          <StyledCardContent>
            <SectionDescription>
              Esta seção mostra o status das conexões do WhatsApp. Sessões desconectadas podem indicar problemas com o serviço ou com os dispositivos.
            </SectionDescription>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <InfoItem>
                  <InfoIconWrapper>
                    <WhatsAppIcon style={{ color: '#25D366' }} />
                  </InfoIconWrapper>
                  <InfoText variant="body2">
                    {t("systemHealth.connectedSessions")}:{" "}
                    <InfoValue color="success">
                      {healthData.whatsapp.connected}
                    </InfoValue>
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                      (ativas)
                    </Typography>
                  </InfoText>
                </InfoItem>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoItem>
                  <InfoIconWrapper>
                    <WhatsAppIcon color="disabled" />
                  </InfoIconWrapper>
                  <InfoText variant="body2">
                    {t("systemHealth.disconnectedSessions")}:{" "}
                    <InfoValue color={healthData.whatsapp.disconnected > 0 ? "error" : "success"}>
                      {healthData.whatsapp.disconnected}
                    </InfoValue>
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                      (inativas)
                    </Typography>
                  </InfoText>
                </InfoItem>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoItem>
                  <InfoIconWrapper>
                    <MessageIcon color={healthData.whatsapp.pendingMessages > 10 ? "warning" : "primary"} />
                  </InfoIconWrapper>
                  <InfoText variant="body2">
                    {t("systemHealth.pendingMessages")}:{" "}
                    <InfoValue color={healthData.whatsapp.pendingMessages > 10 ? "warning" : "success"}>
                      {healthData.whatsapp.pendingMessages}
                    </InfoValue>
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                      (na fila)
                    </Typography>
                  </InfoText>
                </InfoItem>
              </Grid>
            </Grid>
            
            {healthData.whatsapp.disconnected > 0 && (
              <Alert 
                severity="warning" 
                sx={{ mt: 2 }}
                action={
                  <Button color="inherit" size="small" href="/channels">
                    Verificar
                  </Button>
                }
              >
                Há {healthData.whatsapp.disconnected} conexões desconectadas. Verifique a página de Conexões para mais detalhes.
              </Alert>
            )}
          </StyledCardContent>
        </StatusCard>

        <StatusCard>
          <StyledCardHeader
            title={t("systemHealth.database")}
            avatar={<DnsIcon color="primary" />}
            action={renderStatus(healthData.database.status)}
          />
          <StyledCardContent>
            <SectionDescription>
              Esta seção mostra o status do banco de dados. O tempo de resposta e número de conexões ativas são indicadores importantes do desempenho.
            </SectionDescription>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <InfoItem>
                <InfoIconWrapper>
                  <CheckCircleIcon color={healthData.database.status === "healthy" ? "success" : "disabled"} />
                </InfoIconWrapper>
                <InfoText variant="body2">
                  {t("systemHealth.status")}:{" "}
                  <InfoValue color={healthData.database.status === "healthy" ? "success" : 
                              healthData.database.status === "warning" ? "warning" : 
                              healthData.database.status === "critical" ? "error" : "primary"}>
                    {healthData.database.status === "healthy" ? t("systemHealth.statusHealthy") : 
                     healthData.database.status === "warning" ? t("systemHealth.statusWarning") : 
                     healthData.database.status === "critical" ? t("systemHealth.statusCritical") : 
                     t("systemHealth.statusLoading")}
                  </InfoValue>
                </InfoText>
              </InfoItem>
              
              <InfoItem>
                <InfoIconWrapper>
                  <AccessTimeIcon color={healthData.database.responseTime > 500 ? "error" : 
                                   healthData.database.responseTime > 200 ? "warning" : "primary"} />
                </InfoIconWrapper>
                <InfoText variant="body2">
                  {t("systemHealth.responseTime")}:{" "}
                  <InfoValue color={
                    healthData.database.responseTime > 500 ? "error" : 
                    healthData.database.responseTime > 200 ? "warning" : "success"
                  }>
                    {healthData.database.responseTime} ms
                  </InfoValue>
                </InfoText>
              </InfoItem>
              
              <InfoItem>
                <InfoIconWrapper>
                  <PeopleIcon color={healthData.database.activeConnections > 50 ? "warning" : "primary"} />
                </InfoIconWrapper>
                <InfoText variant="body2">
                  {t("systemHealth.activeConnections")}:{" "}
                  <InfoValue color={
                    healthData.database.activeConnections > 50 ? "warning" : "success"
                  }>
                    {healthData.database.activeConnections}
                  </InfoValue>
                </InfoText>
              </InfoItem>
              
              <InfoItem>
                <InfoIconWrapper>
                  <DnsIcon />
                </InfoIconWrapper>
                <InfoText variant="body2">
                  {t("systemHealth.version")}:{" "}
                  <InfoValue>
                    {healthData.database.version || "N/A"}
                  </InfoValue>
                </InfoText>
              </InfoItem>
            </Box>
            
            {healthData.database.status === "critical" && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Problemas críticos detectados no banco de dados. Verifique os logs do sistema.
              </Alert>
            )}
            
            {healthData.database.status === "warning" && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                O banco de dados está apresentando lentidão. Monitore o tempo de resposta.
              </Alert>
            )}
          </StyledCardContent>
        </StatusCard>

        <StatusCard>
          <StyledCardHeader
            title={t("systemHealth.overallStatus")}
            action={renderStatus(healthData.status)}
          />
          <StyledCardContent>
            <SectionDescription>
              Esta seção mostra o status geral do sistema, incluindo tempo de atividade, usuários conectados e atividade recente.
            </SectionDescription>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <InfoItem>
                  <InfoIconWrapper>
                    <AccessTimeIcon />
                  </InfoIconWrapper>
                  <InfoText variant="body1">
                    {t("systemHealth.uptime")}:{" "}
                    <InfoValue color="primary">{formatUptime(healthData.uptime)}</InfoValue>
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                      (tempo ligado)
                    </Typography>
                  </InfoText>
                </InfoItem>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoItem>
                  <InfoIconWrapper>
                    <PeopleIcon />
                  </InfoIconWrapper>
                  <InfoText variant="body1">
                    {t("systemHealth.activeUsers")}:{" "}
                    <InfoValue>{healthData.application.activeUsers}</InfoValue>
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                      (online agora)
                    </Typography>
                  </InfoText>
                </InfoItem>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoItem>
                  <InfoIconWrapper>
                    <ConfirmationNumberIcon />
                  </InfoIconWrapper>
                  <InfoText variant="body1">
                    {t("systemHealth.openTickets")}:{" "}
                    <InfoValue color={healthData.application.openTickets > 10 ? "warning" : "success"}>
                      {healthData.application.openTickets}
                    </InfoValue>
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                      (em aberto)
                    </Typography>
                  </InfoText>
                </InfoItem>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoItem>
                  <InfoIconWrapper>
                    <MessageIcon />
                  </InfoIconWrapper>
                  <InfoText variant="body1">
                    {t("systemHealth.messagesLast24h")}:{" "}
                    <InfoValue>{healthData.application.messagesLast24h}</InfoValue>
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                      (últimas 24h)
                    </Typography>
                  </InfoText>
                </InfoItem>
              </Grid>
            </Grid>
          </StyledCardContent>
        </StatusCard>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StatusCard>
              <StyledCardHeader
                title={t("systemHealth.cpu")}
                avatar={<MemoryIcon color="primary" />}
                action={
                  <Chip 
                    label={`${healthData.cpu.usage}%`}
                    size="small"
                    color={
                      healthData.cpu.usage > 80 ? "error" :
                      healthData.cpu.usage > 60 ? "warning" : "success"
                    }
                    variant="outlined"
                  />
                }
              />
              <StyledCardContent>
                <SectionDescription>
                  Uso da CPU e informações do processador. Um uso elevado por longos períodos pode indicar necessidade de otimização.
                </SectionDescription>
                
                {renderProgressBar(healthData.cpu.usage, t("systemHealth.usage"), 
                  healthData.cpu.usage > 80 ? "error" :
                  healthData.cpu.usage > 60 ? "warning" : "success"
                )}
                
                <Box mt={2} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <InfoItem>
                    <InfoIconWrapper>
                      <DeveloperBoardIcon fontSize="small" />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.cores")}:{" "}
                      <InfoValue>
                        {healthData.cpu.cores}
                      </InfoValue>
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        (núcleos)
                      </Typography>
                    </InfoText>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIconWrapper>
                      <SettingsIcon fontSize="small" />
                    </InfoIconWrapper>
                    <InfoText variant="body2" sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t("systemHealth.model")}:{" "}
                      <InfoValue>
                        {healthData.cpu.model}
                      </InfoValue>
                    </InfoText>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIconWrapper>
                      <SpeedIcon fontSize="small" color={
                        Math.max(...healthData.cpu.loadAvg) > healthData.cpu.cores ? "warning" : "primary"
                      } />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.loadAvg")}:{" "}
                      <InfoValue color={
                        Math.max(...healthData.cpu.loadAvg) > healthData.cpu.cores ? "warning" : "success"
                      }>
                        {healthData.cpu.loadAvg.join(", ")}
                      </InfoValue>
                      <Tooltip title="Carga média nos últimos 1, 5 e 15 minutos">
                        <IconButton size="small">
                          <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InfoText>
                  </InfoItem>
                </Box>
                
                {healthData.cpu.usage > 80 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Uso de CPU elevado! Considere otimizar processos ou aumentar recursos.
                  </Alert>
                )}
              </StyledCardContent>
            </StatusCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <StatusCard>
              <StyledCardHeader
                title={t("systemHealth.memory")}
                avatar={<MemoryIcon color="primary" />}
                action={
                  <Chip 
                    label={`${healthData.memory.percentUsed}%`}
                    size="small"
                    color={
                      healthData.memory.percentUsed > 80 ? "error" :
                      healthData.memory.percentUsed > 60 ? "warning" : "success"
                    }
                    variant="outlined"
                  />
                }
              />
              <StyledCardContent>
                <SectionDescription>
                  Uso da memória RAM do servidor. Um uso elevado pode causar lentidão no sistema e afetar o desempenho.
                </SectionDescription>
                
                {renderProgressBar(healthData.memory.percentUsed, t("systemHealth.usage"),
                  healthData.memory.percentUsed > 80 ? "error" :
                  healthData.memory.percentUsed > 60 ? "warning" : "success"
                )}
                
                <Box mt={2} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <InfoItem>
                    <InfoIconWrapper>
                      <MemoryIcon fontSize="small" />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.total")}:{" "}
                      <InfoValue>
                        {healthData.memory.total} GB
                      </InfoValue>
                    </InfoText>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIconWrapper>
                      <DataUsageIcon fontSize="small" color={
                        healthData.memory.percentUsed > 80 ? "error" :
                        healthData.memory.percentUsed > 60 ? "warning" : "primary"
                      } />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.used")}:{" "}
                      <InfoValue color={
                        healthData.memory.percentUsed > 80 ? "error" :
                        healthData.memory.percentUsed > 60 ? "warning" : "success"
                      }>
                        {healthData.memory.used} GB
                      </InfoValue>
                    </InfoText>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIconWrapper>
                      <DataUsageIcon fontSize="small" color="success" />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.free")}:{" "}
                      <InfoValue color="success">
                        {healthData.memory.free} GB
                      </InfoValue>
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        (disponível)
                      </Typography>
                    </InfoText>
                  </InfoItem>
                </Box>
                
                {healthData.memory.percentUsed > 80 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Memória com uso elevado! Considere fechar aplicações não utilizadas ou aumentar a memória RAM.
                  </Alert>
                )}
              </StyledCardContent>
            </StatusCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <StatusCard>
              <StyledCardHeader
                title={t("systemHealth.disk")}
                avatar={<StorageIcon color="primary" />}
                action={
                  <Chip 
                    label={`${healthData.disk.percentUsed}%`}
                    size="small"
                    color={
                      healthData.disk.percentUsed > 85 ? "error" :
                      healthData.disk.percentUsed > 70 ? "warning" : "success"
                    }
                    variant="outlined"
                  />
                }
              />
              <StyledCardContent>
                <SectionDescription>
                  Uso do espaço em disco. Um uso elevado pode afetar o armazenamento de mensagens e mídias do WhatsApp.
                </SectionDescription>
                
                {renderProgressBar(healthData.disk.percentUsed, t("systemHealth.usage"),
                  healthData.disk.percentUsed > 85 ? "error" :
                  healthData.disk.percentUsed > 70 ? "warning" : "success"
                )}
                
                <Box mt={2} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <InfoItem>
                    <InfoIconWrapper>
                      <StorageIcon fontSize="small" />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.total")}:{" "}
                      <InfoValue>
                        {healthData.disk.total} GB
                      </InfoValue>
                    </InfoText>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIconWrapper>
                      <DataUsageIcon fontSize="small" color={
                        healthData.disk.percentUsed > 85 ? "error" :
                        healthData.disk.percentUsed > 70 ? "warning" : "primary"
                      } />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.used")}:{" "}
                      <InfoValue color={
                        healthData.disk.percentUsed > 85 ? "error" :
                        healthData.disk.percentUsed > 70 ? "warning" : "success"
                      }>
                        {healthData.disk.used} GB
                      </InfoValue>
                    </InfoText>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIconWrapper>
                      <DataUsageIcon fontSize="small" color="success" />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.free")}:{" "}
                      <InfoValue color="success">
                        {healthData.disk.free} GB
                      </InfoValue>
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        (disponível)
                      </Typography>
                    </InfoText>
                  </InfoItem>
                </Box>
                
                {healthData.disk.percentUsed > 85 && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Espaço em disco crítico! Libere espaço ou adicione mais armazenamento.
                  </Alert>
                )}
                
                {healthData.disk.percentUsed > 70 && healthData.disk.percentUsed <= 85 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Espaço em disco limitado. Considere limpar arquivos temporários ou mídias antigas.
                  </Alert>
                )}
              </StyledCardContent>
            </StatusCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={t("systemHealth.database")}
                avatar={<DnsIcon />}
                component={CardHeader}
              />
              <StyledCardContent>
                <Box mb={2}>
                  <Typography variant="body1">
                    {t("systemHealth.status")}:{" "}
                    {healthData.database.status === "connected" ? (
                      <Chip
                        label={t("systemHealth.connected")}
                        as={Chip}
                        size="small"
                      />
                    ) : (
                      <Chip
                        label={t("systemHealth.error")}
                        as={Chip}
                        size="small"
                      />
                    )}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {t("systemHealth.responseTime")}: {healthData.database.responseTime} ms
                </Typography>
                <Typography variant="body2">
                  {t("systemHealth.activeConnections")}: {healthData.database.activeConnections}
                </Typography>
                <Typography variant="body2">
                  {t("systemHealth.version")}: {healthData.database.version}
                </Typography>
                {healthData.database.error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {healthData.database.error}
                  </Alert>
                )}
              </StyledCardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <CardHeader
                title={t("systemHealth.whatsapp")}
                avatar={<WhatsAppIcon style={{ color: '#25D366' }} />}
                sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}
              />
              <StyledCardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <InfoItem>
                    <InfoIconWrapper>
                      <WhatsAppIcon style={{ color: '#25D366' }} />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.totalConnections")}:{" "}
                      <InfoValue color="primary">
                        {healthData.whatsapp.total}
                      </InfoValue>
                    </InfoText>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIconWrapper>
                      <CheckCircleIcon color="success" />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.connectedWhatsapps")}:{" "}
                      <InfoValue color="success">
                        {healthData.whatsapp.connected}
                      </InfoValue>
                    </InfoText>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIconWrapper>
                      <ErrorIcon color={healthData.whatsapp.disconnected > 0 ? "error" : "disabled"} />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.disconnectedWhatsapps")}:{" "}
                      <InfoValue color={healthData.whatsapp.disconnected > 0 ? "error" : "success"}>
                        {healthData.whatsapp.disconnected}
                      </InfoValue>
                    </InfoText>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIconWrapper>
                      <MessageIcon color={healthData.whatsapp.pendingMessages > 10 ? "warning" : "primary"} />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.pendingMessages")}:{" "}
                      <InfoValue color={healthData.whatsapp.pendingMessages > 10 ? "warning" : "success"}>
                        {healthData.whatsapp.pendingMessages}
                      </InfoValue>
                    </InfoText>
                  </InfoItem>
                </Box>
                
                {healthData.whatsapp.disconnected > 0 && (
                  <Alert 
                    severity="warning" 
                    sx={{ mt: 2 }}
                    action={
                      <Button color="inherit" size="small" href="/channels">
                        Verificar
                      </Button>
                    }
                  >
                    Há {healthData.whatsapp.disconnected} conexões desconectadas.
                  </Alert>
                )}
              </StyledCardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <CardHeader
                title={t("systemHealth.application")}
                avatar={<SettingsIcon color="primary" />}
                sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}
              />
              <StyledCardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <InfoItem>
                    <InfoIconWrapper>
                      <CheckCircleIcon color="primary" />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.version")}:{" "}
                      <InfoValue color="primary">
                        v{healthData.application.version}
                      </InfoValue>
                    </InfoText>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIconWrapper>
                      <DeveloperBoardIcon />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.nodeVersion")}:{" "}
                      <InfoValue>
                        {healthData.application.nodeVersion}
                      </InfoValue>
                    </InfoText>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIconWrapper>
                      <ConfirmationNumberIcon color={healthData.application.pendingTickets > 10 ? "warning" : "primary"} />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.pendingTickets")}:{" "}
                      <InfoValue color={healthData.application.pendingTickets > 10 ? "warning" : "success"}>
                        {healthData.application.pendingTickets}
                      </InfoValue>
                    </InfoText>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIconWrapper>
                      <ErrorIcon color={healthData.application.errors > 0 ? "error" : "disabled"} />
                    </InfoIconWrapper>
                    <InfoText variant="body2">
                      {t("systemHealth.errors")}:{" "}
                      <InfoValue color={healthData.application.errors > 0 ? "error" : "success"}>
                        {healthData.application.errors}
                      </InfoValue>
                    </InfoText>
                  </InfoItem>
                </Box>
                
                {healthData.application.errors > 0 && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Foram detectados {healthData.application.errors} erros no sistema. Verifique os logs para mais detalhes.
                  </Alert>
                )}
              </StyledCardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MainContainer>
  );
};

export default SystemHealth;
