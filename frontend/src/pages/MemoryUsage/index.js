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
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import MemoryIcon from '@mui/icons-material/Memory';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CachedIcon from '@mui/icons-material/Cached';
import toastError from '../../errors/toastError';
import api from '../../services/api';
import MainContainer from '../../components/MainContainer';
import MainHeader from '../../components/MainHeader';
import Title from '../../components/Title';

const PREFIX = 'MemoryUsage';

const classes = {
  root: `${PREFIX}-root`,
  card: `${PREFIX}-card`,
  progressBar: `${PREFIX}-progressBar`,
  warningText: `${PREFIX}-warningText`,
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
  [`& .${classes.warningText}`]: {
    color: theme.palette.warning.main,
    fontWeight: 'bold'
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

const MemoryUsage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [memoryInfo, setMemoryInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemoryUsage = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/memory-usage');
        
        if (!data) {
          throw new Error('Dados de memória não recebidos');
        }
        
        const safeData = {
          totalMemory: data.totalMemory || '0 B',
          totalMemoryBytes: data.totalMemoryBytes || 0,
          usedMemory: data.usedMemory || '0 B',
          usedMemoryBytes: data.usedMemoryBytes || 0,
          freeMemory: data.freeMemory || '0 B',
          freeMemoryBytes: data.freeMemoryBytes || 0,
          cachedMemory: data.cachedMemory || '0 B',
          cachedMemoryBytes: data.cachedMemoryBytes || 0,
          availableMemory: data.availableMemory || '0 B',
          availableMemoryBytes: data.availableMemoryBytes || 0,
          usedPercentage: data.usedPercentage || 0,
          processesMemory: Array.isArray(data.processesMemory) ? 
            data.processesMemory.map(process => ({
              pid: process.pid || 0,
              command: process.command || 'Desconhecido',
              memoryUsage: process.memoryUsage || '0 B',
              memoryPercentage: process.memoryPercentage || 0
            })) : []
        };
        
        setMemoryInfo(safeData);
        setError(null);
      } catch (err) {
        console.error('Erro ao obter dados de memória:', err);
        setError(err.message || 'Erro ao carregar informações de uso de memória');
        toastError(err, t);
        
        const fallbackData = {
          totalMemory: "8 GB",
          totalMemoryBytes: 8589934592,
          usedMemory: "4 GB",
          usedMemoryBytes: 4294967296,
          freeMemory: "4 GB",
          freeMemoryBytes: 4294967296,
          cachedMemory: "1 GB",
          cachedMemoryBytes: 1073741824,
          availableMemory: "4 GB",
          availableMemoryBytes: 4294967296,
          usedPercentage: 50,
          processesMemory: [
            {
              pid: 1234,
              command: "node",
              memoryUsage: "500 MB",
              memoryPercentage: 6.25
            },
            {
              pid: 5678,
              command: "chrome",
              memoryUsage: "1 GB",
              memoryPercentage: 12.5
            }
          ]
        };
        
        setMemoryInfo(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchMemoryUsage();
    
    const interval = setInterval(fetchMemoryUsage, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [t]);

  const getStatusColor = (percentage) => {
    if (percentage < 70) return 'success.main';
    if (percentage < 90) return 'warning.main';
    return 'error.main';
  };

  const getStatusIcon = (percentage) => {
    if (percentage < 70) {
      return <CheckCircleIcon className={classes.healthyIcon} />;
    }
    if (percentage < 90) {
      return <WarningIcon className={classes.warningIcon} />;
    }
    return <WarningIcon className={classes.criticalIcon} />;
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{t('memoryUsage.title')}</Title>
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
              Carregando informações de memória...
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
        ) : memoryInfo && (
          <>
            <Paper className={classes.card} elevation={3}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box display="flex" alignItems="center">
                  <MemoryIcon className={classes.infoIcon} />
                  <Typography variant="h5" fontWeight="600">
                    {t('memoryUsage.systemMemory')}
                  </Typography>
                </Box>
                <Box 
                  display="flex" 
                  alignItems="center"
                  sx={{
                    backgroundColor: memoryInfo.usedPercentage < 70 
                      ? 'success.light' 
                      : memoryInfo.usedPercentage < 90 
                        ? 'warning.light' 
                        : 'error.light',
                    color: memoryInfo.usedPercentage < 70 
                      ? 'success.dark' 
                      : memoryInfo.usedPercentage < 90 
                        ? 'warning.dark' 
                        : 'error.dark',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontWeight: 'bold'
                  }}
                >
                  {getStatusIcon(memoryInfo.usedPercentage)}
                  <Typography 
                    component="span" 
                    fontWeight="bold"
                    fontSize="0.95rem"
                  >
                    {memoryInfo.usedPercentage < 70 
                      ? t('memoryUsage.healthy') 
                      : memoryInfo.usedPercentage < 90 
                        ? t('memoryUsage.warning') 
                        : t('memoryUsage.critical')}
                  </Typography>
                </Box>
              </Box>
              
              <Box mb={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="body1" fontWeight="500" fontSize="1.1rem">
                    {memoryInfo.usedMemory} / {memoryInfo.totalMemory}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color={getStatusColor(memoryInfo.usedPercentage)}
                    fontWeight="bold"
                  >
                    {memoryInfo.usedPercentage}%
                  </Typography>
                </Box>
                <Tooltip title={`${memoryInfo.usedPercentage}% ${t('memoryUsage.used')}`}>
                  <LinearProgress 
                    className={classes.progressBar}
                    variant="determinate" 
                    value={memoryInfo.usedPercentage} 
                    color={memoryInfo.usedPercentage > 90 ? "error" : memoryInfo.usedPercentage > 70 ? "warning" : "success"}
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
                        <MemoryIcon sx={{ fontSize: '1.8rem' }} />
                      </Box>
                      <Typography variant="subtitle1" fontWeight="600" color="textSecondary">
                        {t('memoryUsage.totalMemory')}
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="primary" mb={0.5}>
                      {memoryInfo.totalMemory}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatBytes(memoryInfo.totalMemoryBytes)}
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
                          backgroundColor: memoryInfo.usedPercentage > 70 ? 'error.light' : 'info.light',
                          color: memoryInfo.usedPercentage > 70 ? 'error.main' : 'info.main',
                          borderRadius: '12px',
                          padding: 1.5,
                          display: 'flex',
                          marginRight: 1.5
                        }}
                      >
                        <MemoryIcon sx={{ fontSize: '1.8rem' }} />
                      </Box>
                      <Typography variant="subtitle1" fontWeight="600" color="textSecondary">
                        {t('memoryUsage.usedMemory')}
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="primary" mb={0.5}>
                      {memoryInfo.usedMemory}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatBytes(memoryInfo.usedMemoryBytes)}
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
                        <CachedIcon sx={{ fontSize: '1.8rem' }} />
                      </Box>
                      <Typography variant="subtitle1" fontWeight="600" color="textSecondary">
                        {t('memoryUsage.cachedMemory')}
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="primary" mb={0.5}>
                      {memoryInfo.cachedMemory}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatBytes(memoryInfo.cachedMemoryBytes)}
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
                        <MemoryIcon sx={{ fontSize: '1.8rem' }} />
                      </Box>
                      <Typography variant="subtitle1" fontWeight="600" color="textSecondary">
                        {t('memoryUsage.availableMemory')}
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="primary" mb={0.5}>
                      {memoryInfo.availableMemory}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatBytes(memoryInfo.availableMemoryBytes)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {memoryInfo.usedPercentage > 70 && (
              <Paper 
                className={classes.card} 
                elevation={3}
                sx={{ 
                  mt: 3,
                  backgroundColor: memoryInfo.usedPercentage > 90 ? 'error.light' : 'warning.light',
                  borderLeft: 6,
                  borderColor: memoryInfo.usedPercentage > 90 ? 'error.main' : 'warning.main'
                }}
              >
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      backgroundColor: memoryInfo.usedPercentage > 90 ? 'error.main' : 'warning.main',
                      color: 'white',
                      borderRadius: '50%',
                      padding: 1.5,
                      display: 'flex',
                      marginRight: 2
                    }}
                  >
                    <WarningIcon sx={{ fontSize: '1.8rem' }} />
                  </Box>
                  <Typography 
                    variant="body1" 
                    fontWeight="600"
                    color={memoryInfo.usedPercentage > 90 ? 'error.dark' : 'warning.dark'}
                  >
                    {memoryInfo.usedPercentage > 90 
                      ? t('memoryUsage.criticalWarning') 
                      : t('memoryUsage.warningMessage')}
                  </Typography>
                </Box>
              </Paper>
            )}        
            
            <Paper className={classes.card} elevation={3} sx={{ mt: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <MemoryIcon className={classes.infoIcon} />
                <Typography variant="h5" fontWeight="600">
                  {t('memoryUsage.topProcesses')}
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 650, width: '100%', borderRadius: 2 }}>
                <Table stickyHeader sx={{ width: '100%', tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ minWidth: 80, width: '10%' }} />
                    <col style={{ minWidth: 250, width: '50%' }} />
                    <col style={{ minWidth: 120, width: '20%' }} />
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
                        {t('memoryUsage.pid')}
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
                        {t('memoryUsage.process')}
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          padding: '16px 12px', 
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText'
                        }}
                      >
                        {t('memoryUsage.memoryUsage')}
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          padding: '16px 12px', 
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText'
                        }}
                      >
                        {t('memoryUsage.percentage')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {memoryInfo.processesMemory && Array.isArray(memoryInfo.processesMemory) && memoryInfo.processesMemory.length > 0 ? (
                      memoryInfo.processesMemory.map((process, index) => {
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
                            <TableCell align="right" sx={{ padding: '14px 12px', fontWeight: 500 }}>
                              {process.memoryUsage}
                            </TableCell>
                            <TableCell 
                              align="right" 
                              sx={{ 
                                padding: '14px 12px', 
                                fontWeight: 'bold',
                                color: process.memoryPercentage > 5 ? 'warning.main' : 'text.primary'
                              }}
                            >
                              {process.memoryPercentage}%
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell 
                          colSpan={4} 
                          align="center"
                          sx={{ padding: '24px 12px', color: 'text.secondary' }}
                        >
                          {t('memoryUsage.noProcesses')}
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

export default MemoryUsage;
