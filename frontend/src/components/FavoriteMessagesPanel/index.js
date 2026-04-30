import { useState, useEffect, useCallback } from "react";
import {
  Box,
  IconButton,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Drawer
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const DrawerContent = styled(Box)(() => ({
  width: 320,
  display: "flex",
  flexDirection: "column",
  height: "100%",
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.primary.main,
  color: "#fff",
  minHeight: 56,
}));

const ResultItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const mediaTypeLabel = (mediaType) => {
  if (!mediaType || mediaType === "chat") return null;
  const map = {
    image: "🖼 Imagem",
    video: "🎥 Vídeo",
    audio: "🎵 Áudio",
    ptt: "🎙 Áudio",
    document: "📄 Documento",
    sticker: "🎨 Figurinha",
    location: "📍 Localização",
    vcard: "👤 Contato",
  };
  return map[mediaType] || mediaType;
};

const FavoriteMessagesPanel = ({ open, onClose, ticketId }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const fetchStarred = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/messages/${ticketId}/starred`);
      setMessages(data.messages || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (open) fetchStarred();
    else setMessages([]);
  }, [open, fetchStarred]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if ("isStarred" in (e.detail || {})) {
        fetchStarred();
      }
    };
    window.addEventListener("messageStateUpdate", handler);
    return () => window.removeEventListener("messageStateUpdate", handler);
  }, [open, fetchStarred]);

  const handleResultClick = (msg) => {
    window.dispatchEvent(
      new CustomEvent("scrollToMessage", { detail: { messageId: msg.id } })
    );
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "";
    try {
      return format(parseISO(dateStr), "dd/MM/yy, HH:mm");
    } catch {
      return "";
    }
  };

  const getPreview = (msg) => {
    const media = mediaTypeLabel(msg.mediaType);
    if (media) return media;
    return msg.body || "";
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { position: "absolute" } }}
      BackdropProps={{ sx: { position: "absolute" } }}
      ModalProps={{
        container: document.getElementById("drawer-container"),
        style: { position: "absolute" },
      }}
    >
      <DrawerContent>
        <PanelHeader>
          <IconButton size="small" onClick={onClose} sx={{ color: "#fff", mr: 1 }}>
            <CloseIcon />
          </IconButton>
          <StarIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Mensagens Favoritas
          </Typography>
        </PanelHeader>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <StarIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
              <Typography color="text.secondary" variant="body2">
                Nenhuma mensagem favoritada
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {messages.map((msg) => (
                <ResultItem
                  key={msg.id}
                  alignItems="flex-start"
                  disableGutters
                  sx={{ px: 2 }}
                  onClick={() => handleResultClick(msg)}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ color: "text.primary" }}
                      >
                        {getPreview(msg)}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {msg.fromMe
                          ? t("searchMessages.you")
                          : msg.contactName || ""}{" "}
                        • {formatTimestamp(msg.createdAt)}
                      </Typography>
                    }
                  />
                </ResultItem>
              ))}
            </List>
          )}
        </Box>
      </DrawerContent>
    </Drawer>
  );
};

export default FavoriteMessagesPanel;
