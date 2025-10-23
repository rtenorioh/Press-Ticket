import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Box,
  Typography,
  CircularProgress
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import api from "../../services/api";

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

const ParticipantInput = styled(TextField)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
}));

const ChipContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  marginTop: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  minHeight: 60,
}));

const HelperText = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: "0.75rem",
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const CreateGroupModal = ({ open, onClose, whatsappId, onSuccess }) => {
  
  const [groupName, setGroupName] = useState("");
  const [participantNumber, setParticipantNumber] = useState("");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddParticipant = () => {
    const cleanNumber = participantNumber.replace(/\D/g, "");
    
    if (!cleanNumber) {
      toast.error("Digite um número válido");
      return;
    }

    if (cleanNumber.length < 10) {
      toast.error("Número deve ter pelo menos 10 dígitos");
      return;
    }

    if (participants.includes(cleanNumber)) {
      toast.error("Participante já adicionado");
      return;
    }

    setParticipants([...participants, cleanNumber]);
    setParticipantNumber("");
  };

  const handleRemoveParticipant = (number) => {
    setParticipants(participants.filter((p) => p !== number));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddParticipant();
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Digite o nome do grupo");
      return;
    }

    if (participants.length === 0) {
      toast.error("Adicione pelo menos 1 participante");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/whatsapp/${whatsappId}/groups`, {
        name: groupName,
        participants: participants,
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
    setParticipantNumber("");
    setParticipants([]);
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
        />

        <ParticipantInput
          label="Número do Participante"
          value={participantNumber}
          onChange={(e) => setParticipantNumber(e.target.value)}
          onKeyPress={handleKeyPress}
          fullWidth
          variant="outlined"
          placeholder="5511999999999"
          disabled={loading}
          helperText="Digite o número com código do país e DDD (ex: 5511999999999)"
        />

        <Button
          variant="outlined"
          color="primary"
          onClick={handleAddParticipant}
          disabled={loading}
          fullWidth
        >
          Adicionar Participante
        </Button>

        <ChipContainer>
          {participants.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              Nenhum participante adicionado
            </Typography>
          ) : (
            participants.map((number) => (
              <Chip
                key={number}
                label={number}
                onDelete={() => handleRemoveParticipant(number)}
                color="primary"
                disabled={loading}
              />
            ))
          )}
        </ChipContainer>

        <HelperText>
          Total de participantes: {participants.length}
        </HelperText>
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
