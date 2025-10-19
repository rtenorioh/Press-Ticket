import React, { useState, useEffect, useCallback, useRef } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import WhatsMarked from "react-whatsmarked";

import RefreshIcon from "@mui/icons-material/Refresh";
import SystemUpdateIcon from "@mui/icons-material/SystemUpdate";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import RestoreIcon from "@mui/icons-material/Restore";
import DownloadIcon from "@mui/icons-material/Download";
import InfoIcon from "@mui/icons-material/Info";
import Link from "@mui/material/Link";

import api from "../../services/api";
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  overflow: "auto",
  flexDirection: "column",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledCardHeader = styled(CardHeader)(() => ({
  paddingBottom: 0,
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  paddingTop: theme.spacing(1),
}));

const RefreshButtonStyled = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const VersionInfo = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
}));

const VersionText = styled(Typography)(({ theme }) => ({
  marginRight: theme.spacing(2),
}));

const ReleaseNotes = styled('div')(({ theme }) => ({
  maxHeight: 300,
  overflow: "auto",
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

const ProgressContainer = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ProgressText = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  marginTop: theme.spacing(0.5),
}));

const BackupList = styled(List)(() => ({
  maxHeight: 300,
  overflow: "auto",
}));

const BackupItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const UpdateAvailableChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.success.light,
  color: theme.palette.success.contrastText,
  fontWeight: "bold",
}));

const UpdateNotAvailableChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.info.light,
  color: theme.palette.info.contrastText,
}));

const MarkdownStyled = styled(WhatsMarked)(({ theme }) => ({
  "& p": {
    margin: theme.spacing(1, 0),
  },
  "& ul": {
    paddingLeft: theme.spacing(2),
  },
  "& h1, & h2, & h3, & h4, & h5, & h6": {
    margin: theme.spacing(1, 0),
  },
}));

const CardWrapper = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const VersionCard = styled(Card)(({ theme, status }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
  borderRadius: 10,
  border: status === "updated" || status === "latest" 
    ? `2px solid ${theme.palette.success.main}`
    : status === "outdated"
      ? `2px solid ${theme.palette.error.main}`
      : `2px solid ${theme.palette.divider}`,
  backgroundColor: status === "updated" || status === "latest" 
    ? theme.palette.success.light + "20"
    : status === "outdated"
      ? theme.palette.error.light + "20"
      : theme.palette.background.paper,
  "&:hover": {
    boxShadow: "0 8px 30px 0 rgba(0,0,0,0.15)",
    transform: "translateY(-5px)",
  }
}));

const VersionIcon = styled(Box)(({ theme, status }) => ({
  position: "absolute",
  top: 15,
  right: 15,
  width: 40,
  height: 40,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: status === "updated" || status === "latest" 
    ? theme.palette.success.main
    : status === "outdated"
      ? theme.palette.error.main
      : theme.palette.success.main,
  color: "#fff",
  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
}));

