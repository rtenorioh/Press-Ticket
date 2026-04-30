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
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import toastSuccess from "../../errors/toastSuccess";

const EMPTY_BUTTON = { label: "", url: "" };
const EMPTY_QUICK_REPLY = { label: "" };

const makeEmptyCard = () => ({
  title: "",
  media: "",
  text: "",
  buttons: [{ ...EMPTY_BUTTON }],
  quickReplyButtons: [{ ...EMPTY_QUICK_REPLY }],
  expanded: true
});

const CardEditor = ({ card, index, total, onChange, onRemove }) => {
  const handleButtonChange = (bi, field, value) => {
    const updated = card.buttons.map((b, i) => i === bi ? { ...b, [field]: value } : b);
    onChange({ ...card, buttons: updated });
  };

  const handleAddButton = () => {
    onChange({ ...card, buttons: [...card.buttons, { ...EMPTY_BUTTON }] });
  };

  const handleRemoveButton = (bi) => {
    onChange({ ...card, buttons: card.buttons.filter((_, i) => i !== bi) });
  };

  const handleQuickReplyChange = (qi, value) => {
    const updated = card.quickReplyButtons.map((b, i) => i === qi ? { label: value } : b);
    onChange({ ...card, quickReplyButtons: updated });
  };

  const handleAddQuickReply = () => {
    onChange({ ...card, quickReplyButtons: [...card.quickReplyButtons, { ...EMPTY_QUICK_REPLY }] });
  };

  const handleRemoveQuickReply = (qi) => {
    onChange({ ...card, quickReplyButtons: card.quickReplyButtons.filter((_, i) => i !== qi) });
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        mb: 2,
        overflow: "hidden"
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1,
          bgcolor: "action.hover",
          cursor: "pointer"
        }}
        onClick={() => onChange({ ...card, expanded: !card.expanded })}
      >
        <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
          Card {index + 1}{card.title ? ` — ${card.title}` : ""}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          disabled={total <= 2}
          title="Remover card"
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
        <IconButton size="small">
          {card.expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      <Collapse in={card.expanded}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
          <TextField
            fullWidth
            label="Título *"
            value={card.title}
            onChange={(e) => onChange({ ...card, title: e.target.value })}
            size="small"
          />
          <TextField
            fullWidth
            label="URL da imagem"
            value={card.media}
            onChange={(e) => onChange({ ...card, media: e.target.value })}
            size="small"
            placeholder="https://exemplo.com/imagem.jpg"
          />
          <TextField
            fullWidth
            label="Descrição"
            value={card.text}
            onChange={(e) => onChange({ ...card, text: e.target.value })}
            size="small"
            multiline
            rows={2}
          />

          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="caption" color="text.secondary">Botões de ação</Typography>
              <IconButton size="small" onClick={handleAddButton}><AddIcon fontSize="small" /></IconButton>
            </Box>
            {card.buttons.map((btn, bi) => (
              <Box key={bi} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField size="small" label="Label" value={btn.label}
                  onChange={(e) => handleButtonChange(bi, "label", e.target.value)} sx={{ flex: 1 }} />
                <TextField size="small" label="URL (opcional)" value={btn.url}
                  onChange={(e) => handleButtonChange(bi, "url", e.target.value)} sx={{ flex: 2 }} />
                <IconButton size="small" onClick={() => handleRemoveButton(bi)} disabled={card.buttons.length === 1}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="caption" color="text.secondary">Respostas rápidas</Typography>
              <IconButton size="small" onClick={handleAddQuickReply}><AddIcon fontSize="small" /></IconButton>
            </Box>
            {card.quickReplyButtons.map((btn, qi) => (
              <Box key={qi} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField size="small" label="Label" value={btn.label}
                  onChange={(e) => handleQuickReplyChange(qi, e.target.value)} fullWidth />
                <IconButton size="small" onClick={() => handleRemoveQuickReply(qi)} disabled={card.quickReplyButtons.length === 1}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

const CarouselMessageModal = ({ open, onClose, ticketId }) => {
  const [cards, setCards] = useState([makeEmptyCard(), makeEmptyCard()]);
  const [cardWidth, setCardWidth] = useState("medium");
  const [sharedQuickReplies, setSharedQuickReplies] = useState([{ ...EMPTY_QUICK_REPLY }]);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setCards([makeEmptyCard(), makeEmptyCard()]);
    setCardWidth("medium");
    setSharedQuickReplies([{ ...EMPTY_QUICK_REPLY }]);
    onClose();
  };

  const handleCardChange = (index, updated) => {
    setCards(prev => prev.map((c, i) => i === index ? updated : c));
  };

  const handleAddCard = () => {
    setCards(prev => [...prev, makeEmptyCard()]);
  };

  const handleRemoveCard = (index) => {
    setCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleSharedQuickReplyChange = (index, value) => {
    setSharedQuickReplies(prev => prev.map((b, i) => i === index ? { label: value } : b));
  };

  const handleAddSharedQuickReply = () => {
    setSharedQuickReplies(prev => [...prev, { ...EMPTY_QUICK_REPLY }]);
  };

  const handleRemoveSharedQuickReply = (index) => {
    setSharedQuickReplies(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const emptyTitle = cards.findIndex(c => !c.title.trim());
    if (emptyTitle !== -1) {
      toastError(new Error(`Card ${emptyTitle + 1} está sem título.`));
      return;
    }

    const payload = cards.map(({ title, media, text, buttons, quickReplyButtons }) => ({
      title: title.trim(),
      media: media.trim(),
      text: text.trim(),
      buttons: buttons.filter(b => b.label.trim()),
      quickReplyButtons: quickReplyButtons.filter(b => b.label.trim())
    }));

    const validSharedReplies = sharedQuickReplies.filter(b => b.label.trim());

    setLoading(true);
    try {
      await api.post(`/hub-carousel/${ticketId}`, {
        cards: payload,
        cardWidth,
        quickReplyButtons: validSharedReplies
      });
      toastSuccess("Carrossel enviado com sucesso.");
      handleClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const canSend = cards.length >= 2 && cards.every(c => c.title.trim());

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Enviar Carrossel
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Largura dos cards</InputLabel>
              <Select
                value={cardWidth}
                label="Largura dos cards"
                onChange={(e) => setCardWidth(e.target.value)}
              >
                <MenuItem value="small">Pequeno</MenuItem>
                <MenuItem value="medium">Médio</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              {cards.length} card{cards.length !== 1 ? "s" : ""} (mínimo 2)
            </Typography>
          </Box>

          <Divider />

          {cards.map((card, index) => (
            <CardEditor
              key={index}
              card={card}
              index={index}
              total={cards.length}
              onChange={(updated) => handleCardChange(index, updated)}
              onRemove={() => handleRemoveCard(index)}
            />
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddCard}
            variant="outlined"
            size="small"
            sx={{ alignSelf: "flex-start" }}
          >
            Adicionar card
          </Button>

          <Divider />

          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Respostas rápidas do carrossel (compartilhadas)
              </Typography>
              <IconButton size="small" onClick={handleAddSharedQuickReply}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
            {sharedQuickReplies.map((btn, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  label="Label"
                  value={btn.label}
                  onChange={(e) => handleSharedQuickReplyChange(i, e.target.value)}
                  fullWidth
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveSharedQuickReply(i)}
                  disabled={sharedQuickReplies.length === 1}
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

export default CarouselMessageModal;
