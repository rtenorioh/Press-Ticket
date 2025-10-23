import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  CircularProgress,
  Divider
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

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(2.5, 0),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const GroupSettingsModal = ({ open, onClose, whatsappId, group, onSuccess }) => {
  
  const [loading, setLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [messagesAdminsOnly, setMessagesAdminsOnly] = useState(false);
  const [editGroupInfoAdminsOnly, setEditGroupInfoAdminsOnly] = useState(false);

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
      setGroupName(data.name);
      setGroupDescription(data.description);
    } catch (err) {
      toast.error("Erro ao carregar informações do grupo");
    }
    setLoading(false);
  };

  const handleUpdateName = async () => {
    if (!groupName.trim()) {
      toast.error("Digite o nome do grupo");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/whatsapp/${whatsappId}/groups/${group.id}/name`, {
        name: groupName,
      });

      toast.success("Nome atualizado!");
      loadGroupInfo();
      onSuccess();
    } catch (err) {
      toast.error("Erro ao atualizar nome");
    }
    setLoading(false);
  };

  const handleUpdateDescription = async () => {
    setLoading(true);
    try {
      await api.put(`/whatsapp/${whatsappId}/groups/${group.id}/description`, {
        description: groupDescription,
      });

      toast.success("Descrição atualizada!");
      loadGroupInfo();
      onSuccess();
    } catch (err) {
      toast.error("Erro ao atualizar descrição");
    }
    setLoading(false);
  };

  const handleUpdateSettings = async () => {
    setLoading(true);
    try {
      await api.put(`/whatsapp/${whatsappId}/groups/${group.id}/settings`, {
        messagesAdminsOnly,
        editGroupInfoAdminsOnly,
      });

      toast.success("Configurações atualizadas!");
      loadGroupInfo();
      onSuccess();
    } catch (err) {
      toast.error("Erro ao atualizar configurações");
    }
    setLoading(false);
  };

  const handleRevokeInviteLink = async () => {
    if (!window.confirm("Deseja revogar o link de convite atual e gerar um novo?")) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(
        `/whatsapp/${whatsappId}/groups/${group.id}/invite-link/revoke`
      );

      navigator.clipboard.writeText(data.inviteLink);
      toast.success("Novo link gerado e copiado!");
    } catch (err) {
      toast.error("Erro ao revogar link");
    }
    setLoading(false);
  };

  const handleClose = () => {
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
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>
        <Typography variant="h6" component="div">
          Configurações do Grupo
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
          {group?.name}
        </Typography>
      </StyledDialogTitle>
      
      <StyledDialogContent>
        <Section>
          <Typography variant="subtitle2" gutterBottom>
            Nome do Grupo
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              disabled={loading}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateName}
              disabled={loading}
            >
              Salvar
            </Button>
          </Box>
        </Section>

        <StyledDivider />

        <Section>
          <Typography variant="subtitle2" gutterBottom>
            Descrição do Grupo
          </Typography>
          <TextField
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
            multiline
            rows={3}
            disabled={loading}
          />
          <Box mt={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateDescription}
              disabled={loading}
              fullWidth
            >
              Atualizar Descrição
            </Button>
          </Box>
        </Section>

        <StyledDivider />

        <Section>
          <Typography variant="subtitle2" gutterBottom>
            Permissões
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={messagesAdminsOnly}
                onChange={(e) => setMessagesAdminsOnly(e.target.checked)}
                disabled={loading}
              />
            }
            label="Apenas admins podem enviar mensagens"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={editGroupInfoAdminsOnly}
                onChange={(e) => setEditGroupInfoAdminsOnly(e.target.checked)}
                disabled={loading}
              />
            }
            label="Apenas admins podem editar informações do grupo"
          />
          
          <Box mt={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateSettings}
              disabled={loading}
              fullWidth
            >
              Salvar Permissões
            </Button>
          </Box>
        </Section>

        <StyledDivider />

        <Section>
          <Typography variant="subtitle2" gutterBottom>
            Link de Convite
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleRevokeInviteLink}
            disabled={loading}
            fullWidth
          >
            Revogar Link Atual e Gerar Novo
          </Button>
          <Typography variant="caption" color="textSecondary" style={{ marginTop: 8 }}>
            O link atual será invalidado e um novo será gerado
          </Typography>
        </Section>
      </StyledDialogContent>

      <StyledDialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Fechar
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default GroupSettingsModal;
