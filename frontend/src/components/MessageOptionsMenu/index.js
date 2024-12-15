import { Menu } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import MessageHistoryModal from "../MessageHistoryModal";

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
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
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
      >
        {message.fromMe && [
          <MenuItem key="delete" onClick={handleOpenConfirmationModal}>
            {t("messageOptionsMenu.delete")}
          </MenuItem>,
          canEditMessage() && (
            <MenuItem key="edit" onClick={handleEditMessage}>
              {t("messageOptionsMenu.edit")}
            </MenuItem>
          )
        ]}
        {message.oldMessages?.length > 0 && (
          <MenuItem key="history" onClick={handleOpenMessageHistoryModal}>
            {t("messageOptionsMenu.history")}
          </MenuItem>
        )}
        <MenuItem key="reply" onClick={hanldeReplyMessage}>
          {t("messageOptionsMenu.reply")}
        </MenuItem>
      </Menu>
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
