import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Typography,
  CircularProgress,
  Tabs,
  Tab
} from "@mui/material";
import {
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import api from "../../services/api";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    minWidth: 600,
    maxWidth: 700,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  minHeight: 400,
  padding: theme.spacing(3),
}));

const ParticipantInput = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledList = styled(List)(({ theme }) => ({
  maxHeight: 350,
  overflow: "auto",
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

const AdminChip = styled(Chip)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  fontWeight: 500,
  height: 24,
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const ManageParticipantsModal = ({ open, onClose, whatsappId, group, onSuccess }) => {
  
  const [loading, setLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const [newParticipant, setNewParticipant] = useState("");
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (open && group) {
      loadGroupInfo();
    }
  }, [open, group]);

  const loadGroupInfo = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/whatsapp/${whatsappId}/groups/${group.id}`);
      setGroupInfo(data);
    } catch (err) {
      toast.error("Erro ao carregar informações do grupo");
    }
    setLoading(false);
  };

  const handleAddParticipant = async () => {
    const cleanNumber = newParticipant.replace(/\D/g, "");
    
    if (!cleanNumber || cleanNumber.length < 10) {
      toast.error("Digite um número válido");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/whatsapp/${whatsappId}/groups/${group.id}/participants/add`, {
        participants: [cleanNumber],
      });

      toast.success("Participante adicionado!");
      setNewParticipant("");
      loadGroupInfo();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao adicionar participante");
    }
    setLoading(false);
  };

  const handleRemoveParticipant = async (participantId) => {
    if (!window.confirm("Deseja remover este participante?")) {
      return;
    }

    setLoading(true);
    try {
      await api.post(`/whatsapp/${whatsappId}/groups/${group.id}/participants/remove`, {
        participants: [participantId],
      });

      toast.success("Participante removido!");
      loadGroupInfo();
      onSuccess();
    } catch (err) {
      toast.error("Erro ao remover participante");
    }
    setLoading(false);
  };

  const handlePromoteParticipant = async (participantId) => {
    setLoading(true);
    try {
      await api.post(`/whatsapp/${whatsappId}/groups/${group.id}/participants/promote`, {
        participants: [participantId],
      });

      toast.success("Participante promovido a admin!");
      loadGroupInfo();
      onSuccess();
    } catch (err) {
      toast.error("Erro ao promover participante");
    }
    setLoading(false);
  };

  const handleDemoteParticipant = async (participantId) => {
    setLoading(true);
    try {
      await api.post(`/whatsapp/${whatsappId}/groups/${group.id}/participants/demote`, {
        participants: [participantId],
      });

      toast.success("Admin rebaixado!");
      loadGroupInfo();
      onSuccess();
    } catch (err) {
      toast.error("Erro ao rebaixar admin");
    }
    setLoading(false);
  };

  const isAdmin = (participantId) => {
    return groupInfo?.admins?.includes(participantId);
  };

  const isOwner = (participantId) => {
    return groupInfo?.owner === participantId;
  };

  const handleClose = () => {
    setNewParticipant("");
    setTab(0);
    onClose();
  };

  if (!groupInfo) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <StyledDialogTitle>
        <Typography variant="h6" component="div">
          Gerenciar Participantes
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
          {group?.name} • {groupInfo.size} participantes
        </Typography>
      </StyledDialogTitle>
      
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
        <Tab label="Adicionar" />
        <Tab label={`Participantes (${groupInfo.size})`} />
      </Tabs>

      <StyledDialogContent>
        {tab === 0 && (
          <Box>
            <ParticipantInput
              label="Número do Participante"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddParticipant()}
              fullWidth
              variant="outlined"
              placeholder="5511999999999"
              disabled={loading}
              helperText="Digite o número com código do país e DDD"
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={handleAddParticipant}
              disabled={loading}
              fullWidth
            >
              Adicionar Participante
            </Button>
          </Box>
        )}

        {tab === 1 && (
          <StyledList>
            {groupInfo.participants.map((participant) => (
              <ListItem key={participant.id._serialized}>
                <ListItemText
                  primary={participant.id.user}
                  secondary={participant.id._serialized}
                />
                
                {isOwner(participant.id._serialized) && (
                  <AdminChip
                    size="small"
                    label="Dono"
                    color="secondary"
                  />
                )}
                
                {isAdmin(participant.id._serialized) && !isOwner(participant.id._serialized) && (
                  <AdminChip
                    size="small"
                    label="Admin"
                    color="primary"
                  />
                )}

                <ListItemSecondaryAction>
                  {!isOwner(participant.id._serialized) && (
                    <>
                      <IconButton
                        edge="end"
                        onClick={() =>
                          isAdmin(participant.id._serialized)
                            ? handleDemoteParticipant(participant.id._serialized)
                            : handlePromoteParticipant(participant.id._serialized)
                        }
                        disabled={loading}
                      >
                        {isAdmin(participant.id._serialized) ? (
                          <StarIcon color="primary" />
                        ) : (
                          <StarBorderIcon />
                        )}
                      </IconButton>
                      
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveParticipant(participant.id._serialized)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </StyledList>
        )}
      </StyledDialogContent>

      <StyledDialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Fechar
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default ManageParticipantsModal;
