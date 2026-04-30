import PushPinIcon from "@mui/icons-material/PushPin";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import WhatsAppFeaturesService from "../../services/whatsappFeatures";

const PinnedMessagesBanner = ({ ticket, onMessageClick, onClose }) => {
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pinRefreshKey, setPinRefreshKey] = useState(0);

  useEffect(() => {
    const handler = (e) => {
      if ("isPinned" in (e.detail || {})) {
        setPinRefreshKey(k => k + 1);
      }
    };
    window.addEventListener("messageStateUpdate", handler);
    return () => window.removeEventListener("messageStateUpdate", handler);
  }, []);

  useEffect(() => {
    if (!ticket?.whatsappId || !ticket?.contact?.number) return;

    const fetchPinnedMessages = async () => {
      try {
        const chatId = `${ticket.contact.number}@${ticket.contact.isGroup ? "g.us" : "c.us"}`;
        const messages = await WhatsAppFeaturesService.getPinnedMessages(
          ticket.whatsappId,
          chatId
        );
        setPinnedMessages(messages || []);
        setCurrentIndex(0);
      } catch {
        setPinnedMessages([]);
      }
    };

    fetchPinnedMessages();
  }, [ticket?.whatsappId, ticket?.contact?.number, ticket?.contact?.isGroup, pinRefreshKey]);

  if (pinnedMessages.length === 0) return null;

  const total = pinnedMessages.length;
  const current = pinnedMessages[currentIndex];

  const handleClick = () => {
    if (onMessageClick) onMessageClick(current.id);
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const formatPreview = (msg) => {
    if (!msg.body) return "Mídia";
    return msg.body.length > 60 ? `${msg.body.substring(0, 60)}...` : msg.body;
  };

  return (
    <Paper
      elevation={2}
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "#1e3a5f" : "#e3f2fd",
        borderRadius: 0,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        px: 1.5,
        py: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
        cursor: "pointer",
        userSelect: "none",
        "&:hover": {
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "#244a75" : "#d0e9fc",
        },
      }}
      onClick={handleClick}
    >
      <PushPinIcon
        sx={{
          fontSize: 18,
          color: "primary.main",
          transform: "rotate(45deg)",
          flexShrink: 0,
        }}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{ color: "primary.main", fontWeight: 600, lineHeight: 1.2, display: "block" }}
        >
          {total === 1 ? "Mensagem fixada" : `${currentIndex + 1} de ${total}`}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.primary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "0.875rem",
          }}
        >
          {formatPreview(current)}
        </Typography>
      </Box>

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onClose && onClose();
        }}
        sx={{ color: "text.secondary", flexShrink: 0 }}
      >
        ✕
      </IconButton>
    </Paper>
  );
};

export default PinnedMessagesBanner;
