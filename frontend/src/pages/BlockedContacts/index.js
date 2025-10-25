import React, { useState, useEffect, useContext } from "react";
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Block as BlockIcon,
  LockOpen as UnblockIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { useTranslation } from "react-i18next";

const BlockedContacts = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [blockedContacts, setBlockedContacts] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);
  const [selectedWhatsappId, setSelectedWhatsappId] = useState("");

  useEffect(() => {
    loadWhatsapps();
  }, []);

  useEffect(() => {
    if (selectedWhatsappId) {
      loadBlockedContacts();
    }
  }, [selectedWhatsappId]);

  const loadWhatsapps = async () => {
    try {
      const { data } = await api.get("/whatsapp");
      const wwebjs = data.filter(w => w.type === "wwebjs" && w.status === "CONNECTED");
      setWhatsapps(wwebjs);
      if (wwebjs.length > 0) {
        setSelectedWhatsappId(wwebjs[0].id);
      }
    } catch (err) {
      toastError(err, t);
    }
  };

  const loadBlockedContacts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/contacts/blocked", {
        params: { whatsappId: selectedWhatsappId }
      });
      setBlockedContacts(data.blockedContacts || []);
    } catch (err) {
      toastError(err, t);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (contact) => {
    try {
      let contactId = contact.systemContactId;
      
      // Se o contato não está cadastrado no sistema, criar primeiro
      if (!contactId) {
        const { data: newContact } = await api.post("/contacts", {
          name: contact.name || contact.number,
          number: contact.number,
          email: ""
        });
        contactId = newContact.id;
      }

      // Desbloquear usando o ID do contato
      await api.post(`/contacts/${contactId}/unblock`, {
        whatsappId: selectedWhatsappId
      });
      
      toast.success(t("contacts.toasts.unblocked") || "Contato desbloqueado com sucesso!");
      loadBlockedContacts();
    } catch (err) {
      toastError(err, t);
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Contatos Bloqueados</Title>
        <MainHeaderButtonsWrapper>
          <FormControl variant="outlined" sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Canal WhatsApp</InputLabel>
            <Select
              value={selectedWhatsappId}
              onChange={(e) => setSelectedWhatsappId(e.target.value)}
              label="Canal WhatsApp"
              size="small"
            >
              {whatsapps.map((whatsapp) => (
                <MenuItem key={whatsapp.id} value={whatsapp.id}>
                  {whatsapp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Atualizar">
            <IconButton onClick={loadBlockedContacts} disabled={!selectedWhatsappId}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : blockedContacts.length > 0 ? (
          <>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {blockedContacts.length} contato(s) bloqueado(s)
            </Typography>
            <List>
              {blockedContacts.map((contact, index) => (
                <React.Fragment key={contact.id}>
                  <ListItem
                    secondaryAction={
                      <Tooltip title={t("contacts.buttons.unblock") || "Desbloquear"}>
                        <IconButton
                          edge="end"
                          onClick={() => handleUnblock(contact)}
                          color="primary"
                        >
                          <UnblockIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={contact.profilePicUrl}>
                        {contact.name?.charAt(0).toUpperCase() || "?"}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          {contact.name || contact.number}
                          {contact.isRegisteredInSystem && (
                            <Chip
                              label="Cadastrado"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={contact.number}
                    />
                  </ListItem>
                  {index < blockedContacts.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" p={4}>
            <BlockIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
            <Typography color="textSecondary" variant="h6">
              {selectedWhatsappId
                ? "Nenhum contato bloqueado"
                : "Selecione um canal WhatsApp"}
            </Typography>
          </Box>
        )}
      </Paper>
    </MainContainer>
  );
};

export default BlockedContacts;
