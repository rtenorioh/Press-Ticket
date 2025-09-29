import { Menu, MenuItem, ListItemIcon, ListItemText, Divider, Popper, Paper, Box, ClickAwayListener, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { useForwardingMessage } from "../../context/ForwardingMessage";
import toastError from "../../errors/toastError";
import toastSuccess from "../../errors/toastSuccess";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import MessageHistoryModal from "../MessageHistoryModal";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import ReplyIcon from "@mui/icons-material/Reply";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import HistoryIcon from "@mui/icons-material/History";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ForwardIcon from "@mui/icons-material/Forward";

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
  const { enterForwardingMode } = useForwardingMessage();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [messageHistoryOpen, setMessageHistoryOpen] = useState(false);
  const { t } = useTranslation();
  const [reacting, setReacting] = useState(false);
  const [reactionAnchorEl, setReactionAnchorEl] = useState(null);
  const [reactionVirtualAnchor, setReactionVirtualAnchor] = useState(null);
  const [reactionPopperOpen, setReactionPopperOpen] = useState(false);
  const [emojiPickerAnchorEl, setEmojiPickerAnchorEl] = useState(null);
  const [emojiPickerVirtualAnchor, setEmojiPickerVirtualAnchor] = useState(null);
  const emojiPickerOpen = Boolean(emojiPickerAnchorEl);
  const [recentReactions, setRecentReactions] = useState(() => {
    try {
      const saved = localStorage.getItem('recentReactions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ["👍", "❤️", "😂", "😮", "😢", "🙏"]; // defaults
  });

  const canEditMessage = () => {
    const timeDiff = new Date() - new Date(message.updatedAt);
    return timeDiff <= 15 * 60 * 1000; // 15 minutos en milisegundos
  };

  const openReactionMenu = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    try {
      const el = document.getElementById(message?.id);
      const rect = el?.getBoundingClientRect?.();
      if (rect) {
        const virtualTopRight = {
          getBoundingClientRect: () => ({
            width: 0,
            height: 0,
            top: rect.top,
            bottom: rect.top,
            left: rect.right,
            right: rect.right,
            x: rect.right,
            y: rect.top,
            toJSON: () => ({})
          })
        };
        setReactionVirtualAnchor(virtualTopRight);
      } else {
        const fallbackRect = anchorEl?.getBoundingClientRect ? anchorEl.getBoundingClientRect() : null;
        if (fallbackRect) {
          const virtual = { getBoundingClientRect: () => fallbackRect };
          setReactionVirtualAnchor(virtual);
        } else {
          setReactionVirtualAnchor(anchorEl || null);
        }
      }
    } catch (_) {
      setReactionVirtualAnchor(anchorEl || null);
    }
    setReactionAnchorEl(anchorEl);
    setReactionPopperOpen(true);
    handleClose();
  };

  const closeReactionMenu = () => {
    setReactionPopperOpen(false);
  };

  const openEmojiPicker = (e) => {
    try {
      const container = document.getElementById('messagesList');
      const rect = container?.getBoundingClientRect?.();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const VERTICAL_ADJUST = 125;
        const centerY = rect.top + rect.height / 2 + VERTICAL_ADJUST;
        const virtualCenter = {
          getBoundingClientRect: () => ({
            width: 0,
            height: 0,
            top: centerY,
            bottom: centerY,
            left: centerX,
            right: centerX,
            x: centerX,
            y: centerY,
            toJSON: () => ({})
          })
        };
        setEmojiPickerVirtualAnchor(virtualCenter);
        setEmojiPickerAnchorEl(virtualCenter);
      } else {
        setEmojiPickerVirtualAnchor(e.currentTarget || reactionAnchorEl);
        setEmojiPickerAnchorEl(e.currentTarget || reactionAnchorEl);
      }
    } catch (_) {
      setEmojiPickerVirtualAnchor(e.currentTarget || reactionAnchorEl);
      setEmojiPickerAnchorEl(e.currentTarget || reactionAnchorEl);
    }
  };

  const closeEmojiPicker = () => {
    setEmojiPickerAnchorEl(null);
  };

  const handleSendReaction = async (emoji) => {
    try {
      setReacting(true);
      await api.post(`/messages/${message.id}/reactions`, { emoji });
      setReacting(false);
      handleClose();
      try {
        setRecentReactions(prev => {
          const arr = [emoji, ...prev.filter(e => e !== emoji)].slice(0, 6);
          localStorage.setItem('recentReactions', JSON.stringify(arr));
          return arr;
        });
      } catch (_) {}
    } catch (err) {
      setReacting(false);
      toastError(err, t);
    }
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

  const handleForwardMessage = () => {
    enterForwardingMode();
    handleClose();
  }
  
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
        <MenuItem key="react-open" onClick={openReactionMenu} disabled={reacting}>
          <ListItemIcon>
            <SentimentSatisfiedAltIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("messageOptionsMenu.react") || "Reagir"} />
        </MenuItem>
        <Divider />
        <MenuItem key="reply" onClick={hanldeReplyMessage}>
          <ListItemIcon>
            <ReplyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("messageOptionsMenu.reply")} />
        </MenuItem>

        <MenuItem key="forward" onClick={handleForwardMessage}>
          <ListItemIcon>
            <ForwardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("messageOptionsMenu.forward")} />
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

      <Popper
        open={reactionPopperOpen}
        anchorEl={reactionVirtualAnchor || reactionAnchorEl}
        placement="top-end"
        modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
        style={{ zIndex: 1500 }}
      >
        <ClickAwayListener onClickAway={() => { closeReactionMenu(); closeEmojiPicker(); }}>
          <Paper elevation={4} sx={{ borderRadius: 999, px: 0.5, py: 0.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {recentReactions.slice(0,6).map((emoji) => (
                <IconButton
                  key={`react-mini-${emoji}`}
                  size="small"
                  onClick={() => { handleSendReaction(emoji); closeReactionMenu(); }}
                  disabled={reacting}
                  sx={{ width: 32, height: 32 }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{emoji}</span>
                </IconButton>
              ))}
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <IconButton
                size="small"
                onClick={(ev) => { closeReactionMenu(); openEmojiPicker(ev); }}
                disabled={reacting}
                sx={{ width: 30, height: 30 }}
              >
                <AddRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>

      <Popper
        open={emojiPickerOpen}
        anchorEl={emojiPickerVirtualAnchor || emojiPickerAnchorEl}
        placement="top"
        modifiers={[{ name: 'offset', options: { offset: [0, 12] } }]}
        style={{ zIndex: 1550 }}
      >
        <Paper elevation={4} sx={{ overflow: 'hidden', borderRadius: 2 }}>
          <EmojiPicker
            theme={EmojiTheme.AUTO}
            onEmojiClick={(e) => {
              const emoji = e?.emoji || e?.native || e;
              if (emoji) {
                handleSendReaction(emoji);
                try {
                  setRecentReactions(prev => {
                    const arr = [emoji, ...prev.filter(x => x !== emoji)].slice(0, 6);
                    localStorage.setItem('recentReactions', JSON.stringify(arr));
                    return arr;
                  });
                } catch (_) {}
              }
              closeEmojiPicker();
              closeReactionMenu();
            }}
            searchDisabled={false}
            previewConfig={{ showPreview: false }}
            lazyLoadEmojis={true}
          />
        </Paper>
      </Popper>
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
