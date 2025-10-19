import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  Button,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress
} from "@mui/material";

import {
  Refresh,
  SignalCellularAlt,
  SignalCellularConnectedNoInternet0Bar,
  CheckCircle,
  Cancel,
  Speed,
  NetworkCheck,
  Router,
  Dns,
  SettingsEthernet
} from "@mui/icons-material";

import { makeStyles } from "@mui/styles";
import { green, red, yellow, blue, grey } from "@mui/material/colors";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";

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
    fontSize: "0.875rem", 
    border: "1px solid #dadde9",
    maxWidth: 450
  },
  tooltipPopper: {
    textAlign: "center"
  },
  card: {
    marginBottom: 2
  },
  cardHeader: {
    backgroundColor: "#3f51b5", 
    color: "#fff" 
  },
  statusIcon: {
    fontSize: 48,
    marginRight: 2
  },
  statusBox: {
    display: "flex",
    alignItems: "center",
    marginBottom: 2
  },
  statusText: {
    fontWeight: "bold"
  },
  statusOnline: {
    color: "#4caf50" 
  },
  statusOffline: {
    color: "#f44336" 
  },
  statusWarning: {
    color: "#fbc02d" 
  },
  latencyGood: {
    backgroundColor: "#4caf50", 
    color: "#fff"
  },
  latencyMedium: {
    backgroundColor: "#fbc02d", 
    color: "#000"
  },
  latencyBad: {
    backgroundColor: "#f44336", 
    color: "#fff"
  },
  interfaceCard: {
    marginBottom: 1
  },
  interfaceHeader: {
    backgroundColor: "#1976d2", 
    color: "#fff",
    padding: 1
  },
  interfaceContent: {
    padding: 1
  },
  interfaceStatusUp: {
    color: "#4caf50", 
    fontWeight: "bold"
  },
  interfaceStatusDown: {
    color: "#f44336", 
    fontWeight: "bold"
  },
  statsGrid: {
    marginTop: 1
  },
  statsItem: {
    padding: 1,
    border: "1px solid rgba(0, 0, 0, 0.12)", 
    borderRadius: 4,
    textAlign: "center"
  },
  statsLabel: {
    fontSize: "0.75rem",
    color: "rgba(0, 0, 0, 0.6)" 
  },
  statsValue: {
    fontWeight: "bold"
  },
  lastUpdated: {
    marginTop: 2,
    color: "rgba(0, 0, 0, 0.6)", 
    fontSize: "0.875rem",
    fontStyle: "italic"
  }
}));

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const getLatencyClass = (latency) => {
  if (latency < 50) return "latencyGood";
  if (latency < 150) return "latencyMedium";
  return "latencyBad";
};

