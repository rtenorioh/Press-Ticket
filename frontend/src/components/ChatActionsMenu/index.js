import { useState, useEffect, useCallback } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Box
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { useTranslation } from "react-i18next";
import WhatsAppFeaturesService from "../../services/whatsappFeatures";
import toastError from "../../errors/toastError";
import toastSuccess from "../../errors/toastSuccess";
import ConfirmationModal from "../ConfirmationModal";

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ChatActionsMenu = ({ anchorEl, open, onClose, whatsappId, chatId, ticketId, parentChatState, onActionDone }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [chatState, setChatState] = useState(null);

  const fetchChatState = useCallback(async () => {
    if (parentChatState) {
      setChatState(parentChatState);
      return;
    }
    if (!whatsappId || !chatId) return;
    setLoadingState(true);
    try {
      const info = await WhatsAppFeaturesService.getChatInfo(whatsappId, chatId);
      setChatState(info);
    } catch (err) {
      setChatState(null);
    } finally {
      setLoadingState(false);
    }
  }, [whatsappId, chatId, parentChatState]);

  useEffect(() => {
    if (open) {
      fetchChatState();
    } else {
      setChatState(null);
    }
  }, [open, fetchChatState]);

  const executeAction = async (actionFn, successKey) => {
    setLoading(true);
    try {
      await actionFn();
      toastSuccess(t(successKey));
      if (onActionDone) onActionDone();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleToggleSeen = () => {
    if (chatState?.unreadCount > 0) {
      executeAction(
        () => WhatsAppFeaturesService.sendSeen(whatsappId, chatId),
        "chatActions.sendSeenSuccess"
      );
    } else {
      executeAction(
        () => WhatsAppFeaturesService.markUnread(whatsappId, chatId),
        "chatActions.markUnreadSuccess"
      );
    }
  };

  const handleToggleArchive = () => {
    if (chatState?.archived) {
      executeAction(
        () => WhatsAppFeaturesService.unarchiveChat(whatsappId, chatId),
        "chatActions.unarchiveSuccess"
      );
    } else {
      executeAction(
        () => WhatsAppFeaturesService.archiveChat(whatsappId, chatId),
        "chatActions.archiveSuccess"
      );
    }
  };

  const handleTogglePin = () => {
    if (chatState?.pinned) {
      executeAction(
        () => WhatsAppFeaturesService.unpinChat(whatsappId, chatId, ticketId),
        "chatActions.unpinSuccess"
      );
    } else {
      executeAction(
        () => WhatsAppFeaturesService.pinChat(whatsappId, chatId, ticketId),
        "chatActions.pinSuccess"
      );
    }
  };

  const handleToggleMute = () => {
    if (chatState?.isMuted) {
      executeAction(
        () => WhatsAppFeaturesService.unmuteChat(whatsappId, chatId, ticketId),
        "chatActions.unmuteSuccess"
      );
    } else {
      const unmuteDate = new Date();
      unmuteDate.setFullYear(unmuteDate.getFullYear() + 1);
      executeAction(
        () => WhatsAppFeaturesService.muteChat(whatsappId, chatId, unmuteDate.toISOString(), ticketId),
        "chatActions.muteSuccess"
      );
    }
  };

  const handleClearMessages = async () => {
    setClearConfirmOpen(false);
    await executeAction(
      () => WhatsAppFeaturesService.clearMessages(whatsappId, chatId),
      "chatActions.clearSuccess"
    );
  };

  const isDisabled = loading || loadingState;

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {loadingState ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2, px: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <StyledMenuItem onClick={handleToggleSeen} disabled={isDisabled}>
              <ListItemIcon>
                {chatState?.unreadCount > 0
                  ? <DoneAllIcon fontSize="small" />
                  : <MarkChatUnreadIcon fontSize="small" />
                }
              </ListItemIcon>
              <ListItemText
                primary={chatState?.unreadCount > 0
                  ? t("chatActions.sendSeen")
                  : t("chatActions.markUnread")
                }
              />
            </StyledMenuItem>

            <Divider />

            <StyledMenuItem onClick={handleToggleArchive} disabled={isDisabled}>
              <ListItemIcon>
                {chatState?.archived
                  ? <UnarchiveIcon fontSize="small" />
                  : <ArchiveIcon fontSize="small" />
                }
              </ListItemIcon>
              <ListItemText
                primary={chatState?.archived
                  ? t("chatActions.unarchive")
                  : t("chatActions.archive")
                }
              />
            </StyledMenuItem>

            <StyledMenuItem onClick={handleTogglePin} disabled={isDisabled}>
              <ListItemIcon>
                {chatState?.pinned
                  ? <PushPinIcon fontSize="small" />
                  : <PushPinOutlinedIcon fontSize="small" />
                }
              </ListItemIcon>
              <ListItemText
                primary={chatState?.pinned
                  ? t("chatActions.unpin")
                  : t("chatActions.pin")
                }
              />
            </StyledMenuItem>

            <StyledMenuItem onClick={handleToggleMute} disabled={isDisabled}>
              <ListItemIcon>
                {chatState?.isMuted
                  ? <VolumeUpIcon fontSize="small" />
                  : <VolumeOffIcon fontSize="small" />
                }
              </ListItemIcon>
              <ListItemText
                primary={chatState?.isMuted
                  ? t("chatActions.unmute")
                  : t("chatActions.mute")
                }
              />
            </StyledMenuItem>

            <Divider />

            <StyledMenuItem onClick={() => { onClose(); setClearConfirmOpen(true); }} disabled={isDisabled}>
              <ListItemIcon><CleaningServicesIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText primary={t("chatActions.clearMessages")} sx={{ color: "error.main" }} />
            </StyledMenuItem>
          </>
        )}
      </Menu>

      <ConfirmationModal
        title={t("chatActions.clearMessages")}
        open={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={handleClearMessages}
      >
        {t("chatActions.clearConfirm")}
      </ConfirmationModal>
    </>
  );
};

export default ChatActionsMenu;
