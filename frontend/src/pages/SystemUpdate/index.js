import React, { useState, useEffect, useCallback, useRef } from "react";
import { styled, alpha, keyframes } from "@mui/material/styles";
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
import Badge from "@mui/material/Badge";
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryIcon from '@mui/icons-material/History';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SecurityIcon from '@mui/icons-material/Security';

import api from "../../services/api";
import MainHeader from "../../components/MainHeader";
import MainContainer from "../../components/MainContainer";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const shimmerAnimation = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const Root = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(2),
  height: "100%",
  overflow: "auto",
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  overflow: "auto",
  flexDirection: "column",
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${theme.palette.background.paper} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: theme.palette.mode === 'dark'
    ? `0 8px 32px 0 ${alpha('#000', 0.37)}`
    : `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.15)}`,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  overflow: 'visible',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: theme.palette.mode === 'dark'
    ? `0 4px 20px 0 ${alpha('#000', 0.3)}`
    : `0 4px 20px 0 ${alpha(theme.palette.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 12px 40px 0 ${alpha('#000', 0.4)}`
      : `0 12px 40px 0 ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  paddingBottom: 0,
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.primary.dark, 0.1)
    : alpha(theme.palette.primary.light, 0.05),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '& .MuiCardHeader-title': {
    fontWeight: 600,
    fontSize: '1.1rem',
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  paddingTop: theme.spacing(1),
}));

const RefreshButtonStyled = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`
    : `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
  border: 0,
  boxShadow: theme.palette.mode === 'dark'
    ? `0 3px 15px 2px ${alpha(theme.palette.primary.dark, 0.3)}`
    : `0 3px 15px 2px ${alpha(theme.palette.primary.light, 0.3)}`,
  color: '#fff',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`
      : `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 6px 20px 4px ${alpha(theme.palette.primary.dark, 0.4)}`
      : `0 6px 20px 4px ${alpha(theme.palette.primary.light, 0.4)}`,
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
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
  maxHeight: 400,
  overflow: "auto",
  marginTop: theme.spacing(2),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.default, 0.6)
    : alpha(theme.palette.background.default, 0.8),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backdropFilter: 'blur(10px)',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.background.default, 0.1),
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: '4px',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.5),
    },
  },
}));

const ProgressContainer = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '& .MuiLinearProgress-root': {
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.1)
      : alpha(theme.palette.primary.main, 0.1),
  },
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  },
}));

const ProgressText = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  marginTop: theme.spacing(0.5),
}));

const BackupList = styled(List)(({ theme }) => ({
  maxHeight: 400,
  overflow: "auto",
  padding: theme.spacing(2, 0),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.background.default, 0.1),
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: '4px',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.5),
    },
  },
}));

const BackupItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.6)
    : alpha(theme.palette.background.paper, 0.8),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 4px 20px ${alpha('#000', 0.3)}`
      : `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 4,
    height: '60%',
    background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    borderRadius: '0 4px 4px 0',
  },
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
  marginTop: theme.spacing(3),
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.03)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
    backgroundSize: '200% 100%',
    animation: `${shimmerAnimation} 3s linear infinite`,
  },
}));

const VersionCard = styled(Card)(({ theme, status }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  borderRadius: theme.spacing(2.5),
  overflow: 'hidden',
  background: theme.palette.mode === 'dark'
    ? status === "outdated"
      ? `linear-gradient(135deg, ${alpha(theme.palette.error.dark, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
      : `linear-gradient(135deg, ${alpha(theme.palette.success.dark, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
    : status === "outdated"
      ? `linear-gradient(135deg, ${alpha(theme.palette.error.light, 0.1)} 0%, ${theme.palette.background.paper} 100%)`
      : `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.1)} 0%, ${theme.palette.background.paper} 100%)`,
  border: `2px solid ${status === "outdated"
    ? alpha(theme.palette.error.main, 0.3)
    : alpha(theme.palette.success.main, 0.3)}`,
  boxShadow: theme.palette.mode === 'dark'
    ? `0 8px 32px ${alpha('#000', 0.3)}`
    : `0 8px 32px ${status === "outdated"
      ? alpha(theme.palette.error.main, 0.15)
      : alpha(theme.palette.success.main, 0.15)}`,
  backdropFilter: 'blur(10px)',
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: theme.palette.mode === 'dark'
      ? `0 16px 48px ${alpha('#000', 0.4)}`
      : `0 16px 48px ${status === "outdated"
        ? alpha(theme.palette.error.main, 0.25)
        : alpha(theme.palette.success.main, 0.25)}`,
    border: `2px solid ${status === "outdated"
      ? alpha(theme.palette.error.main, 0.5)
      : alpha(theme.palette.success.main, 0.5)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: status === "outdated"
      ? `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.light})`
      : `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
  },
}));

