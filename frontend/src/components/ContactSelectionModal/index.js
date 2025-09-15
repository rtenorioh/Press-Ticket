import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search,
  Close,
  Person,
  Send,
  ContactPhone
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80vh',
  }
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 25,
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
    }
  }
}));

const ContactList = styled(List)(({ theme }) => ({
  maxHeight: 400,
  overflow: 'auto',
  '& .MuiListItem-root': {
    borderRadius: 8,
    marginBottom: 4,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    }
  }
}));

const SelectedContactsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  maxHeight: 100,
  overflow: 'auto',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  borderRadius: 8,
}));

const ContactSelectionModal = ({ open, onClose, onSendContacts }) => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchContacts();
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.number.includes(searchTerm)
      );
      setFilteredContacts(filtered);
    }
  }, [searchTerm, contacts]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/contacts');
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContactToggle = (contact) => {
    const isSelected = selectedContacts.find(c => c.id === contact.id);
    
    if (isSelected) {
      setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts(prev => [...prev, contact]);
    }
  };

  const handleRemoveSelected = (contactId) => {
    setSelectedContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const handleSend = () => {
    if (selectedContacts.length > 0) {
      onSendContacts(selectedContacts);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedContacts([]);
    setSearchTerm('');
    onClose();
  };

  const isContactSelected = (contactId) => {
    return selectedContacts.some(c => c.id === contactId);
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: (theme) => theme.palette.primary.main,
        color: (theme) => theme.palette.primary.contrastText,
        p: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ContactPhone />
          <Typography variant="h6">Enviar contatos</Typography>
        </Box>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={handleClose}
          aria-label="close"
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <SearchField
          fullWidth
          placeholder="Pesquisar nome ou número"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {selectedContacts.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
              Selecionados ({selectedContacts.length}):
            </Typography>
            <SelectedContactsContainer>
              {selectedContacts.map((contact) => (
                <Chip
                  key={contact.id}
                  label={contact.name}
                  onDelete={() => handleRemoveSelected(contact.id)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </SelectedContactsContainer>
          </Box>
        )}

        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
          Contatos
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ContactList>
            {filteredContacts.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography color="textSecondary">
                  {searchTerm ? 'Nenhum contato encontrado' : 'Nenhum contato disponível'}
                </Typography>
              </Box>
            ) : (
              filteredContacts.map((contact) => (
                <ListItem
                  key={contact.id}
                  button
                  onClick={() => handleContactToggle(contact)}
                  selected={isContactSelected(contact.id)}
                >
                  <ListItemAvatar>
                    <Avatar src={contact.profilePicUrl}>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={contact.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {contact.number}
                        </Typography>
                        {contact.isWhatsappValid && (
                          <Typography variant="caption" color="success.main">
                            Disponível
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Checkbox
                      edge="end"
                      checked={isContactSelected(contact.id)}
                      onChange={() => handleContactToggle(contact)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </ContactList>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        backgroundColor: (theme) => theme.palette.grey[50],
        justifyContent: 'space-between'
      }}>
        <Typography variant="body2" color="textSecondary">
          {selectedContacts.length > 0 && `${selectedContacts.length} contato(s) selecionado(s)`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            variant="contained"
            disabled={selectedContacts.length === 0}
            startIcon={<Send />}
          >
            Enviar
          </Button>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default ContactSelectionModal;
