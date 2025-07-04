import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { parseISO, format } from "date-fns";
import { pt } from "date-fns/locale";

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
  Chip
} from "@mui/material";

import {
  Refresh,
  Search,
  Info,
  FilterList,
  Close,
  Warning
} from "@mui/icons-material";

import { makeStyles } from "@mui/styles";
import { green, red, blue, orange, grey } from "@mui/material/colors";

import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import ptBR from "date-fns/locale/pt-BR";

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: 2,
    margin: 1,
    overflowY: "scroll",
    ...theme.scrollbarStyles
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: "0.875rem", // Equivalente a 14px
    border: "1px solid #dadde9",
    maxWidth: 450
  },
  tooltipPopper: {
    textAlign: "center"
  },
  buttonProgress: {
    color: green[500]
  },
  actionChip: {
    margin: 0.5,
    fontWeight: "bold"
  },
  noLogsMessage: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    flexDirection: "column"
  },
  warningIcon: {
    color: red[500],
    fontSize: 48,
    marginBottom: 2
  },
  filterContainer: {
    padding: 2,
    marginBottom: 2
  },
  filterButton: {
    marginLeft: 1
  },
  closeButton: {
    position: "absolute",
    right: 1,
    top: 1,
    color: "#9e9e9e" // Equivalente a grey[500]
  },
  detailsContainer: {
    padding: 2
  },
  detailsTitle: {
    marginBottom: 2,
    fontWeight: "bold"
  },
  detailsItem: {
    padding: 1,
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)" // Equivalente a theme.palette.divider
  },
  detailsLabel: {
    fontWeight: "bold",
    marginRight: 1
  }
}));

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
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    userId: "",
    action: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [actions, setActions] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [entityDetails, setEntityDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadLogs();
    loadActions();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        ...filters
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
      action: ""
    });
    setPage(0);
    loadLogs();
  };

  const renderEntityDetails = () => {
    if (!entityDetails) return null;

    return (
      <Box className={classes.detailsContainer}>
        <Typography variant="h6" className={classes.detailsTitle}>
          {t("activityLogs.entityDetails")}
        </Typography>
        
        {Object.entries(entityDetails).map(([key, value]) => {
          // Ignorar campos complexos ou vazios
          if (typeof value === "object" || value === null) return null;
          
          return (
            <Box key={key} className={classes.detailsItem}>
              <Typography variant="body2">
                <span className={classes.detailsLabel}>{key}:</span>
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
            onClick={() => setShowFilters(true)}
            startIcon={<FilterList />}
            className={classes.filterButton}
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
      <Paper className={classes.mainPaper} variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("activityLogs.user")}</TableCell>
                <TableCell>{t("activityLogs.action")}</TableCell>
                <TableCell>{t("activityLogs.description")}</TableCell>
                <TableCell>{t("activityLogs.entity")}</TableCell>
                <TableCell>{t("activityLogs.timestamp")}</TableCell>
                <TableCell align="center">{t("activityLogs.details")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box className={classes.noLogsMessage}>
                      <Warning className={classes.warningIcon} />
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
                        className={classes.actionChip}
                        style={{ backgroundColor: getActionColor(log.action), color: "#fff" }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.description}</TableCell>
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
            className={classes.closeButton}
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
                  renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label={t("activityLogs.endDate")}
                  value={filters.endDate}
                  onChange={(date) => handleFilterChange("endDate", date)}
                  renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
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
            className={classes.closeButton}
            onClick={handleCloseDetails}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" className={classes.detailsTitle}>
                  {t("activityLogs.basicInfo")}
                </Typography>
                <Box className={classes.detailsItem}>
                  <Typography variant="body2">
                    <span className={classes.detailsLabel}>{t("activityLogs.user")}:</span>
                    {selectedLog.username}
                  </Typography>
                </Box>
                <Box className={classes.detailsItem}>
                  <Typography variant="body2">
                    <span className={classes.detailsLabel}>{t("activityLogs.action")}:</span>
                    <Chip
                      label={selectedLog.action}
                      className={classes.actionChip}
                      style={{ backgroundColor: getActionColor(selectedLog.action), color: "#fff" }}
                      size="small"
                    />
                  </Typography>
                </Box>
                <Box className={classes.detailsItem}>
                  <Typography variant="body2">
                    <span className={classes.detailsLabel}>{t("activityLogs.description")}:</span>
                    {selectedLog.description}
                  </Typography>
                </Box>
                <Box className={classes.detailsItem}>
                  <Typography variant="body2">
                    <span className={classes.detailsLabel}>{t("activityLogs.timestamp")}:</span>
                    {format(new Date(selectedLog.createdAt), "dd/MM/yyyy HH:mm:ss")}
                  </Typography>
                </Box>
                <Box className={classes.detailsItem}>
                  <Typography variant="body2">
                    <span className={classes.detailsLabel}>{t("activityLogs.ip")}:</span>
                    {selectedLog.ip}
                  </Typography>
                </Box>
                {selectedLog.entityType && (
                  <Box className={classes.detailsItem}>
                    <Typography variant="body2">
                      <span className={classes.detailsLabel}>{t("activityLogs.entity")}:</span>
                      {selectedLog.entityType} {selectedLog.entityId ? `#${selectedLog.entityId}` : ""}
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              {selectedLog.details && (
                <Grid item xs={12}>
                  <Typography variant="h6" className={classes.detailsTitle}>
                    {t("activityLogs.additionalDetails")}
                  </Typography>
                  <Box className={classes.detailsItem}>
                    <pre>{JSON.stringify(JSON.parse(selectedLog.details), null, 2)}</pre>
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
