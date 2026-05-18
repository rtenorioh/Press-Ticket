import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { format } from "date-fns";

import {
  Button,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  TablePagination,
  InputAdornment
} from "@mui/material";

import {
  Refresh,
  Search,
  Info,
  FilterList,
  Close,
  Warning,
  Download,
  TrendingUp,
  People,
  Assessment,
  Language,
  Computer
} from "@mui/icons-material";

import { useTheme } from "@mui/material/styles";
import { green, red, blue, orange, grey } from "@mui/material/colors";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import ptBR from "date-fns/locale/pt-BR";

const getStyles = (theme) => ({
  mainPaper: {
    flex: 1,
    padding: 2,
    margin: 1,
    overflowY: "scroll",
    ...theme.scrollbarStyles
  },
  actionChip: {
    m: 0.5,
    fontWeight: "bold"
  },
  noLogsMessage: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    p: 4,
    flexDirection: "column"
  },
  warningIcon: {
    color: red[500],
    fontSize: 48,
    mb: 2
  },
  closeButton: {
    position: "absolute",
    right: 1,
    top: 1,
    color: "#9e9e9e"
  },
  detailsContainer: {
    p: 2
  },
  detailsTitle: {
    mb: 2,
    fontWeight: "bold"
  },
  detailsItem: {
    p: 1,
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)"
  },
  detailsLabel: {
    fontWeight: "bold",
    mr: 1
  },
  statsCard: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    p: 2,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    borderRadius: 2,
    boxShadow: "0 4px 20px 0 rgba(0,0,0,0.12)"
  },
  statsCardGreen: {
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
  },
  statsCardBlue: {
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  statsCardOrange: {
    background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  },
  statsIcon: {
    fontSize: 48,
    mb: 1,
    opacity: 0.9
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: "bold",
    mb: 0.5
  },
  statsLabel: {
    fontSize: 14,
    textTransform: "uppercase",
    opacity: 0.9
  },
  searchField: {
    mb: 2,
    backgroundColor: "#fff"
  },
  jsonPre: {
    backgroundColor: "#f5f5f5",
    p: 2,
    borderRadius: 1,
    overflow: "auto",
    maxHeight: 400,
    fontSize: 12,
    fontFamily: "monospace"
  },
  exportButton: {
    mr: 1
  }
});

const getActionColor = (action) => {
  switch (action) {
    case "login":
    case "create":
      return green[500];
    case "logout":
    case "delete":
      return red[500];
    case "update":
    case "transfer":
      return blue[500];
    case "close":
    case "reopen":
    case "accept":
      return orange[500];
    default:
      return grey[500];
  }
};

