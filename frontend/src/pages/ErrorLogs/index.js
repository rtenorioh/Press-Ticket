import React, { useState, useEffect } from "react";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  TableContainer,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Tooltip,
  Chip,
  CircularProgress,
  Box,
  Card,
  CardContent
} from "@mui/material";
import { styled, alpha, keyframes } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BugReportIcon from "@mui/icons-material/BugReport";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import CodeIcon from "@mui/icons-material/Code";
import StorageIcon from "@mui/icons-material/Storage";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { useTranslation } from "react-i18next";
import ErrorLogService from "../../services/ErrorLogService";
import useAuth from "../../hooks/useAuth";

// Animações
const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Container principal com gradiente
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${theme.palette.background.paper} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: theme.palette.mode === 'dark'
    ? `0 8px 32px 0 ${alpha('#000', 0.37)}`
    : `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.15)}`,
  animation: `${fadeIn} 0.5s ease-out`,
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 180px)',
  '&::-webkit-scrollbar': {
    width: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.divider, 0.1),
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: 4,
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.5),
    }
  }
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  }
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.8)
      : alpha('#fff', 0.9),
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    '&:hover': {
      background: theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.9)
        : '#fff',
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    '&.Mui-focused': {
      background: '#fff',
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
    }
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1, 3),
  fontWeight: 600,
  textTransform: 'none',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.6)
    : alpha('#fff', 0.8),
  backdropFilter: 'blur(10px)',
  overflowX: 'auto',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: 8,
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.divider, 0.1),
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: 4,
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.5),
    }
  }
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)}, ${alpha(theme.palette.primary.main, 0.2)})`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`,
  '& .MuiTableCell-head': {
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.08)
      : alpha(theme.palette.primary.main, 0.04),
    transform: 'scale(1.01)',
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
  }
}));

const SeverityChip = styled(Chip)(({ theme, severitytype }) => {
  const colors = {
    error: {
      bg: alpha(theme.palette.error.main, 0.15),
      color: theme.palette.error.main,
      border: theme.palette.error.main,
    },
    warning: {
      bg: alpha(theme.palette.warning.main, 0.15),
      color: theme.palette.warning.main,
      border: theme.palette.warning.main,
    },
    info: {
      bg: alpha(theme.palette.info.main, 0.15),
      color: theme.palette.info.main,
      border: theme.palette.info.main,
    },
    default: {
      bg: alpha(theme.palette.grey[500], 0.15),
      color: theme.palette.grey[700],
      border: theme.palette.grey[500],
    }
  };
  
  const style = colors[severitytype] || colors.default;
  
  return {
    background: style.bg,
    color: style.color,
    border: `1.5px solid ${alpha(style.border, 0.3)}`,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: 28,
    transition: 'all 0.2s ease',
    '&:hover': {
      background: style.color,
      color: '#fff',
      transform: 'scale(1.05)',
    }
  };
});

const SourceChip = styled(Chip)(({ theme, sourcetype }) => {
  const isPrimary = sourcetype === 'backend';
  
  return {
    background: isPrimary
      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.dark, 0.1)})`
      : `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.15)}, ${alpha(theme.palette.secondary.dark, 0.1)})`,
    color: isPrimary ? theme.palette.primary.main : theme.palette.secondary.main,
    border: `1.5px solid ${alpha(isPrimary ? theme.palette.primary.main : theme.palette.secondary.main, 0.3)}`,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: 28,
    transition: 'all 0.2s ease',
    '&:hover': {
      background: isPrimary
        ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
        : `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
      color: '#fff',
      transform: 'scale(1.05)',
    }
  };
});

const LogDetailContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.default, 0.8)
    : alpha(theme.palette.grey[100], 0.8),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  fontFamily: "'Fira Code', 'Courier New', monospace",
  fontSize: '0.875rem',
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  maxHeight: "400px",
  overflowY: "auto",
  boxShadow: `inset 0 2px 8px ${alpha('#000', 0.1)}`,
  '&::-webkit-scrollbar': {
    width: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.divider, 0.1),
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: 4,
  }
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.default, 0.6)})`
    : `linear-gradient(135deg, ${alpha('#fff', 0.9)}, ${alpha(theme.palette.grey[50], 0.8)})`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)}, ${alpha(theme.palette.background.paper, 0.1)})`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha('#fff', 0.5)})`,
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
}));

function ErrorLogs() {
  const { t } = useTranslation();
  const { user } = useAuth();  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    source: "",
    severity: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }
    
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const loadMoreLogs = () => {
    if (loading) {
      return;
    }
    
    if (logs.length >= totalCount && totalCount > 0) {
      setHasMore(false);
      return;
    }
    
    setLoading(true);
    
    const nextPage = page + 1;
    
    const searchParams = {
      pageNumber: nextPage,
      limit: rowsPerPage,
      searchTerm,
      ...filters
    };
    
    const currentLogs = [...logs];
    
    let loadingTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 10000);
    
    ErrorLogService.getLogs(searchParams)
      .then(response => {
        clearTimeout(loadingTimeout);
        
        if (response && response.logs) {
          const newLogs = response.logs;
          const count = response.count || 0;
          
          setTotalCount(count);
          
          if (newLogs && newLogs.length > 0) {
            const updatedLogs = [...currentLogs, ...newLogs];
            setLogs(updatedLogs);
            setPage(nextPage);
            const hasMoreLogs = updatedLogs.length < count;
            setHasMore(hasMoreLogs);
          } else {
            setLogs(currentLogs);
            setHasMore(false);
          }
        } else {
          setLogs(currentLogs);
          toast.error('Resposta inválida ao carregar mais logs');
          setHasMore(false);
        }
      })
      .catch(error => {
        clearTimeout(loadingTimeout);
        setLogs(currentLogs);
        toast.error('Erro ao carregar mais logs');
        setHasMore(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleScroll = (e) => {
    if (loading || !hasMore) {
      return;
    }
    
    if (!e.currentTarget) {
      return;
    }
    
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    if (scrollHeight - scrollTop - clientHeight < 100) {
      setTimeout(() => {
        if (!loading && hasMore) {
          loadMoreLogs();
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLogs = async () => {
    try {
      if (loading) {
        return;
      }
      
      setLoading(true);
      
      const searchParams = {
        pageNumber: 1,
        limit: rowsPerPage,
        searchTerm,
        ...filters
      };
      
      let loadingTimeout = setTimeout(() => {
        if (loading) {
          setLoading(false);
        }
      }, 10000);
      
      try {
        const response = await ErrorLogService.getLogs(searchParams);
        clearTimeout(loadingTimeout);
        
        if (response && response.logs) {
          const fetchedLogs = response.logs;
          const count = response.count || 0;
          
          setTotalCount(count);
          
          if (fetchedLogs && fetchedLogs.length > 0) {
            setLogs(fetchedLogs);
            setPage(1);
            const hasMoreLogs = fetchedLogs.length < count;
            setHasMore(hasMoreLogs);
          } else {
            setLogs([]);
            setTotalCount(0);
            setHasMore(false);
            setPage(1);
          }
        } else {
          setLogs([]);
          setTotalCount(0);
          setHasMore(false);
          setPage(1);
        }
      } catch (apiError) {
        clearTimeout(loadingTimeout);
        throw apiError;
      }
    } catch (error) {
      toast.error(t("errorLogs.fetchError"));
      
      setLogs([]);
      setTotalCount(0);
      setHasMore(false);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchLogs();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const resetAndFetchLogs = () => {
    setPage(0);
    setLogs([]);
    setHasMore(true);
    fetchLogs(false);
  };

  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };

  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false);
  };

  const handleApplyFilters = () => {
    setPage(0);
    fetchLogs();
    handleCloseFilterDialog();
  };

  const handleResetFilters = () => {
    setFilters({
      source: "",
      severity: "",
      startDate: "",
      endDate: ""
    });
    setPage(0);
    fetchLogs();
    handleCloseFilterDialog();
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteOldLogs = async () => {
    try {
      setLoading(true);
      
      if (!ErrorLogService || !ErrorLogService.deleteOldLogs) {
        console.error("ErrorLogService.deleteOldLogs não está disponível");
        toast.error(t("errorLogs.deleteError", "Erro ao excluir logs antigos"));
        setLoading(false);
        return;
      }
      
      await ErrorLogService.deleteOldLogs();
      toast.success(t("errorLogs.deleteSuccess", "Logs antigos excluídos com sucesso"));
      fetchLogs();
    } catch (error) {
      console.error("Erro ao excluir logs antigos:", error);
      toast.error(t("errorLogs.deleteError", "Erro ao excluir logs antigos"));
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  const handleOpenLogDetail = async (logId) => {
    try {
      setLoading(true);
      
      if (!ErrorLogService || !ErrorLogService.findById) {
        console.error("ErrorLogService.findById não está disponível");
        toast.error(t("errorLogs.detailError", "Erro ao buscar detalhes do log"));
        setLoading(false);
        return;
      }
      
      const response = await ErrorLogService.findById(logId);
      
      if (!response || !response.data) {
        console.error("Resposta inválida do servidor");
        toast.error(t("errorLogs.detailError", "Erro ao buscar detalhes do log"));
        setLoading(false);
        return;
      }
      
      setSelectedLog(response.data);
      setDetailDialogOpen(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes do log:", error);
      toast.error(t("errorLogs.detailError", "Erro ao buscar detalhes do log"));
      
      try {
        const localLog = ErrorLogService.getLocalLogById(logId);
        if (localLog) {
          setSelectedLog(localLog);
          setDetailDialogOpen(true);
          toast.info(t("errorLogs.usingLocalLog", "Usando log armazenado localmente"));
        }
      } catch (localError) {
        console.error("Erro ao buscar log local:", localError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedLog(null);
  };

  const handleCopyLogDetails = () => {
    if (!selectedLog) return;

    const logDetails = `
