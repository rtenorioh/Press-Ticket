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
import MainContainer from '../../components/MainContainer';
import MainHeader from '../../components/MainHeader';
import Title from '../../components/Title';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

const PREFIX = 'CpuUsage';
const classes = {
  root: `${PREFIX}-root`,
  card: `${PREFIX}-card`,
  progressBar: `${PREFIX}-progressBar`,
  infoIcon: `${PREFIX}-infoIcon`,
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
    padding: theme.spacing(3),
    width: '100%',
    overflowY: 'auto'
  },
  [`& .${classes.card}`]: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    }
  },
  [`& .${classes.progressBar}`]: {
    height: 32,
    borderRadius: 16,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.08)',
    '& .MuiLinearProgress-bar': {
      borderRadius: 16,
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)'
        : 'linear-gradient(90deg, #66bb6a 0%, #4caf50 100%)'
    }
  },
  [`& .${classes.infoIcon}`]: {
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
    fontSize: '1.5rem'
  },
  [`& .${classes.healthyIcon}`]: {
    color: theme.palette.success.main,
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
    fontSize: '1.5rem'
  },
  [`& .${classes.warningIcon}`]: {
    color: theme.palette.warning.main,
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
    fontSize: '1.5rem'
  },
  [`& .${classes.criticalIcon}`]: {
    color: theme.palette.error.main,
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
    fontSize: '1.5rem'
  },
  [`& .${classes.detailsCard}`]: {
    height: '100%',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
    }
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
    overflow: 'hidden',
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
    <MainContainer>
      <MainHeader>
        <Title>{t('cpuUsage.title')}</Title>
      </MainHeader>
      
      <Root className={classes.root}>
        {loading ? (
        <Box 
          className={classes.loadingContainer}
          sx={{
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body1" color="textSecondary">
            Carregando informações de CPU...
          </Typography>
        </Box>
      ) : error ? (
        <Paper 
          className={classes.card} 
          elevation={3}
          sx={{
            backgroundColor: 'error.light',
            borderLeft: 6,
            borderColor: 'error.main'
          }}
        >
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                backgroundColor: 'error.main',
                color: 'white',
                borderRadius: '50%',
                padding: 1.5,
                display: 'flex',
                marginRight: 2
              }}
            >
              <WarningIcon sx={{ fontSize: '1.8rem' }} />
            </Box>
            <Typography variant="h6" color="error.dark" fontWeight="600">
              {error}
            </Typography>
          </Box>
        </Paper>
      ) : (
        <>
          <Paper className={classes.card} elevation={3}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center">
                <CpuIcon className={classes.infoIcon} />
                <Typography variant="h5" fontWeight="600">
                  {t('cpuUsage.systemCpu')}
                </Typography>
              </Box>
              <Box 
                display="flex" 
                alignItems="center"
                sx={{
                  backgroundColor: cpuInfo.cpuUsage < 70 
                    ? 'success.light' 
                    : cpuInfo.cpuUsage < 90 
                      ? 'warning.light' 
                      : 'error.light',
                  color: cpuInfo.cpuUsage < 70 
                    ? 'success.dark' 
                    : cpuInfo.cpuUsage < 90 
                      ? 'warning.dark' 
                      : 'error.dark',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: 'bold'
                }}
              >
                {getStatusIcon(cpuInfo.cpuUsage)}
                <Typography 
                  component="span" 
                  fontWeight="bold"
                  fontSize="0.95rem"
                >
                  {cpuInfo.cpuUsage < 70 ? 'Saudável' : cpuInfo.cpuUsage < 90 ? 'Alerta' : 'Crítico'}
                </Typography>
              </Box>
            </Box>
            
            <Box mb={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="body1" fontWeight="500" fontSize="1.1rem">
                  Uso da CPU
                </Typography>
                <Typography 
                  variant="h6" 
                  color={getStatusColor(cpuInfo.cpuUsage)}
                  fontWeight="bold"
                >
                  {cpuInfo.cpuUsage}%
                </Typography>
              </Box>
              <Tooltip title={`${cpuInfo.cpuUsage}% em uso`}>
                <LinearProgress 
                  className={classes.progressBar}
                  variant="determinate" 
                  value={cpuInfo.cpuUsage} 
                  color={cpuInfo.cpuUsage > 90 ? "error" : cpuInfo.cpuUsage > 70 ? "warning" : "success"}
                />
              </Tooltip>
            </Box>
          </Paper>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card className={classes.detailsCard} elevation={2}>
                <CardContent sx={{ padding: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      sx={{
                        backgroundColor: 'primary.light',
                        color: 'primary.main',
                        borderRadius: '12px',
                        padding: 1.5,
                        display: 'flex',
                        marginRight: 1.5
                      }}
                    >
                      <CpuIcon sx={{ fontSize: '1.8rem' }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="600" color="textSecondary">
                      {t('cpuUsage.modelCPU')}
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="primary" sx={{ wordBreak: 'break-word' }}>
                    {cpuInfo.cpuModel}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className={classes.detailsCard} elevation={2}>
                <CardContent sx={{ padding: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      sx={{
                        backgroundColor: 'info.light',
                        color: 'info.main',
                        borderRadius: '12px',
                        padding: 1.5,
                        display: 'flex',
                        marginRight: 1.5
                      }}
                    >
                      <CpuIcon sx={{ fontSize: '1.8rem' }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="600" color="textSecondary">
                      {t('cpuUsage.cores')}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="primary" mb={0.5}>
                    {cpuInfo.cores}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {cpuInfo.threads} {t('cpuUsage.threads')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className={classes.detailsCard} elevation={2}>
                <CardContent sx={{ padding: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      sx={{
                        backgroundColor: 'warning.light',
                        color: 'warning.main',
                        borderRadius: '12px',
                        padding: 1.5,
                        display: 'flex',
                        marginRight: 1.5
                      }}
                    >
                      <CpuIcon sx={{ fontSize: '1.8rem' }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="600" color="textSecondary">
                      {t('cpuUsage.frequency')}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {cpuInfo.frequency}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className={classes.detailsCard} elevation={2}>
                <CardContent sx={{ padding: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      sx={{
                        backgroundColor: 'success.light',
                        color: 'success.main',
                        borderRadius: '12px',
                        padding: 1.5,
                        display: 'flex',
                        marginRight: 1.5
                      }}
                    >
                      <CpuIcon sx={{ fontSize: '1.8rem' }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="600" color="textSecondary">
                      {t('cpuUsage.uptime')}
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="primary" mb={0.5}>
                    {cpuInfo.uptime}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Load avg: {cpuInfo.loadAverage.join(', ')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Paper className={classes.card} elevation={3} sx={{ mt: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <CpuIcon className={classes.infoIcon} />
              <Typography variant="h5" fontWeight="600">
                {t('cpuUsage.topProcesses')}
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 650, width: '100%', borderRadius: 2 }}>
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
                    <TableCell 
                      sx={{ 
                        padding: '16px 12px', 
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText'
                      }}
                    >
                      {t('cpuUsage.pid')}
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        padding: '16px 12px', 
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText'
                      }}
                    >
                      {t('cpuUsage.process')}
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        padding: '16px 12px', 
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText'
                      }}
                    >
                      {t('cpuUsage.user')}
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        padding: '16px 12px', 
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText'
                      }}
                    >
                      {t('cpuUsage.cpuUsage')}
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        padding: '16px 12px', 
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText'
                      }}
                    >
                      {t('cpuUsage.cpuTime')}
                    </TableCell>
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
                        <TableRow 
                          key={index}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: 'action.hover',
                            },
                            '&:hover': {
                              backgroundColor: 'action.selected',
                              transition: 'background-color 0.2s ease'
                            }
                          }}
                        >
                          <TableCell sx={{ padding: '14px 12px', fontWeight: 500 }}>
                            {process.pid}
                          </TableCell>
                          <TableCell sx={{ padding: '14px 12px' }}>
                            <Tooltip title={fullCommand} placement="top-start">
                              <Typography 
                                className={classes.processName}
                                sx={{ 
                                  fontWeight: 500,
                                  color: 'text.primary'
                                }}
                              >
                                {simplifiedCommand}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ padding: '14px 12px', fontWeight: 500 }}>
                            {process.user || '-'}
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              padding: '14px 12px', 
                              fontWeight: 'bold',
                              color: process.cpuPercentage > 50 ? 'warning.main' : 'text.primary'
                            }}
                          >
                            {process.cpuPercentage}%
                          </TableCell>
                          <TableCell sx={{ padding: '14px 12px', fontWeight: 500 }}>
                            {process.cpuTime || '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell 
                        colSpan={5} 
                        align="center"
                        sx={{ padding: '24px 12px', color: 'text.secondary' }}
                      >
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
    </MainContainer>
  );
};

export default CpuUsage;
