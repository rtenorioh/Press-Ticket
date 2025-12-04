import React, { useState, useRef } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Description,
  PhotoCamera,
  Videocam,
  ContactPhone,
  AudioFile,
  Poll
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import CameraModal from '../CameraModal';
import ContactSelectionModal from '../ContactSelectionModal';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 12,
    minWidth: 200,
    boxShadow: theme.shadows[8],
    border: `1px solid ${theme.palette.divider}`,
    '& .MuiMenuItem-root': {
      padding: '12px 16px',
      margin: '4px 8px',
      borderRadius: 8,
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '& .MuiListItemIcon-root': {
        minWidth: 40,
        color: theme.palette.primary.main,
      },
      '& .MuiListItemText-primary': {
        fontWeight: 500,
        fontSize: '0.95rem',
      }
    }
  }
}));

const MenuItemStyled = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));

const AttachmentMenu = ({ 
  anchorEl, 
  open, 
  onClose, 
  onDocumentSelect, 
  onPhotoVideoSelect, 
  onCameraSelect, 
  onAudioSelect,
  onContactSelect,
  onPollClick,
  disabled = false 
}) => {
  const { t } = useTranslation();
  const documentInputRef = useRef(null);
  const photoVideoInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const handleDocumentClick = () => {
    onClose();
    if (documentInputRef.current) {
      documentInputRef.current.click();
    }
  };

  const handlePhotoVideoClick = () => {
    onClose();
    if (photoVideoInputRef.current) {
      photoVideoInputRef.current.click();
    }
  };

  const handleCameraClick = () => {
    onClose();
    setShowCameraModal(true);
  };

  const handleAudioClick = () => {
    onClose();
    if (audioInputRef.current) {
      audioInputRef.current.click();
    }
  };

  const handleContactClick = () => {
    onClose();
    setShowContactModal(true);
  };

  const handlePollClick = () => {
    onClose();
    if (onPollClick) {
      onPollClick();
    }
  };

  const handleDocumentChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onDocumentSelect(files);
    }
    e.target.value = '';
  };

  const handlePhotoVideoChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onPhotoVideoSelect(files);
    }
    e.target.value = '';
  };

  const handleCameraCapture = (files) => {
    setShowCameraModal(false);
    onCameraSelect(files);
  };

  const handleAudioChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onAudioSelect(files);
    }
    e.target.value = '';
  };

  const handleContactSelect = (contacts) => {
    setShowContactModal(false);
    onContactSelect(contacts);
  };

  return (
    <>
      <StyledMenu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: -1,
            ml: 1,
          }
        }}
      >
        <MenuItemStyled onClick={handleDocumentClick} disabled={disabled}>
          <ListItemIcon>
            <Description />
          </ListItemIcon>
          <ListItemText 
            primary={t('attachmentMenu.document')} 
            secondary={t('attachmentMenu.documentDesc')}
          />
        </MenuItemStyled>

        <MenuItemStyled onClick={handlePhotoVideoClick} disabled={disabled}>
          <ListItemIcon>
            <Videocam />
          </ListItemIcon>
          <ListItemText 
            primary={t('attachmentMenu.photoVideo')} 
            secondary={t('attachmentMenu.photoVideoDesc')}
          />
        </MenuItemStyled>

        <MenuItemStyled onClick={handleCameraClick} disabled={disabled}>
          <ListItemIcon>
            <PhotoCamera />
          </ListItemIcon>
          <ListItemText 
            primary={t('attachmentMenu.camera')} 
            secondary={t('attachmentMenu.cameraDesc')}
          />
        </MenuItemStyled>

        <MenuItemStyled onClick={handleAudioClick} disabled={disabled}>
          <ListItemIcon>
            <AudioFile />
          </ListItemIcon>
          <ListItemText 
            primary={t('attachmentMenu.audio')} 
            secondary={t('attachmentMenu.audioDesc')}
          />
        </MenuItemStyled>

        <MenuItemStyled onClick={handleContactClick} disabled={disabled}>
          <ListItemIcon>
            <ContactPhone />
          </ListItemIcon>
          <ListItemText 
            primary={t('attachmentMenu.contact')} 
            secondary={t('attachmentMenu.contactDesc')}
          />
        </MenuItemStyled>

        <MenuItemStyled onClick={handlePollClick} disabled={disabled}>
          <ListItemIcon>
            <Poll />
          </ListItemIcon>
          <ListItemText 
            primary="Enquete" 
            secondary="Criar enquete"
          />
        </MenuItemStyled>
      </StyledMenu>

      <input
        ref={documentInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z"
        style={{ display: 'none' }}
        onChange={handleDocumentChange}
      />

      <input
        ref={photoVideoInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        style={{ display: 'none' }}
        onChange={handlePhotoVideoChange}
      />

      <input
        ref={audioInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
        style={{ display: 'none' }}
        onChange={handleAudioChange}
      />

        <CameraModal
          open={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onCapture={handleCameraCapture}
        />

        <ContactSelectionModal
          open={showContactModal}
          onClose={() => setShowContactModal(false)}
          onSendContacts={handleContactSelect}
        />
    </>
  );
};

export default AttachmentMenu;
