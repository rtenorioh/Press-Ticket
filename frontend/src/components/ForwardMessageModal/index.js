import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import toastSuccess from "../../errors/toastSuccess";

const ForwardMessageModal = ({ open, onClose, selectedMessages }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      fetchContacts();
    }
  }, [open]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/contacts", {
        params: { searchParam: "", pageNumber: 1 }
      });
      setContacts(data.contacts);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.number.includes(searchTerm)
  );

  const handleContactToggle = (contact) => {
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleForwardMessages = async () => {
    if (selectedContacts.length === 0) {
      return;
    }

    setSending(true);
    try {
      const promises = selectedContacts.map(async (contact) => {
        try {
          const ticketId = contact.ticketId || 0;
          
          return api.post(`/messages/${ticketId}/forward`, {
            contactId: contact.id,
            messages: selectedMessages.map(msg => ({
              id: msg.id,
              body: msg.body,
              mediaType: msg.mediaType,
              mediaUrl: msg.mediaUrl,
              quotedMsg: msg.quotedMsg,
            }))
          });
        } catch (contactError) {
          console.error(`Erro ao processar contato ${contact.name}:`, contactError);
          throw contactError;
        }
      });

      await Promise.all(promises);
      toastSuccess(t("forwardMessages.forwardedSuccess"));
      onClose();
      setSelectedContacts([]);
    } catch (err) {
      console.error("Erro ao encaminhar mensagens:", err);
      toastError(err, t);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setSelectedContacts([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh",
          maxHeight: "600px",
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {t("forwardMessages.title")}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t("forwardMessages.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: "300px", overflow: "auto" }}>
            {filteredContacts.map((contact) => (
              <ListItem
                key={contact.id}
                button
                onClick={() => handleContactToggle(contact)}
                dense
              >
                <Checkbox
                  checked={selectedContacts.some(c => c.id === contact.id)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemAvatar>
                  <Avatar src={contact.profilePicUrl}>
                    {contact.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={contact.name}
                  secondary={contact.number}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
          <Typography variant="body2" color="textSecondary">
            {selectedMessages.length} {selectedMessages.length === 1 
              ? t("forwardMessages.selectedCount") 
              : t("forwardMessages.selectedCountPlural")
            }
          </Typography>
          
          <Box>
            <Button onClick={handleClose} sx={{ mr: 1 }}>
              {t("forwardMessages.cancel")}
            </Button>
            <Button
              variant="contained"
              onClick={handleForwardMessages}
              disabled={selectedContacts.length === 0 || sending}
              startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {t("forwardMessages.forwardButton")}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ForwardMessageModal;
