import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { alpha, styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CodeIcon from "@mui/icons-material/Code";
import GitHubIcon from "@mui/icons-material/GitHub";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import StorageIcon from "@mui/icons-material/Storage";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io.js";

// ─── Styled Components ────────────────────────────────────────────────────────

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow:
    theme.palette.mode === "dark"
      ? `0 4px 24px ${alpha("#000", 0.35)}`
      : `0 4px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
}));

const SectionCardHeader = styled(CardHeader)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.primary.dark, 0.12)
      : alpha(theme.palette.primary.light, 0.07),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  "& .MuiCardHeader-title": { fontWeight: 600, fontSize: "1.05rem" },
}));

const VersionCard = styled(Card)(({ theme, uptodate }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  border: `2px solid ${
    uptodate === "true"
      ? alpha(theme.palette.success.main, 0.35)
      : alpha(theme.palette.warning.main, 0.35)
  }`,
  background:
    theme.palette.mode === "dark"
      ? uptodate === "true"
        ? `linear-gradient(135deg, ${alpha(theme.palette.success.dark, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
        : `linear-gradient(135deg, ${alpha(theme.palette.warning.dark, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
      : uptodate === "true"
      ? `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.1)} 0%, ${theme.palette.background.paper} 100%)`
      : `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.12)} 0%, ${theme.palette.background.paper} 100%)`,
  "&::before": {
    content: '""',
    display: "block",
    height: "5px",
    background:
      uptodate === "true"
        ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
        : `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
  },
  transition: "transform 0.25s ease, box-shadow 0.25s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? `0 12px 36px ${alpha("#000", 0.4)}`
        : `0 12px 36px ${alpha(theme.palette.primary.main, 0.18)}`,
  },
}));

