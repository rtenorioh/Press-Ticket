import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  Box,
  Fade,
  useMediaQuery,
  useTheme,
  alpha,
  Chip,
  Card,
  CardContent
} from "@mui/material";

import {
  AddCircleOutline,
  Delete,
  GetApp,
  Restore,
  Refresh,
  Warning,
  CloudUpload,
  CloudDownload,
  Storage as StorageIcon,
  Schedule as ScheduleIcon,
  FolderZip as FolderZipIcon,
  Publish as PublishIcon
} from "@mui/icons-material";

import { styled, keyframes } from "@mui/material/styles";
import { green, red, blue } from "@mui/material/colors";

import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const BackupPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${theme.palette.background.paper} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: theme.palette.mode === 'dark'
    ? `0 8px 32px 0 ${alpha('#000', 0.37)}`
    : `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.15)}`,
  animation: `${fadeIn} 0.5s ease-out`,
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 180px)',
  '&::-webkit-scrollbar': {
    width: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.divider, 0.1),
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: 4,
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.5),
    }
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)}, ${alpha(theme.palette.background.paper, 0.1)})`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha('#fff', 0.5)})`,
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1)
}));

const StyledIconButton = styled(IconButton)(({ theme, color }) => ({
  backgroundColor: alpha(theme.palette[color || "primary"].main, 0.1),
  border: `1.5px solid ${alpha(theme.palette[color || "primary"].main, 0.3)}`,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette[color || "primary"].main,
    color: '#fff',
    transform: "translateY(-2px) scale(1.05)",
    boxShadow: `0 4px 12px ${alpha(theme.palette[color || "primary"].main, 0.4)}`
  }
}));

const CreateBackupButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
  }
}));

const InputContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.default, 0.6)})`
    : `linear-gradient(135deg, ${alpha('#fff', 0.95)}, ${alpha(theme.palette.grey[50], 0.8)})`,
  backdropFilter: "blur(10px)",
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  marginBottom: theme.spacing(3)
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.8)
      : alpha('#fff', 0.9),
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    '&:hover': {
      background: theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.9)
        : '#fff',
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    '&.Mui-focused': {
      background: '#fff',
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
    }
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.6)
    : alpha('#fff', 0.8),
  backdropFilter: 'blur(10px)',
  overflow: "hidden",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)}, ${alpha(theme.palette.primary.main, 0.2)})`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`,
  '& .MuiTableCell-head': {
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.08)
      : alpha(theme.palette.primary.main, 0.04),
    transform: 'scale(1.01)',
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
  }
}));

const NoBackupsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(8),
  flexDirection: "column",
  color: theme.palette.text.secondary,
  animation: `${fadeIn} 0.8s ease-out`
}));

const WarningIcon = styled(Warning)(({ theme }) => ({
  color: theme.palette.warning.main,
  fontSize: 80,
  marginBottom: theme.spacing(2),
  opacity: 0.6,
  animation: `${pulse} 2s ease-in-out infinite`
}));

const Backup = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState([]);
  const [backupName, setBackupName] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [importingBackup, setImportingBackup] = useState(false);

  useEffect(() => {
    loadBackups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/backups");
      setBackups(data);
    } catch (err) {
      toast.error(t("backup.loadError"));
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      await api.post("/backups", { name: backupName });
      toast.success(t("backup.createSuccess"));
      setBackupName("");
      loadBackups();
    } catch (err) {
      toast.error(t("backup.createError"));
      console.error(err);
    }
    setCreatingBackup(false);
  };

  const handleDownloadBackup = async (filename) => {
    try {
      const { data } = await api.get(`/backups/${filename}`, {
        responseType: "blob"
      });
      
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error(t("backup.downloadError"));
      console.error(err);
    }
  };

  const handleOpenDeleteDialog = (backup) => {
    setSelectedBackup(backup);
    setConfirmOpen(true);
  };

  const handleOpenRestoreDialog = (backup) => {
    setSelectedBackup(backup);
    setRestoreConfirmOpen(true);
  };

  const handleDeleteBackup = async () => {
    setConfirmOpen(false);
    if (!selectedBackup) return;

    try {
      await api.delete(`/backups/${selectedBackup.filename}`);
      toast.success(t("backup.deleteSuccess"));
      loadBackups();
    } catch (err) {
      toast.error(t("backup.deleteError"));
      console.error(err);
    }
    setSelectedBackup(null);
  };

  const handleRestoreBackup = async () => {
    setRestoreConfirmOpen(false);
    if (!selectedBackup) return;

    try {
      await api.post(`/backups/${selectedBackup.filename}/restore`);
      toast.success(t("backup.restoreSuccess"));
      
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (err) {
      toast.error(t("backup.restoreError"));
      console.error(err);
    }
    setSelectedBackup(null);
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.sql') && !file.name.endsWith('.sql.gz')) {
      toast.error(t("backup.importError") + ": Apenas arquivos .sql ou .sql.gz");
      return;
    }

    setImportingBackup(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.post("/backups/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success(t("backup.importSuccess"));
      loadBackups();
    } catch (err) {
      toast.error(t("backup.importError"));
      console.error(err);
    }
    setImportingBackup(false);
    event.target.value = '';
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{t("backup.title")}</Title>
        <MainHeaderButtonsWrapper>
          <input
            type="file"
            id="import-backup-input"
            accept=".sql,.sql.gz"
            style={{ display: 'none' }}
            onChange={handleImportBackup}
            disabled={importingBackup}
          />
          <Button
            variant="contained"
            color="secondary"
            startIcon={importingBackup ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <PublishIcon />}
            onClick={() => document.getElementById('import-backup-input').click()}
            disabled={importingBackup}
            sx={{
              borderRadius: theme.shape.borderRadius * 1.5,
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s",
              marginRight: 1,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
              }
            }}
          >
            {isMobile ? "" : importingBackup ? t("backup.importing") : t("backup.import")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={loadBackups}
            startIcon={<Refresh />}
            disabled={loading}
            sx={{
              borderRadius: theme.shape.borderRadius * 1.5,
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
              }
            }}
          >
            {isMobile ? "" : t("backup.refresh")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <BackupPaper elevation={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <HeaderSection>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: theme => `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }}
                >
                  <StorageIcon sx={{ color: '#fff', fontSize: '2rem' }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    💾 Gerenciamento de Backups
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Crie, restaure e gerencie backups do banco de dados de forma segura
                  </Typography>
                </Box>
                {backups.length > 0 && (
                  <Chip 
                    icon={<FolderZipIcon />}
                    label={`${backups.length} Backup${backups.length !== 1 ? 's' : ''}`}
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            </HeaderSection>

            <Fade in={true} timeout={800}>
              <InputContainer elevation={0}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <StyledTextField
                      fullWidth
                      label={t("backup.nameLabel")}
                      placeholder={t("backup.namePlaceholder")}
                      value={backupName}
                      onChange={(e) => setBackupName(e.target.value)}
                      variant="outlined"
                      disabled={creatingBackup}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <CreateBackupButton
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={creatingBackup ? null : <CloudUpload />}
                      onClick={handleCreateBackup}
                      disabled={creatingBackup}
                    >
                      {creatingBackup ? (
                        <>
                          <CircularProgress
                            size={24}
                            sx={{ color: green[500], marginRight: 1 }}
                          />
                          {isMobile ? "" : t("backup.creating")}
                        </>
                      ) : (
                        t("backup.create")
                      )}
                    </CreateBackupButton>
                  </Grid>
                </Grid>
              </InputContainer>
            </Fade>
          </Grid>
          <Grid item xs={12}>
            <Fade in={true} timeout={1000}>
              <StyledTableContainer component={Paper} elevation={0}>
                <Table>
                  <StyledTableHead>
                    <TableRow>
                      <TableCell>{t("backup.filename")}</TableCell>
                      <TableCell>{t("backup.size")}</TableCell>
                      <TableCell>{isMobile ? "Data" : t("backup.createdAt")}</TableCell>
                      <TableCell align="center">{t("backup.actions")}</TableCell>
                    </TableRow>
                  </StyledTableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={40} sx={{ color: blue[500] }} />
                        </TableCell>
                      </TableRow>
                    ) : backups.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Fade in={true} timeout={800}>
                            <NoBackupsContainer>
                              <WarningIcon />
                              <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.8 }}>
                                {t("backup.noBackups")}
                              </Typography>
                            </NoBackupsContainer>
                          </Fade>
                        </TableCell>
                      </TableRow>
                    ) : (
                      backups.map((backup) => (
                        <StyledTableRow key={backup.filename}>
                          <TableCell sx={{ maxWidth: { xs: 120, md: 'none' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {backup.filename}
                          </TableCell>
                          <TableCell>{backup.size}</TableCell>
                          <TableCell>{backup.date}</TableCell>
                          <TableCell align="center">
                            <ActionButtons>
                              <Tooltip
                                title={t("backup.download")}
                                placement="top"
                                arrow
                              >
                                <StyledIconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleDownloadBackup(backup.filename)}
                                >
                                  <CloudDownload fontSize="small" />
                                </StyledIconButton>
                              </Tooltip>
                              <Tooltip
                                title={t("backup.restore")}
                                placement="top"
                                arrow
                                componentsProps={{
                                  tooltip: {
                                    sx: {
                                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                                      color: theme.palette.text.primary,
                                      fontSize: "0.875rem",
                                      border: `1px solid ${theme.palette.divider}`,
                                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                      maxWidth: 450,
                                      textAlign: "center"
                                    }
                                  }
                                }}
                              >
                                <StyledIconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleOpenRestoreDialog(backup)}
                                >
                                  <Restore fontSize="small" />
                                </StyledIconButton>
                              </Tooltip>
                              <Tooltip
                                title={t("backup.delete")}
                                placement="top"
                                arrow
                              >
                                <StyledIconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenDeleteDialog(backup)}
                                >
                                  <Delete fontSize="small" />
                                </StyledIconButton>
                              </Tooltip>
                            </ActionButtons>
                          </TableCell>
                        </StyledTableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </Fade>
          </Grid>
        </Grid>
      </BackupPaper>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius * 2,
            padding: theme.spacing(1),
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {t("backup.confirmDeleteTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: theme.palette.text.secondary }}>
            {t("backup.confirmDeleteMessage", {
              name: selectedBackup?.filename
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: theme.spacing(2) }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            color="inherit"
            sx={{ 
              borderRadius: theme.shape.borderRadius * 1.5,
              textTransform: "none"
            }}
          >
            {t("backup.cancelButton")}
          </Button>
          <Button
            onClick={handleDeleteBackup}
            color="error"
            variant="contained"
            autoFocus
            startIcon={<Delete />}
            sx={{ 
              borderRadius: theme.shape.borderRadius * 1.5,
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(244, 67, 54, 0.2)"
            }}
          >
            {t("backup.confirmButton")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={restoreConfirmOpen}
        onClose={() => setRestoreConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius * 2,
            padding: theme.spacing(1),
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {t("backup.confirmRestoreTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: theme.palette.text.secondary }}>
            {t("backup.confirmRestoreMessage", {
              name: selectedBackup?.filename
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: theme.spacing(2) }}>
          <Button
            onClick={() => setRestoreConfirmOpen(false)}
            color="inherit"
            sx={{ 
              borderRadius: theme.shape.borderRadius * 1.5,
              textTransform: "none"
            }}
          >
            {t("backup.cancelButton")}
          </Button>
          <Button
            onClick={handleRestoreBackup}
            color="success"
            variant="contained"
            autoFocus
            startIcon={<Restore />}
            sx={{ 
              borderRadius: theme.shape.borderRadius * 1.5,
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(76, 175, 80, 0.2)"
            }}
          >
            {t("backup.confirmButton")}
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default Backup;
