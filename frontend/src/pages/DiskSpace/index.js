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
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import StorageIcon from '@mui/icons-material/Storage';
import FolderIcon from '@mui/icons-material/Folder';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [folderContents, setFolderContents] = useState(new Map());
  
  React.useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.height = '100%';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  useEffect(() => {
    const fetchDiskSpace = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/disk-space');
        console.log('Dados recebidos do backend:', data);
        console.log('Maiores pastas:', data.largestFolders);
        setDiskSpace(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Erro ao carregar informações de espaço em disco');
        toastError(err, t);
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

  const getFileIcon = (fileName, isFolder) => {
    if (isFolder) {
      return <FolderIcon sx={{ color: 'primary.main', fontSize: 18 }} />;
    }
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
      case 'scss':
      case 'json':
      case 'xml':
        return <CodeIcon sx={{ color: 'info.main', fontSize: 18 }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return <ImageIcon sx={{ color: 'success.main', fontSize: 18 }} />;
      case 'pdf':
        return <PictureAsPdfIcon sx={{ color: 'error.main', fontSize: 18 }} />;
      case 'md':
      case 'txt':
      case 'doc':
      case 'docx':
        return <DescriptionIcon sx={{ color: 'warning.main', fontSize: 18 }} />;
      default:
        return <InsertDriveFileIcon sx={{ color: 'text.secondary', fontSize: 18 }} />;
    };
  };

  const loadFolderContents = async (folderPath) => {
    try {
      const { data } = await api.get('/folder-contents', {
        params: { folderPath }
      });
      setFolderContents(prev => new Map(prev.set(folderPath, data)));
      return data;
    } catch (err) {
      console.error('Erro ao carregar conteúdo da pasta:', err);
      toastError(err, t);
      return [];
    }
  };

  const toggleFolder = async (folderPath, isFolder) => {
    if (!isFolder) return;
    
    const newExpanded = new Set(expandedFolders);
    
    if (expandedFolders.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
      
      if (!folderContents.has(folderPath)) {
        await loadFolderContents(folderPath);
      }
    }
    
    setExpandedFolders(newExpanded);
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{t('diskSpace.title')}</Title>
      </MainHeader>
      
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
              mb: 3,
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '5px',
                backgroundColor: diskSpace.usedPercentage > 90 ? "error.main" : diskSpace.usedPercentage > 70 ? "warning.main" : "success.main"
              }} />
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                padding: '0 16px',
                paddingTop: '16px',
                mb: 2, 
                mt: 1,
                gap: { xs: 2, sm: 0 }
              }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  minWidth: 0
                }}>
                  <Box sx={{ 
                    backgroundColor: diskSpace.usedPercentage > 90 ? "error.light" : diskSpace.usedPercentage > 70 ? "warning.light" : "success.light",
                    borderRadius: '50%',
                    p: 1.5,
                    mr: 2,
                    flexShrink: 0
                  }}>
                    <FolderIcon sx={{ color: '#fff', fontSize: 30 }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography 
                      variant="h5" 
                      fontWeight="500"
                      sx={{ 
                        fontSize: { xs: '1.1rem', sm: '1.5rem' },
                        wordBreak: 'break-word'
                      }}
                    >
                      {t('diskSpace.systemFolder', { name: diskSpace.folderName }, `Pasta do Sistema: ${diskSpace.folderName}`)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatBytes(diskSpace.folderSizeBytes)} / {diskSpace.totalSpace}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  textAlign: { xs: 'left', sm: 'right' },
                  alignSelf: { xs: 'flex-start', sm: 'center' },
                  ml: { xs: 0, sm: 'auto' }
                }}>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    color={getStatusColor(diskSpace.usedPercentage)}
                    sx={{ 
                      mb: -0.5,
                      fontSize: { xs: '2rem', sm: '2.125rem' }
                    }}
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
              
              <Box sx={{ px: 2, pb: 2, pt: 1, mt: 'auto' }}>
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
                    <Typography variant="subtitle2" sx={{ flex: 1 }}>Estrutura de Pastas</Typography>
                    <Typography variant="subtitle2" sx={{ width: '80px', textAlign: 'right', mr: 2 }}>Tamanho</Typography>
                    <Typography variant="subtitle2" sx={{ width: '130px', textAlign: 'center' }}>Uso (%)</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2,
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FolderOpenIcon sx={{ mr: 1, fontSize: 24 }} />
                        <Typography variant="h6" fontWeight="bold">
                          📁 dev/
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" fontWeight="bold">
                          {diskSpace.folderSize}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          100%
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>

                  {(() => {
                    const renderTreeItem = (item, depth = 0) => {
                      const percentage = Math.round((item.sizeBytes / diskSpace.folderSizeBytes) * 100);
                      const isFolder = item.type === 'folder';
                      const fileName = item.name.split('/').pop() || item.name;
                      const isExpanded = expandedFolders.has(item.name);
                      const contents = folderContents.get(item.name) || [];
                      
                      return (
                        <Box key={`${item.name}-${item.path}`} sx={{ mb: 0.5 }}>
                          <Paper 
                            elevation={1} 
                            sx={{ 
                              backgroundColor: depth % 2 === 0 ? 'background.default' : 'background.paper',
                              borderLeft: depth > 0 ? '2px solid' : 'none',
                              borderColor: isFolder ? 'primary.light' : 'info.light',
                              borderRadius: 1,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                p: 1.5,
                                pl: 2 + (depth * 2),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: isFolder ? 'pointer' : 'default',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                  transform: isFolder ? 'translateX(4px)' : 'none'
                                }
                              }}
                              onClick={() => toggleFolder(item.name, isFolder)}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                {isFolder && (
                                  <IconButton
                                    size="small"
                                    sx={{ 
                                      mr: 1, 
                                      p: 0.5,
                                      transition: 'transform 0.2s ease'
                                    }}
                                  >
                                    {isExpanded ? (
                                      <ExpandMoreIcon fontSize="small" />
                                    ) : (
                                      <ChevronRightIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                )}
                                
                                {!isFolder && (
                                  <Box sx={{ width: 32, mr: 1 }} />
                                )}
                                
                                {isFolder ? (
                                  isExpanded ? (
                                    <FolderOpenIcon sx={{ color: 'warning.main', mr: 1, fontSize: 20 }} />
                                  ) : (
                                    <FolderIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                                  )
                                ) : (
                                  getFileIcon(fileName, false)
                                )}
                                
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    fontFamily: 'monospace',
                                    fontWeight: isFolder ? 'bold' : 'medium',
                                    color: isFolder ? 'warning.dark' : 'text.primary',
                                    mr: 1
                                  }}
                                >
                                  {fileName}{isFolder ? '/' : ''}
                                </Typography>
                                
                                {!isFolder && (
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: 'text.secondary',
                                      fontStyle: 'italic'
                                    }}
                                  >
                                    arquivo
                                  </Typography>
                                )}
                              </Box>
                              
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'monospace',
                                  fontWeight: 'bold',
                                  minWidth: '60px',
                                  textAlign: 'right',
                                  mr: 2
                                }}
                              >
                                {item.size}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '130px' }}>
                                <Box sx={{ width: '80px', mr: 1 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={percentage} 
                                    color={percentage > 50 ? "error" : percentage > 30 ? "warning" : "primary"}
                                    sx={{ height: 6, borderRadius: 3 }}
                                  />
                                </Box>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 'bold',
                                    minWidth: '40px',
                                    color: percentage > 50 ? "error.main" : percentage > 30 ? "warning.main" : "primary.main"
                                  }}
                                >
                                  {percentage}%
                                </Typography>
                              </Box>
                            </Box>
                            
                            {isFolder && (
                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box sx={{ pl: 2, pb: 1 }}>
                                  {contents.map((child) => renderTreeItem(child, depth + 1))}
                                </Box>
                              </Collapse>
                            )}
                          </Paper>
                        </Box>
                      );
                    };

                    return diskSpace.largestFolders.map((item) => renderTreeItem(item, 0));
                  })()}
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
