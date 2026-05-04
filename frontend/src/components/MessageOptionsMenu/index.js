import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import ForwardIcon from "@mui/icons-material/Forward";
import HistoryIcon from "@mui/icons-material/History";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import ReplyIcon from "@mui/icons-material/Reply";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import {
  Box,
  ClickAwayListener,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper
} from "@mui/material";
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";
import { useForwardingMessage } from "../../context/ForwardingMessage";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import toastSuccess from "../../errors/toastSuccess";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import WhatsAppFeaturesService from "../../services/whatsappFeatures";
import ConfirmationModal from "../ConfirmationModal";
import MessageHistoryModal from "../MessageHistoryModal";
import MessageInfoModal from "../MessageInfoModal";

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
  const [messageInfoOpen, setMessageInfoOpen] = useState(false);
  const [pinning, setPinning] = useState(false);
  const [starring, setStarring] = useState(false);
  const [emojiPickerVirtualAnchor, setEmojiPickerVirtualAnchor] = useState(null);
  const emojiPickerOpen = Boolean(emojiPickerAnchorEl);
  const [recentReactions, setRecentReactions] = useState(() => {
    try {
      const saved = localStorage.getItem('recentReactions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ["👍", "❤️", "😂", "😮", "😢", "🙏"]; 
  });
  const [currentMessage, setCurrentMessage] = useState(message);
  
  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
    }
  }, [message]);
  
  useEffect(() => {
    if (!message?.id) return;
    
    const socket = openSocket();
    
    const handleAppMessage = (data) => {
      if (data.action === "update" && data.message?.id === message.id) {
        setCurrentMessage(data.message);
      }
    };
    
    socket.on("appMessage", handleAppMessage);
    
    return () => {
      socket.off("appMessage", handleAppMessage);
    };
  }, [message?.id]);

  const canEditMessage = () => {
    const timeDiff = new Date() - new Date(message.updatedAt);
    return timeDiff <= 15 * 60 * 1000; 
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

  const dispatchMessageState = (messageId, updates) => {
    window.dispatchEvent(
      new CustomEvent("messageStateUpdate", { detail: { messageId, ...updates } })
    );
  };

  const handlePinMessage = async () => {
    try {
      setPinning(true);
      await WhatsAppFeaturesService.pinMessage(message.id, 604800);
      setCurrentMessage(prev => ({ ...prev, isPinned: true }));
      dispatchMessageState(message.id, { isPinned: true });
      toastSuccess(t("messageOptionsMenu.pinSuccess"));
    } catch (err) {
      toastError(err, t);
    } finally {
      setPinning(false);
      handleClose();
    }
  };

  const handleUnpinMessage = async () => {
    try {
      setPinning(true);
      await WhatsAppFeaturesService.unpinMessage(message.id);
      setCurrentMessage(prev => ({ ...prev, isPinned: false }));
      dispatchMessageState(message.id, { isPinned: false });
      toastSuccess(t("messageOptionsMenu.unpinSuccess"));
    } catch (err) {
      toastError(err, t);
    } finally {
      setPinning(false);
      handleClose();
    }
  };

  const handleStarMessage = async () => {
    try {
      setStarring(true);
      await WhatsAppFeaturesService.starMessage(message.id);
      setCurrentMessage(prev => ({ ...prev, isStarred: true }));
      dispatchMessageState(message.id, { isStarred: true });
      toastSuccess(t("messageOptionsMenu.starSuccess"));
    } catch (err) {
      toastError(err, t);
    } finally {
      setStarring(false);
      handleClose();
    }
  };

  const handleUnstarMessage = async () => {
    try {
      setStarring(true);
      await WhatsAppFeaturesService.unstarMessage(message.id);
      setCurrentMessage(prev => ({ ...prev, isStarred: false }));
      dispatchMessageState(message.id, { isStarred: false });
      toastSuccess(t("messageOptionsMenu.unstarSuccess"));
    } catch (err) {
      toastError(err, t);
    } finally {
      setStarring(false);
      handleClose();
    }
  };

  const handleOpenMessageInfo = () => {
    setMessageInfoOpen(true);
    handleClose();
  };
  
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
        oldMessages={currentMessage?.oldMessages || []}
      >
      </MessageHistoryModal>
      <MessageInfoModal
        open={messageInfoOpen}
        onClose={() => setMessageInfoOpen(false)}
        messageId={message?.id}
      />
      <Popper
        open={menuOpen}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 4],
            },
          },
        ]}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            elevation={3}
            sx={{
              minWidth: 180,
              borderRadius: 2,
              overflow: 'visible',
            }}
          >
            <MenuList>
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
              
              {currentMessage?.oldMessages?.length > 0 && (
                <MenuItem key="history" onClick={handleOpenMessageHistoryModal}>
                  <ListItemIcon>
                    <HistoryIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("messageOptionsMenu.history")} />
                </MenuItem>
              )}
              
              {message.fromMe && <Divider />}
              
              {!currentMessage?.isPinned ? (
                <MenuItem key="pin" onClick={handlePinMessage} disabled={pinning}>
                  <ListItemIcon>
                    <PushPinOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("messageOptionsMenu.pin")} />
                </MenuItem>
              ) : (
                <MenuItem key="unpin" onClick={handleUnpinMessage} disabled={pinning}>
                  <ListItemIcon>
                    <PushPinIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("messageOptionsMenu.unpin")} />
                </MenuItem>
              )}

              {!currentMessage?.isStarred ? (
                <MenuItem key="star" onClick={handleStarMessage} disabled={starring}>
                  <ListItemIcon>
                    <StarBorderIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("messageOptionsMenu.star")} />
                </MenuItem>
              ) : (
                <MenuItem key="unstar" onClick={handleUnstarMessage} disabled={starring}>
                  <ListItemIcon>
                    <StarIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("messageOptionsMenu.unstar")} />
                </MenuItem>
              )}

              {message.fromMe && (
                <MenuItem key="info" onClick={handleOpenMessageInfo}>
                  <ListItemIcon>
                    <InfoOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("messageOptionsMenu.info")} />
                </MenuItem>
              )}

              {message.fromMe && <Divider />}

              {message.fromMe && (
                <MenuItem 
                  key="delete" 
                  onClick={handleOpenConfirmationModal}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.08)',
                      '& .MuiListItemIcon-root': {
                        color: 'error.main',
                      },
                      '& .MuiTypography-root': {
                        color: 'error.main',
                      }
                    },
                  }}
                >
                  <ListItemIcon>
                    <DeleteOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("messageOptionsMenu.delete")} />
                </MenuItem>
              )}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>

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

export default MessageOptionsMenu;