Detalhes do Log    
ID: ${selectedLog.id}
Data: ${selectedLog.createdAt ? format(parseISO(selectedLog.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : "Data desconhecida"}
Origem: ${selectedLog.source || "-"}
Severidade: ${selectedLog.severity || "error"}
Componente: ${selectedLog.component || "-"}
Usuário: ${selectedLog.user || "-"}
URL: ${selectedLog.url || "-"}
User Agent: ${selectedLog.userAgent || "-"}
Mensagem: ${selectedLog.message || "-"}
Stack Trace:
${selectedLog.stack || "-"}
    `.trim();

    navigator.clipboard.writeText(logDetails)
      .then(() => {
        toast.success("Informações do log copiadas para a área de transferência");
      })
      .catch((error) => {
        console.error("Erro ao copiar:", error);
        toast.error("Erro ao copiar informações do log");
      });
  };

  const handleDownloadLogs = async () => {
    try {
      if (!ErrorLogService || !ErrorLogService.downloadLogs) {
        console.error("ErrorLogService.downloadLogs não está disponível");
        toast.error(t("errorLogs.downloadError", "Erro ao baixar logs"));
        return;
      }
      
      if (!logs || logs.length === 0) {
        toast.info(t("errorLogs.noLogsToDownload", "Não há logs para baixar"));
        return;
      }
      
      await ErrorLogService.downloadLogs({
        searchTerm,
        ...filters
      });
      toast.success(t("errorLogs.downloadSuccess", "Logs baixados com sucesso"));
    } catch (error) {
      console.error("Erro ao baixar logs:", error);
      toast.error(t("errorLogs.downloadError", "Erro ao baixar logs"));
    }
  };

  const renderSeverityChip = (severity) => {
    const severityType = severity || "default";
    const icons = {
      error: <BugReportIcon fontSize="small" />,
      warning: <WarningAmberIcon fontSize="small" />,
      info: <InfoIcon fontSize="small" />,
      default: <InfoIcon fontSize="small" />
    };
    
    return (
      <SeverityChip 
        label={severity || "desconhecido"}
        severitytype={severityType}
        size="small"
        icon={icons[severityType] || icons.default}
      />
    );
  };

  const renderSourceChip = (source) => {
    const sourceType = source || "frontend";
    const icons = {
      backend: <StorageIcon fontSize="small" />,
      frontend: <CodeIcon fontSize="small" />
    };
    
    return (
      <SourceChip 
        label={source || "desconhecido"}
        sourcetype={sourceType}
        size="small"
        icon={icons[sourceType] || icons.frontend}
      />
    );
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{t("errorLogs.title")} {logs.length > 0 ? `(${totalCount})` : ""}</Title>
        <MainHeaderButtonsWrapper>
          <Tooltip title={t("errorLogs.buttons.refresh", "Atualizar")}>
            <IconButton color="primary" onClick={resetAndFetchLogs} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("errorLogs.buttons.filter", "Filtrar")}>
            <IconButton color="primary" onClick={handleOpenFilterDialog}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("errorLogs.buttons.download", "Download")}>
            <IconButton color="primary" onClick={handleDownloadLogs} disabled={!logs || logs.length === 0}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          {user && user.profile === "admin" && (
            <Tooltip title={t("errorLogs.buttons.deleteOld", "Remover Antigos")}>
              <IconButton color="secondary" onClick={handleOpenDeleteDialog}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <StyledPaper elevation={0}>
        <HeaderSection>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme => `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                boxShadow: theme => `0 4px 20px ${alpha(theme.palette.error.main, 0.4)}`,
              }}
            >
              <BugReportIcon sx={{ color: '#fff', fontSize: '2rem' }} />
            </Box>
            <Box flex={1}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                🐛 Log de Erros do Sistema
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Monitore e analise erros em tempo real para manter o sistema saudável
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Chip 
                label={`${totalCount} Registros`}
                color="primary"
                sx={{ fontWeight: 600 }}
              />
              {logs.length > 0 && logs.length < totalCount && (
                <Chip 
                  label={`Exibindo ${logs.length}`}
                  color="default"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        </HeaderSection>

        <SearchContainer>
          <SearchField
            placeholder={t("errorLogs.searchPlaceholder", "Buscar por mensagem de erro...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchTerm("")} size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            fullWidth
            size="medium"
          />
          <ActionButton
            variant="contained"
            onClick={resetAndFetchLogs}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <SearchIcon />}
            sx={{ minWidth: 140 }}
          >
            {loading ? "Buscando..." : t("errorLogs.buttons.search", "Buscar")}
          </ActionButton>
        </SearchContainer>

        <StyledTableContainer 
          sx={{ maxHeight: "calc(100vh - 550px)", minHeight: "400px" }}
          onScroll={handleScroll}
        >
          <Table size="small" stickyHeader sx={{ minWidth: 1200 }}>
            <StyledTableHead>
              <TableRow>
                <TableCell sx={{ width: 80, minWidth: 80 }}>{t("errorLogs.table.id", "ID")}</TableCell>
                <TableCell sx={{ width: 180, minWidth: 180 }}>{t("errorLogs.table.date", "Data")}</TableCell>
                <TableCell sx={{ width: 130, minWidth: 130 }}>{t("errorLogs.table.source", "Fonte")}</TableCell>
                <TableCell sx={{ width: 150, minWidth: 150 }}>{t("errorLogs.table.severity", "Severidade")}</TableCell>
                <TableCell sx={{ minWidth: 350 }}>{t("errorLogs.table.message", "Mensagem")}</TableCell>
                <TableCell align="center" sx={{ width: 100, minWidth: 100 }}>{t("errorLogs.table.actions", "Ações")}</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {logs.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t("errorLogs.noRecords")}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  if (!log || !log.id) {
                    return null;
                  }
                  
                  return (
                    <StyledTableRow key={log.id}>
                      <TableCell sx={{ width: 80 }}>{log.id}</TableCell>
                      <TableCell sx={{ width: 180 }}>
                        {log.createdAt ? 
                          format(parseISO(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : 
                          "Data desconhecida"}
                      </TableCell>
                      <TableCell sx={{ width: 130 }}>{renderSourceChip(log.source || "desconhecido")}</TableCell>
                      <TableCell sx={{ width: 150 }}>{renderSeverityChip(log.severity || "error")}</TableCell>
                      <TableCell sx={{ minWidth: 350, maxWidth: 600 }}>
                        <Tooltip title={log.message || ""}>
                          <Typography 
                            noWrap 
                            sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {log.message || "Sem mensagem"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center" sx={{ width: 100 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenLogDetail(log.id)}
                          color="primary"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </StyledTableRow>
                  );
                })
              )}
              
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, bgcolor: theme => alpha(theme.palette.background.default, 0.3) }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2, py: 2 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" fontWeight={500} color="primary">
                        {t("errorLogs.loading", "Carregando mais logs...")}
                      </Typography>
                    </Box>
                  ) : logs.length > 0 && logs.length < totalCount ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <ActionButton
                        variant="outlined"
                        onClick={loadMoreLogs}
                        startIcon={<RefreshIcon />}
                        disabled={loading}
                        sx={{ 
                          background: 'transparent',
                          '&:hover': {
                            background: theme => alpha(theme.palette.primary.main, 0.1),
                          }
                        }}
                      >
                        Carregar mais logs
                      </ActionButton>
                      <Typography variant="caption" color="text.secondary">
                        Exibindo {logs.length} de {totalCount} registros
                      </Typography>
                    </Box>
                  ) : logs.length > 0 ? (
                    <Box sx={{ py: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography variant="body2" color="success.main" fontWeight={500}>
                        ✅ Todos os {totalCount} logs foram carregados
                      </Typography>
                    </Box>
                  ) : null}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </StyledTableContainer>

        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 2,
            p: 2,
            borderRadius: 2,
            background: theme => theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.6)}, ${alpha(theme.palette.background.default, 0.4)})`
              : `linear-gradient(135deg, ${alpha(theme.palette.grey[100], 0.8)}, ${alpha('#fff', 0.6)})`,
            backdropFilter: 'blur(10px)',
            border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          {loading && logs.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" fontWeight={500}>
                Carregando logs do sistema...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <StorageIcon fontSize="small" color="primary" />
                <Typography variant="body2" fontWeight={600}>
                  Total: <Chip label={totalCount} size="small" color="primary" sx={{ ml: 0.5 }} />
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <VisibilityIcon fontSize="small" color="secondary" />
                <Typography variant="body2" fontWeight={600}>
                  Exibindo: <Chip label={logs.length} size="small" color="secondary" variant="outlined" sx={{ ml: 0.5 }} />
                </Typography>
              </Box>
            </Box>
          )}
          
          <ActionButton
            size="small"
            startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <RefreshIcon />}
            onClick={resetAndFetchLogs}
            disabled={loading}
          >
            {loading ? "Atualizando..." : "Atualizar Lista"}
          </ActionButton>
        </Box>

      </StyledPaper>

      <Dialog open={filterDialogOpen} onClose={handleCloseFilterDialog}>
        <DialogTitle>{t("errorLogs.filter.title", "Filtrar Logs")}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" size="small">
                <Typography variant="subtitle2" gutterBottom>
                  {t("errorLogs.filter.source", "Fonte")}
                </Typography>
                <Select
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                  displayEmpty
                >
                  <MenuItem value="">
                    {t("errorLogs.filter.all", "Todos")}
                  </MenuItem>
                  <MenuItem value="frontend">Frontend</MenuItem>
                  <MenuItem value="backend">Backend</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" size="small">
                <Typography variant="subtitle2" gutterBottom>
                  {t("errorLogs.filter.severity", "Severidade")}
                </Typography>
                <Select
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  displayEmpty
                >
                  <MenuItem value="">
                    {t("errorLogs.filter.all", "Todos")}
                  </MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                {t("errorLogs.filter.startDate", "Data Inicial")}
              </Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                {t("errorLogs.filter.endDate", "Data Final")}
              </Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetFilters} color="secondary">
            {t("errorLogs.filter.reset", "Limpar")}
          </Button>
          <Button onClick={handleCloseFilterDialog} color="primary">
            {t("errorLogs.filter.cancel", "Cancelar")}
          </Button>
          <Button onClick={handleApplyFilters} color="primary" variant="contained">
            {t("errorLogs.filter.apply", "Aplicar")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t("errorLogs.delete.title", "Excluir Logs Antigos")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("errorLogs.delete.confirmation", "Tem certeza que deseja excluir logs com mais de 30 dias? Esta ação não pode ser desfeita.")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            {t("errorLogs.delete.cancel", "Cancelar")}
          </Button>
          <Button onClick={handleDeleteOldLogs} color="secondary" variant="contained">
            {t("errorLogs.delete.confirm", "Excluir")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {t("errorLogs.detail.title", "Detalhes do Log")}
          <Tooltip title="Copiar todas as informações">
            <IconButton
              onClick={handleCopyLogDetails}
              color="primary"
              size="small"
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent>
          {selectedLog ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("errorLogs.table.id", "ID")}:
                </Typography>
                <Typography variant="body2">{selectedLog.id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("errorLogs.table.date", "Data")}:
                </Typography>
                <Typography variant="body2">
                  {selectedLog.createdAt ? 
                    format(parseISO(selectedLog.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : 
                    "Data desconhecida"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("errorLogs.table.source", "Fonte")}:
                </Typography>
                {renderSourceChip(selectedLog.source || "desconhecido")}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("errorLogs.table.severity", "Severidade")}:
                </Typography>
                {renderSeverityChip(selectedLog.severity || "error")}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("errorLogs.detail.component", "Componente")}:
                </Typography>
                <Typography variant="body2">{selectedLog.component || "-"}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("errorLogs.detail.user", "Usuário")}:
                </Typography>
                <Typography variant="body2">{selectedLog.user || "-"}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("errorLogs.detail.url", "URL")}:
                </Typography>
                <Typography variant="body2">{selectedLog.url || "-"}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("errorLogs.detail.userAgent", "User Agent")}:
                </Typography>
                <Typography variant="body2" noWrap>{selectedLog.userAgent || "-"}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("errorLogs.table.message", "Mensagem")}:
                </Typography>
                <Typography variant="body2">{selectedLog.message || "-"}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("errorLogs.detail.stack", "Stack Trace")}:
                </Typography>
                <LogDetailContainer>
                  {selectedLog.stack || "-"}
                </LogDetailContainer>
              </Grid>
            </Grid>
          ) : (
            <Typography align="center">
              {t("errorLogs.detail.loading", "Carregando detalhes...")}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog} color="primary">
            {t("errorLogs.detail.close", "Fechar")}
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
}

export default ErrorLogs;