const VersionIcon = styled(Box)(({ theme, status }) => ({
  position: "absolute",
  top: 20,
  right: 20,
  width: 56,
  height: 56,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: status === "outdated"
    ? `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
    : `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
  color: "#fff",
  boxShadow: theme.palette.mode === 'dark'
    ? `0 8px 24px ${alpha(status === "outdated" ? theme.palette.error.main : theme.palette.success.main, 0.4)}`
    : `0 8px 24px ${alpha(status === "outdated" ? theme.palette.error.main : theme.palette.success.main, 0.3)}`,
  animation: status === "outdated" ? `${pulseAnimation} 2s ease-in-out infinite` : 'none',
  '& .MuiSvgIcon-root': {
    fontSize: '2rem',
  },
}));

const VersionValue = styled(Typography)(({ theme }) => ({
  fontSize: "2.5rem",
  fontWeight: 800,
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  letterSpacing: '-0.02em',
}));

const MessageBox = styled(Paper)(({ theme, type }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
  background: theme.palette.mode === 'dark'
    ? type === "success"
      ? `linear-gradient(135deg, ${alpha(theme.palette.success.dark, 0.2)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
      : `linear-gradient(135deg, ${alpha(theme.palette.warning.dark, 0.2)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
    : type === "success"
      ? `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.15)} 0%, ${theme.palette.background.paper} 100%)`
      : `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.15)} 0%, ${theme.palette.background.paper} 100%)`,
  borderLeft: `6px solid ${type === "success"
    ? theme.palette.success.main
    : theme.palette.warning.main}`,
  borderRadius: theme.spacing(2),
  boxShadow: theme.palette.mode === 'dark'
    ? `0 8px 32px ${alpha('#000', 0.3)}`
    : `0 8px 32px ${type === "success"
      ? alpha(theme.palette.success.main, 0.15)
      : alpha(theme.palette.warning.main, 0.15)}`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(type === "success"
    ? theme.palette.success.main
    : theme.palette.warning.main, 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '200px',
    height: '200px',
    background: type === "success"
      ? `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.1)} 0%, transparent 70%)`
      : `radial-gradient(circle, ${alpha(theme.palette.warning.main, 0.1)} 0%, transparent 70%)`,
    transform: 'translate(30%, -30%)',
  },
}));

const StatusBadge = styled(Chip)(({ theme, statusType }) => ({
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: theme.spacing(0.5, 1),
  height: 'auto',
  background: statusType === 'success'
    ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
    : statusType === 'error'
      ? `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
      : `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
  color: '#fff',
  boxShadow: `0 4px 12px ${alpha(statusType === 'success'
    ? theme.palette.success.main
    : statusType === 'error'
      ? theme.palette.error.main
      : theme.palette.info.main, 0.3)}`,
  '& .MuiChip-icon': {
    color: '#fff',
  },
}));

const ActionButton = styled(Button)(({ theme, variant: buttonVariant }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  ...(buttonVariant === 'contained' && {
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
    color: '#fff',
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
    '&:hover': {
      background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.5)}`,
    },
  }),
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
    publishedAt: null,
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
        releaseNotes: data.releaseNotes,
        publishedAt: data.publishedAt
      }));
      
      
      toast.success(t("systemUpdate.checkSuccess"));
    } catch (err) {
      toastError(err, t);
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
      toastError(err,t);
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
      toastError(err, t);
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
      toastError(err, t);
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
    // Executar apenas uma vez ao montar o componente
    getUpdateStatus();
    getCurrentVersion();
    checkForUpdates();
    getBackups();
    
    return () => {
      if (statusPolling) {
        clearInterval(statusPolling);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vazio = executa apenas uma vez no mount
  
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
        <HeaderSection>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                🔄 Atualizações do Sistema
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Mantenha seu Press-Ticket sempre atualizado com as últimas melhorias e correções
              </Typography>
            </Box>
            <RefreshButtonStyled
              startIcon={checkingUpdate ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
              onClick={checkForUpdates}
              disabled={checkingUpdate}
            >
              {checkingUpdate ? "Verificando..." : t("systemUpdate.checkUpdates") || "Verificar Atualizações"}
            </RefreshButtonStyled>
          </Box>
        </HeaderSection>

        {updateStatus.status !== "idle" && (
          <StyledCard>
            <StyledCardHeader
              avatar={
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: theme => updateStatus.status === "completed"
                      ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
                      : updateStatus.status === "error"
                        ? `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`
                        : `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                    color: '#fff',
                  }}
                >
                  {updateStatus.status === "completed" ? (
                    <CheckCircleIcon />
                  ) : updateStatus.status === "error" ? (
                    <WarningIcon />
                  ) : (
                    <SystemUpdateIcon />
                  )}
                </Box>
              }
              title={
                <Typography variant="h6" fontWeight={600}>
                  {t("systemUpdate.updateStatus") || "Status da Atualização"}
                </Typography>
              }
              subheader={updateStatus.message || "Acompanhe o progresso da atualização"}
            />
            <StyledCardContent>
              {renderUpdateStatus()}
              {(updateStatus.status === "downloading" ||
                updateStatus.status === "installing") && (
                <ProgressContainer>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Box flex={1}>
                      <LinearProgress
                        variant="determinate"
                        value={updateStatus.progress}
                      />
                    </Box>
                    <Chip
                      label={`${updateStatus.progress}%`}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 600, minWidth: 60 }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {updateStatus.message}
                  </Typography>
                </ProgressContainer>
              )}
            </StyledCardContent>
          </StyledCard>
        )}

        <StyledCard>
          <StyledCardHeader
            avatar={
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  color: '#fff',
                }}
              >
                <InfoIcon />
              </Box>
            }
            title={
              <Typography variant="h6" fontWeight={600}>
                {t("systemUpdate.versionInfo") || "Informações da Versão"}
              </Typography>
            }
            subheader="Compare a versão atual com a mais recente disponível"
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
                  <CardContent sx={{ pt: 3 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <SecurityIcon color="primary" fontSize="small" />
                      <Typography variant="overline" color="textSecondary" fontWeight={600}>
                        Versão Atual do Sistema
                      </Typography>
                    </Box>
                    <VersionValue>
                      {updateInfo.currentVersion || "N/A"}
                    </VersionValue>
                    <Box mt={2}>
                      <StatusBadge 
                        statusType={updateInfo.needsUpdate ? "error" : "success"}
                        icon={updateInfo.needsUpdate ? <WarningIcon /> : <CheckCircleIcon />}
                        label={updateInfo.needsUpdate ? "Sistema Desatualizado" : "Sistema Atualizado"}
                        size="medium"
                      />
                    </Box>
                  </CardContent>
                </VersionCard>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <VersionCard status="latest">
                  <VersionIcon status="latest">
                    <RocketLaunchIcon />
                  </VersionIcon>
                  <CardContent sx={{ pt: 3 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <TrendingUpIcon color="primary" fontSize="small" />
                      <Typography variant="overline" color="textSecondary" fontWeight={600}>
                        Última Versão Disponível
                      </Typography>
                    </Box>
                    <VersionValue>
                      {updateInfo.latestVersion || "N/A"}
                    </VersionValue>
                    <Box mt={2}>
                      <StatusBadge 
                        statusType="success"
                        icon={<RocketLaunchIcon />}
                        label="Versão Mais Recente"
                        size="medium"
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block', fontStyle: "italic" }}>
                      📅 Disponibilizada em: {updateInfo.publishedAt 
                        ? new Date(updateInfo.publishedAt).toLocaleDateString('pt-BR') + ' às ' + new Date(updateInfo.publishedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        : 'Data não disponível'}
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
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: theme => `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                  flexShrink: 0,
                  boxShadow: theme => `0 4px 20px ${alpha(theme.palette.warning.main, 0.4)}`,
                }}
              >
                <SystemUpdateIcon sx={{ color: '#fff', fontSize: '2rem' }} />
              </Box>
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography variant="h5" fontWeight={700}>
                    Atualização do Sistema Disponível
                  </Typography>
                  <StatusBadge
                    statusType="error"
                    icon={<WarningIcon />}
                    label="Requer Atenção"
                    size="small"
                  />
                </Box>
                <Typography variant="body1" paragraph color="textSecondary">
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
                
                <Box mt={3} mb={2}>
                  <ActionButton
                    variant="contained"
                    startIcon={<SystemUpdateIcon />}
                    onClick={() => setUpdateDialogOpen(true)}
                    disabled={installingUpdate || updateStatus.status !== "idle"}
                    fullWidth
                    size="large"
                  >
                    {installingUpdate ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />
                        Instalando...
                      </>
                    ) : (
                      t("systemUpdate.installUpdate") || "Instalar Atualização Agora"
                    )}
                  </ActionButton>
                </Box>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    background: theme => theme.palette.mode === 'dark'
                      ? alpha(theme.palette.background.default, 0.5)
                      : alpha(theme.palette.background.default, 0.7),
                    border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    🔗 Links Úteis
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Link 
                      href="https://github.com/rtenorioh/Press-Ticket" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      📦 Repositório: Press-Ticket no GitHub
                    </Link>
                    <Link 
                      href="https://github.com/rtenorioh/Press-Ticket/blob/main/docs/INSTALL_AUTOMATICO_VPS.md" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      📚 Documentação: Guia de Atualização
                    </Link>
                  </Box>
                </Box>
              </Box>
            </Box>
          </MessageBox>
        ) : (
          <MessageBox type="success">
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: theme => `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                  flexShrink: 0,
                  boxShadow: theme => `0 4px 20px ${alpha(theme.palette.success.main, 0.4)}`,
                }}
              >
                <CheckCircleIcon sx={{ color: '#fff', fontSize: '2rem' }} />
              </Box>
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography variant="h5" fontWeight={700}>
                    Sistema Atualizado
                  </Typography>
                  <StatusBadge
                    statusType="success"
                    icon={<CheckCircleIcon />}
                    label="Tudo Certo"
                    size="small"
                  />
                </Box>
                <Typography variant="body1" color="textSecondary">
                  🎉 Seu sistema Press-Ticket está executando a versão mais recente disponível. Não é necessário realizar nenhuma ação no momento.
                </Typography>
              </Box>
            </Box>
          </MessageBox>
        )}

        <StyledCard>
          <StyledCardHeader
            avatar={
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  color: '#fff',
                }}
              >
                <HistoryIcon />
              </Box>
            }
            title={
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6" fontWeight={600}>
                  {t("systemUpdate.backups") || "Backups do Sistema"}
                </Typography>
                {backups.length > 0 && (
                  <Chip 
                    label={`${backups.length} ${backups.length === 1 ? 'backup' : 'backups'}`}
                    size="small"
                    color="primary"
                  />
                )}
              </Box>
            }
            subheader="Histórico de backups realizados automaticamente"
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
                      <Box display="flex" alignItems="center" gap={2} flex={1}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.dark, 0.05)})`,
                            border: theme => `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          }}
                        >
                          <HistoryIcon color="primary" />
                        </Box>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={600}>
                              Versão {version}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="textSecondary">
                              📅 {date}
                            </Typography>
                          }
                        />
                      </Box>
                      <ListItemSecondaryAction>
                        <Tooltip title={t("systemUpdate.restore") || "Restaurar este backup"}>
                          <IconButton
                            edge="end"
                            onClick={() => {
                              setSelectedBackup(backup);
                              setRestoreDialogOpen(true);
                            }}
                            disabled={updateStatus.status !== "idle"}
                            sx={{
                              background: theme => alpha(theme.palette.primary.main, 0.1),
                              '&:hover': {
                                background: theme => alpha(theme.palette.primary.main, 0.2),
                              },
                            }}
                          >
                            <RestoreIcon color="primary" />
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
          <CardActions sx={{ p: 2 }}>
            <ActionButton
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={getBackups}
              sx={{ borderRadius: 2 }}
            >
              {t("systemUpdate.refreshBackups") || "Atualizar Lista"}
            </ActionButton>
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
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <ActionButton
              onClick={() => setRestoreDialogOpen(false)}
              variant="outlined"
            >
              {t("systemUpdate.cancel") || "Cancelar"}
            </ActionButton>
            <ActionButton
              onClick={restoreBackup}
              variant="contained"
              startIcon={<RestoreIcon />}
            >
              {t("systemUpdate.confirm") || "Confirmar Restauração"}
            </ActionButton>
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
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <ActionButton
              onClick={() => setUpdateDialogOpen(false)}
              variant="outlined"
              disabled={installingUpdate}
            >
              {t("systemUpdate.cancel") || "Cancelar"}
            </ActionButton>
            <ActionButton
              onClick={startUpdate}
              variant="contained"
              disabled={installingUpdate}
              startIcon={installingUpdate ? <CircularProgress size={18} color="inherit" /> : <SystemUpdateIcon />}
            >
              {installingUpdate ? "Instalando..." : (t("systemUpdate.confirm") || "Confirmar Atualização")}
            </ActionButton>
          </DialogActions>
        </Dialog>
      </Container>
    </MainContainer>
  );
};

export default SystemUpdate;

