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

  // Função para comparar versões e atualizar o estado
  const compareVersions = useCallback((currentVersion, latestVersion) => {
    // Evitar comparações desnecessárias
    if (!currentVersion || !latestVersion) return;
    
    // Obter a versão atual limpa (sem prefixo 'v')
    const currentVersionClean = String(currentVersion).replace(/^v/i, "").trim();
    // Obter a versão mais recente limpa (sem prefixo 'v')
    const latestVersionClean = String(latestVersion).replace(/^v/i, "").trim();
    
    // Verificar se as versões são iguais
    const isEqual = currentVersionClean === latestVersionClean && currentVersionClean !== "";
    
    // Atualizar o estado apenas se houver mudança
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
      
      // Atualizar apenas a versão atual sem chamar compareVersions aqui
      setUpdateInfo(prevState => ({
        ...prevState,
        currentVersion: data.currentVersion
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
      
      // Não chamamos compareVersions aqui, o useEffect cuidará disso
      
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
      // Verificar se já comparamos essas versões antes
      if (lastCompareRef.current.current === currentVersion && 
          lastCompareRef.current.latest === latestVersion) {
        return; // Evitar comparações redundantes
      }
      
      // Atualizar a referência
      lastCompareRef.current = { current: currentVersion, latest: latestVersion };
      
      // Comparar versões
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
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <VersionInfo>
                  <VersionText variant="body1">
                    {t("systemUpdate.currentVersion")}:
                  </VersionText>
                  <Typography variant="body1" fontWeight="bold">
                    {updateInfo.currentVersion}
                  </Typography>
                </VersionInfo>
              </Grid>
              <Grid item xs={12} md={6}>
                <VersionInfo>
                  <VersionText variant="body1">
                    {t("systemUpdate.latestVersion")}:
                  </VersionText>
                  <Typography variant="body1" fontWeight="bold">
                    v{updateInfo.latestVersion}
                  </Typography>
                  {updateInfo.versionsEqual ? (
                    <UpdateNotAvailableChip
                      label={t("systemUpdate.systemUpdated")}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  ) : updateInfo.needsUpdate ? (
                    <UpdateAvailableChip
                      label={t("systemUpdate.updateAvailable")}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  ) : (
                    <UpdateNotAvailableChip
                      label={t("systemUpdate.upToDate")}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </VersionInfo>
              </Grid>
            </Grid>

            {updateInfo.lastUpdateCheck && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {t("systemUpdate.lastChecked")}: {formatDate(updateInfo.lastUpdateCheck)}
              </Typography>
            )}

            {updateInfo.needsUpdate && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">
                  {t("systemUpdate.releaseNotes")}
                </Typography>
                <Paper variant="outlined" sx={{ maxHeight: 300, overflow: "auto", mt: 2, p: 2, bgcolor: theme => theme.palette.background.default, borderRadius: theme => theme.shape.borderRadius }}>
                  <MarkdownStyled>{updateInfo.releaseNotes}</MarkdownStyled>
                </Paper>
              </>
            )}
          </StyledCardContent>
          <CardActions>
            {updateInfo.needsUpdate && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SystemUpdateIcon />}
                onClick={() => setUpdateDialogOpen(true)}
                disabled={installingUpdate || updateStatus.status !== "idle"}
              >
                {t("systemUpdate.installUpdate")}
              </Button>
            )}
          </CardActions>
        </StyledCard>

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

