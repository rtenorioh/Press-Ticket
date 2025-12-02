import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
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
  TableRow,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import StorageIcon from '@mui/icons-material/Storage';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CachedIcon from '@mui/icons-material/Cached';
import ErrorIcon from '@mui/icons-material/Error';
import toastError from '../../errors/toastError';
import api from '../../services/api';
import MainContainer from '../../components/MainContainer';
import MainHeader from '../../components/MainHeader';
import Title from '../../components/Title';

const PREFIX = 'DatabaseStatus';

const classes = {
  root: `${PREFIX}-root`,
  card: `${PREFIX}-card`,
  warningText: `${PREFIX}-warningText`,
  infoIcon: `${PREFIX}-infoIcon`,
  healthyIcon: `${PREFIX}-healthyIcon`,
  warningIcon: `${PREFIX}-warningIcon`,
  criticalIcon: `${PREFIX}-criticalIcon`,
  detailsCard: `${PREFIX}-detailsCard`,
  loadingContainer: `${PREFIX}-loadingContainer`,
  tableContainer: `${PREFIX}-tableContainer`,
  tableName: `${PREFIX}-tableName`,
  statusChip: `${PREFIX}-statusChip`,
  refreshButton: `${PREFIX}-refreshButton`,
  headerContainer: `${PREFIX}-headerContainer`,
  sectionTitle: `${PREFIX}-sectionTitle`,
  sectionDivider: `${PREFIX}-sectionDivider`
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    padding: 2,
    width: '100%',
    overflowY: 'auto'
  },
  [`& .${classes.card}`]: {
    marginBottom: 2,
    padding: 2
  },
  [`& .${classes.warningText}`]: {
    color: theme.palette.warning.main,
    fontWeight: 'bold'
  },
  [`& .${classes.infoIcon}`]: {
    marginRight: 1,
    verticalAlign: 'middle'
  },
  [`& .${classes.healthyIcon}`]: {
    color: theme.palette.success.main,
    marginRight: 1,
    verticalAlign: 'middle'
  },
  [`& .${classes.warningIcon}`]: {
    color: theme.palette.warning.main,
    marginRight: 1,
    verticalAlign: 'middle'
  },
  [`& .${classes.criticalIcon}`]: {
    color: theme.palette.error.main,
    marginRight: 1,
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
    marginTop: 2
  },
  [`& .${classes.tableName}`]: {
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  [`& .${classes.statusChip}`]: {
    fontWeight: 'bold'
  },
  [`& .${classes.refreshButton}`]: {
    marginLeft: theme.spacing(1)
  },
  [`& .${classes.headerContainer}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  [`& .${classes.sectionTitle}`]: {
    marginTop: 3,
    marginBottom: 1,
    fontWeight: 'bold'
  },
  [`& .${classes.sectionDivider}`]: {
    marginTop: 2,
    marginBottom: 2
  }
}));

const DatabaseStatus = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dbInfo, setDbInfo] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDatabaseStatus = async () => {
    try {
      setRefreshing(true);
      const { data } = await api.get('/database-status');
      
      if (!data) {
        throw new Error('Dados do banco de dados não recebidos');
      }
      
      setDbInfo(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao obter dados do banco de dados:', err);
      setError(err.message || 'Erro ao carregar informações do banco de dados');
      toastError(err, t);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDatabaseStatus();
    
    const interval = setInterval(fetchDatabaseStatus, 5 * 60 * 1000); 
    
    return () => clearInterval(interval);
  }, [t]);

  const handleRefresh = () => {
    fetchDatabaseStatus();
  };

  const getStatusColor = (status) => {
    if (status === 'online') return 'success';
    return 'error';
  };

  const getStatusIcon = (status) => {
    if (status === 'online') {
      return <CheckCircleIcon className={classes.healthyIcon} />;
    }
    return <ErrorIcon className={classes.criticalIcon} />;
  };

  if (loading) {
    return (
      <MainContainer>
        <MainHeader>
          <Title>{t("Monitoramento do Banco de Dados")}</Title>
        </MainHeader>
        <Paper sx={{ p: 4, m: 2, borderRadius: 3, textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
            Carregando informações do banco de dados...
          </Typography>
        </Paper>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <MainHeader>
        <div className={classes.headerContainer}>
          <Title>
            <StorageIcon className={classes.infoIcon} />
            {t("Monitoramento do Banco de Dados")}
          </Title>
          <IconButton 
            onClick={handleRefresh} 
            disabled={refreshing}
            className={classes.refreshButton}
            color="primary"
            size="large"
          >
            <CachedIcon />
          </IconButton>
        </div>
      </MainHeader>
      <Root className={classes.root}>
        {error && (
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 3,
              backgroundColor: 'error.lighter',
              borderLeft: '4px solid',
              borderColor: 'error.main'
            }}
          >
            <Box display="flex" alignItems="center" mb={1}>
              <ErrorIcon sx={{ color: 'error.main', fontSize: 32, mr: 2 }} />
              <Typography variant="h6" color="error">
                {t("Erro ao carregar dados do banco de dados")}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ ml: 6 }}>{error}</Typography>
          </Paper>
        )}
        
        {dbInfo && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={3}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={3}>
                      <StorageIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                      <Typography variant="h6" fontWeight="600">
                        {t("Informações Gerais")}
                      </Typography>
                    </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            {t("Nome do Banco")}:
                          </Typography>
                          <Typography variant="body1">
                            {dbInfo.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            {t("Status")}:
                          </Typography>
                          <Chip
                            label={dbInfo.status === 'online' ? t("Online") : t("Offline")}
                            color={getStatusColor(dbInfo.status)}
                            size="small"
                            className={classes.statusChip}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            {t("Host")}:
                          </Typography>
                          <Typography variant="body1">
                            {dbInfo.host}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            {t("Porta")}:
                          </Typography>
                          <Typography variant="body1">
                            {dbInfo.port}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            {t("Dialeto")}:
                          </Typography>
                          <Typography variant="body1">
                            {dbInfo.dialect}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            {t("Tamanho Total")}:
                          </Typography>
                          <Typography variant="body1">
                            {dbInfo.size?.total || '0 B'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={3}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={3}>
                      <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                      <Typography variant="h6" fontWeight="600">
                        {t("Desempenho")}
                      </Typography>
                    </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            {t("Tempo de Atividade")}:
                          </Typography>
                          <Typography variant="body1">
                            {dbInfo.performance?.uptime || '0d 0h 0m 0s'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            {t("Conexões Ativas")}:
                          </Typography>
                          <Typography variant="body1">
                            {dbInfo.performance?.connectionCount || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            {t("Total de Conexões")}:
                          </Typography>
                          <Typography variant="body1">
                            {dbInfo.performance?.totalConnections || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            {t("Total de Consultas")}:
                          </Typography>
                          <Typography variant="body1">
                            {dbInfo.performance?.totalQueries || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            {t("Consultas Lentas")}:
                          </Typography>
                          <Typography variant="body1">
                            {dbInfo.performance?.slowQueryCount || 0}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
              {t("Tabelas do Banco de Dados")}
            </Typography>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>{t("Nome da Tabela")}</strong></TableCell>
                      <TableCell align="right"><strong>{t("Linhas")}</strong></TableCell>
                      <TableCell align="right"><strong>{t("Tamanho de Dados")}</strong></TableCell>
                      <TableCell align="right"><strong>{t("Tamanho de Índices")}</strong></TableCell>
                      <TableCell align="right"><strong>{t("Tamanho Total")}</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dbInfo.tables && dbInfo.tables.length > 0 ? (
                      dbInfo.tables.map((table) => (
                        <TableRow key={table.name}>
                          <TableCell className={classes.tableName}>
                            {table.name}
                          </TableCell>
                          <TableCell align="right">{table.rows}</TableCell>
                          <TableCell align="right">{table.dataSize}</TableCell>
                          <TableCell align="right">{table.indexSize}</TableCell>
                          <TableCell align="right">{table.totalSize}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          {t("Nenhuma tabela encontrada")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
              {t("Consultas Lentas (últimas 24h)")}
            </Typography>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>{t("Hora de Início")}</strong></TableCell>
                      <TableCell><strong>{t("Banco")}</strong></TableCell>
                      <TableCell><strong>{t("Tempo de Consulta")}</strong></TableCell>
                      <TableCell><strong>{t("Linhas Examinadas")}</strong></TableCell>
                      <TableCell><strong>{t("SQL")}</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dbInfo.performance?.slowQueries && dbInfo.performance.slowQueries.length > 0 ? (
                      dbInfo.performance.slowQueries.map((query, index) => (
                        <TableRow key={index}>
                          <TableCell>{query.start_time}</TableCell>
                          <TableCell>{query.db}</TableCell>
                          <TableCell>{query.query_time}s</TableCell>
                          <TableCell>{query.rows_examined}</TableCell>
                          <Tooltip title={query.sql_text} placement="top">
                            <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {query.sql_text}
                            </TableCell>
                          </Tooltip>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          {t("Nenhuma consulta lenta encontrada")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <CachedIcon sx={{ mr: 1, color: 'info.main' }} />
              {t("Processos Ativos")}
            </Typography>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>{t("ID")}</strong></TableCell>
                      <TableCell><strong>{t("Usuário")}</strong></TableCell>
                      <TableCell><strong>{t("Host")}</strong></TableCell>
                      <TableCell><strong>{t("Banco")}</strong></TableCell>
                      <TableCell><strong>{t("Comando")}</strong></TableCell>
                      <TableCell><strong>{t("Tempo (s)")}</strong></TableCell>
                      <TableCell><strong>{t("Estado")}</strong></TableCell>
                      <TableCell><strong>{t("Consulta")}</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dbInfo.performance?.activeProcesses && dbInfo.performance.activeProcesses.length > 0 ? (
                      dbInfo.performance.activeProcesses.map((process) => (
                        <TableRow key={process.id}>
                          <TableCell>{process.id}</TableCell>
                          <TableCell>{process.user}</TableCell>
                          <TableCell>{process.host}</TableCell>
                          <TableCell>{process.db}</TableCell>
                          <TableCell>{process.command}</TableCell>
                          <TableCell>{process.time}</TableCell>
                          <TableCell>{process.state}</TableCell>
                          <Tooltip title={process.info} placement="top">
                            <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {process.info || t("Nenhuma consulta")}
                            </TableCell>
                          </Tooltip>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          {t("Nenhum processo ativo encontrado")}
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

export default DatabaseStatus;
