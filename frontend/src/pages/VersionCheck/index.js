import React, { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getVersionInfo, updateWhatsappLib, updateWhatsappLibFromGit, getReleaseNotes } from "../../services/versionService";
import { 
  Container, 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box, 
  Button,
  CircularProgress,
  Link,
  Divider
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import SystemUpdateIcon from "@mui/icons-material/SystemUpdate";
import GitHubIcon from "@mui/icons-material/GitHub";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";

const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: "scroll",
  ...(theme.scrollbarStyles || {}),
}));

const CardWrapper = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const VersionCard = styled(Card)(({ theme, status }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
  borderRadius: 10,
  border: status === "updated" || status === "latest" 
    ? `2px solid ${theme.palette.success.main}`
    : status === "outdated"
      ? `2px solid ${theme.palette.error.main}`
      : `2px solid ${theme.palette.divider}`,
  backgroundColor: status === "updated" || status === "latest" 
    ? theme.palette.success.light + "20"
    : status === "outdated"
      ? theme.palette.error.light + "20"
      : theme.palette.background.paper,
  "&:hover": {
    boxShadow: "0 8px 30px 0 rgba(0,0,0,0.15)",
    transform: "translateY(-5px)",
  }
}));

const VersionIcon = styled(Box)(({ theme, status }) => ({
  position: "absolute",
  top: 15,
  right: 15,
  width: 40,
  height: 40,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: status === "updated" || status === "latest" 
    ? theme.palette.success.main
    : status === "outdated"
      ? theme.palette.error.main
      : theme.palette.success.main,
  color: "#fff",
  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
}));

