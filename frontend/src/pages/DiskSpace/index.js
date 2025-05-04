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
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import StorageIcon from '@mui/icons-material/Storage';
import FolderIcon from '@mui/icons-material/Folder';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import toastError from '../../errors/toastError';
import api from '../../services/api';
import MainContainer from '../../components/MainContainer';
import MainHeader from '../../components/MainHeader';
import Title from '../../components/Title';

const PREFIX = 'DiskSpace';

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
  loadingContainer: `${PREFIX}-loadingContainer`
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
  [`& .${classes.warningText}`]: {
    color: theme.palette.warning.main,
    fontWeight: 'bold'
  },
  [`& .${classes.infoIcon}`]: {
    marginRight: theme.spacing(1),
    verticalAlign: 'middle'
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
  }
}));

const DiskSpace = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [diskSpace, setDiskSpace] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiskSpace = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/disk-space');
        setDiskSpace(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Erro ao carregar informações de espaço em disco');
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiskSpace();
    
    const interval = setInterval(fetchDiskSpace, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

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
        <Title>{t('diskSpace.title')}</Title>
      </MainHeader>
      
      <Root className={classes.root}>
        {loading ? (
          <Box className={classes.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper className={classes.card}>
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          </Paper>
        ) : diskSpace && (
          <>
            <Paper className={classes.card}>
              <Typography variant="h6" gutterBottom>
                <FolderIcon className={classes.infoIcon} />
                {t('diskSpace.systemFolder', { name: diskSpace.folderName }, `Pasta do Sistema: ${diskSpace.folderName}`)}
              </Typography>
              
              <Box mt={2} mb={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">
                    {formatBytes(diskSpace.folderSizeBytes)} / {diskSpace.totalSpace}
                  </Typography>
                  <Typography variant="body2" color={getStatusColor(diskSpace.usedPercentage)}>
                    {diskSpace.usedPercentage}%
                  </Typography>
                </Box>
                <Tooltip title={`${diskSpace.usedPercentage}% ${t('diskSpace.used')}`}>
                  <LinearProgress 
                    className={classes.progressBar}
                    variant="determinate" 
                    value={diskSpace.usedPercentage} 
                    color={diskSpace.usedPercentage > 90 ? "error" : diskSpace.usedPercentage > 70 ? "warning" : "success"}
                  />
                </Tooltip>
              </Box>
              
              <Box mt={2}>
                {getStatusIcon(diskSpace.usedPercentage)}
                <Typography 
                  component="span" 
                  color={getStatusColor(diskSpace.usedPercentage)}
                  fontWeight="bold"
                >
                  {diskSpace.usedPercentage < 70 
                    ? t('diskSpace.healthy') 
                    : diskSpace.usedPercentage < 90 
                      ? t('diskSpace.warning') 
                      : t('diskSpace.critical')}
                </Typography>
              </Box>
            </Paper>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card className={classes.detailsCard}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <FolderIcon className={classes.infoIcon} />
                      {t('diskSpace.folderSize')}
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {diskSpace.folderSize}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatBytes(diskSpace.folderSizeBytes)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card className={classes.detailsCard}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <StorageIcon className={classes.infoIcon} />
                      {t('diskSpace.freeSpace')}
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {diskSpace.freeSpace}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatBytes(diskSpace.freeSpaceBytes)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card className={classes.detailsCard}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <StorageIcon className={classes.infoIcon} />
                      {t('diskSpace.totalSpace')}
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {diskSpace.totalSpace}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatBytes(diskSpace.totalSpaceBytes)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {diskSpace.usedPercentage > 70 && (
              <Paper className={classes.card} sx={{ mt: 2 }}>
                <Typography variant="body1">
                  <WarningIcon className={classes.warningIcon} />
                  {diskSpace.usedPercentage > 90 
                    ? t('diskSpace.criticalWarning') 
                    : t('diskSpace.warningMessage')}
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Root>
    </MainContainer>
  );
};

export default DiskSpace;
