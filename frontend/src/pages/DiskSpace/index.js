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
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import StorageIcon from '@mui/icons-material/Storage';
import FolderIcon from '@mui/icons-material/Folder';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
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
  loadingContainer: `${PREFIX}-loadingContainer`,
  folderTable: `${PREFIX}-folderTable`,
  folderIcon: `${PREFIX}-folderIcon`,
  folderTreeView: `${PREFIX}-folderTreeView`,
  folderTreeItem: `${PREFIX}-folderTreeItem`,
  folderTreeItemNested: `${PREFIX}-folderTreeItemNested`,
  folderTreeItemText: `${PREFIX}-folderTreeItemText`,
  folderTreeItemSize: `${PREFIX}-folderTreeItemSize`,
  folderTreeItemPercentage: `${PREFIX}-folderTreeItemPercentage`
};

const Root = styled('div')(({ theme }) => ({
  height: '100%',
  overflow: 'auto',
  [`& .${classes.container}`]: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    overflow: 'visible'
  },
  [`& .${classes.card}`]: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2)
  },
  [`& .${classes.progressBar}`]: {
    height: 10,
    borderRadius: 5
  },
  [`& .${classes.warningText}`]: {
    color: theme.palette.warning.main
  },
  [`& .${classes.infoIcon}`]: {
    verticalAlign: 'middle',
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main
  },
  [`& .${classes.healthyIcon}`]: {
    verticalAlign: 'middle',
    marginRight: theme.spacing(1),
    color: theme.palette.success.main
  },
  [`& .${classes.warningIcon}`]: {
    verticalAlign: 'middle',
    marginRight: theme.spacing(1),
    color: theme.palette.warning.main
  },
  [`& .${classes.criticalIcon}`]: {
    verticalAlign: 'middle',
    marginRight: theme.spacing(1),
    color: theme.palette.error.main
  },
  [`& .${classes.detailsCard}`]: {
    height: '100%'
  },
  [`& .${classes.loadingContainer}`]: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4)
  },
  [`& .${classes.folderTable}`]: {
    marginTop: theme.spacing(2)
  },
  [`& .${classes.folderIcon}`]: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main
  },
  [`& .${classes.folderTreeView}`]: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.05)'
  },
  [`& .${classes.folderTreeItem}`]: {
    borderLeft: `2px solid ${theme.palette.primary.light}`,
    marginLeft: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderRadius: '0 4px 4px 0',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      boxShadow: `0 0 0 1px ${theme.palette.primary.light}`
    }
  },
  [`& .${classes.folderTreeItemNested}`]: {
    paddingLeft: theme.spacing(2)
  },
  [`& .${classes.folderTreeItemText}`]: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    flex: 1
  },
  [`& .${classes.folderTreeItemSize}`]: {
    marginLeft: theme.spacing(2),
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    color: theme.palette.text.secondary,
    minWidth: '60px',
    textAlign: 'right'
  },
  [`& .${classes.folderTreeItemPercentage}`]: {
    marginLeft: theme.spacing(2),
    width: '120px',
    display: 'flex',
    alignItems: 'center'
  }
}));

