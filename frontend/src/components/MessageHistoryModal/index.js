import { Table, TableBody, TableCell, TableContainer, TableRow, styled, Box, Divider, Stack } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { format, parseISO } from "date-fns";
import PropTypes from "prop-types";
import React from "react";
import { useTranslation } from "react-i18next";
import WhatsMarked from "react-whatsmarked";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogTitle-root': {
    backgroundColor: '#673ab7',
    color: '#fff',
    '& .MuiTypography-root': {
      fontWeight: 500,
    },
    padding: theme.spacing(2),
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
    backgroundColor: '#f5f5f5',
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
    backgroundColor: '#f5f5f5',
  },
}));

const TimestampCell = styled(TableCell)(({ theme }) => ({
  minWidth: 250,
  color: '#666',
  fontWeight: 500,
  [theme.breakpoints.down("sm")]: {
    minWidth: 150,
  },
}));

const MessageCell = styled(TableCell)(({ theme }) => ({
  fontSize: '0.95rem',
  padding: theme.spacing(2),
  borderBottom: '1px solid #e0e0e0',
}));

const MessageRow = styled(TableRow)(({ theme }) => ({
  '&:last-child td, &:last-child th': {
    borderBottom: 0,
  },
}));

const CloseButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(1, 3),
  backgroundColor: '#673ab7',
  color: '#fff',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  '&:hover': {
    backgroundColor: '#5e35b1',
  },
}));

const MessageHistoryModal = ({ open, onClose, oldMessages }) => {
  const { t } = useTranslation();

  React.useEffect(() => {
    if (open) {
      console.log('[MessageHistoryModal] Modal aberto com oldMessages:', {
        count: oldMessages?.length || 0,
        messages: oldMessages?.map(om => ({ id: om.id, body: om.body?.substring(0, 30), createdAt: om.createdAt }))
      });
    }
  }, [open, oldMessages]);

  return (
    <StyledDialog
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="dialog-title">
        <Stack direction="row" alignItems="center">
          <HistoryIcon fontSize="small" sx={{ mr: 1.5 }}/>
          {t("messageHistoryModal.title")}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <TableContainer sx={{ mt: 1 }}>
          <Table aria-label="message-history-table">
            <TableBody>
              {oldMessages?.map((oldMessage) => (
                <MessageRow key={oldMessage.id}>
                  <MessageCell component="th" scope="row">
                    <WhatsMarked>{oldMessage.body}</WhatsMarked>
                  </MessageCell>
                  <TimestampCell
                    align="right"
                    aria-describedby={`message-${oldMessage.id}`}
                  >
                    {format(parseISO(oldMessage.createdAt), "dd/MM HH:mm")}
                  </TimestampCell>
                </MessageRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <CloseButton
            onClick={() => onClose(false)}
            aria-label="Fechar histórico de mensagens"
          >
            {t("messageHistoryModal.close")}
          </CloseButton>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

MessageHistoryModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  oldMessages: PropTypes.array,
};

export default MessageHistoryModal;
