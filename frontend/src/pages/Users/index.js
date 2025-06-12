import {
  Box,
  Button,
  Divider,
  Fade,
  IconButton,
  InputAdornment,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Edit from "@mui/icons-material/Edit";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import Search from "@mui/icons-material/Search";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HighlightOff from "@mui/icons-material/HighlightOff";
import React, { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import UserModal from "../../components/UserModal";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";

const reducer = (state, action) => {
  if (action.type === "LOAD_USERS") {
    const users = action.payload;
    const newUsers = [];

    users.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "UPDATE_USER_STATUS") {
    const { userId, online } = action.payload;
    const userIndex = state.findIndex((u) => u.id === userId);

    if (userIndex !== -1) {
      state[userIndex] = { ...state[userIndex], online };
      return [...state];
    }
    return state;
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === parseInt(userId));
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  overflowY: "auto",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  ...theme.scrollbarStyles,
}));

const ModalPaper = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[24],
  width: "400px",
  maxWidth: "90%",
  maxHeight: "80%",
  overflowY: "auto",
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

const ActionButtons = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(0.5),
}));

const ColorIndicator = styled('div')(({ theme }) => ({
  flex: "none",
  width: "8px",
  height: "100%",
  position: "absolute",
  top: "0%",
  left: "0%",
  borderTopLeftRadius: theme.shape.borderRadius,
  borderBottomLeftRadius: theme.shape.borderRadius,
}));

const IdContainer = styled('div')({
  paddingLeft: "20px",
});

const SearchContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: '60%',
  },
}));

