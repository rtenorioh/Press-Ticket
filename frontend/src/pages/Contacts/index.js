  import React, { useContext, useEffect, useReducer, useState } from "react";
import {
  Avatar,
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
  Box
} from "@mui/material";
import { styled } from '@mui/material/styles';
import {
  AddCircleOutline,
  Archive,
  DeleteForever,
  DeleteOutline,
  Edit,
  ImportContacts,
  Search,
  WhatsApp
} from "@mui/icons-material";
import { CSVLink } from "react-csv";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import WhatsMarked from "react-whatsmarked";

import { Can } from "../../components/Can";
import ConfirmationModal from "../../components/ConfirmationModal/";
import ContactChannels from "../../components/ContactChannels";
import ContactModal from "../../components/ContactModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import NewTicketModalPageContact from "../../components/NewTicketModalPageContact";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagsFilter from "../../components/TagsFilter";
import Title from "../../components/Title";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const PaperStyled = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  overflowY: "scroll",
  ...theme.scrollbarStyles,
}));

const CSVLinkStyled = styled(CSVLink)(({ theme }) => ({
  textDecoration: 'none'
}));

const AvatarStyled = styled(Avatar)(({ theme }) => ({
  width: "50px",
  height: "50px",
  borderRadius: "25%"
}));

const ButtonStyled = styled(Button)(({ theme }) => ({
  maxWidth: "36px",
  maxHeight: "36px",
  padding: theme.spacing(1),
}));