const DiskSpace = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [diskSpace, setDiskSpace] = useState(null);
  const [error, setError] = useState(null);
  
  // Adicionar estilo global para garantir que a página tenha rolagem
  React.useEffect(() => {
    // Adicionar estilo para garantir que o corpo da página tenha altura mínima
    document.body.style.overflow = 'auto';
    document.body.style.height = '100%';
    
    return () => {
      // Limpar estilos ao desmontar o componente
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

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
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  const getStatusColor = (percentage) => {
    if (percentage > 90) return 'error';
    if (percentage > 70) return 'warning';
    return 'success';
  };
  
  const getStatusIcon = (percentage) => {
    if (percentage > 90) {
      return <WarningIcon className={classes.criticalIcon} />;
    } else if (percentage > 70) {
      return <WarningIcon className={classes.warningIcon} />;
    } else {
      return <CheckCircleIcon className={classes.healthyIcon} />;
    }
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
      
      {/* Conteúdo com rolagem */}
      <Box 
        sx={{ 
          height: 'calc(100vh - 120px)', 
          overflow: 'auto', 
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.01)'
        }}
      >
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
            <Paper className={classes.card} sx={{ 
              boxShadow: 3, 
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              mb: 3
            }}>
              <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '5px',
                backgroundColor: diskSpace.usedPercentage > 90 ? "error.main" : diskSpace.usedPercentage > 70 ? "warning.main" : "success.main"
              }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 1 }}>
                <Box sx={{ 
                  backgroundColor: diskSpace.usedPercentage > 90 ? "error.light" : diskSpace.usedPercentage > 70 ? "warning.light" : "success.light",
                  borderRadius: '50%',
                  p: 1.5,
                  mr: 2
                }}>
                  <FolderIcon sx={{ color: '#fff', fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="500">
                    {t('diskSpace.systemFolder', { name: diskSpace.folderName }, `Pasta do Sistema: ${diskSpace.folderName}`)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatBytes(diskSpace.folderSizeBytes)} / {diskSpace.totalSpace}
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    color={getStatusColor(diskSpace.usedPercentage)}
                    sx={{ mb: -0.5 }}
                  >
                    {diskSpace.usedPercentage}%
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={getStatusColor(diskSpace.usedPercentage)}
                    fontWeight="medium"
                  >
                    {diskSpace.usedPercentage < 70 
                      ? t('diskSpace.healthy') 
                      : diskSpace.usedPercentage < 90 
                        ? t('diskSpace.warning') 
                        : t('diskSpace.critical')}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ px: 2, pb: 2, pt: 1 }}>
                <Tooltip title={`${diskSpace.usedPercentage}% ${t('diskSpace.used')}`}>
                  <LinearProgress 
                    className={classes.progressBar}
                    variant="determinate" 
                    value={diskSpace.usedPercentage} 
                    color={diskSpace.usedPercentage > 90 ? "error" : diskSpace.usedPercentage > 70 ? "warning" : "success"}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Tooltip>
              </Box>
            </Paper>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card className={classes.detailsCard} sx={{ 
                  boxShadow: 2, 
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 }
                }}>
                  <CardContent sx={{ position: 'relative', pt: 3, pb: 3 }}>
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '4px', 
                      backgroundColor: 'primary.main' 
                    }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ 
                        backgroundColor: 'primary.light', 
                        borderRadius: '50%', 
                        p: 1, 
                        display: 'flex', 
                        mr: 2 
                      }}>
                        <FolderIcon sx={{ color: '#fff' }} />
                      </Box>
                      <Typography variant="h6">
                        {t('diskSpace.folderSize')}
                      </Typography>
                    </Box>
                    <Typography variant="h3" color="primary" sx={{ my: 2, fontWeight: 'bold' }}>
                      {diskSpace.folderSize}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatBytes(diskSpace.folderSizeBytes)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card className={classes.detailsCard} sx={{ 
                  boxShadow: 2, 
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 }
                }}>
                  <CardContent sx={{ position: 'relative', pt: 3, pb: 3 }}>
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '4px', 
                      backgroundColor: 'success.main' 
                    }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ 
                        backgroundColor: 'success.light', 
                        borderRadius: '50%', 
                        p: 1, 
                        display: 'flex', 
                        mr: 2 
                      }}>
                        <StorageIcon sx={{ color: '#fff' }} />
                      </Box>
                      <Typography variant="h6">
                        {t('diskSpace.freeSpace')}
                      </Typography>
                    </Box>
                    <Typography variant="h3" color="success.main" sx={{ my: 2, fontWeight: 'bold' }}>
                      {diskSpace.freeSpace}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatBytes(diskSpace.freeSpaceBytes)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card className={classes.detailsCard} sx={{ 
                  boxShadow: 2, 
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 }
                }}>
                  <CardContent sx={{ position: 'relative', pt: 3, pb: 3 }}>
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '4px', 
                      backgroundColor: 'info.main' 
                    }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ 
                        backgroundColor: 'info.light', 
                        borderRadius: '50%', 
                        p: 1, 
                        display: 'flex', 
                        mr: 2 
                      }}>
                        <StorageIcon sx={{ color: '#fff' }} />
                      </Box>
                      <Typography variant="h6">
                        {t('diskSpace.totalSpace')}
                      </Typography>
                    </Box>
                    <Typography variant="h3" color="info.main" sx={{ my: 2, fontWeight: 'bold' }}>
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
              <Paper 
                className={classes.card} 
                sx={{ 
                  mt: 2, 
                  mb: 3, 
                  borderLeft: '4px solid', 
                  borderColor: diskSpace.usedPercentage > 90 ? 'error.main' : 'warning.main',
                  backgroundColor: diskSpace.usedPercentage > 90 ? 'rgba(211, 47, 47, 0.1)' : 'rgba(237, 108, 2, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  p: 2
                }}
                elevation={diskSpace.usedPercentage > 90 ? 3 : 1}
              >
                <Box sx={{ 
                  backgroundColor: diskSpace.usedPercentage > 90 ? 'error.main' : 'warning.main',
                  borderRadius: '50%',
                  p: 1,
                  mr: 2,
                  display: 'flex'
                }}>
                  <WarningIcon sx={{ color: '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color={diskSpace.usedPercentage > 90 ? 'error.main' : 'warning.main'}>
                    {diskSpace.usedPercentage > 90 ? 'Alerta Crítico!' : 'Atenção!'}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {diskSpace.usedPercentage > 90 
                      ? t('diskSpace.criticalWarning') 
                      : t('diskSpace.warningMessage')}
                  </Typography>
                </Box>
              </Paper>
            )}
            
            {/* Listagem das maiores pastas em estilo árvore */}
            <Paper className={`${classes.card} ${classes.folderTable}`} sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                <FolderOpenIcon sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
                <Typography variant="h5" fontWeight="500" color="primary.main">
                  {t('diskSpace.largestFolders', 'Maiores Pastas')}
                </Typography>
                <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                  (Top 20)
                </Typography>
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'error.main', mr: 0.5 }} />
                    <Typography variant="caption">{'> 50%'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'warning.main', mr: 0.5 }} />
                    <Typography variant="caption">{'30-50%'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'primary.main', mr: 0.5 }} />
                    <Typography variant="caption">{'< 30%'}</Typography>
                  </Box>
                </Box>
              </Box>
              
              {diskSpace.largestFolders && diskSpace.largestFolders.length > 0 ? (
                <Box className={classes.folderTreeView}>
                  {/* Cabeçalho da tabela */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    borderBottom: '2px solid', 
                    borderColor: 'divider', 
                    pb: 1, 
                    mb: 2, 
                    fontWeight: 'bold',
                    color: 'text.secondary'
                  }}>
                    <Typography variant="subtitle2" sx={{ flex: 1 }}>Nome da Pasta</Typography>
                    <Typography variant="subtitle2" sx={{ width: '80px', textAlign: 'right', mr: 2 }}>Tamanho</Typography>
                    <Typography variant="subtitle2" sx={{ width: '130px', textAlign: 'center' }}>Uso (%)</Typography>
                  </Box>
                  {diskSpace.largestFolders.map((folder, index) => {
                    const percentage = Math.round((folder.sizeBytes / diskSpace.folderSizeBytes) * 100);
                    const pathParts = folder.name.split('/');
                    const folderName = pathParts[pathParts.length - 1] || folder.name;
                    const depth = pathParts.length - 1;
                    
                    // Criar representação visual do caminho em estilo árvore
                    return (
                      <Box key={index} sx={{ mb: 1.5 }}>
                        <Paper 
                          elevation={1} 
                          className={classes.folderTreeItem} 
                          sx={{ 
                            pl: depth * 2,
                            backgroundColor: index % 2 === 0 ? 'background.default' : 'background.paper'
                          }}
                        >
                          <Box className={classes.folderTreeItemText}>
                            {/* Prefixo da árvore baseado na profundidade */}
                            {depth > 0 && (
                              <Box 
                                component="span" 
                                sx={{ 
                                  mr: 1, 
                                  color: 'primary.main', 
                                  display: 'inline-block', 
                                  width: 'auto',
                                  fontFamily: 'monospace',
                                  fontWeight: 'bold'
                                }}
                              >
                                {index === diskSpace.largestFolders.length - 1 || depth !== pathParts.length - 1 ? '└── ' : '├── '}
                              </Box>
                            )}
                            <FolderIcon color="primary" sx={{ mr: 1 }} />
                            <Typography 
                              variant="body1" 
                              component="span" 
                              sx={{ fontWeight: 'medium' }}
                            >
                              {folderName}/
                            </Typography>
                          </Box>
                          <Typography 
                            variant="body2" 
                            className={classes.folderTreeItemSize}
                            sx={{ fontWeight: 'bold' }}
                          >
                            {folder.size}
                          </Typography>
                          <Box className={classes.folderTreeItemPercentage}>
                            <Box width="80px" mr={1}>
                              <LinearProgress 
                                variant="determinate" 
                                value={percentage} 
                                color={percentage > 50 ? "error" : percentage > 30 ? "warning" : "primary"}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                minWidth: '50px',
                                fontWeight: 'bold',
                                color: percentage > 50 ? "error.main" : percentage > 30 ? "warning.main" : "primary.main"
                              }}
                            >
                              {percentage}%
                            </Typography>
                          </Box>
                        </Paper>
                        
                        {/* Visualização do caminho completo em formato de árvore */}
                        {pathParts.length > 1 && (
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              pl: (depth + 1) * 2 + 2, 
                              pr: 2,
                              py: 0.5,
                              ml: (depth + 1) * 2,
                              mb: 1,
                              mt: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                              borderRadius: 1,
                              borderColor: 'primary.light',
                              backgroundColor: 'background.paper',
                              maxWidth: 'fit-content'
                            }}
                          >
                            <Box 
                              component="span" 
                              sx={{ 
                                width: '18px', 
                                height: '18px', 
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 1,
                                fontSize: '0.7rem',
                                color: 'primary.main',
                                border: '1px solid',
                                borderColor: 'primary.light',
                                borderRadius: '50%',
                                backgroundColor: 'background.default'
                              }}
                            >
                              i
                            </Box>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'text.primary',
                                fontSize: '0.8rem',
                                fontStyle: 'italic'
                              }}
                            >
                              Caminho completo: <Box component="span" sx={{ fontWeight: 'medium' }}>{folder.name}</Box>
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  {t('diskSpace.noFoldersFound', 'Nenhuma pasta encontrada')}
                </Typography>
              )}
            </Paper>
          </>
        )}
      </Box>
    </MainContainer>
  );
};

export default DiskSpace;