const ActivityLogs = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = getStyles(theme);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(0);
  const [, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    userId: "",
    action: "",
    entityType: "",
    ip: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [actions, setActions] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [entityDetails, setEntityDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [stats, setStats] = useState({
    totalLogs: 0,
    uniqueUsers: 0,
    topAction: "",
    todayLogs: 0
  });
  const [entityTypes, setEntityTypes] = useState([]);

  useEffect(() => {
    loadLogs();
    loadActions();
    loadUsers();
    loadEntityTypes();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  // Busca em tempo real
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page === 0) {
        loadLogs();
      } else {
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        ...filters,
        searchParam: searchTerm
      };

      if (params.startDate) {
        params.startDate = format(params.startDate, "yyyy-MM-dd");
      }
      if (params.endDate) {
        params.endDate = format(params.endDate, "yyyy-MM-dd");
      }

      const { data } = await api.get("/activity-logs", { params });
      setLogs(data.logs);
      setCount(data.count);
      setHasMore(data.hasMore);
    } catch (err) {
      toast.error(t("activityLogs.loadError"));
      console.error(err);
    }
    setLoading(false);
  };

  const loadActions = async () => {
    try {
      const { data } = await api.get("/activity-logs/actions");
      setActions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await api.get("/activity-logs/stats");
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEntityTypes = async () => {
    try {
      const { data } = await api.get("/activity-logs/entity-types");
      setEntityTypes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDetails = async (log) => {
    setSelectedLog(log);
    setDetailsOpen(true);
    
    if (log.entityType && log.entityId) {
      setLoadingDetails(true);
      try {
        const { data } = await api.get(`/activity-logs/${log.id}/details`, {
          params: {
            entityType: log.entityType,
            entityId: log.entityId
          }
        });
        setEntityDetails(data);
      } catch (err) {
        console.error(err);
        toast.error(t("activityLogs.detailsError"));
      }
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedLog(null);
    setEntityDetails(null);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setPage(0);
    loadLogs();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      userId: "",
      action: "",
      entityType: "",
      ip: ""
    });
    setSearchTerm("");
    setPage(0);
    loadLogs();
  };

  const handleExportCSV = () => {
    try {
      const headers = ["Usuário", "Ação", "Descrição", "IP", "Entidade", "Data/Hora"];
      const csvContent = [
        headers.join(","),
        ...logs.map(log =>
          [
            log.username || "",
            log.action || "",
            `"${log.description || ""}"`,
            log.ip || "",
            log.entityType ? `${log.entityType} #${log.entityId || ""}` : "",
            format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")
          ].join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `activity-logs-${format(new Date(), "yyyyMMdd-HHmmss")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Logs exportados com sucesso!");
    } catch (err) {
      toast.error("Erro ao exportar logs");
      console.error(err);
    }
  };

  const renderEntityDetails = () => {
    if (!entityDetails) return null;

    return (
      <Box sx={classes.detailsContainer}>
        <Typography variant="h6" sx={classes.detailsTitle}>
          {t("activityLogs.entityDetails")}
        </Typography>
        
        {Object.entries(entityDetails).map(([key, value]) => {
          if (typeof value === "object") return null;
          
          return (
            <Box key={key} sx={classes.detailsItem}>
              <Typography variant="body2">
                <Box component="span" sx={classes.detailsLabel}>{key}:</Box>
                {value.toString()}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{t("activityLogs.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExportCSV}
            startIcon={<Download />}
            sx={classes.exportButton}
            disabled={logs.length === 0}
          >
            Exportar CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowFilters(true)}
            startIcon={<FilterList />}
            sx={classes.filterButton}
          >
            {t("activityLogs.filter")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={loadLogs}
            startIcon={<Refresh />}
            disabled={loading}
          >
            {t("activityLogs.refresh")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      {/* Cards de Estatísticas */}
      <Grid container spacing={2} style={{ marginBottom: 16 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...classes.statsCard, ...classes.statsCardBlue }}>
            <Assessment sx={classes.statsIcon} />
            <Typography sx={classes.statsNumber}>{stats.totalLogs}</Typography>
            <Typography sx={classes.statsLabel}>Total de Logs</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...classes.statsCard, ...classes.statsCardGreen }}>
            <People sx={classes.statsIcon} />
            <Typography sx={classes.statsNumber}>{stats.uniqueUsers}</Typography>
            <Typography sx={classes.statsLabel}>Usuários Ativos</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...classes.statsCard, ...classes.statsCardOrange }}>
            <TrendingUp sx={classes.statsIcon} />
            <Typography sx={classes.statsNumber}>{stats.todayLogs}</Typography>
            <Typography sx={classes.statsLabel}>Logs Hoje</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={classes.statsCard}>
            <Computer sx={classes.statsIcon} />
            <Typography sx={{ ...classes.statsNumber, fontSize: 20 }}>
              {stats.topAction || "N/A"}
            </Typography>
            <Typography sx={classes.statsLabel}>Ação Mais Comum</Typography>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={classes.mainPaper} variant="outlined">
        {/* Campo de Busca em Tempo Real */}
        <TextField
          sx={classes.searchField}
          fullWidth
          variant="outlined"
          placeholder="Buscar em logs (descrição, usuário, IP...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("activityLogs.user")}</TableCell>
                <TableCell>{t("activityLogs.action")}</TableCell>
                <TableCell>{t("activityLogs.description")}</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>{t("activityLogs.entity")}</TableCell>
                <TableCell>{t("activityLogs.timestamp")}</TableCell>
                <TableCell align="center">{t("activityLogs.details")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={classes.noLogsMessage}>
                      <Warning sx={classes.warningIcon} />
                      <Typography variant="body1">
                        {t("activityLogs.noLogs")}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.username}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        sx={{ ...classes.actionChip, backgroundColor: getActionColor(log.action), color: "#fff" }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.description}</TableCell>
                    <TableCell>
                      <Tooltip title={log.ip || "N/A"} arrow>
                        <Chip
                          icon={<Language />}
                          label={log.ip || "N/A"}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {log.entityType && (
                        <Typography variant="body2">
                          {log.entityType} {log.entityId ? `#${log.entityId}` : ""}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={t("activityLogs.viewDetails")} arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDetails(log)}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Paginação */}
        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Logs por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      <Dialog
        open={showFilters}
        onClose={() => setShowFilters(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("activityLogs.filterTitle")}
          <IconButton
            sx={classes.closeButton}
            onClick={() => setShowFilters(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label={t("activityLogs.startDate")}
                  value={filters.startDate}
                  onChange={(date) => handleFilterChange("startDate", date)}
                  slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label={t("activityLogs.endDate")}
                  value={filters.endDate}
                  onChange={(date) => handleFilterChange("endDate", date)}
                  slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>{t("activityLogs.user")}</InputLabel>
                <Select
                  value={filters.userId}
                  onChange={(e) => handleFilterChange("userId", e.target.value)}
                  label={t("activityLogs.user")}
                >
                  <MenuItem value="">{t("activityLogs.allUsers")}</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>{t("activityLogs.action")}</InputLabel>
                <Select
                  value={filters.action}
                  onChange={(e) => handleFilterChange("action", e.target.value)}
                  label={t("activityLogs.action")}
                >
                  <MenuItem value="">{t("activityLogs.allActions")}</MenuItem>
                  {actions.map((action) => (
                    <MenuItem key={action} value={action}>
                      {action}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Tipo de Entidade</InputLabel>
                <Select
                  value={filters.entityType}
                  onChange={(e) => handleFilterChange("entityType", e.target.value)}
                  label="Tipo de Entidade"
                >
                  <MenuItem value="">Todos os Tipos</MenuItem>
                  {entityTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Filtrar por IP"
                value={filters.ip}
                onChange={(e) => handleFilterChange("ip", e.target.value)}
                placeholder="Ex: 192.168.1.1"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Language />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearFilters} color="primary">
            {t("activityLogs.clearFilters")}
          </Button>
          <Button
            onClick={handleApplyFilters}
            color="primary"
            variant="contained"
            startIcon={<Search />}
          >
            {t("activityLogs.applyFilters")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t("activityLogs.logDetails")}
          <IconButton
            sx={classes.closeButton}
            onClick={handleCloseDetails}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={classes.detailsTitle}>
                  {t("activityLogs.basicInfo")}
                </Typography>
                <Box sx={classes.detailsItem}>
                  <Typography variant="body2">
                    <Box component="span" sx={classes.detailsLabel}>{t("activityLogs.user")}:</Box>
                    {selectedLog.username}
                  </Typography>
                </Box>
                <Box sx={classes.detailsItem}>
                  <Typography variant="body2">
                    <Box component="span" sx={classes.detailsLabel}>{t("activityLogs.action")}:</Box>
                    <Chip
                      label={selectedLog.action}
                      sx={{ ...classes.actionChip, backgroundColor: getActionColor(selectedLog.action), color: "#fff" }}
                      size="small"
                    />
                  </Typography>
                </Box>
                <Box sx={classes.detailsItem}>
                  <Typography variant="body2">
                    <Box component="span" sx={classes.detailsLabel}>{t("activityLogs.description")}:</Box>
                    {selectedLog.description}
                  </Typography>
                </Box>
                <Box sx={classes.detailsItem}>
                  <Typography variant="body2">
                    <Box component="span" sx={classes.detailsLabel}>{t("activityLogs.timestamp")}:</Box>
                    {format(new Date(selectedLog.createdAt), "dd/MM/yyyy HH:mm:ss")}
                  </Typography>
                </Box>
                <Box sx={classes.detailsItem}>
                  <Typography variant="body2">
                    <Box component="span" sx={classes.detailsLabel}>{t("activityLogs.ip")}:</Box>
                    {selectedLog.ip}
                  </Typography>
                </Box>
                {selectedLog.entityType && (
                  <Box sx={classes.detailsItem}>
                    <Typography variant="body2">
                      <Box component="span" sx={classes.detailsLabel}>{t("activityLogs.entity")}:</Box>
                      {selectedLog.entityType} {selectedLog.entityId ? `#${selectedLog.entityId}` : ""}
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              {selectedLog.additionalData && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={classes.detailsTitle}>
                    Dados Adicionais
                  </Typography>
                  <Box sx={classes.jsonPre}>
                    <pre>{JSON.stringify(
                      typeof selectedLog.additionalData === 'string' 
                        ? JSON.parse(selectedLog.additionalData) 
                        : selectedLog.additionalData, 
                      null, 
                      2
                    )}</pre>
                  </Box>
                </Grid>
              )}
              
              {loadingDetails ? (
                <Grid item xs={12} style={{ textAlign: "center" }}>
                  <CircularProgress />
                </Grid>
              ) : (
                entityDetails && (
                  <Grid item xs={12}>
                    {renderEntityDetails()}
                  </Grid>
                )
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} color="primary">
            {t("activityLogs.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default ActivityLogs;
