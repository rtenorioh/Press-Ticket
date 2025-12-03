import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Typography,
  Button
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../services/api";

const MessageReactionsModal = ({ open, onClose, messageId, t }) => {
  const [loading, setLoading] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [tab, setTab] = useState(0);

  const load = async () => {
    if (!messageId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/messages/${messageId}/reactions`);
      setReactions(Array.isArray(data?.reactions) ? data.reactions : []);
    } catch (e) {
      console.error("Erro ao buscar reações:", e);
      setReactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setTab(0);
      load();
    }
  }, [open, messageId]);

  const emojis = useMemo(() => reactions.map(r => ({ emoji: r.aggregateEmoji || r.id, count: r.senders?.length || 0, hasMe: !!r.hasReactionByMe })), [reactions]);

  const youReaction = useMemo(() => reactions.find(r => r.hasReactionByMe), [reactions]);

  const filteredSenders = useMemo(() => {
    if (tab === 0) {
      const list = [];
      reactions.forEach(r => {
        const senders = (r.senders || []).map(s => ({ ...s, _emoji: r.aggregateEmoji || r.id }));
        list.push(...senders);
      });
      return list;
    }
    const idx = tab - 1;
    const r = reactions[idx];
    return (r?.senders || []).map(s => ({ ...s, _emoji: r.aggregateEmoji || r.id }));
  }, [tab, reactions]);

  const handleRemoveMine = async (emojiToRemove) => {
    try {
      await api.post(`/messages/${messageId}/reactions`, { emoji: "", removeEmoji: emojiToRemove });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", alignItems: "center", pr: 6 }}>
        {t ? t("messageReactions.title", { defaultValue: "Reações" }) : "Reações"}
        <IconButton onClick={onClose} sx={{ ml: "auto" }} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1, flexWrap: "wrap" }}>
              <Chip label={(t ? t("messageReactions.all", { defaultValue: "Todas" }) : "Todas") + ` ${filteredSenders.length}`} color={tab === 0 ? "primary" : "default"} onClick={() => setTab(0)} />
              {emojis.map((e, i) => (
                <Chip key={`emoji-${i}`} label={`${e.emoji} ${e.count}`} color={tab === i + 1 ? "primary" : "default"} onClick={() => setTab(i + 1)} />
              ))}
            </Box>

            {youReaction && (
              <Box sx={{ p: 1, borderRadius: 1, bgcolor: (theme) => theme.palette.action.hover, mb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="body2">{t ? t("messageReactions.youReacted", { defaultValue: "Você reagiu" }) : "Você reagiu"}: <span style={{ fontSize: 18 }}>{youReaction.aggregateEmoji || youReaction.id}</span></Typography>
                <Button variant="text" size="small" onClick={() => handleRemoveMine(youReaction.aggregateEmoji || youReaction.id)}>
                  {t ? t("messageReactions.remove", { defaultValue: "Remover" }) : "Remover"}
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            <List dense>
              {filteredSenders.map((s, idx) => (
                <ListItem key={`sender-${idx}`} secondaryAction={s.isMe || s.fromMe || s.me || s.isSenderMe ? (
                  <Button size="small" onClick={() => handleRemoveMine(s._emoji)}>
                    {t ? t("messageReactions.clickToRemove", { defaultValue: "Clique para remover" }) : "Clique para remover"}
                  </Button>
                ) : null}>
                  <ListItemAvatar>
                    <Avatar src={s.profilePicThumbObj?.img}>
                      {(s?.id?.user || "?").toString().slice(-2)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={s.isMe || s.fromMe || s.me || s.isSenderMe ? (t ? t("messageReactions.you", { defaultValue: "Você" }) : "Você") : (s?.contactName || s?.id?._serialized || s?.id?.user || "Contato")}
                    secondary={<span style={{ fontSize: 18 }}>{s._emoji}</span>}
                  />
                </ListItem>
              ))}
              {filteredSenders.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                  {t ? t("messageReactions.empty", { defaultValue: "Sem reações" }) : "Sem reações"}
                </Typography>
              )}
            </List>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MessageReactionsModal;