const VersionValue = styled(Typography)(({ theme }) => ({
  fontSize: "2rem",
  fontWeight: 700,
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const MessageBox = styled(Paper)(({ theme, type }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  backgroundColor: type === "success"
    ? theme.palette.success.light + "30"
    : theme.palette.warning.light + "30",
  borderLeft: type === "success"
    ? `4px solid ${theme.palette.success.main}`
    : `4px solid ${theme.palette.warning.main}`,
  borderRadius: 4,
}));

const SystemUpdate = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [installingUpdate, setInstallingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState({
    currentVersion: "",
    latestVersion: "",
    needsUpdate: false,
    versionsEqual: false,
    releaseNotes: "",
  });
  const [updateStatus, setUpdateStatus] = useState({
    status: "idle",
    progress: 0,
    message: "",
    error: "",
    lastUpdateCheck: null,
    lastUpdateInstalled: null,
  });
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState("");
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [statusPolling, setStatusPolling] = useState(null);

  const compareVersions = useCallback((currentVersion, latestVersion) => {
    if (!currentVersion || !latestVersion) return;
    
    const currentVersionClean = String(currentVersion).replace(/^v/i, "").trim();
    const latestVersionClean = String(latestVersion).replace(/^v/i, "").trim();
    
    const isEqual = currentVersionClean === latestVersionClean && currentVersionClean !== "";
    
    setUpdateInfo(prevState => {
      if (prevState.versionsEqual === isEqual) return prevState;
      
      return {
        ...prevState,
        needsUpdate: !isEqual && prevState.needsUpdate,
        versionsEqual: isEqual
      };
    });
  }, []);

  const getCurrentVersion = useCallback(async () => {
    try {
      const { data } = await api.get("/version");
      
      setUpdateInfo(prevState => ({
        ...prevState,
        currentVersion: data.currentVersion,
        latestVersion: data.latestVersion || prevState.latestVersion,
        needsUpdate: data.needsUpdate || prevState.needsUpdate
      }));
    } catch (err) {
      console.error("Erro ao buscar versão atual:", err);
    }
  }, []);

  const checkForUpdates = useCallback(async () => {
    setCheckingUpdate(true);
    try {
      const { data } = await api.get("/system-update/check");
      
      setUpdateInfo(prevState => ({
        ...prevState,
        latestVersion: data.latestVersion,
        needsUpdate: data.needsUpdate,
        releaseNotes: data.releaseNotes
      }));
      
      
      toast.success(t("systemUpdate.checkSuccess"));
    } catch (err) {
      toastError(err);
    } finally {
      setCheckingUpdate(false);
    }
  }, []);

  const getUpdateStatus = useCallback(async () => {
    try {
      const { data } = await api.get("/system-update/status");
      setUpdateStatus(data);
      
      if (data.status === "completed" || data.status === "error") {
        if (statusPolling) {
          clearInterval(statusPolling);
          setStatusPolling(null);
        }
        
        if (data.status === "completed") {
          toast.success(t("systemUpdate.updateCompleted"));
        } else if (data.status === "error") {
          toast.error(data.error || t("systemUpdate.updateError"));
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [statusPolling]);

  const getBackups = useCallback(async () => {
    setLoadingBackups(true);
    try {
      const { data } = await api.get("/system-update/backups");
      setBackups(data.backups || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoadingBackups(false);
    }
  }, []);

  const startUpdate = async () => {
    setInstallingUpdate(true);
    try {
      await api.post("/system-update/install");
      toast.success(t("systemUpdate.updateStarted"));
      
      const interval = setInterval(() => {
        getUpdateStatus();
      }, 3000);
      setStatusPolling(interval);
      
      setUpdateDialogOpen(false);
    } catch (err) {
      toastError(err);
    } finally {
      setInstallingUpdate(false);
    }
  };

  const restoreBackup = async () => {
    if (!selectedBackup) return;
    
    try {
      await api.post(`/system-update/restore/${selectedBackup}`);
      toast.success(t("systemUpdate.restoreStarted"));
      
      const interval = setInterval(() => {
        getUpdateStatus();
      }, 3000);
      setStatusPolling(interval);
      
      setRestoreDialogOpen(false);
    } catch (err) {
      toastError(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const parseBackupFileName = (fileName) => {
    const match = fileName.match(/backup-v([\d.]+)-(.+)\.tar\.gz/);
    if (!match) return { version: "", date: "" };
    
    const version = match[1];
    const dateString = match[2].replace(/-/g, ":").replace("T", " ");
    
    return { version, date: dateString };
  };

  const renderUpdateStatus = () => {
    switch (updateStatus.status) {
      case "checking":
        return (
          <Alert severity="info" icon={<RefreshIcon />}>
            {updateStatus.message || t("systemUpdate.checking")}
          </Alert>
        );
      case "downloading":
        return (
          <Alert severity="info" icon={<DownloadIcon />}>
            {updateStatus.message || t("systemUpdate.downloading")}
          </Alert>
        );
      case "installing":
        return (
          <Alert severity="warning" icon={<SystemUpdateIcon />}>
            {updateStatus.message || t("systemUpdate.installing")}
          </Alert>
        );
      case "completed":
        return (
          <Alert severity="success" icon={<CheckCircleIcon />}>
            {updateStatus.message || t("systemUpdate.completed")}
          </Alert>
        );
      case "error":
        return (
          <Alert severity="error" icon={<WarningIcon />}>
            {updateStatus.message || t("systemUpdate.error")}
            {updateStatus.error && (
              <Typography variant="body2" component="p" sx={{ mt: 1 }}>
                {updateStatus.error}
              </Typography>
            )}
          </Alert>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    getUpdateStatus();
    getCurrentVersion();
    checkForUpdates();
    getBackups();
    
    return () => {
      if (statusPolling) {
        clearInterval(statusPolling);
      }
    };
  }, [checkForUpdates, getCurrentVersion, getUpdateStatus, getBackups, statusPolling]);
  
  const lastCompareRef = useRef({ current: "", latest: "" });
  
  useEffect(() => {
    const currentVersion = updateInfo.currentVersion;
    const latestVersion = updateInfo.latestVersion;
    
    if (currentVersion && latestVersion) {
      if (lastCompareRef.current.current === currentVersion && 
          lastCompareRef.current.latest === latestVersion) {
        return; 
      }
      
      lastCompareRef.current = { current: currentVersion, latest: latestVersion };
      
      compareVersions(currentVersion, latestVersion);
    }
  }, [updateInfo.currentVersion, updateInfo.latestVersion, compareVersions]);

  return (
    <MainContainer>
      <MainHeader>
        <Title>{t("systemUpdate.title")}</Title>
      </MainHeader>
      <Container component={Root} maxWidth="lg" sx={{ height: 'calc(100vh - 100px)', overflow: 'auto' }}>
        <RefreshButtonStyled
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={checkForUpdates}
          disabled={checkingUpdate}
        >
          {checkingUpdate ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            t("systemUpdate.checkUpdates")
          )}
        </RefreshButtonStyled>

        {updateStatus.status !== "idle" && (
          <StyledCard>
            <StyledCardHeader
              title={t("systemUpdate.updateStatus")}
            />
            <StyledCardContent>
              {renderUpdateStatus()}
              {(updateStatus.status === "downloading" ||
                updateStatus.status === "installing") && (
                <ProgressContainer>
                  <LinearProgress
                    variant="determinate"
                    value={updateStatus.progress}
                  />
                  <ProgressText>
                    <Typography variant="body2" color="textSecondary">
                      {updateStatus.message}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {updateStatus.progress}%
                    </Typography>
                  </ProgressText>
                </ProgressContainer>
              )}
            </StyledCardContent>
          </StyledCard>
        )}

        <StyledCard>
          <StyledCardHeader
            title={t("systemUpdate.versionInfo")}
          />
          <StyledCardContent>
            <CardWrapper container spacing={4}>
              <Grid item xs={12} md={6}>
                <VersionCard status={updateInfo.needsUpdate ? "outdated" : "updated"}>
                  <VersionIcon status={updateInfo.needsUpdate ? "outdated" : "updated"}>
                    {updateInfo.needsUpdate ? (
                      <WarningIcon />
                    ) : (
                      <CheckCircleIcon />
                    )}
                  </VersionIcon>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      Versão Atual do Sistema
                    </Typography>
                    <VersionValue color={updateInfo.needsUpdate ? "error" : "success"}>
                      {updateInfo.currentVersion || "N/A"}
                    </VersionValue>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {updateInfo.needsUpdate 
                        ? "Sistema desatualizado"
                        : "Sistema atualizado"}
                    </Typography>
                  </CardContent>
                </VersionCard>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <VersionCard status="latest">
                  <VersionIcon status="latest">
                    <CheckCircleIcon />
                  </VersionIcon>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      Última Versão Disponível
                    </Typography>
                    <VersionValue>
                      {updateInfo.latestVersion || "N/A"}
                    </VersionValue>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      Versão mais recente disponível
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontStyle: "italic" }}>
                      Disponibilizada em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </CardContent>
                </VersionCard>
              </Grid>
            </CardWrapper>

            {updateInfo.lastUpdateCheck && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {t("systemUpdate.lastChecked")}: {formatDate(updateInfo.lastUpdateCheck)}
              </Typography>
            )}

          </StyledCardContent>
        </StyledCard>

        {updateInfo.needsUpdate ? (
          <MessageBox type="warning">
            <Box display="flex" alignItems="flex-start">
              <WarningIcon color="warning" style={{ marginRight: 16, marginTop: 4 }} />
              <div>
                <Typography variant="h6" gutterBottom>
                  Atualização do Sistema Disponível
                </Typography>
                <Typography variant="body1" paragraph>
                  Uma nova versão do Press-Ticket está disponível. Recomendamos atualizar para obter as últimas melhorias e correções.
                </Typography>
                
                {updateInfo.releaseNotes && (
                  <>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      Notas da Release
                    </Typography>
                    <Paper variant="outlined" sx={{ maxHeight: 300, overflow: "auto", p: 2, bgcolor: theme => theme.palette.background.default, borderRadius: theme => theme.shape.borderRadius }}>
                      <MarkdownStyled>{updateInfo.releaseNotes}</MarkdownStyled>
                    </Paper>
                  </>
                )}
                
                <Box mt={2} mb={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SystemUpdateIcon />}
                    onClick={() => setUpdateDialogOpen(true)}
                    disabled={installingUpdate || updateStatus.status !== "idle"}
                    fullWidth
                    size="large"
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      fontWeight: "bold",
                      boxShadow: 3,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {t("systemUpdate.installUpdate") || "Instalar Atualização"}
                  </Button>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Repositório: 
                  <Link 
                    href="https://github.com/rtenorioh/Press-Ticket" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ marginLeft: 8 }}
                  >
                    Press-Ticket no GitHub
                  </Link>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Documentação: 
                  <Link 
                    href="https://github.com/rtenorioh/Press-Ticket/blob/main/docs/INSTALL_AUTOMATICO_VPS.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ marginLeft: 8 }}
                  >
                    Guia de Atualização
                  </Link>
                </Typography>
              </div>
            </Box>
          </MessageBox>
        ) : (
          <MessageBox type="success">
            <Box display="flex" alignItems="flex-start">
              <CheckCircleIcon color="success" style={{ marginRight: 16, marginTop: 4 }} />
              <div>
                <Typography variant="h6" gutterBottom>
                  Sistema Atualizado
                </Typography>
                <Typography variant="body1" paragraph>
                  Seu sistema Press-Ticket está executando a versão mais recente disponível.
                </Typography>
              </div>
            </Box>
          </MessageBox>
        )}

        <StyledCard>
          <StyledCardHeader
            title={t("systemUpdate.backups")}
          />
          <StyledCardContent>
            {loadingBackups ? (
              <Box display="flex" justifyContent="center" my={2}>
                <CircularProgress />
              </Box>
            ) : backups.length > 0 ? (
              <BackupList>
                {backups.map((backup) => {
                  const { version, date } = parseBackupFileName(backup);
                  return (
                    <BackupItem key={backup}>
                      <ListItemText
                        primary={`v${version}`}
                        secondary={date}
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title={t("systemUpdate.restore")}>
                          <IconButton
                            edge="end"
                            onClick={() => {
                              setSelectedBackup(backup);
                              setRestoreDialogOpen(true);
                            }}
                            disabled={updateStatus.status !== "idle"}
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </BackupItem>
                  );
                })}
              </BackupList>
            ) : (
              <Alert severity="info" icon={<InfoIcon />}>
                {t("systemUpdate.noBackups")}
              </Alert>
            )}
          </StyledCardContent>
          <CardActions>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={getBackups}
            >
              {t("systemUpdate.refreshBackups")}
            </Button>
          </CardActions>
        </StyledCard>

        <Dialog
          open={restoreDialogOpen}
          onClose={() => setRestoreDialogOpen(false)}
        >
          <DialogTitle>{t("systemUpdate.confirmRestore")}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t("systemUpdate.restoreWarning")}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setRestoreDialogOpen(false)}
              color="primary"
            >
              {t("systemUpdate.cancel")}
            </Button>
            <Button
              onClick={restoreBackup}
              color="primary"
              variant="contained"
            >
              {t("systemUpdate.confirm")}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={updateDialogOpen}
          onClose={() => setUpdateDialogOpen(false)}
        >
          <DialogTitle>{t("systemUpdate.confirmUpdate")}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t("systemUpdate.updateWarning")}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setUpdateDialogOpen(false)}
              color="primary"
            >
              {t("systemUpdate.cancel")}
            </Button>
            <Button
              onClick={startUpdate}
              color="primary"
              variant="contained"
              disabled={installingUpdate}
            >
              {installingUpdate ? (
                <CircularProgress size={24} />
              ) : (
                t("systemUpdate.confirm")
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainContainer>
  );
};

export default SystemUpdate;

