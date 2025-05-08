import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Divider,
  Stack,
  Typography
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogTitle-root': {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    '& .MuiTypography-root': {
      fontWeight: 500,
    },
    padding: theme.spacing(2),
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
    backgroundColor: '#f5f5f5',
  },
}));

const NewTicketModalPageContact = ({ modalOpen, onClose, initialContact }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState(initialContact || null);

  useEffect(() => {
    setContact(initialContact || null);
  }, [initialContact]);

  const handleClose = useCallback(() => {
    onClose();
    setSelectedQueue("");
  }, [onClose]);

  const handleCreateTicket = useCallback(async () => {
    if (!contact?.id) {
      toastError({ message: "Contato sem ID! Não é possível criar o ticket." });
      return;
    }
    if (selectedQueue === "" && user?.profile !== 'admin') {
      toastError({ message: t("newTicketModalContactPage.queue") });
      return;
    }
    setLoading(true);
    try {
      const queueId = selectedQueue !== "" ? selectedQueue : null;
      const { data: ticket } = await api.post("/tickets", {
        contactId: contact.id,
        queueId,
        userId: user?.id,
        status: "open",
      });
      setLoading(false);
      onClose(ticket);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  }, [contact, selectedQueue, user, t, onClose]);

  return (
    <StyledDialog
      open={modalOpen}
      onClose={handleClose}
      aria-labelledby="create-ticket-dialog-title"
      aria-describedby="create-ticket-dialog-description"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }
      }}
    >
      <DialogTitle id="create-ticket-dialog-title">
        <Stack direction="row" alignItems="center">
          {t("newTicketModal.title")}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <FormControl variant="outlined" sx={{ width: "100%", mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            {t("ticketsList.acceptModal.queue")}
          </Typography>
          <Select
            value={selectedQueue}
            sx={{ width: "100%" }}
            onChange={(e) => setSelectedQueue(e.target.value)}
            variant="outlined"
            displayEmpty
          >
            <MenuItem value={''}>
              <em>{t("ticketsList.acceptModal.selectQueue")}</em>
            </MenuItem>
            {user?.queues?.map((queue) => (
              <MenuItem key={queue.id} value={queue.id}>{queue.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {contact && (
          <Typography variant="body2" sx={{ mt: 3 }}>
            <strong>{t("contacts.name")}:</strong> {contact.name}<br />
            <strong>{t("contacts.number")}:</strong> {contact.number}
          </Typography>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ padding: 2, gap: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="contained"
          size="large"
          sx={{
            borderRadius: 20,
            backgroundColor: '#e0e0e0',
            color: '#757575',
            minWidth: '120px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#d5d5d5',
            }
          }}
        >
          {t("newTicketModal.buttons.cancel")}
        </Button>
        <Button
          variant="contained"
          type="button"
          disabled={selectedQueue === "" || !contact}
          onClick={handleCreateTicket}
          size="large"
          sx={{
            position: "relative",
            borderRadius: 20,
            minWidth: '120px',
            backgroundColor: theme.palette.primary.main,
            textTransform: 'uppercase',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark
            }
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" sx={{ position: 'absolute' }} />
          ) : t("newTicketModal.buttons.ok")}
        </Button>
      </DialogActions>
    </StyledDialog>
  );

};

export default NewTicketModalPageContact;