const VersionValue = styled(Typography)(({ theme }) => ({
  fontSize: "2rem",
  fontWeight: 700,
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const MessageBox = styled(Paper)(({ theme, type }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  backgroundColor: type === "success"
    ? theme.palette.success.light + "30"
    : theme.palette.warning.light + "30",
  borderLeft: type === "success"
    ? `4px solid ${theme.palette.success.main}`
    : `4px solid ${theme.palette.warning.main}`,
  borderRadius: 4,
}));

const VersionCheck = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updatingLib, setUpdatingLib] = useState(false);
  const [updatingLibFromGit, setUpdatingLibFromGit] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [versionInfo, setVersionInfo] = useState({
    whatsappLibVersion: "",
    whatsappLibLatestVersion: "",
    whatsappLibNeedsUpdate: false,
    whatsappLibLatestReleaseDate: null,
    whatsappLibGitCommits: [],
    whatsappLibHasGitUpdates: false,
    whatsappLibGitCommitsCount: 0
  });
  const [releaseNotes, setReleaseNotes] = useState(null);
  const [loadingReleaseNotes, setLoadingReleaseNotes] = useState(false);

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        setLoading(true);
        const data = await getVersionInfo();
        setVersionInfo(data);
        
        if (data.whatsappLibNeedsUpdate && data.whatsappLibLatestVersion) {
          fetchReleaseNotes(data.whatsappLibLatestVersion);
        }
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVersionInfo();
  }, []);

  const fetchReleaseNotes = async (version) => {
    try {
      setLoadingReleaseNotes(true);
      const notes = await getReleaseNotes(version);
      setReleaseNotes(notes);
    } catch (err) {
      console.error('Erro ao buscar release notes:', err);
    } finally {
      setLoadingReleaseNotes(false);
    }
  };

  const handleRefreshVersion = async () => {
    try {
      setLoading(true);
      toast.dismiss();
      const data = await getVersionInfo();
      setVersionInfo(data);
      toast.success(t("versionCheck.success"));
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const createCountdownToast = (seconds, initialMessage, finalMessage, onComplete = null, reload = false) => {
    let secondsRemaining = seconds;
    let intervalId = null;
    let toastId = null;

    const showToast = () => {
      if (toastId) {
        toast.update(toastId, {
          render: `${initialMessage} ${secondsRemaining} segundos...`,
          type: "info",
          autoClose: false,
          closeButton: false,
          position: "top-right"
        });
      } else {
        toastId = toast.info(`${initialMessage} ${secondsRemaining} segundos...`, {
          autoClose: false,
          closeButton: false,
          draggable: false,
          position: "top-right"
        });
      }
    };

    const startCountdown = () => {
      showToast();

      intervalId = setInterval(() => {
        secondsRemaining -= 1;
        
        showToast();

        if (secondsRemaining <= 0) {
          clearInterval(intervalId);
          
          if (toastId) {
            toast.dismiss(toastId);
          }
          
          toast.success(finalMessage, {
            position: "top-right"
          });
          
          if (onComplete && typeof onComplete === 'function') {
            onComplete();
          }
          
          if (reload) {
            setTimeout(() => {
              refreshPage();
            }, 1000);
          }
        }
      }, 1000);

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, (secondsRemaining + 1) * 1000);
      });
    };

    const cancelCountdown = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (toastId) {
        toast.dismiss(toastId);
      }
    };

    return {
      startCountdown,
      cancelCountdown
    };
  };

  useEffect(() => {
    let countdownController = null;
    
    if (countdown > 0) {
      countdownController = createCountdownToast(
        countdown,
        "A página será recarregada em",
        "Recarregando página agora...",
        null,
        true
      );
      
      countdownController.startCountdown();
    }
    
    return () => {
      if (countdownController) {
        countdownController.cancelCountdown();
      }
    };
  }, [countdown]);

  const handleUpdateWhatsappLib = async () => {
    try {
      setUpdatingLib(true);
      toast.dismiss();
      
      const prepToastId = toast.info('Preparando para atualizar a biblioteca WhatsApp...', {
        autoClose: false,
        position: "top-right",
        closeButton: false
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.update(prepToastId, {
        render: 'Iniciando atualização da biblioteca WhatsApp...',
        type: 'info',
        autoClose: false,
        position: "top-right",
        closeButton: false
      });
      
      try {
        const result = await updateWhatsappLib();
        
        toast.dismiss(prepToastId);
        
        if (result.success) {
          toast.success(`Biblioteca WhatsApp atualizada com sucesso para a versão v${result.newVersion || 'mais recente'}. O servidor está sendo reiniciado para aplicar as mudanças.`, {
            autoClose: 5000,
            position: "top-right",
            toastId: 'update-success'
          });
          
          setTimeout(() => {
            setCountdown(30);
          }, 1000);
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          try {
            const data = await getVersionInfo();
            setVersionInfo(data);
          } catch (versionError) {
            console.error('Erro ao obter informações de versão após atualização:', versionError);
          }
        } else {
          toast.error(`Erro ao atualizar biblioteca: ${result.error || 'Erro desconhecido'}`, {
            autoClose: false,
            position: "top-right"
          });
        }
      } catch (apiError) {
        toast.dismiss(prepToastId);
        
        console.error('Erro na chamada da API:', apiError);
        
        if (apiError.message && apiError.message.includes('Network Error')) {
          toast.info('O servidor está sendo reiniciado após a atualização da biblioteca...', {
            autoClose: 5000,
            position: "top-right"
          });
          
          setTimeout(() => {
            setCountdown(30);
          }, 1000);
        } else {
          toast.error('Erro de conexão ao tentar atualizar a biblioteca. A atualização pode ter sido iniciada, mas não foi possível confirmar. Por favor, atualize a página em alguns segundos para verificar o status.', {
            autoClose: false,
            position: "top-right"
          });
        }
      }
    } catch (err) {
      console.error('Erro geral:', err);
      toast.error('Ocorreu um erro inesperado. Por favor, tente novamente em alguns instantes.', {
        autoClose: false,
        position: "top-right"
      });
    } finally {
      setUpdatingLib(false);
    }
  };

  const handleUpdateWhatsappLibFromGit = async () => {
    try {
      setUpdatingLibFromGit(true);
      toast.dismiss();
      
      const prepToastId = toast.info('Preparando para atualizar a biblioteca WhatsApp do GitHub...', {
        autoClose: false,
        position: "top-right",
        closeButton: false
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.update(prepToastId, {
        render: 'Instalando versão mais recente do GitHub (branch main)...',
        type: 'info',
        autoClose: false,
        position: "top-right",
        closeButton: false
      });
      
      try {
        const result = await updateWhatsappLibFromGit();
        
        toast.dismiss(prepToastId);
        
        if (result.success) {
          toast.success(`Biblioteca WhatsApp atualizada do GitHub com sucesso para a versão v${result.newVersion || 'mais recente'}. O servidor está sendo reiniciado para aplicar as mudanças.`, {
            autoClose: 5000,
            position: "top-right",
            toastId: 'update-git-success'
          });
          
          setTimeout(() => {
            setCountdown(30);
          }, 1000);
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          try {
            const data = await getVersionInfo();
            setVersionInfo(data);
          } catch (versionError) {
            console.error('Erro ao obter informações de versão após atualização:', versionError);
          }
        } else {
          toast.error(`Erro ao atualizar biblioteca do GitHub: ${result.error || 'Erro desconhecido'}`, {
            autoClose: false,
            position: "top-right"
          });
        }
      } catch (apiError) {
        toast.dismiss(prepToastId);
        
        console.error('Erro na chamada da API:', apiError);
        
        if (apiError.message && apiError.message.includes('Network Error')) {
          toast.info('O servidor está sendo reiniciado após a atualização da biblioteca...', {
            autoClose: 5000,
            position: "top-right"
          });
          
          setTimeout(() => {
            setCountdown(30);
          }, 1000);
        } else {
          toast.error('Erro de conexão ao tentar atualizar a biblioteca do GitHub. A atualização pode ter sido iniciada, mas não foi possível confirmar. Por favor, atualize a página em alguns segundos para verificar o status.', {
            autoClose: false,
            position: "top-right"
          });
        }
      }
    } catch (err) {
      console.error('Erro geral:', err);
      toast.error('Ocorreu um erro inesperado. Por favor, tente novamente em alguns instantes.', {
        autoClose: false,
        position: "top-right"
      });
    } finally {
      setUpdatingLibFromGit(false);
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{t("versionCheck.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRefreshVersion}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SystemUpdateIcon />}
          >
            {t("versionCheck.checkUpdates")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <MainPaper variant="outlined">
        <Container maxWidth="lg">

          {loading ? (
            <Box display="flex" justifyContent="center" my={8}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                {t("versionCheck.whatsappLibTitle")}
              </Typography>
              <CardWrapper container spacing={4}>
                <Grid item xs={12} md={6}>
                  <VersionCard status={versionInfo.whatsappLibNeedsUpdate ? "outdated" : "updated"}>
                    <VersionIcon status={versionInfo.whatsappLibNeedsUpdate ? "outdated" : "updated"}>
                      {versionInfo.whatsappLibNeedsUpdate ? (
                        <ErrorIcon />
                      ) : (
                        <CheckCircleIcon />
                      )}
                    </VersionIcon>
                    <CardContent>
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {t("versionCheck.whatsappLibCurrentVersion")}
                      </Typography>
                      <VersionValue color={versionInfo.whatsappLibNeedsUpdate ? "error" : "success"}>
                        v{versionInfo.whatsappLibVersion || "N/A"}
                      </VersionValue>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {versionInfo.whatsappLibNeedsUpdate 
                          ? t("versionCheck.whatsappLibOutdated")
                          : t("versionCheck.whatsappLibUpToDate")}
                      </Typography>
                    </CardContent>
                  </VersionCard>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <VersionCard status="latest">
                    <VersionIcon status="latest">
                      <CheckCircleIcon />
                    </VersionIcon>
                    <CardContent>
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {t("versionCheck.whatsappLibLatestVersion")}
                      </Typography>
                      <VersionValue>
                        v{versionInfo.whatsappLibLatestVersion || "N/A"}
                      </VersionValue>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {t("versionCheck.whatsappLibLatestAvailable")}
                      </Typography>
                      {versionInfo.whatsappLibLatestReleaseDate && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontStyle: "italic" }}>
                          Disponibilizada em: {new Date(versionInfo.whatsappLibLatestReleaseDate).toLocaleDateString('pt-BR')} às {new Date(versionInfo.whatsappLibLatestReleaseDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      )}
                    </CardContent>
                  </VersionCard>
                </Grid>
              </CardWrapper>

              {versionInfo.whatsappLibNeedsUpdate && (
                <CardWrapper container spacing={4}>
                  <Grid item xs={12}>
                    <VersionCard status="latest">
                      <CardContent>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                          📋 Detalhes da Release
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            v{versionInfo.whatsappLibLatestVersion || "N/A"}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            🗓️ Data de lançamento: {versionInfo.whatsappLibLatestReleaseDate ? new Date(versionInfo.whatsappLibLatestReleaseDate).toLocaleDateString('pt-BR') : 'N/A'}
                          </Typography>
                          {loadingReleaseNotes ? (
                            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                              <CircularProgress size={16} sx={{ mr: 1 }} />
                              <Typography variant="body2" color="textSecondary">
                                Carregando mudanças da release...
                              </Typography>
                            </Box>
                          ) : releaseNotes ? (
                            <Box sx={{ mb: 2 }}>
                              {releaseNotes.body && (
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                                    📋 O que mudou:
                                  </Typography>
                                  <Box sx={{ 
                                    maxHeight: 300, 
                                    overflowY: 'auto', 
                                    backgroundColor: 'grey.50', 
                                    p: 2, 
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'grey.200'
                                  }}>
                                    <Typography 
                                      variant="body2" 
                                      component="div"
                                      sx={{ 
                                        whiteSpace: 'pre-wrap',
                                        '& ul': { pl: 2, mb: 1 },
                                        '& li': { mb: 0.5 },
                                        '& h1, & h2, & h3': { fontWeight: 'bold', mb: 1, mt: 1 },
                                        '& h2': { fontSize: '1rem' },
                                        '& h3': { fontSize: '0.9rem' },
                                        '& a': { color: 'primary.main', textDecoration: 'none' },
                                        '& code': { 
                                          backgroundColor: 'grey.100', 
                                          padding: '2px 4px', 
                                          borderRadius: '3px',
                                          fontFamily: 'monospace'
                                        }
                                      }}
                                      dangerouslySetInnerHTML={{ 
                                        __html: releaseNotes.body
                                          .replace(/### (.*)/g, '<h3>$1</h3>')
                                          .replace(/## (.*)/g, '<h2>$1</h2>')
                                          .replace(/# (.*)/g, '<h1>$1</h1>')
                                          .replace(/\* (.*)/g, '<li>$1</li>')
                                          .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
                                          .replace(/<\/ul>\s*<ul>/g, '')
                                          .replace(/`([^`]+)`/g, '<code>$1</code>')
                                          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                                          .replace(/\n\n/g, '<br><br>')
                                      }}
                                    />
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ mb: 2 }}>
                              📝 Esta versão inclui melhorias de performance, correções de bugs e novos recursos para a biblioteca WhatsApp Web.js.
                            </Typography>
                          )}
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                              🔗 Links úteis:
                            </Typography>
                            <Box sx={{ ml: 2, mt: 1 }}>
                              <Link 
                                href={`https://github.com/pedroslopez/whatsapp-web.js/releases/tag/v${versionInfo.whatsappLibLatestVersion}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{ display: 'block', mb: 0.5 }}
                              >
                                📄 Ver release completa no GitHub
                              </Link>
                              <Link 
                                href="https://github.com/pedroslopez/whatsapp-web.js/releases" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{ display: 'block', mb: 0.5 }}
                              >
                                📋 Todas as releases
                              </Link>
                              <Link 
                                href="https://github.com/pedroslopez/whatsapp-web.js/blob/main/CHANGELOG.md" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{ display: 'block' }}
                              >
                                📝 Changelog completo
                              </Link>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </VersionCard>
                  </Grid>
                </CardWrapper>
              )}

              {(versionInfo.whatsappLibNeedsUpdate || versionInfo.whatsappLibHasGitUpdates) ? (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
                    ⚠️ Atualizações Disponíveis
                  </Typography>
                  <Grid container spacing={3}>
                    {/* Coluna NPM */}
                    {versionInfo.whatsappLibNeedsUpdate && (
                      <Grid item xs={12} md={versionInfo.whatsappLibHasGitUpdates ? 6 : 12}>
                        <Card sx={{ height: '100%', borderLeft: 4, borderColor: 'warning.main' }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                              <CloudDownloadIcon sx={{ fontSize: 40, mr: 2, color: 'warning.main' }} />
                              <div>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  📦 Versão Estável (NPM)
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  v{versionInfo.whatsappLibLatestVersion}
                                </Typography>
                              </div>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {loadingReleaseNotes ? (
                              <Box display="flex" alignItems="center" justifyContent="center" py={3}>
                                <CircularProgress size={24} sx={{ mr: 2 }} />
                                <Typography variant="body2" color="textSecondary">
                                  Carregando informações da release...
                                </Typography>
                              </Box>
                            ) : releaseNotes?.body ? (
                              <Box sx={{ 
                                maxHeight: 200, 
                                overflowY: 'auto', 
                                mb: 2,
                                p: 2,
                                backgroundColor: 'grey.50',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'grey.200'
                              }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                                  {releaseNotes.body.substring(0, 300)}...
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ mb: 2 }} color="textSecondary">
                                Release oficial do NPM com testes completos.
                              </Typography>
                            )}
                            
                            <Button
                              variant="contained"
                              color="warning"
                              onClick={handleUpdateWhatsappLib}
                              disabled={updatingLib || updatingLibFromGit}
                              startIcon={updatingLib ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />}
                              fullWidth
                              size="large"
                              sx={{
                                borderRadius: 2,
                                py: 1.5,
                                fontWeight: "bold",
                                boxShadow: 3,
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: 4,
                                },
                                transition: 'all 0.3s ease',
                                mb: 1
                              }}
                            >
                              {updatingLib ? "Atualizando do NPM..." : "Atualizar via NPM"}
                            </Button>
                            
                            <Link 
                              href={`https://github.com/pedroslopez/whatsapp-web.js/releases/tag/v${versionInfo.whatsappLibLatestVersion}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                            >
                              <Typography variant="caption">
                                Ver detalhes da release
                              </Typography>
                            </Link>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                    
                    {/* Coluna Git */}
                    {versionInfo.whatsappLibHasGitUpdates && (
                      <Grid item xs={12} md={versionInfo.whatsappLibNeedsUpdate ? 6 : 12}>
                        <Card sx={{ height: '100%', borderLeft: 4, borderColor: 'info.main' }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                              <GitHubIcon sx={{ fontSize: 40, mr: 2, color: 'info.main' }} />
                              <div>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  🚀 Versão Desenvolvimento (Git)
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {versionInfo.whatsappLibGitCommitsCount} commit{versionInfo.whatsappLibGitCommitsCount > 1 ? 's' : ''} à frente
                                </Typography>
                              </div>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ 
                              maxHeight: 200, 
                              overflowY: 'auto', 
                              mb: 2,
                              p: 2,
                              backgroundColor: 'grey.50',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'grey.200'
                            }}>
                              {versionInfo.whatsappLibGitCommits.slice(0, 5).map((commit, index) => (
                                <Box key={commit.sha} mb={1.5}>
                                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'info.main', fontWeight: 'bold' }}>
                                    {commit.sha}
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontSize: '0.85rem', mt: 0.5 }}>
                                    {commit.message}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    por {commit.author} • {new Date(commit.date).toLocaleDateString('pt-BR')}
                                  </Typography>
                                  {index < Math.min(4, versionInfo.whatsappLibGitCommits.length - 1) && (
                                    <Divider sx={{ mt: 1 }} />
                                  )}
                                </Box>
                              ))}
                              {versionInfo.whatsappLibGitCommitsCount > 5 && (
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                                  + {versionInfo.whatsappLibGitCommitsCount - 5} commit{versionInfo.whatsappLibGitCommitsCount - 5 > 1 ? 's' : ''} adicional{versionInfo.whatsappLibGitCommitsCount - 5 > 1 ? 'is' : ''}
                                </Typography>
                              )}
                            </Box>
                            
                            <Button
                              variant="contained"
                              color="info"
                              onClick={handleUpdateWhatsappLibFromGit}
                              disabled={updatingLib || updatingLibFromGit}
                              startIcon={updatingLibFromGit ? <CircularProgress size={20} color="inherit" /> : <GitHubIcon />}
                              fullWidth
                              size="large"
                              sx={{
                                borderRadius: 2,
                                py: 1.5,
                                fontWeight: "bold",
                                boxShadow: 3,
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: 4,
                                },
                                transition: 'all 0.3s ease',
                                mb: 1
                              }}
                            >
                              {updatingLibFromGit ? "Instalando do Git..." : "Atualizar via Git"}
                            </Button>
                            
                            <Link 
                              href="https://github.com/pedroslopez/whatsapp-web.js/commits/main"
                              target="_blank" 
                              rel="noopener noreferrer"
                              sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                            >
                              <Typography variant="caption">
                                Ver todos os commits
                              </Typography>
                            </Link>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                  
                  <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.lighter', borderRadius: 1, border: '1px solid', borderColor: 'info.main' }}>
                    <Typography variant="body2" color="textSecondary">
                      ℹ️ <strong>Dica:</strong> Versões do NPM são estáveis e testadas. Versões do Git contêm as últimas correções e recursos, mas podem ser menos estáveis.
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <MessageBox type="success">
                  <Box display="flex" alignItems="flex-start">
                    <CheckCircleIcon color="success" style={{ marginRight: 16, marginTop: 4 }} />
                    <div>
                      <Typography variant="h6" gutterBottom>
                        {t("versionCheck.whatsappLibUpToDateTitle")}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {t("versionCheck.whatsappLibUpToDateMessage")}
                      </Typography>
                    </div>
                  </Box>
                </MessageBox>
              )}
            </>
          )}
        </Container>
      </MainPaper>
    </MainContainer>
  );
};

export default VersionCheck;
