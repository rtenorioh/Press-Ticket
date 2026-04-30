import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useTranslation } from "react-i18next";
import WhatsAppFeaturesService from "../../services/whatsappFeatures";
import toastError from "../../errors/toastError";

const formatTimestamp = (ts) => {
  if (!ts) return "—";
  const date = new Date(ts * 1000);
  return date.toLocaleString("pt-BR");
};

const MessageInfoModal = ({ open, onClose, messageId }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [pollVotes, setPollVotes] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (!open || !messageId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [infoData, reactionsData, votesData] = await Promise.allSettled([
          WhatsAppFeaturesService.getMessageInfo(messageId),
          WhatsAppFeaturesService.getMessageReactions(messageId),
          WhatsAppFeaturesService.getPollVotes(messageId)
        ]);

        if (infoData.status === "fulfilled") setInfo(infoData.value);
        if (reactionsData.status === "fulfilled") setReactions(reactionsData.value || []);
        if (votesData.status === "fulfilled") setPollVotes(votesData.value || []);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, messageId]);

  const handleClose = () => {
    setTabValue(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {t("messageInfoModal.title")}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
              <Tab label={t("messageInfoModal.title")} />
              {reactions.length > 0 && <Tab label={t("messageInfoModal.reactions")} />}
              {pollVotes.length > 0 && <Tab label={t("messageInfoModal.pollVotes")} />}
            </Tabs>

            {tabValue === 0 && (
              <Box>
                {info ? (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <DoneIcon color="action" fontSize="small" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          {t("messageInfoModal.delivery")}
                        </Typography>
                      </Box>
                      {info.delivery?.length > 0 ? (
                        <List dense disablePadding>
                          {info.delivery.map((d, i) => (
                            <ListItem key={i} disableGutters sx={{ pl: 4 }}>
                              <ListItemText
                                primary={d.id}
                                secondary={formatTimestamp(d.timestamp)}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>—</Typography>
                      )}
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <DoneAllIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          {t("messageInfoModal.read")}
                        </Typography>
                      </Box>
                      {info.read?.length > 0 ? (
                        <List dense disablePadding>
                          {info.read.map((r, i) => (
                            <ListItem key={i} disableGutters sx={{ pl: 4 }}>
                              <ListItemText
                                primary={r.id}
                                secondary={formatTimestamp(r.timestamp)}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>—</Typography>
                      )}
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <PlayArrowIcon color="action" fontSize="small" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          {t("messageInfoModal.played")}
                        </Typography>
                      </Box>
                      {info.played?.length > 0 ? (
                        <List dense disablePadding>
                          {info.played.map((p, i) => (
                            <ListItem key={i} disableGutters sx={{ pl: 4 }}>
                              <ListItemText
                                primary={p.id}
                                secondary={formatTimestamp(p.timestamp)}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>—</Typography>
                      )}
                    </Box>
                  </>
                ) : (
                  <Typography color="text.secondary">{t("messageInfoModal.noInfo")}</Typography>
                )}
              </Box>
            )}

            {tabValue === 1 && reactions.length > 0 && (
              <Box>
                {reactions.map((r, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
                    <Typography fontSize={20}>{r.reaction}</Typography>
                    <Typography variant="body2" color="text.secondary">{r.senderId}</Typography>
                  </Box>
                ))}
              </Box>
            )}

            {tabValue === (reactions.length > 0 ? 2 : 1) && pollVotes.length > 0 && (
              <Box>
                {pollVotes.map((v, i) => (
                  <Box key={i} sx={{ mb: 1.5 }}>
                    <Typography variant="body2" fontWeight={600}>{v.voter}</Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                      {v.selectedOptions?.map((opt, j) => (
                        <Chip key={j} label={opt.name} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MessageInfoModal;
