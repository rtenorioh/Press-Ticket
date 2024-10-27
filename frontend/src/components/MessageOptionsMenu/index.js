import React, { useContext, useState } from "react";

import MenuItem from "@material-ui/core/MenuItem";

import { Menu } from "@material-ui/core";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../ConfirmationModal";

const MessageOptionsMenu = ({ message, menuOpen, handleClose, anchorEl }) => {
  const { setReplyingMessage } = useContext(ReplyMessageContext);
  const { setEditingMessage } = useContext(EditMessageContext);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

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
      toastError(new Error(i18n.t("messageOptionsMenu.edit.error.timeExceeded")));
    }
    handleClose();
  };

  return (
    <>
      <ConfirmationModal
        title={i18n.t("messageOptionsMenu.confirmationModal.title")}
        open={confirmationOpen}
        onClose={setConfirmationOpen}
        onConfirm={handleDeleteMessage}
      >
        {i18n.t("messageOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>
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
            {i18n.t("messageOptionsMenu.delete")}
          </MenuItem>,
          canEditMessage() && (
            <MenuItem key="edit" onClick={handleEditMessage}>
              {i18n.t("messageOptionsMenu.edit")}
            </MenuItem>
          )
        ]}
        <MenuItem key="reply" onClick={hanldeReplyMessage}>
          {i18n.t("messageOptionsMenu.reply")}
        </MenuItem>
      </Menu>
    </>
  );
};

// MessageOptionsMenu.propTypes = {
//   message: PropTypes.object,
//   menuOpen: PropTypes.bool.isRequired,
//   handleClose: PropTypes.func.isRequired,
//   anchorEl: PropTypes.object
// }


export default MessageOptionsMenu;
