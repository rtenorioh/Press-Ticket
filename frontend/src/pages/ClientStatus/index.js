import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Chip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import DeleteForever from "@mui/icons-material/DeleteForever";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Edit from "@mui/icons-material/Edit";
import Search from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ClientStatusModal from "../../components/ClientStatusModal";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";

const reducer = (state, action) => {
  if (action.type === "LOAD_CLIENT_STATUS") {
    const clientStatus = action.payload;
    const newClientStatus = [];

    clientStatus.forEach((status) => {
      const statusIndex = state.findIndex((s) => s.id === status.id);
      if (statusIndex !== -1) {
        state[statusIndex] = status;
      } else {
        newClientStatus.push(status);
      }
    });

    return [...state, ...newClientStatus];
  }

  if (action.type === "UPDATE_CLIENT_STATUS") {
    const status = action.payload;
    const statusIndex = state.findIndex((s) => s.id === status.id);

    if (statusIndex !== -1) {
      state[statusIndex] = status;
      return [...state];
    } else {
      return [status, ...state];
    }
  }

  if (action.type === "DELETE_CLIENT_STATUS") {
    const statusId = action.payload;

    const statusIndex = state.findIndex((s) => s.id === statusId);
    if (statusIndex !== -1) {
      state.splice(statusIndex, 1);
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
  margin: theme.spacing(1),
  overflowY: "scroll",
  ...theme.scrollbarStyles,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  [theme.breakpoints.down("md")]: {
    marginBottom: theme.spacing(1),
  },
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  [theme.breakpoints.down("md")]: {
    marginTop: theme.spacing(1),
  },
}));

const ClientStatus = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedClientStatus, setSelectedClientStatus] = useState(null);
  const [deletingClientStatus, setDeletingClientStatus] = useState(null);
  const [deletingAllClientStatus, setDeletingAllClientStatus] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [clientStatus, dispatch] = useReducer(reducer, []);
  const [clientStatusModalOpen, setClientStatusModalOpen] = useState(false);

  const fetchClientStatus = useCallback(async () => {
    try {
      const { data } = await api.get("/client-status/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CLIENT_STATUS", payload: data.clientStatus });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err, t);
    }
  }, [searchParam, pageNumber, t]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchClientStatus();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, fetchClientStatus]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("clientStatus", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CLIENT_STATUS", payload: data.clientStatus });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CLIENT_STATUS", payload: +data.clientStatusId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenClientStatusModal = () => {
    setSelectedClientStatus(null);
    setClientStatusModalOpen(true);
  };

  const handleCloseClientStatusModal = (statusData) => {
    setSelectedClientStatus(null);
    setClientStatusModalOpen(false);
    
    if (statusData) {
      dispatch({ type: "UPDATE_CLIENT_STATUS", payload: statusData });
    }
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditClientStatus = (status) => {
    setSelectedClientStatus(status);
    setClientStatusModalOpen(true);
  };

  const handleDeleteClientStatus = async (statusId) => {
    try {
      await api.delete(`/client-status/${statusId}`);
      toast.success(t("clientStatus.toasts.deleted"));
      
      dispatch({ type: "DELETE_CLIENT_STATUS", payload: statusId });
    } catch (err) {
      toastError(err, t);
    }
    setDeletingClientStatus(null);
  };

  const handleDeleteAllClientStatus = async () => {
    try {
      await api.delete(`/client-status`);
      toast.success(t("clientStatus.toasts.deletedAll"));
      dispatch({ type: "RESET" });
    } catch (err) {
      toastError(err, t);
    }
    setDeletingAllClientStatus(null);
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

  const handleViewContacts = (statusName) => {
    navigate('/contacts', { state: { statusFilter: statusName } });
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingClientStatus ? `${t("clientStatus.confirmationModal.deleteTitle")}`
            : `${t("clientStatus.confirmationModal.deleteAllTitle")}`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() =>
          deletingClientStatus ? handleDeleteClientStatus(deletingClientStatus.id)
            : handleDeleteAllClientStatus(deletingAllClientStatus)
        }
      >
        {
          deletingClientStatus ? `${t("clientStatus.confirmationModal.deleteMessage")}`
            : `${t("clientStatus.confirmationModal.deleteAllMessage")}`
        }
      </ConfirmationModal>
      <ClientStatusModal
        open={clientStatusModalOpen}
        onClose={handleCloseClientStatusModal}
        reload={fetchClientStatus}
        aria-labelledby="form-dialog-title"
        clientStatusId={selectedClientStatus && selectedClientStatus.id}
      />
      <MainHeader>
        <Title>{t("clientStatus.title")} {clientStatus.length > 0 ? `(${clientStatus.length})` : ""}</Title>
        <MainHeaderButtonsWrapper>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            width: '100%',
            gap: 1
          }}>
            <SearchContainer>
              <TextField
                placeholder={t("contacts.searchPlaceholder")}
                type="search"
                fullWidth
                size="small"
                value={searchParam}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="secondary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  py: 0,
                  '& .MuiOutlinedInput-root': {
                    height: 40
                  }
                }}
              />
            </SearchContainer>
            <ButtonContainer>
              <Tooltip title={t("clientStatus.buttons.add")}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenClientStatusModal}
                  sx={{
                    minWidth: { xs: '100%', md: 'auto' },
                    height: 40
                  }}
                >
                  <AddCircleOutline />
                </Button>
              </Tooltip>
              <Tooltip title={t("clientStatus.buttons.deleteAll")}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    setConfirmModalOpen(true);
                    setDeletingAllClientStatus(clientStatus);
                  }}
                  sx={{
                    minWidth: { xs: '100%', md: 'auto' },
                    height: 40
                  }}
                >
                  <DeleteForever />
                </Button>
              </Tooltip>
            </ButtonContainer>
          </Box>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <MainPaper
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{t("clientStatus.table.id")}</TableCell>
              <TableCell align="center">{t("clientStatus.table.name")}</TableCell>
              <TableCell align="center">{t("clientStatus.table.color")}</TableCell>
              <TableCell align="center">{t("clientStatus.table.contacts")}</TableCell>
              <TableCell align="center">{t("clientStatus.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {clientStatus.map((status) => (
                <TableRow key={status.id}>
                  <TableCell align="center">
                    {status.id}
                  </TableCell>
                  <TableCell align="center">
                    {status.name}
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        backgroundColor: status.color,
                        width: 40,
                        height: 20,
                        margin: "0 auto",
                        borderRadius: 10
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={t("clientStatus.buttons.viewContacts", { defaultValue: "Ver contatos com este status" })}>
                      <Chip
                        label={status.contactsCount || 0}
                        onClick={() => handleViewContacts(status.name)}
                        icon={<VisibilityIcon />}
                        color="primary"
                        variant="outlined"
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'white'
                          }
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClientStatus(status)}
                    >
                      <Edit color="info" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingClientStatus(status);
                      }}
                    >
                      <DeleteOutline color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={5} />}
            </>
          </TableBody>
        </Table>
      </MainPaper>
    </MainContainer>
  );
};

export default ClientStatus;