const VersionValue = styled(Typography)(({ theme }) => ({
  fontSize: "2.25rem",
  fontWeight: 800,
  background:
    theme.palette.mode === "dark"
      ? `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
      : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  letterSpacing: "-0.02em",
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1.5),
}));

const CommitItem = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.5),
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(1),
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  background:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.default, 0.5)
      : alpha(theme.palette.background.default, 0.7),
  marginBottom: theme.spacing(1),
  "&:last-child": { marginBottom: 0 },
  "&:hover": {
    borderColor: alpha(theme.palette.primary.main, 0.3),
    background:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.primary.dark, 0.1)
        : alpha(theme.palette.primary.light, 0.06),
  },
}));

const CommitList = styled(Box)(({ theme }) => ({
  maxHeight: 380,
  overflowY: "auto",
  paddingRight: theme.spacing(0.5),
  "&::-webkit-scrollbar": { width: "6px" },
  "&::-webkit-scrollbar-track": {
    background: alpha(theme.palette.background.default, 0.1),
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: "4px",
  },
}));

const CommitHashLink = styled(Link)(({ theme }) => ({
  fontFamily: "monospace",
  fontSize: "0.78rem",
  fontWeight: 700,
  color: theme.palette.primary.main,
  textDecoration: "none",
  padding: theme.spacing(0.2, 0.6),
  borderRadius: "4px",
  background: alpha(theme.palette.primary.main, 0.1),
  "&:hover": {
    background: alpha(theme.palette.primary.main, 0.2),
    textDecoration: "none",
  },
}));

const TerminalOutput = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: theme.palette.mode === "dark" ? "#161b22" : "#0d1117",
  color: "#e6edf3",
  fontFamily: "'Courier New', monospace",
  fontSize: "0.78rem",
  lineHeight: 1.6,
  borderRadius: theme.spacing(1),
  maxHeight: 420,
  overflow: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
  marginTop: theme.spacing(2),
  "&::-webkit-scrollbar": { width: "8px" },
  "&::-webkit-scrollbar-track": { background: "#21262d", borderRadius: "4px" },
  "&::-webkit-scrollbar-thumb": { background: "#444c56", borderRadius: "4px" },
}));

const IconAvatar = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: "#fff",
  flexShrink: 0,
}));

// ─── Component ────────────────────────────────────────────────────────────────

const SystemUpdate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateOS, setUpdateOS] = useState(true);
  const [updateBrowser, setUpdateBrowser] = useState(false);
  const [sudoPassword, setSudoPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [versionData, setVersionData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const terminalRef = useRef(null);
  const countdownRef = useRef(null);

  const fetchVersionCheck = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get("/version-check");
      setVersionData(data);
    } catch (err) {
      setFetchError("Não foi possível verificar a versão. Tente novamente.");
      toastError(err, t);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVersionCheck();
  }, [fetchVersionCheck]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, []);

  const startReconnectCountdown = () => {
    if (countdownRef.current) return;

    let seconds = 20;

    const toastId = toast.loading(
      t("systemUpdate.toastReconnecting", { seconds }),
      { autoClose: false, closeOnClick: false, draggable: false }
    );

    countdownRef.current = setInterval(() => {
      seconds -= 1;
      if (seconds > 0) {
        toast.update(toastId, {
          render: t("systemUpdate.toastReconnecting", { seconds }),
        });
      } else {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        toast.update(toastId, {
          render: t("systemUpdate.toastReloading"),
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        setTimeout(() => window.location.reload(), 2000);
      }
    }, 1000);
  };

  const handleDialogClose = () => {
    setUpdateDialogOpen(false);
    setSudoPassword("");
    setShowPassword(false);
  };

  const handleUpdate = async () => {
    setUpdateDialogOpen(false);
    setSudoPassword("");
    setShowPassword(false);
    setUpdating(true);
    setLogs([]);

    const socket = openSocket();

    const handleLog = (data) => {
      setLogs(prev => [...prev, data]);

      if (
        data.type === "warning" &&
        (data.message.includes("PM2") || data.message.includes("Reiniciando os serviços"))
      ) {
        // backend vai reiniciar — inicia contagem regressiva e para de escutar
        setUpdating(false);
        if (socket) socket.off("systemUpdateLog", handleLog);
        startReconnectCountdown();
      } else if (data.type === "success" || data.type === "error") {
        setUpdating(false);
        if (socket) socket.off("systemUpdateLog", handleLog);
      } else if (data.type === "warning") {
        // aviso final sem reinício (ex: "concluído com avisos")
        setUpdating(false);
        if (socket) socket.off("systemUpdateLog", handleLog);
        toast.warning("Atualização concluída com avisos. Verifique o terminal.");
      }
    };

    if (socket) {
      socket.on("systemUpdateLog", handleLog);
    }

    try {
      await api.post("/system-update", { updateOS, updateBrowser, sudoPassword });
    } catch (err) {
      const isDisconnect =
        err?.code === "ECONNABORTED" ||
        err?.message?.includes("Network Error");
      if (isDisconnect) {
        setLogs(prev => [...prev, {
          type: "info",
          message: "O servidor foi reiniciado como parte da atualização.\nAguarde alguns minutos e recarregue a página para verificar o resultado.",
        }]);
        toast.info("Servidor reiniciado. Aguarde e recarregue a página em alguns minutos.");
        setUpdating(false);
      } else {
        toastError(err);
        if (socket) socket.off("systemUpdateLog", handleLog);
        setUpdating(false);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Verificação de Versão</Title>
        <Box sx={{ ml: "auto" }}>
          <Button
            variant="contained"
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <RefreshIcon />
              )
            }
            onClick={fetchVersionCheck}
            disabled={loading || updating}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {loading ? "Verificando…" : "Verificar Atualizações"}
          </Button>
        </Box>
      </MainHeader>

      <Box sx={{ p: 3, overflowY: "auto", height: "calc(100vh - 130px)" }}>
        {/* Info Tip */}
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon fontSize="small" />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="body2">
            <strong>Dica:</strong> GitHub Releases contêm versões testadas e
            estáveis do sistema. Os commits listados foram integrados ao
            repositório após a última release oficial.
          </Typography>
        </Alert>

        {/* Fetch error */}
        {fetchError && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {fetchError}
          </Alert>
        )}

        {/* Loading skeleton */}
        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={10}
          >
            <CircularProgress size={48} />
          </Box>
        )}

        {/* Main content */}
        {versionData && !loading && (
          <>
            {/* ── Seção 1: Versão do Sistema Press Ticket ─────────────────── */}
            <SectionCard>
              <SectionCardHeader
                avatar={
                  <IconAvatar>
                    <StorageIcon fontSize="small" />
                  </IconAvatar>
                }
                title="Versão do Sistema Press Ticket"
                subheader="Compare a versão instalada com a mais recente disponível no repositório"
              />
              <CardContent sx={{ pt: 3 }}>
                <Grid container spacing={3}>
                  {/* Card: Versão Atual */}
                  <Grid item xs={12} md={6}>
                    <VersionCard uptodate={String(versionData.upToDate)}>
                      <CardContent sx={{ pt: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <StorageIcon
                            fontSize="small"
                            color="primary"
                            sx={{ opacity: 0.7 }}
                          />
                          <Typography
                            variant="overline"
                            color="textSecondary"
                            fontWeight={600}
                          >
                            Versão Atual do Sistema
                          </Typography>
                        </Box>

                        <VersionValue>{versionData.localVersion}</VersionValue>

                        {versionData.localGitSha && (
                          <Chip
                            icon={<CodeIcon fontSize="small" />}
                            label={`git: ${versionData.localGitSha}`}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ fontFamily: "monospace", mb: 2 }}
                          />
                        )}

                        <Box>
                          <Chip
                            icon={
                              versionData.upToDate ? (
                                <CheckCircleIcon />
                              ) : (
                                <WarningAmberIcon />
                              )
                            }
                            label={
                              versionData.upToDate
                                ? "Sistema Atualizado"
                                : `${versionData.commitsBehind} commit(s) desde a última release`
                            }
                            color={versionData.upToDate ? "success" : "warning"}
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </CardContent>
                    </VersionCard>
                  </Grid>

                  {/* Card: Última Versão no GitHub */}
                  <Grid item xs={12} md={6}>
                    <VersionCard uptodate="true">
                      <CardContent sx={{ pt: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <GitHubIcon
                            fontSize="small"
                            color="primary"
                            sx={{ opacity: 0.7 }}
                          />
                          <Typography
                            variant="overline"
                            color="textSecondary"
                            fontWeight={600}
                          >
                            Última Versão Disponível no GitHub
                          </Typography>
                        </Box>

                        <VersionValue>
                          {versionData.latestReleaseTag || "—"}
                        </VersionValue>

                        {versionData.latestReleaseDate ? (
                          <Chip
                            icon={<CalendarTodayIcon fontSize="small" />}
                            label={formatDate(versionData.latestReleaseDate)}
                            size="small"
                            variant="outlined"
                            color="success"
                            sx={{ mb: 2 }}
                          />
                        ) : null}

                        <Box>
                          {versionData.githubAvailable ? (
                            <Chip
                              icon={<RocketLaunchIcon />}
                              label={versionData.latestReleaseName || "Release Oficial"}
                              color="success"
                              sx={{ fontWeight: 600 }}
                            />
                          ) : (
                            <Chip
                              icon={<WarningAmberIcon />}
                              label="GitHub indisponível"
                              color="warning"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                        </Box>
                      </CardContent>
                    </VersionCard>
                  </Grid>
                </Grid>

                {/* Commits Pendentes */}
                {versionData.pendingCommits?.length > 0 && (
                  <Box mt={3}>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                      <GitHubIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Commits Pendentes
                      </Typography>
                      <Chip
                        label={`${versionData.commitsBehind} commit(s)`}
                        size="small"
                        color="warning"
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>

                    <CommitList>
                      {versionData.pendingCommits.map((commit) => (
                        <CommitItem key={commit.fullSha}>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            flexWrap="wrap"
                          >
                            <Tooltip title="Ver commit no GitHub">
                              <CommitHashLink
                                href={commit.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {commit.sha}
                              </CommitHashLink>
                            </Tooltip>
                            <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
                              {commit.message}
                            </Typography>
                          </Box>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={2}
                            flexWrap="wrap"
                          >
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <PersonIcon
                                sx={{ fontSize: "0.85rem", color: "text.secondary" }}
                              />
                              <Typography variant="caption" color="textSecondary">
                                {commit.author}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <CalendarTodayIcon
                                sx={{ fontSize: "0.85rem", color: "text.secondary" }}
                              />
                              <Typography variant="caption" color="textSecondary">
                                {formatDate(commit.date)}
                              </Typography>
                            </Box>
                          </Box>
                        </CommitItem>
                      ))}
                    </CommitList>
                  </Box>
                )}

                {versionData.upToDate && versionData.githubAvailable && (
                  <Alert
                    severity="success"
                    icon={<CheckCircleIcon />}
                    sx={{ mt: 3, borderRadius: 2 }}
                  >
                    Não há commits pendentes desde a última release oficial.
                  </Alert>
                )}

                {!versionData.githubAvailable && (
                  <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mt: 3, borderRadius: 2 }}>
                    {t("systemUpdate.githubApiError")}
                  </Alert>
                )}
              </CardContent>
            </SectionCard>

            {/* ── Seção 2: Ações de Atualização ───────────────────────────── */}
            <SectionCard>
              <SectionCardHeader
                avatar={
                  <IconAvatar>
                    <SystemUpdateAltIcon fontSize="small" />
                  </IconAvatar>
                }
                title="Ações de Atualização"
                subheader="Execute a atualização do sistema diretamente via script Git"
              />
              <CardContent sx={{ pt: 3 }}>
                <Tooltip
                  title={
                    !versionData.isLinux
                      ? t("systemUpdate.updateUnavailableWindows")
                      : ""
                  }
                >
                  <span style={{ display: "block" }}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={
                        updating ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SystemUpdateAltIcon />
                        )
                      }
                      onClick={() => setUpdateDialogOpen(true)}
                      disabled={updating || versionData.upToDate || !versionData.isLinux}
                      sx={{
                        borderRadius: 3,
                        py: 1.5,
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "1rem",
                        background: (theme) =>
                          !updating && !versionData.upToDate && versionData.isLinux
                            ? `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`
                            : undefined,
                        boxShadow: (theme) =>
                          !updating && !versionData.upToDate && versionData.isLinux
                            ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                            : undefined,
                        "&:hover": {
                          transform:
                            !updating && !versionData.upToDate && versionData.isLinux
                              ? "translateY(-2px)"
                              : undefined,
                        },
                      }}
                    >
                      {updating
                        ? t("systemUpdate.updating")
                        : t("systemUpdate.updateViaGit")}
                    </Button>
                  </span>
                </Tooltip>

                {!versionData.isLinux && (
                  <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                    {t("systemUpdate.warningWindowsEnvironment")}
                  </Alert>
                )}

                {versionData.upToDate && logs.length === 0 && (
                  <Alert
                    severity="success"
                    icon={<CheckCircleIcon />}
                    sx={{ mt: 2, borderRadius: 2 }}
                  >
                    O sistema já está na versão mais recente. Nenhuma
                    atualização necessária.
                  </Alert>
                )}

                {updating && (
                  <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                    Atualização em andamento. Isso pode levar vários minutos.
                    Não feche esta página.
                  </Alert>
                )}

                {logs.length > 0 && (
                  <Box mt={2}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ mb: 0.5 }}
                    >
                      Saída do script:
                    </Typography>
                    <TerminalOutput ref={terminalRef}>
                      {logs.map((log, index) => (
                        <Box
                          key={index}
                          component="span"
                          sx={{
                            display: "block",
                            color:
                              log.type === "error"   ? "#f44336" :
                              log.type === "success" ? "#4caf50" :
                              log.type === "warning" ? "#ff9800" :
                              log.type === "stderr"  ? "#ff9800" :
                              log.type === "info"    ? "#2196f3" :
                              "#d4d4d4",
                          }}
                        >
                          {log.message}
                        </Box>
                      ))}
                      {updating && (
                        <Box
                          component="span"
                          sx={{ display: "block", color: "#888" }}
                        >
                          {t("systemUpdate.terminalRunning")}
                        </Box>
                      )}
                    </TerminalOutput>
                  </Box>
                )}
              </CardContent>
            </SectionCard>
          </>
        )}
      </Box>

      {/* Diálogo de configuração de atualização */}
      <Dialog
        open={updateDialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {t("systemUpdate.dialogTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t("systemUpdate.dialogDescription")}
          </DialogContentText>

          <TextField
            fullWidth
            label={t("systemUpdate.dialogPasswordLabel")}
            type={showPassword ? "text" : "password"}
            value={sudoPassword}
            onChange={(e) => setSudoPassword(e.target.value)}
            sx={{ mb: 3 }}
            helperText={t("systemUpdate.dialogPasswordHelper")}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {t("systemUpdate.dialogUpdateOS")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("systemUpdate.dialogUpdateOSDesc")}
              </Typography>
            </Box>
            <Switch
              checked={updateOS}
              onChange={(e) => setUpdateOS(e.target.checked)}
              color="primary"
            />
          </Box>

          <Divider />

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {t("systemUpdate.dialogUpdateBrowser")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("systemUpdate.dialogUpdateBrowserDesc")}
              </Typography>
            </Box>
            <Switch
              checked={updateBrowser}
              onChange={(e) => setUpdateBrowser(e.target.checked)}
              color="primary"
            />
          </Box>

          <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
            O processo pode levar <strong>10 a 30 minutos</strong> e o
            sistema ficará temporariamente indisponível durante o reinício.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleDialogClose}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            {t("systemUpdate.dialogCancel")}
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            startIcon={<SystemUpdateAltIcon />}
            disabled={!sudoPassword.trim()}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            {t("systemUpdate.dialogConfirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default SystemUpdate;
