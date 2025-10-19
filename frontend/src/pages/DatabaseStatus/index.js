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
        <Root className={classes.root}>
          <div className={classes.loadingContainer}>
            <CircularProgress />
          </div>
        </Root>
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
          <Paper className={classes.card}>
            <Typography variant="h6" color="error">
              <ErrorIcon className={classes.criticalIcon} />
              {t("Erro ao carregar dados do banco de dados")}
            </Typography>
            <Typography variant="body2">{error}</Typography>
          </Paper>
        )}
        
        {dbInfo && (
          <>
            <Paper className={classes.card}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card className={classes.detailsCard}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {t("Informações Gerais")}
                      </Typography>
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
                  <Card className={classes.detailsCard}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {t("Desempenho")}
                      </Typography>
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
            </Paper>

            <Typography variant="h6" className={classes.sectionTitle}>
              {t("Tabelas do Banco de Dados")}
            </Typography>
            <Paper className={classes.card}>
              <TableContainer className={classes.tableContainer}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("Nome da Tabela")}</TableCell>
                      <TableCell align="right">{t("Linhas")}</TableCell>
                      <TableCell align="right">{t("Tamanho de Dados")}</TableCell>
                      <TableCell align="right">{t("Tamanho de Índices")}</TableCell>
                      <TableCell align="right">{t("Tamanho Total")}</TableCell>
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

            <Typography variant="h6" className={classes.sectionTitle}>
              {t("Consultas Lentas (últimas 24h)")}
            </Typography>
            <Paper className={classes.card}>
              <TableContainer className={classes.tableContainer}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("Hora de Início")}</TableCell>
                      <TableCell>{t("Banco")}</TableCell>
                      <TableCell>{t("Tempo de Consulta")}</TableCell>
                      <TableCell>{t("Linhas Examinadas")}</TableCell>
                      <TableCell>{t("SQL")}</TableCell>
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

            <Typography variant="h6" className={classes.sectionTitle}>
              {t("Processos Ativos")}
            </Typography>
            <Paper className={classes.card}>
              <TableContainer className={classes.tableContainer}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("ID")}</TableCell>
                      <TableCell>{t("Usuário")}</TableCell>
                      <TableCell>{t("Host")}</TableCell>
                      <TableCell>{t("Banco")}</TableCell>
                      <TableCell>{t("Comando")}</TableCell>
                      <TableCell>{t("Tempo (s)")}</TableCell>
                      <TableCell>{t("Estado")}</TableCell>
                      <TableCell>{t("Consulta")}</TableCell>
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
