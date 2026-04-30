import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Divider
} from "@mui/material";
import LabelIcon from "@mui/icons-material/Label";
import { useTranslation } from "react-i18next";
import WhatsAppFeaturesService from "../../services/whatsappFeatures";
import toastError from "../../errors/toastError";
import toastSuccess from "../../errors/toastSuccess";

const LabelsPanel = ({ whatsappId, chatId }) => {
  const { t } = useTranslation();
  const [allLabels, setAllLabels] = useState([]);
  const [chatLabelIds, setChatLabelIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!whatsappId || !chatId) return;

    const fetchLabels = async () => {
      setLoading(true);
      try {
        const [labelsData, chatLabelsData] = await Promise.all([
          WhatsAppFeaturesService.getLabels(whatsappId),
          WhatsAppFeaturesService.getChatLabels(whatsappId, chatId)
        ]);
        setAllLabels(labelsData || []);
        setChatLabelIds((chatLabelsData || []).map(l => l.id || l));
      } catch (err) {
        console.error("[LabelsPanel] Erro ao carregar etiquetas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLabels();
  }, [whatsappId, chatId]);

  const handleToggleLabel = async (labelId) => {
    const isActive = chatLabelIds.includes(labelId);
    const newLabelIds = isActive
      ? chatLabelIds.filter(id => id !== labelId)
      : [...chatLabelIds, labelId];

    try {
      await WhatsAppFeaturesService.changeChatLabels(whatsappId, chatId, newLabelIds);
      setChatLabelIds(newLabelIds);
      toastSuccess(t("labelsPanel.updated"));
    } catch (err) {
      toastError(err);
    }
  };

  if (!whatsappId || !chatId) return null;

  return (
    <Box sx={{ mt: 2, px: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <LabelIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight={600}>
          {t("labelsPanel.title")}
        </Typography>
      </Box>
      <Divider sx={{ mb: 1 }} />
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={20} />
        </Box>
      ) : allLabels.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t("labelsPanel.noLabels")}
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {allLabels.map((label) => {
            const isActive = chatLabelIds.includes(label.id);
            return (
              <Chip
                key={label.id}
                label={label.name || label.id}
                size="small"
                variant={isActive ? "filled" : "outlined"}
                color={isActive ? "primary" : "default"}
                onClick={() => handleToggleLabel(label.id)}
                sx={{
                  backgroundColor: isActive && label.hexColor
                    ? label.hexColor
                    : undefined,
                  color: isActive && label.hexColor ? "#fff" : undefined,
                  borderColor: label.hexColor || undefined,
                  cursor: "pointer",
                  "&:hover": { opacity: 0.8 },
                }}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default LabelsPanel;
