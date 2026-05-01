import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import toastSuccess from "../../errors/toastSuccess";

const EmailComposeModal = ({
  open,
  onClose,
  defaultValues = {},
  accounts = [],
  selectedAccount,
  onSent
}) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [accountId, setAccountId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toError, setToError] = useState(false);

  // Pre-fill when modal opens
  useEffect(() => {
    if (open) {
      setTo(defaultValues.to || "");
      setSubject(defaultValues.subject || "");
      setBody(defaultValues.body || "");
      setAccountId(selectedAccount?.id || accounts[0]?.id || null);
      setToError(false);
    }
  }, [open, defaultValues, selectedAccount, accounts]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSend = async () => {
    if (!to || !isValidEmail(to)) {
      setToError(true);
      return;
    }
    if (!accountId) {
      toastError(new Error("Selecione uma conta de email remetente."));
      return;
    }

    setLoading(true);
    try {
      await api.post("/emails", {
        whatsappId: accountId,
        to: to.trim(),
        subject: subject.trim(),
        htmlBody: body,
        textBody: body
      });

      toastSuccess("Email enviado com sucesso!");
      if (onSent) onSent();
      handleClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTo("");
    setSubject("");
    setBody("");
    setToError(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}
      >
        <Typography fontWeight={700}>Novo Email</Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {/* Sender account — only if multiple accounts */}
          {accounts.length > 1 && (
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                DE
              </Typography>
              <Select
                size="small"
                fullWidth
                value={accountId || ""}
                onChange={(e) => setAccountId(e.target.value)}
                sx={{ mt: 0.5 }}
              >
                {accounts.map((acc) => (
                  <MenuItem key={acc.id} value={acc.id}>
                    {acc.name} ({acc.qrcode})
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}

          {/* To */}
          <TextField
            label="Para *"
            size="small"
            fullWidth
            value={to}
            onChange={(e) => { setTo(e.target.value); setToError(false); }}
            error={toError}
            helperText={toError ? "Email inválido." : ""}
            type="email"
            autoFocus={!defaultValues.to}
            disabled={loading}
          />

          {/* Subject */}
          <TextField
            label="Assunto"
            size="small"
            fullWidth
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={loading}
          />

          {/*
            CC e BCC não são suportados pelo NotificameHub SDK (EmailContent não tem esses campos).
            Implementar futuramente quando o SDK suportar.
          */}

          {/* Body */}
          <TextField
            label="Mensagem"
            size="small"
            fullWidth
            multiline
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={loading}
            placeholder="Escreva sua mensagem..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading || !to}
          startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
        >
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailComposeModal;
