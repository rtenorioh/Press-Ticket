import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  IconButton,
  Typography,
  Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import toastSuccess from "../../errors/toastSuccess";

const EMPTY_BUTTON = { label: "", url: "" };
const EMPTY_QUICK_REPLY = { label: "" };

const CardMessageModal = ({ open, onClose, ticketId }) => {
  const [title, setTitle] = useState("");
  const [media, setMedia] = useState("");
  const [text, setText] = useState("");
  const [buttons, setButtons] = useState([{ ...EMPTY_BUTTON }]);
  const [quickReplyButtons, setQuickReplyButtons] = useState([{ ...EMPTY_QUICK_REPLY }]);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setTitle("");
    setMedia("");
    setText("");
    setButtons([{ ...EMPTY_BUTTON }]);
    setQuickReplyButtons([{ ...EMPTY_QUICK_REPLY }]);
    onClose();
  };

  const handleButtonChange = (index, field, value) => {
    setButtons(prev => prev.map((btn, i) => i === index ? { ...btn, [field]: value } : btn));
  };

  const handleAddButton = () => {
    setButtons(prev => [...prev, { ...EMPTY_BUTTON }]);
  };

  const handleRemoveButton = (index) => {
    setButtons(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickReplyChange = (index, value) => {
    setQuickReplyButtons(prev => prev.map((btn, i) => i === index ? { label: value } : btn));
  };

  const handleAddQuickReply = () => {
    setQuickReplyButtons(prev => [...prev, { ...EMPTY_QUICK_REPLY }]);
  };

  const handleRemoveQuickReply = (index) => {
    setQuickReplyButtons(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!title.trim()) {
      toastError(new Error("O título é obrigatório."));
      return;
    }

    const validButtons = buttons.filter(b => b.label.trim());
    const validQuickReplies = quickReplyButtons.filter(b => b.label.trim());

    setLoading(true);
    try {
      await api.post(`/hub-card/${ticketId}`, {
        title: title.trim(),
        media: media.trim(),
        text: text.trim(),
        buttons: validButtons,
        quickReplyButtons: validQuickReplies
      });
      toastSuccess("Card enviado com sucesso.");
      handleClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Enviar Card
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Título *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
          />

          <TextField
            fullWidth
            label="URL da imagem"
            value={media}
            onChange={(e) => setMedia(e.target.value)}
            size="small"
            placeholder="https://exemplo.com/imagem.jpg"
          />

          <TextField
            fullWidth
            label="Descrição"
            value={text}
            onChange={(e) => setText(e.target.value)}
            size="small"
            multiline
            rows={2}
          />

          <Divider />

          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Botões de ação
              </Typography>
              <IconButton size="small" onClick={handleAddButton}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
            {buttons.map((btn, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  label="Label"
                  value={btn.label}
                  onChange={(e) => handleButtonChange(i, "label", e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="URL (opcional)"
                  value={btn.url}
                  onChange={(e) => handleButtonChange(i, "url", e.target.value)}
                  sx={{ flex: 2 }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveButton(i)}
                  disabled={buttons.length === 1}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Respostas rápidas
              </Typography>
              <IconButton size="small" onClick={handleAddQuickReply}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
            {quickReplyButtons.map((btn, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  label="Label"
                  value={btn.label}
                  onChange={(e) => handleQuickReplyChange(i, e.target.value)}
                  fullWidth
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveQuickReply(i)}
                  disabled={quickReplyButtons.length === 1}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={loading || !title.trim()}
          startIcon={loading && <CircularProgress size={16} />}
        >
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CardMessageModal;
