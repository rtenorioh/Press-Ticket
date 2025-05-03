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
  Box
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
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

const SearchContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch"
  }
}));

const LogDetailContainer = styled("div")(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  fontFamily: "monospace",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  maxHeight: "400px",
  overflowY: "auto"
}));

function ErrorLogs() {
  const { t } = useTranslation();
  const { user } = useAuth();  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      setError(null);
      
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
          setError('Resposta inválida ao carregar logs');
        }
      } catch (apiError) {
        clearTimeout(loadingTimeout);
        throw apiError;
      }
    } catch (error) {
      setError(`Erro ao carregar logs: ${error.message || 'Erro desconhecido'}`);
      toast.error(t("errorLogs.fetchError", "Erro ao buscar logs"));
      
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
    if (!severity) {
      return (
        <Chip 
          label="desconhecido" 
          color="default" 
          size="small" 
          variant="outlined"
        />
      );
    }
    
    let color = "default";
    
    switch (severity) {
      case "error":
        color = "error";
        break;
      case "warning":
        color = "warning";
        break;
      case "info":
        color = "info";
        break;
      default:
        color = "default";
    }
    
    return (
      <Chip 
        label={severity} 
        color={color} 
        size="small" 
        variant="outlined"
      />
    );
  };

  const renderSourceChip = (source) => {
    if (!source) {
      return (
        <Chip 
          label="desconhecido" 
          color="default" 
          size="small" 
          variant="outlined"
        />
      );
    }
    
    return (
      <Chip 
        label={source} 
        color={source === "backend" ? "primary" : "secondary"} 
        size="small" 
        variant="outlined"
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

      <Paper elevation={3} sx={{ p: 2 }}>
        <SearchContainer>
          <TextField
            placeholder={t("errorLogs.searchPlaceholder", "Buscar logs...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
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
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={resetAndFetchLogs}
            disabled={loading}
            sx={{ ml: { xs: 0, sm: 1 }, mt: { xs: 1, sm: 0 } }}
          >
            {t("errorLogs.buttons.search", "Buscar")}
          </Button>
        </SearchContainer>

        <TableContainer 
          sx={{ maxHeight: "calc(100vh - 300px)" }}
          onScroll={handleScroll}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("errorLogs.table.id", "ID")}</TableCell>
                <TableCell>{t("errorLogs.table.date", "Data")}</TableCell>
                <TableCell>{t("errorLogs.table.source", "Fonte")}</TableCell>
                <TableCell>{t("errorLogs.table.severity", "Severidade")}</TableCell>
                <TableCell>{t("errorLogs.table.message", "Mensagem")}</TableCell>
                <TableCell align="center">{t("errorLogs.table.actions", "Ações")}</TableCell>
              </TableRow>
            </TableHead>
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
                    <TableRow key={log.id}>
                      <TableCell>{log.id}</TableCell>
                      <TableCell>
                        {log.createdAt ? 
                          format(parseISO(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : 
                          "Data desconhecida"}
                      </TableCell>
                      <TableCell>{renderSourceChip(log.source || "desconhecido")}</TableCell>
                      <TableCell>{renderSeverityChip(log.severity || "error")}</TableCell>
                      <TableCell>
                        <Tooltip title={log.message || ""}>
                          <Typography noWrap sx={{ maxWidth: 300 }}>
                            {log.message || "Sem mensagem"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenLogDetail(log.id)}
                          color="primary"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      <Typography variant="body2">{t("errorLogs.loading", "Carregando...")}</Typography>
                    </Box>
                  ) : logs.length > 0 && logs.length < totalCount ? (
                    <Button 
                      variant="text" 
                      color="primary" 
                      onClick={loadMoreLogs}
                      startIcon={<RefreshIcon />}
                      disabled={loading}
                    >
                      Carregar mais logs ({logs.length} de {totalCount})
                    </Button>
                  ) : logs.length > 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      Todos os {totalCount} logs foram carregados
                    </Typography>
                  ) : null}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 1,
            borderTop: '1px solid rgba(224, 224, 224, 1)',
            bgcolor: '#f5f5f5'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {loading && logs.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Carregando logs...
              </Box>
            ) : (
              `Total: ${totalCount} registros | Exibindo: ${logs.length}`
            )}
          </Typography>
          
          <Box>
            <Button 
              size="small" 
              startIcon={<RefreshIcon />} 
              onClick={resetAndFetchLogs}
              disabled={loading}
            >
              Atualizar
            </Button>
          </Box>
        </Box>

      </Paper>

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
        <DialogTitle>{t("errorLogs.detail.title", "Detalhes do Log")}</DialogTitle>
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
