import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Chip,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import WhatsAppFeaturesService from "../../services/whatsappFeatures";
import toastError from "../../errors/toastError";
import toastSuccess from "../../errors/toastSuccess";
import api from "../../services/api";

const Section = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const WhatsAppProfilePanel = () => {
  const { t } = useTranslation();
  const [whatsapps, setWhatsapps] = useState([]);
  const [selectedWhatsappId, setSelectedWhatsappId] = useState("");
  const [status, setStatus] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [wwebVersion, setWwebVersion] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingVersion, setLoadingVersion] = useState(false);

  useEffect(() => {
    const fetchWhatsapps = async () => {
      try {
        const { data } = await api.get("/whatsapp");
        const connected = (data || []).filter(w => w.status === "CONNECTED");
        setWhatsapps(connected);
        if (connected.length > 0) {
          setSelectedWhatsappId(connected[0].id);
        }
      } catch (err) {
        console.error("Erro ao buscar conexões:", err);
      }
    };
    fetchWhatsapps();
  }, []);

  useEffect(() => {
    if (!selectedWhatsappId) return;
    const loadVersion = async () => {
      setLoadingVersion(true);
      try {
        const data = await WhatsAppFeaturesService.getWWebVersion(selectedWhatsappId);
        setWwebVersion(data.version || "");
      } catch {
        setWwebVersion("");
      } finally {
        setLoadingVersion(false);
      }
    };
    loadVersion();
  }, [selectedWhatsappId]);

  const handleUpdateStatus = async () => {
    if (!status.trim()) return;
    setLoading(true);
    try {
      await WhatsAppFeaturesService.setStatus(selectedWhatsappId, status);
      toastSuccess(t("profileSettings.statusSuccess"));
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!displayName.trim()) return;
    setLoading(true);
    try {
      await WhatsAppFeaturesService.setDisplayName(selectedWhatsappId, displayName);
      toastSuccess(t("profileSettings.nameSuccess"));
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePicture = async () => {
    setLoading(true);
    try {
      await WhatsAppFeaturesService.removeProfilePicture(selectedWhatsappId);
      toastSuccess(t("profileSettings.pictureRemoved"));
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPresence = async (available) => {
    setLoading(true);
    try {
      if (available) {
        await WhatsAppFeaturesService.setPresenceAvailable(selectedWhatsappId);
      } else {
        await WhatsAppFeaturesService.setPresenceUnavailable(selectedWhatsappId);
      }
      toastSuccess(available ? t("profileSettings.available") : t("profileSettings.unavailable"));
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {t("profileSettings.title")}
      </Typography>

      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <InputLabel>Conexão WhatsApp</InputLabel>
        <Select
          value={selectedWhatsappId}
          onChange={(e) => setSelectedWhatsappId(e.target.value)}
          label="Conexão WhatsApp"
        >
          {whatsapps.map((w) => (
            <MenuItem key={w.id} value={w.id}>
              {w.name} ({w.number || "sem número"})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedWhatsappId && (
        <>
          {wwebVersion && (
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t("profileSettings.wwebVersion")}:
              </Typography>
              {loadingVersion ? (
                <CircularProgress size={14} />
              ) : (
                <Chip label={wwebVersion} size="small" variant="outlined" />
              )}
            </Box>
          )}

          <Section variant="outlined">
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              {t("profileSettings.status")}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Escreva seu status..."
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleUpdateStatus}
                disabled={loading || !status.trim()}
                startIcon={<SaveIcon />}
                sx={{ whiteSpace: "nowrap" }}
              >
                {t("profileSettings.updateStatus")}
              </Button>
            </Box>
          </Section>

          <Section variant="outlined">
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              {t("profileSettings.displayName")}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Nome de exibição..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleUpdateName}
                disabled={loading || !displayName.trim()}
                startIcon={<SaveIcon />}
                sx={{ whiteSpace: "nowrap" }}
              >
                {t("profileSettings.updateName")}
              </Button>
            </Box>
          </Section>

          <Section variant="outlined">
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              {t("profileSettings.profilePicture")}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={handleRemovePicture}
              disabled={loading}
              startIcon={<DeleteIcon />}
            >
              {t("profileSettings.removePicture")}
            </Button>
          </Section>

          <Section variant="outlined">
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              {t("profileSettings.presence")}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleSetPresence(true)}
                disabled={loading}
              >
                {t("profileSettings.available")}
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleSetPresence(false)}
                disabled={loading}
              >
                {t("profileSettings.unavailable")}
              </Button>
            </Box>
          </Section>
        </>
      )}
    </Box>
  );
};

export default WhatsAppProfilePanel;