const NetworkStatus = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  
  const [loading, setLoading] = useState(true);
  const [networkStatus, setNetworkStatus] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  useEffect(() => {
    fetchNetworkStatus();
  }, []);
  
  const fetchNetworkStatus = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/network-status");
      setNetworkStatus(data);
      setLastUpdated(new Date());
    } catch (err) {
      toast.error(t("networkStatus.fetchError"));
      console.error(err);
    }
    setLoading(false);
  };
  
  const renderInternetStatus = () => {
    if (!networkStatus) return null;
    
    const { connectionStatus } = networkStatus;
    const isOnline = connectionStatus.internet;
    
    return (
      <Card className={classes.card}>
        <CardHeader
          title={t("networkStatus.internetConnection")}
          className={classes.cardHeader}
          avatar={<NetworkCheck />}
        />
        <CardContent>
          <Box className={classes.statusBox}>
            {isOnline ? (
              <CheckCircle className={`${classes.statusIcon} ${classes.statusOnline}`} />
            ) : (
              <SignalCellularConnectedNoInternet0Bar className={`${classes.statusIcon} ${classes.statusOffline}`} />
            )}
            <Typography variant="h6" className={classes.statusText}>
              {isOnline ? t("networkStatus.online") : t("networkStatus.offline")}
            </Typography>
          </Box>
          
          <Typography variant="subtitle1">{t("networkStatus.latency")}</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("networkStatus.host")}</TableCell>
                  <TableCell>{t("networkStatus.status")}</TableCell>
                  <TableCell>{t("networkStatus.avgLatency")}</TableCell>
                  <TableCell>{t("networkStatus.minLatency")}</TableCell>
                  <TableCell>{t("networkStatus.maxLatency")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connectionStatus.latency.map((ping) => (
                  <TableRow key={ping.host}>
                    <TableCell>{ping.host}</TableCell>
                    <TableCell>
                      {ping.alive ? (
                        <CheckCircle fontSize="small" className={classes.statusOnline} />
                      ) : (
                        <Cancel fontSize="small" className={classes.statusOffline} />
                      )}
                    </TableCell>
                    <TableCell>
                      {ping.alive ? (
                        <Chip
                          label={`${ping.avg} ms`}
                          size="small"
                          className={classes[getLatencyClass(ping.avg)]}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{ping.alive ? `${ping.min} ms` : "-"}</TableCell>
                    <TableCell>{ping.alive ? `${ping.max} ms` : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };
  
  const renderDnsStatus = () => {
    if (!networkStatus) return null;
    
    const { dnsStatus } = networkStatus;
    
    return (
      <Card className={classes.card}>
        <CardHeader
          title={t("networkStatus.dnsStatus")}
          className={classes.cardHeader}
          avatar={<Dns />}
        />
        <CardContent>
          <Box className={classes.statusBox}>
            {dnsStatus.working ? (
              <CheckCircle className={`${classes.statusIcon} ${classes.statusOnline}`} />
            ) : (
              <Cancel className={`${classes.statusIcon} ${classes.statusOffline}`} />
            )}
            <Typography variant="h6" className={classes.statusText}>
              {dnsStatus.working ? t("networkStatus.dnsWorking") : t("networkStatus.dnsFailed")}
            </Typography>
          </Box>
          
          {dnsStatus.working && (
            <Box mt={2}>
              <Typography variant="body1">
                {t("networkStatus.resolveTime")}: {dnsStatus.resolveTime} ms
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };
  
  const renderActiveConnections = () => {
    if (!networkStatus) return null;
    
    const { activeConnections } = networkStatus;
    
    return (
      <Card className={classes.card}>
        <CardHeader
          title={t("networkStatus.activeConnections")}
          className={classes.cardHeader}
          avatar={<SettingsEthernet />}
        />
        <CardContent>
          <Grid container spacing={2} className={classes.statsGrid}>
            <Grid item xs={4} sm={2}>
              <Box className={classes.statsItem}>
                <Typography className={classes.statsLabel}>
                  {t("networkStatus.total")}
                </Typography>
                <Typography className={classes.statsValue}>
                  {activeConnections.total}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4} sm={2}>
              <Box className={classes.statsItem}>
                <Typography className={classes.statsLabel}>
                  {t("networkStatus.established")}
                </Typography>
                <Typography className={classes.statsValue}>
                  {activeConnections.established}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4} sm={2}>
              <Box className={classes.statsItem}>
                <Typography className={classes.statsLabel}>
                  {t("networkStatus.listening")}
                </Typography>
                <Typography className={classes.statsValue}>
                  {activeConnections.listening}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box className={classes.statsItem}>
                <Typography className={classes.statsLabel}>
                  {t("networkStatus.timeWait")}
                </Typography>
                <Typography className={classes.statsValue}>
                  {activeConnections.timeWait}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box className={classes.statsItem}>
                <Typography className={classes.statsLabel}>
                  {t("networkStatus.closeWait")}
                </Typography>
                <Typography className={classes.statsValue}>
                  {activeConnections.closeWait}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  const renderNetworkInterfaces = () => {
    if (!networkStatus) return null;
    
    const { interfaces } = networkStatus;
    
    return (
      <Card className={classes.card}>
        <CardHeader
          title={t("networkStatus.networkInterfaces")}
          className={classes.cardHeader}
          avatar={<Router />}
        />
        <CardContent>
          {interfaces.length === 0 ? (
            <Typography>{t("networkStatus.noInterfaces")}</Typography>
          ) : (
            interfaces.map((iface) => (
              <Paper key={iface.name} className={classes.interfaceCard} variant="outlined">
                <Box className={classes.interfaceHeader}>
                  <Typography variant="subtitle1">
                    {iface.name} - {iface.ipAddress}
                  </Typography>
                </Box>
                <Box className={classes.interfaceContent}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>{t("networkStatus.status")}:</strong>{" "}
                        <span className={iface.status === "up" ? classes.interfaceStatusUp : classes.interfaceStatusDown}>
                          {iface.status === "up" ? t("networkStatus.up") : t("networkStatus.down")}
                        </span>
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t("networkStatus.mac")}:</strong> {iface.macAddress}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t("networkStatus.speed")}:</strong> {iface.speed}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>{t("networkStatus.received")}:</strong> {formatBytes(iface.bytesReceived)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t("networkStatus.sent")}:</strong> {formatBytes(iface.bytesSent)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t("networkStatus.errors")}:</strong> {iface.errors}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t("networkStatus.dropped")}:</strong> {iface.dropped}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            ))
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <MainContainer>
      <MainHeader>
        <Title>{t("networkStatus.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchNetworkStatus}
            startIcon={<Refresh />}
            disabled={loading}
          >
            {t("networkStatus.refresh")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper className={classes.mainPaper} variant="outlined">
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {renderInternetStatus()}
            {renderDnsStatus()}
            {renderActiveConnections()}
            {renderNetworkInterfaces()}
            
            {lastUpdated && (
              <Typography className={classes.lastUpdated}>
                {t("networkStatus.lastUpdated")}: {formatDistanceToNow(lastUpdated, { addSuffix: true, locale: ptBR })}
              </Typography>
            )}
          </>
        )}
      </Paper>
    </MainContainer>
  );
};

export default NetworkStatus;