const Users = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [users, dispatch] = useReducer(reducer, []);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showOnlyActive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedUserSchedule, setSelectedUserSchedule] = useState(null);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam, showOnlyActive]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { searchParam, pageNumber, showOnlyActive },
          });
          dispatch({ type: "LOAD_USERS", payload: data.users });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, showOnlyActive]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("user", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_USERS", payload: data.user });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_USER", payload: +data.userId });
      }
    });

    socket.on("userSessionUpdate", (data) => {
      dispatch({ type: "UPDATE_USER_STATUS", payload: data });
    });

    socket.on("userSessionExpired", (data) => {
      if (data.userId === user?.id) {
        localStorage.removeItem("token");
        toast.error(data.message || "Sua sessão foi encerrada.");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate, user]);

  const handleOpenUserModal = () => {
    setSelectedUsers([]);
    setUserModalOpen(true);
  };

  const handleCloseUserModal = (userData) => {
    setSelectedUsers([]);
    setUserModalOpen(false);
    
    if (userData) {
      dispatch({ type: "UPDATE_USERS", payload: userData });
    }
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditUser = (userId) => {
    setSelectedUsers([userId]);
    setUserModalOpen(true);
  };

  const handleDeleteUser = async (user) => {
    try {
      await api.delete(`/users/${user.id}`);
      toast.success(t("users.toasts.deleted"));
      dispatch({ type: "DELETE_USER", payload: user.id });
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
    setConfirmModalOpen(false);
  };

  const handleToggleActive = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { active: !user.active });
      dispatch({ type: "UPDATE_USERS", payload: { ...user, active: !user.active } });
      toast.success(t("users.toasts.updated"));
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleOpenModal = (content, title) => {
    setModalContent(content);
    setModalTitle(title);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalContent([]);
    setModalOpen(false);
  };

  const handleOpenScheduleModal = (user) => {
    setSelectedUserSchedule(user);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setSelectedUserSchedule(null);
    setScheduleModalOpen(false);
  };

  return (
    <MainContainer>
      <Modal
        open={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
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
            {t("users.schedule.title")}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                {t("users.schedule.opening")}:
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
                  {selectedUserSchedule?.startWork || (
                    <Typography component="span" color="text.secondary" fontStyle="italic">
                      00:00
                    </Typography>
                  )}
                </Typography>
              </Paper>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                {t("users.schedule.closing")}:
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
                  {selectedUserSchedule?.endWork || (
                    <Typography component="span" color="text.secondary" fontStyle="italic">
                      23:59
                    </Typography>
                  )}
                </Typography>
              </Paper>
            </Box>
          </Box>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={handleCloseScheduleModal}
              variant="contained"
              color="primary"
              sx={{ borderRadius: 20 }}
            >
              {t("users.buttons.close")}
            </Button>
          </Box>
        </Box>
      </Modal>
      
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.4)"
            }
          }
        }}
      >
        <Fade in={modalOpen}>
          <ModalPaper>
            <h2>{modalTitle}</h2>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("users.modalTable.id")}</TableCell>
                  <TableCell>{t("users.modalTable.name")}</TableCell>
                  {modalTitle === t("users.modalTitle.channel") && (
                    <TableCell>{t("users.modalTable.type")}</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {modalContent.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ padding: 0, width: "5px", position: "relative" }}>
                      <ColorIndicator sx={{ backgroundColor: item.color }}></ColorIndicator>
                      <IdContainer>{item.id}</IdContainer>
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    {modalTitle === t("users.modalTitle.channel") && (
                      <TableCell>{item.type === null ? "wwebjs" : item.type}</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ModalPaper>
        </Fade>
      </Modal>
      <ConfirmationModal
        title={
          deletingUser &&
          `${t("users.confirmationModal.deleteTitle")} ${deletingUser.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteUser(deletingUser)}
      >
        {t("users.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <UserModal
        open={userModalOpen}
        onClose={handleCloseUserModal}
        aria-labelledby="form-dialog-title"
        userId={selectedUsers.length === 1 ? selectedUsers[0] : null}
      />
      <MainHeader>
        <Title>{t("users.title")} {users.length > 0 ? `(${users.length})` : ""}</Title>
        <MainHeaderButtonsWrapper sx={{ display: 'flex', alignItems: 'center' }}>
          <SearchContainer sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              placeholder={t("users.searchPlaceholder")}
              type="search"
              value={searchParam}
              onChange={handleSearch}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="secondary" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  height: '40px'
                },
                my: 0,
                py: 0
              }}
            />
          </SearchContainer>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={t("users.buttons.add")}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenUserModal}
                sx={{
                  borderRadius: 2,
                  px: { xs: 1, sm: 2 },
                  height: '40px',
                  minWidth: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.25rem'
                  }
                }}
              >
                <AddCircleOutline />
              </Button>
            </Tooltip>
          </Box>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <MainPaper variant="outlined" onScroll={handleScroll}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">
                {t("users.table.id")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("users.table.name")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("users.table.status")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("users.table.email")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("users.table.profile")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("users.table.whatsapp")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("users.table.queue")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("users.table.schedule")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("users.table.actions")}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRowSkeleton columns={10} />
            ) : (
              <>
                {users.map((user) => (
                  <StyledTableRow key={user.id}>
                    <StyledTableCell align="center">{user.id}</StyledTableCell>
                    <StyledTableCell align="center">{user.name}</StyledTableCell>
                    <StyledTableCell align="center">
                      <Tooltip title={user.online ? t("users.status.online") : t("users.status.offline")} arrow placement="top">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          {user.online ? (
                            <TaskAltIcon sx={{ color: "green" }} />
                          ) : (
                            <HighlightOff sx={{ color: "red" }} />
                          )}
                        </Box>
                      </Tooltip>
                    </StyledTableCell>
                    <StyledTableCell align="center">{user.email}</StyledTableCell>
                    <StyledTableCell align="center">{user.profile}</StyledTableCell>
                    <StyledTableCell align="center">
                      <Tooltip title={t("users.table.viewChannels")} arrow placement="top">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenModal(user.whatsapps, t("users.modalTitle.channel"))}
                          sx={{ color: 'primary.main' }}
                        >
                          <InfoOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Tooltip title={t("users.table.viewQueues")} arrow placement="top">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenModal(user.queues, t("users.modalTitle.queue"))}
                          sx={{ color: 'primary.main' }}
                        >
                          <InfoOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Tooltip title={t("users.table.viewSchedule")} arrow placement="top">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenScheduleModal(user)}
                          sx={{ color: 'primary.main' }}
                        >
                          <AccessTimeIcon />
                        </IconButton>
                      </Tooltip>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <ActionButtons>
                        <Tooltip title={user.active ? t("users.actions.deactivate") : t("users.actions.activate")} arrow placement="top">
                          <IconButton
                            size="small"
                            onClick={() => handleToggleActive(user)}
                            sx={{ color: user.active ? 'success.main' : 'error.main' }}
                          >
                            {user.active ? <TaskAltIcon /> : <CancelOutlined />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("users.actions.edit")} arrow placement="top">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user.id)}
                          >
                            <Edit color="info"/>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("users.actions.delete")} arrow placement="top">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setConfirmModalOpen(true);
                              setDeletingUser(user);
                            }}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteOutline />
                          </IconButton>
                        </Tooltip>
                      </ActionButtons>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </MainPaper>
    </MainContainer>
  );
};

export default Users;
