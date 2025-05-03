import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import toastSuccess from "../../errors/toastSuccess";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import MessageHistoryModal from "../MessageHistoryModal";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import ReplyIcon from "@mui/icons-material/Reply";
import HistoryIcon from "@mui/icons-material/History";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 8,
    boxShadow: theme.shadows[3],
    padding: theme.spacing(1, 0),
    backgroundColor: theme.palette.background.paper,
  },
  '& .MuiMenuItem-root': {
    padding: theme.spacing(1, 2),
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
      minWidth: 36,
    },
  },
  '& .delete-option': {
    '&:hover': {
      backgroundColor: 'rgba(211, 47, 47, 0.08)',
      '& .MuiListItemIcon-root': {
        color: theme.palette.error.main,
      },
      '& .MuiTypography-root': {
        color: theme.palette.error.main,
      }
    },
  },
  '& .MuiDivider-root': {
    margin: theme.spacing(1, 0),
  }
}));

const MessageOptionsMenu = ({ message, menuOpen, handleClose, anchorEl }) => {
  const { setReplyingMessage } = useContext(ReplyMessageContext);
  const { setEditingMessage } = useContext(EditMessageContext);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [messageHistoryOpen, setMessageHistoryOpen] = useState(false);
  const { t } = useTranslation();

  const canEditMessage = () => {
    const timeDiff = new Date() - new Date(message.updatedAt);
    return timeDiff <= 15 * 60 * 1000; // 15 minutos en milisegundos
  };

  const handleDeleteMessage = async () => {
    try {
      await api.delete(`/messages/${message.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const hanldeReplyMessage = () => {
    setReplyingMessage(message);
    handleClose();
  };

  const handleOpenConfirmationModal = (e) => {
    setConfirmationOpen(true);
    handleClose();
  };

  const handleEditMessage = () => {
    if (canEditMessage()) {
      setEditingMessage(message);
    } else {
      toastError(new Error(t("messageOptionsMenu.edit.error.timeExceeded")));
    }
    handleClose();
  };

  const handleOpenMessageHistoryModal = (e) => {
    setMessageHistoryOpen(true);
    handleClose();
  }
  
  const handleCopyMessage = () => {
    if (message.body) {
      navigator.clipboard.writeText(message.body)
        .then(() => {
          toastSuccess(t("messageOptionsMenu.copied"));
        })
        .catch((err) => {
          console.error("Erro ao copiar mensagem:", err);
          toastError(new Error(t("messageOptionsMenu.copyError")));
        });
      handleClose();
    }
  }
  
  // Verifica se a mensagem tem texto para copiar
  const hasTextToCopy = () => {
    return message.body && typeof message.body === 'string' && message.body.trim() !== '';
  };

  return (
    <>
      <ConfirmationModal
        title={t("messageOptionsMenu.confirmationModal.title")}
        open={confirmationOpen}
        onClose={setConfirmationOpen}
        onConfirm={handleDeleteMessage}
      >
        {t("messageOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>
      <MessageHistoryModal
        open={messageHistoryOpen}
        onClose={setMessageHistoryOpen}
        oldMessages={message.oldMessages}
      >
      </MessageHistoryModal>
      <StyledMenu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={menuOpen}
        onClose={handleClose}
        elevation={3}
        PaperProps={{
          sx: {
            minWidth: 180,
            overflow: 'visible',
          }
        }}
      >
        <MenuItem key="reply" onClick={hanldeReplyMessage}>
          <ListItemIcon>
            <ReplyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("messageOptionsMenu.reply")} />
        </MenuItem>
        
        {hasTextToCopy() && (
          <MenuItem key="copy" onClick={handleCopyMessage}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("messageOptionsMenu.copy")} />
          </MenuItem>
        )}
        
        {(message.fromMe || hasTextToCopy()) && <Divider />}
        
        {message.fromMe && canEditMessage() && (
          <MenuItem key="edit" onClick={handleEditMessage}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("messageOptionsMenu.edit")} />
          </MenuItem>
        )}
        
        {message.oldMessages?.length > 0 && (
          <MenuItem key="history" onClick={handleOpenMessageHistoryModal}>
            <ListItemIcon>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("messageOptionsMenu.history")} />
          </MenuItem>
        )}
        
        {message.fromMe && <Divider />}
        
        {message.fromMe && (
          <MenuItem key="delete" onClick={handleOpenConfirmationModal} className="delete-option">
            <ListItemIcon>
              <DeleteOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("messageOptionsMenu.delete")} />
          </MenuItem>
        )}
      </StyledMenu>
    </>
  );
};

MessageOptionsMenu.propTypes = {
  message: PropTypes.object,
  menuOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  anchorEl: PropTypes.object
}

export default MessageOptionsMenu;
