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
  Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import toastSuccess from "../../errors/toastSuccess";

const ReplyableTextModal = ({ open, onClose, ticketId }) => {
  const [text, setText] = useState("");
  const [buttons, setButtons] = useState([{ label: "" }]);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setText("");
    setButtons([{ label: "" }]);
    onClose();
  };

  const handleButtonChange = (index, value) => {
    setButtons(prev => prev.map((b, i) => i === index ? { label: value } : b));
  };

  const handleAddButton = () => {
    setButtons(prev => [...prev, { label: "" }]);
  };

  const handleRemoveButton = (index) => {
    setButtons(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!text.trim()) {
      toastError(new Error("O texto da mensagem é obrigatório."));
      return;
    }

    const validButtons = buttons.filter(b => b.label.trim());
    if (validButtons.length === 0) {
      toastError(new Error("Pelo menos um botão de resposta rápida é obrigatório."));
      return;
    }

    setLoading(true);
    try {
      await api.post(`/hub-replyable/${ticketId}`, {
        text: text.trim(),
        quickReplyButtons: validButtons
      });
      toastSuccess("Mensagem com respostas rápidas enviada.");
      handleClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const canSend = text.trim() && buttons.some(b => b.label.trim());

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Mensagem com respostas rápidas
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Mensagem *"
            value={text}
            onChange={(e) => setText(e.target.value)}
            size="small"
            multiline
            rows={3}
          />

          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Botões de resposta rápida *
              </Typography>
              <IconButton size="small" onClick={handleAddButton} title="Adicionar botão">
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
            {buttons.map((btn, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  label={`Botão ${i + 1}`}
                  value={btn.label}
                  onChange={(e) => handleButtonChange(i, e.target.value)}
                  fullWidth
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveButton(i)}
                  disabled={buttons.length === 1}
                  title="Remover botão"
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
          disabled={loading || !canSend}
          startIcon={loading && <CircularProgress size={16} />}
        >
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReplyableTextModal;
