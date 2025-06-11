import Box from '@mui/material/Box';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Modal from '@mui/material/Modal';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import Edit from '@mui/icons-material/Edit';
import React, { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import QueueModal from "../../components/QueueModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";

const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  overflowY: "auto",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  ...theme.scrollbarStyles,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  fontSize: '0.875rem',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  transition: 'background-color 0.2s ease',
}));

const ColorBox = styled(Box)(({ theme }) => ({
  width: 40,
  height: 20,
  borderRadius: 10,
  margin: '0 auto',
}));

const ActionButtons = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(1),
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_QUEUES") {
    const queues = action.payload;
    const newQueues = [];

    queues.forEach((queue) => {
      const queueIndex = state.findIndex((q) => q.id === queue.id);
      if (queueIndex !== -1) {
        state[queueIndex] = queue;
      } else {
        newQueues.push(queue);
      }
    });

    return [...state, ...newQueues];
  }

  if (action.type === "UPDATE_QUEUES") {
    const queue = action.payload;
    const queueIndex = state.findIndex((u) => u.id === queue.id);

    if (queueIndex !== -1) {
      state[queueIndex] = queue;
      return [...state];
    } else {
      return [queue, ...state];
    }
  }

  if (action.type === "DELETE_QUEUE") {
    const queueId = action.payload;
    const queueIndex = state.findIndex((q) => q.id === queueId);
    if (queueIndex !== -1) {
      state.splice(queueIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Queues = () => {
  const { t } = useTranslation();
  const [queues, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingQueue, setDeletingQueue] = useState(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedQueueMessages, setSelectedQueueMessages] = useState({ greetingMessage: '', absenceMessage: '', breakMessage: '' });
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [selectedQueueTimes, setSelectedQueueTimes] = useState({ startWork: '', endWork: '', startBreak: '', endBreak: '' });

  const handleOpenMessageModal = (queue) => {
    setSelectedQueueMessages({
      greetingMessage: queue.greetingMessage,
      absenceMessage: queue.absenceMessage,
      breakMessage: queue.breakMessage
    });
    setMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setMessageModalOpen(false);
    setSelectedQueueMessages({ greetingMessage: '', absenceMessage: '', breakMessage: '' });
  };
  
  const handleOpenTimeModal = (queue) => {
    setSelectedQueueTimes({
      startWork: queue.startWork,
      endWork: queue.endWork,
      startBreak: queue.startBreak,
      endBreak: queue.endBreak
    });
    setTimeModalOpen(true);
  };

  const handleCloseTimeModal = () => {
    setTimeModalOpen(false);
    setSelectedQueueTimes({ startWork: '', endWork: '', startBreak: '', endBreak: '' });
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/queue");
        dispatch({ type: "LOAD_QUEUES", payload: data });
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const socket = openSocket();

    socket.on("queue", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUEUES", payload: data.queue });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUEUE", payload: data.queueId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenQueueModal = () => {
    setQueueModalOpen(true);
    setSelectedQueue(null);
  };

  const handleCloseQueueModal = () => {
    setQueueModalOpen(false);
    setSelectedQueue(null);
  };

  const handleEditQueue = (queue) => {
    setSelectedQueue(queue);
    setQueueModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setDeletingQueue(null);
  };

  const handleDeleteQueue = async (queueId) => {
    try {
      await api.delete(`/queue/${queueId}`);
      toast.success(t("queues.notifications.queueDeleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingQueue(null);
    setConfirmModalOpen(false);
  };

  return (
    <MainContainer>
      <QueueModal
        open={queueModalOpen}
        onClose={handleCloseQueueModal}
        queueId={selectedQueue?.id}
      />
      <ConfirmationModal
        title={
          deletingQueue &&
          `${t("queues.confirmationModal.deleteTitle")} ${deletingQueue.name}?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteQueue(deletingQueue.id)}
      >
        {t("queues.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <MainHeader>
        <Title>{t("queues.title")} {queues.length > 0 ? `(${queues.length})` : ""}</Title>
        <MainHeaderButtonsWrapper>
          <Tooltip title={t("queues.buttons.add")}>
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenQueueModal}
                sx={{
                  borderRadius: 2,
                  px: { xs: 1, sm: 2 },
                }}
              >
                <AddCircleOutline />
              </Button>
            </div>
          </Tooltip>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <MainPaper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">{t("queues.table.id")}</StyledTableCell>
              <StyledTableCell align="center">{t("queues.table.name")}</StyledTableCell>
              <StyledTableCell align="center">{t("queues.table.color")}</StyledTableCell>
              <StyledTableCell align="center">{t("queues.table.greeting")}</StyledTableCell>
              <StyledTableCell align="center">{t("queues.table.workHours")}</StyledTableCell>
              <StyledTableCell align="center">{t("queues.table.actions")}</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRowSkeleton columns={7} />
            ) : (
              queues?.map((queue) => (
                <StyledTableRow key={queue.id}>
                  <StyledTableCell align="center">{queue.id}</StyledTableCell>
                  <StyledTableCell align="center">{queue.name}</StyledTableCell>
                  <StyledTableCell align="center">
                    <ColorBox sx={{ backgroundColor: queue.color }} />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Tooltip 
                      title={t("queues.messagesModal.title")} 
                      arrow 
                      placement="top"
                    >
                      <IconButton 
                        onClick={() => handleOpenMessageModal(queue)} 
                        size="small"
                        sx={{ color: 'primary.main' }}
                      >
                        <InfoOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Tooltip 
                      title={t("queues.timeModal.title")} 
                      arrow 
                      placement="top"
                    >
                      <IconButton 
                        onClick={() => handleOpenTimeModal(queue)} 
                        size="small"
                        sx={{ color: 'primary.main' }}
                      >
                        <AccessTimeIcon />
                      </IconButton>
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <ActionButtons>
                      <Tooltip title={t("queues.table.edit")} arrow placement="top">
                        <IconButton
                          size="small"
                          onClick={() => handleEditQueue(queue)}
                        >
                          <Edit color="info"/>
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={t("queues.table.delete")} arrow placement="top">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setConfirmModalOpen(true);
                            setDeletingQueue(queue);
                          }}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteOutline />
                        </IconButton>
                      </Tooltip>
                    </ActionButtons>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </MainPaper>
      <Modal
        open={messageModalOpen}
        onClose={handleCloseMessageModal}
        closeAfterTransition
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            maxWidth: '90%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 3,
            borderRadius: theme => theme.shape.borderRadius,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {t("queues.messagesModal.title")}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'primary.main', mb: 1 }}>
            {t("queues.messagesModal.greetingMessage")}:
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: 'background.default',
              borderRadius: theme => theme.shape.borderRadius,
            }}
          >
            <Typography variant="body2">
              {selectedQueueMessages.greetingMessage || (
                <Typography component="span" color="text.secondary" fontStyle="italic">
                  {t("queues.messagesModal.none")}
                </Typography>
              )}
            </Typography>
          </Paper>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'primary.main', mb: 1 }}>
            {t("queues.messagesModal.absenceMessage")}:
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: 'background.default',
              borderRadius: theme => theme.shape.borderRadius,
            }}
          >
            <Typography variant="body2">
              {selectedQueueMessages.absenceMessage || (
                <Typography component="span" color="text.secondary" fontStyle="italic">
                  {t("queues.messagesModal.none")}
                </Typography>
              )}
            </Typography>
          </Paper>

          <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'primary.main', mb: 1 }}>
            {t("queueModal.form.breakMessage")}:
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: 'background.default',
              borderRadius: theme => theme.shape.borderRadius,
            }}
          >
            <Typography variant="body2">
              {selectedQueueMessages.breakMessage || (
                <Typography component="span" color="text.secondary" fontStyle="italic">
                  {t("queues.messagesModal.none")}
                </Typography>
              )}
            </Typography>
          </Paper>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={handleCloseMessageModal}
              variant="contained"
              color="primary"
              sx={{ borderRadius: 20 }}
            >
              {t("queues.messagesModal.btnClose")}
            </Button>
          </Box>
        </Box>
      </Modal>
      
      <Modal
        open={timeModalOpen}
        onClose={handleCloseTimeModal}
        closeAfterTransition
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            maxWidth: '90%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 3,
            borderRadius: theme => theme.shape.borderRadius,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {t("queues.timeModal.title")}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                {t("queues.table.startWork")}:
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  width: '50%',
                  bgcolor: 'background.default',
                  borderRadius: theme => theme.shape.borderRadius,
                  textAlign: 'center'
                }}
              >
                <Typography variant="body1" fontWeight="500">
                  {selectedQueueTimes.startWork || (
                    <Typography component="span" color="text.secondary" fontStyle="italic">
                      {t("queues.timeModal.notSet")}
                    </Typography>
                  )}
                </Typography>
              </Paper>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                {t("queues.table.endWork")}:
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  width: '50%',
                  bgcolor: 'background.default',
                  borderRadius: theme => theme.shape.borderRadius,
                  textAlign: 'center'
                }}
              >
                <Typography variant="body1" fontWeight="500">
                  {selectedQueueTimes.endWork || (
                    <Typography component="span" color="text.secondary" fontStyle="italic">
                      {t("queues.timeModal.notSet")}
                    </Typography>
                  )}
                </Typography>
              </Paper>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'secondary.main', mt: 2, mb: 1 }}>
              {t("queueModal.form.breakTitle")}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                {t("queueModal.form.startBreak")}:
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  width: '50%',
                  bgcolor: 'background.default',
                  borderRadius: theme => theme.shape.borderRadius,
                  textAlign: 'center'
                }}
              >
                <Typography variant="body1" fontWeight="500">
                  {selectedQueueTimes.startBreak || (
                    <Typography component="span" color="text.secondary" fontStyle="italic">
                      {t("queues.timeModal.notSet")}
                    </Typography>
                  )}
                </Typography>
              </Paper>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                {t("queueModal.form.endBreak")}:
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  width: '50%',
                  bgcolor: 'background.default',
                  borderRadius: theme => theme.shape.borderRadius,
                  textAlign: 'center'
                }}
              >
                <Typography variant="body1" fontWeight="500">
                  {selectedQueueTimes.endBreak || (
                    <Typography component="span" color="text.secondary" fontStyle="italic">
                      {t("queues.timeModal.notSet")}
                    </Typography>
                  )}
                </Typography>
              </Paper>
            </Box>
          </Box>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={handleCloseTimeModal}
              variant="contained"
              color="primary"
              sx={{ borderRadius: 20 }}
            >
              {t("queues.timeModal.btnClose")}
            </Button>
          </Box>
        </Box>
      </Modal>
    </MainContainer>
  );
};

export default Queues;
