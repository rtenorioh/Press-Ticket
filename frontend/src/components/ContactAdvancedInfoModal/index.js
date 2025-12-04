import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Info as InfoIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const ContactAdvancedInfoModal = ({ open, onClose, contactId, whatsappId }) => {
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [aboutInfo, setAboutInfo] = useState(null);
  const [commonGroups, setCommonGroups] = useState([]);

  useEffect(() => {
    if (open && contactId) {
      loadContactInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contactId]);

  const loadContactInfo = async () => {
    setLoading(true);
    try {
      // Carregar informações do "sobre"
      const aboutResponse = await api.get(
        `/contacts/${contactId}/about`,
        { params: { whatsappId } }
      );
      setAboutInfo(aboutResponse.data);

      // Carregar grupos em comum
      const groupsResponse = await api.get(
        `/contacts/${contactId}/common-groups`,
        { params: { whatsappId } }
      );
      setCommonGroups(groupsResponse.data.commonGroups || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClose = () => {
    setTabValue(0);
    setAboutInfo(null);
    setCommonGroups([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Informações Avançadas do Contato
      </DialogTitle>
      <DialogContent dividers>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab icon={<InfoIcon />} label="Sobre" />
          <Tab icon={<GroupIcon />} label="Grupos em Comum" />
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Aba Sobre */}
            {tabValue === 0 && (
              <Box>
                {aboutInfo ? (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">
                      Nome
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {aboutInfo.contactName}
                    </Typography>

                    <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                      Número
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {aboutInfo.contactNumber}
                    </Typography>

                    <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                      Sobre / Status
                    </Typography>
                    <Typography 
                      variant="body1" 
                      gutterBottom
                      sx={{ 
                        fontStyle: aboutInfo.about ? 'normal' : 'italic',
                        color: aboutInfo.about ? 'text.primary' : 'text.secondary'
                      }}
                    >
                      {aboutInfo.about || "Este contato não configurou um status"}
                    </Typography>
                  </>
                ) : (
                  <Typography color="textSecondary">
                    Nenhuma informação disponível
                  </Typography>
                )}
              </Box>
            )}

            {/* Aba Grupos em Comum */}
            {tabValue === 1 && (
              <Box>
                {commonGroups.length > 0 ? (
                  <>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {commonGroups.length} grupo(s) em comum
                    </Typography>
                    <List>
                      {commonGroups.map((group, index) => (
                        <React.Fragment key={group.id}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar src={group.profilePicUrl}>
                                <GroupIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={group.name}
                              secondary={`${group.participantsCount} participantes`}
                            />
                          </ListItem>
                          {index < commonGroups.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  </>
                ) : (
                  <Typography color="textSecondary">
                    Nenhum grupo em comum
                  </Typography>
                )}
              </Box>
            )}

          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactAdvancedInfoModal;
