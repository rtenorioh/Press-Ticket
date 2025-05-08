import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CpuIcon from '@mui/icons-material/DeveloperBoard';
import MainHeader from '../../components/MainHeader';
import Title from '../../components/Title';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

const PREFIX = 'CpuUsage';
const classes = {
  root: `${PREFIX}-root`,
  card: `${PREFIX}-card`,
  progressBar: `${PREFIX}-progressBar`,
  healthyIcon: `${PREFIX}-healthyIcon`,
  warningIcon: `${PREFIX}-warningIcon`,
  criticalIcon: `${PREFIX}-criticalIcon`,
  detailsCard: `${PREFIX}-detailsCard`,
  loadingContainer: `${PREFIX}-loadingContainer`,
  tableContainer: `${PREFIX}-tableContainer`,
  processName: `${PREFIX}-processName`
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    padding: theme.spacing(2),
    width: '100%'
  },
  [`& .${classes.card}`]: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2)
  },
  [`& .${classes.progressBar}`]: {
    height: 20,
    borderRadius: 5,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  [`& .${classes.healthyIcon}`]: {
    color: theme.palette.success.main,
    marginRight: theme.spacing(1),
    verticalAlign: 'middle'
  },
  [`& .${classes.warningIcon}`]: {
    color: theme.palette.warning.main,
    marginRight: theme.spacing(1),
    verticalAlign: 'middle'
  },
  [`& .${classes.criticalIcon}`]: {
    color: theme.palette.error.main,
    marginRight: theme.spacing(1),
    verticalAlign: 'middle'
  },
  [`& .${classes.detailsCard}`]: {
    height: '100%'
  },
  [`& .${classes.loadingContainer}`]: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px'
  },
  [`& .${classes.tableContainer}`]: {
    marginTop: theme.spacing(2)
  },
  [`& .${classes.processName}`]: {
    maxWidth: '300px',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'block'
  }
}));

const CpuUsage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [cpuInfo, setCpuInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCpuUsage = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/cpu-usage');
        setCpuInfo(data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar informações de uso de CPU');
      } finally {
        setLoading(false);
      }
    };
    fetchCpuUsage();
    const interval = setInterval(fetchCpuUsage, 60 * 1000);
    return () => clearInterval(interval);
  }, [t]);

  const getStatusColor = (percentage) => {
    if (percentage < 70) return 'success.main';
    if (percentage < 90) return 'warning.main';
    return 'error.main';
  };
  const getStatusIcon = (percentage) => {
    if (percentage < 70) return <CheckCircleIcon className={classes.healthyIcon} />;
    if (percentage < 90) return <WarningIcon className={classes.warningIcon} />;
    return <WarningIcon className={classes.criticalIcon} />;
  };

  return (
    <Root className={classes.root}>
      <MainHeader>
        <Title>{t('cpuUsage.title')}</Title>
      </MainHeader>
      {loading ? (
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper className={classes.card}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : (
        <>
          <Paper className={classes.card}>
            <Typography variant="h6" gutterBottom>
              <CpuIcon className={classes.infoIcon} /> {t('cpuUsage.infoIcon')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {cpuInfo.cpuUsage}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={cpuInfo.cpuUsage}
              sx={{ height: 18, borderRadius: 5, background: '#eee', marginY: 1, [`& .MuiLinearProgress-bar`]: { backgroundColor: (theme) => theme.palette[getStatusColor(cpuInfo.cpuUsage).split('.')[0]].main } }}
            />
            <Box display="flex" alignItems="center" mt={1}>
              {getStatusIcon(cpuInfo.cpuUsage)}
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: getStatusColor(cpuInfo.cpuUsage) }}>
                {cpuInfo.cpuUsage < 70 ? 'Saudável' : cpuInfo.cpuUsage < 90 ? 'Alerta' : 'Crítico'}
              </Typography>
            </Box>
          </Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Card className={classes.detailsCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <CpuIcon className={classes.infoIcon} /> {t('cpuUsage.modelCPU')}
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {cpuInfo.cpuModel}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card className={classes.detailsCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <CpuIcon className={classes.infoIcon} /> {t('cpuUsage.cores')}
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {cpuInfo.cores}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {cpuInfo.threads} {t('cpuUsage.threads')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card className={classes.detailsCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <CpuIcon className={classes.infoIcon} /> {t('cpuUsage.frequency')}
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {cpuInfo.frequency}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card className={classes.detailsCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <CpuIcon className={classes.infoIcon} /> {t('cpuUsage.uptime')}
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {cpuInfo.uptime}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Load avg: {cpuInfo.loadAverage.join(', ')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Paper className={classes.card} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              <CpuIcon className={classes.infoIcon} /> {t('cpuUsage.topProcesses')}
            </Typography>
            <TableContainer sx={{ maxHeight: 650, width: '100%' }}>
              <Table stickyHeader sx={{ width: '100%', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ minWidth: 80, width: '10%' }} />
                  <col style={{ minWidth: 250, width: '40%' }} />
                  <col style={{ minWidth: 100, width: '15%' }} />
                  <col style={{ minWidth: 100, width: '15%' }} />
                  <col style={{ minWidth: 100, width: '20%' }} />
                </colgroup>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ padding: '12px 8px', fontWeight: 'bold' }}>{t('cpuUsage.pid')}</TableCell>
                    <TableCell sx={{ padding: '12px 8px', fontWeight: 'bold' }}>{t('cpuUsage.process')}</TableCell>
                    <TableCell sx={{ padding: '12px 8px', fontWeight: 'bold' }}>{t('cpuUsage.user')}</TableCell>
                    <TableCell sx={{ padding: '12px 8px', fontWeight: 'bold' }}>{t('cpuUsage.cpuUsage')}</TableCell>
                    <TableCell sx={{ padding: '12px 8px', fontWeight: 'bold' }}>{t('cpuUsage.cpuTime')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cpuInfo.topProcesses && Array.isArray(cpuInfo.topProcesses) && cpuInfo.topProcesses.length > 0 ? (
                    cpuInfo.topProcesses.map((process, index) => {
                      const fullCommand = process.command || '';
                      const commandParts = fullCommand.split('/');
                      let simplifiedCommand = commandParts[commandParts.length - 1] || fullCommand;
                      simplifiedCommand = simplifiedCommand.split(' ')[0];
                      return (
                        <TableRow key={index}>
                          <TableCell>{process.pid}</TableCell>
                          <TableCell>
                            <Tooltip title={fullCommand} placement="top-start">
                              <Typography className={classes.processName}>{simplifiedCommand}</Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{process.user || '-'}</TableCell>
                          <TableCell>{process.cpuPercentage}%</TableCell>
                          <TableCell>{process.cpuTime || '-'}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {t('cpuUsage.noProcessesFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Root>
  );
};

export default CpuUsage;