const Contacts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const defaultImage = '/default-profile.png';
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const [deletingAllContact, setDeletingAllContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [filteredTags, setFilteredTags] = useState([]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);

    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: {
              searchParam,
              pageNumber,
              tags: filteredTags.map(tag => tag.id).join(",")
            }
          });

          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };

      fetchContacts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, filteredTags]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("contact", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleTagFilter = (tags) => {
    setFilteredTags(tags);
    dispatch({ type: "RESET" }); // Resetar os contatos
    setPageNumber(1); // Reiniciar a busca da página 1
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.id !== undefined) {
      navigate(`/tickets/${ticket.id}`);
    }
    setLoading(false);
  };

  const handleSaveTicket = async (contactId) => {
    if (!contactId) return;

    setLoading(true);

    const { data: settingsData } = await api.get("/settings");
    const openTicketsSetting = settingsData.find(s => s.key === "openTickets")?.value;
    const { data: ticketData } = await api.get(`/tickets/contact/${contactId}/open`);
    const assignedUserName = ticketData.ticket?.user?.name || "Atendente desconhecido";
    const assignedUserChannel = ticketData.ticket?.whatsapp?.name || "Canal desconhecido";
    const ticketCreatedAt = ticketData.ticket?.createdAt ? new Date(ticketData.ticket.createdAt).toLocaleDateString('pt-BR') : "Data desconhecida";

    try {
      
      if (openTicketsSetting === "enabled" || ticketData.hasOpenTicket) {
        if (ticketData.ticket?.user?.id === user?.id) {
          toast.info(
            <WhatsMarked>
              {t("contacts.toasts.redirectTicket")}
            </WhatsMarked>,
            {
              toastId: "redirecting-to-ticket",
            }
          );
        
          setLoading(false);
          setTimeout(() => {
            navigate(`/tickets/${ticketData.ticket.id}`);
          }, 3000);
          return;
        } else {
          setLoading(false);
          toastError({
            message: t("contacts.errors.ticketAlreadyOpen", {
              userName: assignedUserName,
              userChannel: assignedUserChannel,
              ticketCreatedAt: ticketCreatedAt,
            }),
          });
          return;
        }
      }

      const { data } = await api.post("/tickets", {
        contactId,
        userId: user?.id,
        status: "open",
      });

      navigate(`/tickets/${data.id}`);
    } catch (err) {
      console.error(err);
      toastError({
        message: t("contacts.errors.ticketAlreadyOpen", {
          userName: assignedUserName,
          userChannel: assignedUserChannel,
          ticketCreatedAt: ticketCreatedAt,
        }),
      });
    } finally {
      setLoading(false);
    }
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleDeleteAllContact = async () => {
    try {
      await api.delete("/contacts");
      toast.success(t("contacts.toasts.deletedAll"));
      navigate(0);
    } catch (err) {
      toastError(err);
    }
    setDeletingAllContact(null);
    setSearchParam("");
    setPageNumber();
  };

  const handleimportContact = async () => {
    try {
      await api.post("/contacts/import");
      navigate(0);
    } catch (err) {
      toastError(err, t);
    }
  };

  const handleExportContacts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchParam) {
        params.searchParam = searchParam;
      }
      if (filteredTags && filteredTags.length > 0) {
        params.tags = filteredTags.map(tag => tag.id).join(",");
      }

      const { data } = await api.get("/contacts/export", { params });
      
      if (!data || data.length === 0) {
        toast.info(t("contacts.toasts.noContactsToExport"));
        setLoading(false);
        return;
      }

      const csvContent = [
        'ID;Nome;Número;Email;Endereço;Tags;Data de Criação'
      ].concat(
        data.map(contact => 
          [contact.id, contact.name, contact.number, contact.email, contact.address, contact.tags, contact.createdAt].join(';')
        )
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const element = document.createElement('a');
      element.href = url;
      element.download = 'pressticket-contacts-export.csv';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success(t("contacts.toasts.exportSuccess"));
    } catch (err) {
      console.error(err, t);
      if (err.response && err.response.status === 404 && 
          err.response.data && err.response.data.error === "ERR_NO_CONTACT_FOUND") {
        toast.info(t("contacts.toasts.noContactsFound"));
      } else {
        toastError(err, t);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading || !e.currentTarget) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const formatPhoneNumber = (number) => {
    if (!number) return "-";
    if (number.startsWith('55') && number.length === 13) {
      const ddd = number.slice(2, 4);
      const firstPart = number.slice(4, 9);
      const secondPart = number.slice(9);
      return `(${ddd}) ${firstPart}-${secondPart}`;
    } else if (number.startsWith('55') && number.length === 12) {
      const ddd = number.slice(2, 4);
      const firstPart = number.slice(4, 8);
      const secondPart = number.slice(8);
      return `(${ddd}) ${firstPart}-${secondPart}`;
    }

    return number;
  };

  return (
    <MainContainer>
      <NewTicketModalPageContact
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      ></ContactModal>
      <ConfirmationModal
        title={
          deletingContact ? `${t("contacts.confirmationModal.deleteTitle")} ${deletingContact.name}?`
            : deletingAllContact ? `${t("contacts.confirmationModal.deleteAllTitle")}`
              : `${t("contacts.confirmationModal.importTitle")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={(e) =>
          deletingContact ? handleDeleteContact(deletingContact.id)
            : deletingAllContact ? handleDeleteAllContact(deletingAllContact)
              : handleimportContact()
        }
      >
        {
          deletingContact ? `${t("contacts.confirmationModal.deleteMessage")}`
            : deletingAllContact ? `${t("contacts.confirmationModal.deleteAllMessage")}`
              : `${t("contacts.confirmationModal.importMessage")}`
        }
      </ConfirmationModal>
      <MainHeader>
        <Title>{t("contacts.title")} {contacts.length > 0 ? `(${contacts.length})` : ""}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="secondary" />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ alignSelf: 'center', marginRight: 1, minWidth: 220 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Can
              role={user?.profile}
              perform="drawer-admin-items:view"
              yes={() => (
                <>
                  <Tooltip title={t("contacts.buttons.import")}disabled={loading}>
                    <ButtonStyled
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      onClick={(e) => setConfirmOpen(true)}
                    >
                      <ImportContacts />
                    </ButtonStyled>
                  </Tooltip>
                </>
              )}
            />
            <Tooltip title={t("contacts.buttons.add")} disabled={loading}>
              <ButtonStyled
                variant="contained"
                color="primary"
                disabled={loading}
                onClick={handleOpenContactModal}
              >
                <AddCircleOutline />
              </ButtonStyled>
            </Tooltip>
            <Tooltip title={t("contacts.buttons.export")} disabled={loading}>
              <span style={{ display: 'inline-block' }}>
                <ButtonStyled
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  onClick={handleExportContacts}
                >
                  <Archive />
                </ButtonStyled>
              </span>
            </Tooltip>
            <Can
              role={user?.profile}
              perform="drawer-admin-items:view"
              yes={() => (
                <>
                  <Tooltip title={t("contacts.buttons.delete")} disabled={loading}>
                    <ButtonStyled
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      onClick={(e) => {
                        setConfirmOpen(true);
                        setDeletingAllContact(contacts);
                      }}
                    >
                      <DeleteForever />
                    </ButtonStyled>
                  </Tooltip>
                </>
              )}
            />
          </Box>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Box sx={{ padding: 1 }}>
        <TagsFilter onFiltered={handleTagFilter} />
      </Box>
      <PaperStyled
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"></TableCell>
              <TableCell>{t("contacts.table.name")}</TableCell>
              <TableCell align="center">{t("contacts.table.whatsapp")}</TableCell>
              <TableCell align="center">{t("contacts.table.address")}</TableCell>
              <TableCell align="center">{t("contacts.table.channels")}</TableCell>
              <TableCell align="center">{t("contacts.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {contacts
                .filter((contact) => {
                  if (filteredTags.length === 0) return true;
                  return (
                    contact.tags &&
                    contact.tags.length > 0 &&
                    filteredTags.every(tag => contact.tags.some(ctag => ctag.id === tag.id))
                  );
                })
                .map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell sx={{ paddingRight: 0 }}>
                      <AvatarStyled src={contact?.profilePicUrl || defaultImage} alt="contact_image" />
                    </TableCell>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell align="center">
                      {contact.number ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleSaveTicket(contact.id)}>
                            <Tooltip title="wwebjs" disabled={loading} arrow placement="left" >
                              <WhatsApp sx={{ color: "#075e54" }} />
                            </Tooltip>
                          </IconButton>
                          <span>
                            {user?.isTricked === "enabled" ? formatPhoneNumber(contact.number) : formatPhoneNumber(contact.number).slice(0, -4) + "****"}
                          </span>
                        </Box>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="center">{contact.address}</TableCell>
                    <TableCell align="center">
                      <ContactChannels
                        contact={contact}
                        handleSaveTicket={handleSaveTicket}
                        setContactTicket={setContactTicket}
                        setNewTicketModalOpen={setNewTicketModalOpen}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {contact.number && (
                          <IconButton size="small" onClick={() => hadleEditContact(contact.id)}>
                            <Edit color="info" />
                          </IconButton>
                        )}
                        <Can
                          role={user?.profile}
                          perform="contacts-page:deleteContact"
                          yes={() => (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setConfirmOpen(true);
                                setDeletingContact(contact);
                              }}
                            >
                              <DeleteOutline color="error" />
                            </IconButton>
                          )}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              {loading && <TableRowSkeleton avatar columns={4} />}
            </>
          </TableBody>
        </Table>
      </PaperStyled>
    </MainContainer>
  );
};

export default Contacts;