import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import api from "../../services/api";
import ContactsAutocomplete from "../ContactsAutocomplete";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    minWidth: 500,
    maxWidth: 600,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const CreateGroupModal = ({ open, onClose, whatsappId, onSuccess }) => {

  const [groupName, setGroupName] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Digite o nome do grupo");
      return;
    }

    if (selectedContacts.length === 0) {
      toast.error("Adicione pelo menos 1 participante");
      return;
    }

    const participants = selectedContacts.map((c) => c.number.replace(/\D/g, ""));

    setLoading(true);
    try {
      await api.post(`/whatsapp/${whatsappId}/groups`, {
        name: groupName,
        participants,
      });

      toast.success("Grupo criado com sucesso!");
      handleClose();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao criar grupo");
    }
    setLoading(false);
  };

  const handleClose = () => {
    setGroupName("");
    setSelectedContacts([]);
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>
        <Typography variant="h6" component="div">
          Criar Novo Grupo
        </Typography>
      </StyledDialogTitle>

      <StyledDialogContent>
        <TextField
          label="Nome do Grupo"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          fullWidth
          variant="outlined"
          autoFocus
          disabled={loading}
          sx={{ mb: 2 }}
        />

        <ContactsAutocomplete
          value={selectedContacts}
          onChange={setSelectedContacts}
          disabled={loading}
          label="Participantes"
        />

        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: "block" }}>
          Total de participantes: {selectedContacts.length}
        </Typography>
      </StyledDialogContent>

      <StyledDialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleCreateGroup}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Criar Grupo"}
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default CreateGroupModal;
