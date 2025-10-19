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
  alpha
} from "@mui/material";

import {
  AddCircleOutline,
  Delete,
  GetApp,
  Restore,
  Refresh,
  Warning,
  CloudUpload,
  CloudDownload
} from "@mui/icons-material";

import { styled } from "@mui/material/styles";
import { green, red, blue } from "@mui/material/colors";

import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";

const BackupPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  margin: theme.spacing(1),
  overflowY: "auto",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
  ...theme.scrollbarStyles
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1)
}));

const StyledIconButton = styled(IconButton)(({ theme, color }) => ({
  backgroundColor: alpha(theme.palette[color || "primary"].main, 0.1),
  transition: "all 0.2s",
  "&:hover": {
    backgroundColor: alpha(theme.palette[color || "primary"].main, 0.2),
    transform: "translateY(-2px)"
  }
}));

const CreateBackupButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  transition: "all 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
  }
}));

const InputContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  marginBottom: theme.spacing(3),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(10px)"
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  overflow: "hidden",
  "& .MuiTableCell-head": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    fontWeight: 600
  }
}));

const NoBackupsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(6),
  flexDirection: "column",
  color: theme.palette.text.secondary
}));

const WarningIcon = styled(Warning)(({ theme }) => ({
  color: theme.palette.warning.main,
  fontSize: 64,
  marginBottom: theme.spacing(2),
  opacity: 0.7
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
    } catch (err) {
      toast.error(t("backup.restoreError"));
      console.error(err);
    }
    setSelectedBackup(null);
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{t("backup.title")}</Title>
        <MainHeaderButtonsWrapper>
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
            <Fade in={true} timeout={800}>
              <InputContainer elevation={0}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label={t("backup.nameLabel")}
                      placeholder={t("backup.namePlaceholder")}
                      value={backupName}
                      onChange={(e) => setBackupName(e.target.value)}
                      variant="outlined"
                      disabled={creatingBackup}
                      InputProps={{
                        sx: {
                          borderRadius: theme.shape.borderRadius * 1.5
                        }
                      }}
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
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("backup.filename")}</TableCell>
                      <TableCell>{t("backup.size")}</TableCell>
                      <TableCell>{isMobile ? "Data" : t("backup.createdAt")}</TableCell>
                      <TableCell align="center">{t("backup.actions")}</TableCell>
                    </TableRow>
                  </TableHead>
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
                        <TableRow key={backup.filename} hover>
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
                        </TableRow>
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
