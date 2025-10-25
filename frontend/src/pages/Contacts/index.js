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
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Modal,
  Divider,
  Typography,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Dialog,
  DialogContent,
  DialogTitle
} from "@mui/material";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { styled } from '@mui/material/styles';
import {
  AddCircleOutline,
  Archive,
  DeleteForever,
  DeleteOutline,
  Edit,
  ImportContacts,
  Block as BlockIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
  Search,
  WhatsApp,
  Group,
  Groups,
  Person,
  AllInclusive
} from "@mui/icons-material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import WhatsMarked from "react-whatsmarked";

import { Can } from "../../components/Can";
import ConfirmationModal from "../../components/ConfirmationModal/";
import ContactChannels from "../../components/ContactChannels";
import ContactModal from "../../components/ContactModal";
import ContactAdvancedInfoModal from "../../components/ContactAdvancedInfoModal";
import ExportFieldsModal from "../../components/ExportFieldsModal";
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

const ModalPaper = styled(Paper)(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  maxWidth: "500px",
  width: "90%",
  borderRadius: theme.shape.borderRadius,
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

const Contacts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [blockLoadingId, setBlockLoadingId] = useState(null);
  const [blockedStatus, setBlockedStatus] = useState({});
  const TYPE_FILTER_KEY = "pressticket:contactsTypeFilter";
  const [typeFilter, setTypeFilter] = useState("all");
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [selectedDataContact, setSelectedDataContact] = useState(null);
  const [dataTab, setDataTab] = useState(0);
  const [channelsModalOpen, setChannelsModalOpen] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [clientStatusList, setClientStatusList] = useState([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportProgressOpen, setExportProgressOpen] = useState(false);
  const [advancedInfoModalOpen, setAdvancedInfoModalOpen] = useState(false);
  const [selectedAdvancedContact, setSelectedAdvancedContact] = useState(null);

  useEffect(() => {
    if (location.state?.statusFilter) {
      setStatusFilter(location.state.statusFilter);
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.tagFilter) {
      setFilteredTags([location.state.tagFilter]);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const formatDate = (dt) => {
    try {
      if (!dt) return "—";
      const d = new Date(dt);
      if (Number.isNaN(d.getTime())) return "—";
      return d.toLocaleString('pt-BR');
    } catch { return "—"; }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TYPE_FILTER_KEY);
      if (saved && ["all", "individual", "group"].includes(saved)) {
        setTypeFilter(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const fetchClientStatus = async () => {
      try {
        const { data } = await api.get("/client-status/");
        setClientStatusList(data.clientStatus || []);
      } catch (err) {
        console.error("Erro ao carregar status de clientes:", err);
      }
    };
    fetchClientStatus();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TYPE_FILTER_KEY, typeFilter);
    } catch {}
  }, [typeFilter]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam, typeFilter, statusFilter]);

  useEffect(() => {
    setLoading(true);

    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const isGroupParam = typeFilter === 'group' ? 'true' : (typeFilter === 'individual' ? 'false' : undefined);
          const { data } = await api.get("/contacts/", {
            params: {
              searchParam,
              pageNumber,
              tags: filteredTags.map(tag => tag.id).join(","),
              ...(isGroupParam ? { isGroup: isGroupParam } : {}),
              ...(statusFilter ? { status: statusFilter } : {})
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
  }, [searchParam, pageNumber, filteredTags, typeFilter, statusFilter]);

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
    dispatch({ type: "RESET" });
    setPageNumber(1);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    dispatch({ type: "RESET" });
    setPageNumber(1);
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
            { toastId: "redirecting-to-ticket" }
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

  const fetchBlockedStatus = async (contact) => {
    if (!contact?.id) return;
    if (contact?.isGroup) return;
    if (blockedStatus[contact.id] !== undefined) return;
    try {
      const { data } = await api.get(`/contacts/${contact.id}/block-status`);
      setBlockedStatus(prev => ({ ...prev, [contact.id]: Boolean(data?.isBlocked) }));
    } catch (err) {
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

  const handleOpenDataModal = async (contact) => {
    try {
      const { data } = await api.get(`/contacts/${contact.id}`);
      setSelectedDataContact(data);
      setDataTab(0);
      setDataModalOpen(true);
    } catch (err) {
      console.error("Erro ao carregar dados do contato:", err);
      setSelectedDataContact(contact);
      setDataTab(0);
      setDataModalOpen(true);
    }
  };

  const handleCloseDataModal = () => {
    setDataModalOpen(false);
    setSelectedDataContact(null);
  };

  const handleOpenChannelsModal = (contact) => {
    const channels = [];
    
    if (contact.number) {
      channels.push({ id: 'whatsapp', name: 'WhatsApp', type: 'wwebjs', color: '#075e54' });
    }
    if (contact.telegramId) {
      channels.push({ id: contact.telegramId, name: 'Telegram', type: 'telegram', color: '#0088cc' });
    }
    if (contact.messengerId) {
      channels.push({ id: contact.messengerId, name: 'Facebook', type: 'messenger', color: '#3b5998' });
    }
    if (contact.instagramId) {
      channels.push({ id: contact.instagramId, name: 'Instagram', type: 'instagram', color: '#cd486b' });
    }
    if (contact.email) {
      channels.push({ id: contact.email, name: 'Email', type: 'email', color: '#004f9f' });
    }
    if (contact.webchatId) {
      channels.push({ id: contact.webchatId, name: 'WebChat', type: 'webchat', color: '#EB6D58' });
    }
    
    setSelectedChannels(channels);
    setChannelsModalOpen(true);
  };

  const handleCloseChannelsModal = () => {
    setChannelsModalOpen(false);
    setSelectedChannels([]);
  };

  const handleToggleBlock = async (contact) => {
    if (contact?.isGroup) {
      toast.error(t("contacts.toasts.groupNotSupported") || "Bloqueio não suportado para grupos");
      return;
    }
    try {
      setBlockLoadingId(contact.id);
      const { data: status } = await api.get(`/contacts/${contact.id}/block-status`);
      const currentlyBlocked = Boolean(status?.isBlocked);
      if (currentlyBlocked) {
        await api.post(`/contacts/${contact.id}/unblock`);
        toast.success(t("contacts.toasts.unblocked") || "Contato desbloqueado no WhatsApp");
        setBlockedStatus(prev => ({ ...prev, [contact.id]: false }));
      } else {
        await api.post(`/contacts/${contact.id}/block`);
        toast.success(t("contacts.toasts.blocked") || "Contato bloqueado no WhatsApp");
        setBlockedStatus(prev => ({ ...prev, [contact.id]: true }));
      }
    } catch (err) {
      toastError(err, t);
    } finally {
      setBlockLoadingId(null);
    }
  };

  const handleimportContact = async () => {
    try {
      await api.post("/contacts/import");
      navigate(0);
    } catch (err) {
      toastError(err, t);
    }
  };

  const handleExportContacts = async (selectedFields) => {
    setLoading(true);
    setExportProgress(0);
    setExportProgressOpen(true);
    
    try {
      setExportProgress(10);
      
      const params = {};
      if (searchParam) {
        params.searchParam = searchParam;
      }
      if (filteredTags && filteredTags.length > 0) {
        params.tags = filteredTags.map(tag => tag.id).join(",");
      }
      
      const isGroupParam = typeFilter === 'group' ? 'true' : (typeFilter === 'individual' ? 'false' : undefined);
      if (isGroupParam !== undefined) {
        params.isGroup = isGroupParam;
      }
      
      if (statusFilter) {
        params.status = statusFilter;
      }

      setExportProgress(20);
      
      const { data } = await api.get("/contacts/export", { params });
      
      setExportProgress(40);
      
      if (!data || data.length === 0) {
        toast.info(t("contacts.toasts.noContactsToExport"));
        setLoading(false);
        setExportProgressOpen(false);
        return;
      }

      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(';') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const formatNumber = (value) => {
        if (!value) return '';
        return `'${value}`;
      };

      const fieldMapping = {
        id: { label: 'ID', getValue: (c) => c.id },
        name: { label: 'Nome', getValue: (c) => escapeCSV(c.name) },
        number: { label: 'Número', getValue: (c) => formatNumber(c.number) },
        email: { label: 'Email', getValue: (c) => escapeCSV(c.email) },
        cpf: { label: 'CPF', getValue: (c) => formatNumber(c.cpf) },
        birthdate: { label: 'Data Nascimento', getValue: (c) => c.birthdate },
        gender: { label: 'Gênero', getValue: (c) => escapeCSV(c.gender) },
        status: { label: 'Status', getValue: (c) => escapeCSV(c.status) },
        address: { label: 'Endereço', getValue: (c) => escapeCSV(c.address) },
        addressNumber: { label: 'Número', getValue: (c) => c.addressNumber },
        addressComplement: { label: 'Complemento', getValue: (c) => escapeCSV(c.addressComplement) },
        neighborhood: { label: 'Bairro', getValue: (c) => escapeCSV(c.neighborhood) },
        city: { label: 'Cidade', getValue: (c) => escapeCSV(c.city) },
        state: { label: 'Estado', getValue: (c) => escapeCSV(c.state) },
        zip: { label: 'CEP', getValue: (c) => formatNumber(c.zip) },
        country: { label: 'País', getValue: (c) => escapeCSV(c.country) },
        isGroup: { label: 'É Grupo', getValue: (c) => c.isGroup },
        profilePicUrl: { label: 'Foto Perfil', getValue: (c) => c.profilePicUrl },
        extraInfo: { label: 'Informações Extras', getValue: (c) => escapeCSV(c.extraInfo) },
        tags: { label: 'Tags', getValue: (c) => escapeCSV(c.tags) },
        createdAt: { label: 'Data Criação', getValue: (c) => c.createdAt },
        updatedAt: { label: 'Data Atualização', getValue: (c) => c.updatedAt },
        lastContactAt: { label: 'Último Contato', getValue: (c) => c.lastContactAt }
      };

      const headers = selectedFields.map(fieldId => fieldMapping[fieldId]?.label || fieldId).join(';');

      setExportProgress(50);

      const rows = [];
      const totalContacts = data.length;
      const batchSize = 100;
      
      for (let i = 0; i < totalContacts; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const batchRows = batch.map(contact => 
          selectedFields.map(fieldId => {
            const field = fieldMapping[fieldId];
            return field ? field.getValue(contact) : '';
          }).join(';')
        );
        rows.push(...batchRows);
        
        const progress = 50 + Math.floor(((i + batchSize) / totalContacts) * 40);
        setExportProgress(Math.min(progress, 90));
        
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      setExportProgress(95);

      const csvContent = [headers, ...rows].join('\n');
      
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      setExportProgress(98);
      
      const element = document.createElement('a');
      element.href = url;
      element.download = 'pressticket-contacts-export.csv';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      setExportProgress(100);
      
      setTimeout(() => {
        setExportProgressOpen(false);
        toast.success(t("contacts.toasts.exportSuccess"));
      }, 500);
    } catch (err) {
      console.error(err, t);
      setExportProgressOpen(false);
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
                  onClick={() => setExportModalOpen(true)}
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
      <Box sx={{ padding: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <TagsFilter onFiltered={handleTagFilter} initialTags={filteredTags} />
        </Box>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter-label">{t("contacts.filters.status", { defaultValue: "Filtrar por Status" })}</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            label={t("contacts.filters.status", { defaultValue: "Filtrar por Status" })}
            onChange={handleStatusFilter}
          >
            <MenuItem value="">{t("contacts.filters.allStatus", { defaultValue: "Todos os Status" })}</MenuItem>
            {clientStatusList.map((status) => (
              <MenuItem key={status.id} value={status.name}>{status.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
              <TableCell align="center">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <span>{t("contacts.table.type")}</span>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    color="primary"
                    value={typeFilter}
                    onChange={(e, val) => { if (val) setTypeFilter(val); }}
                    sx={{ '& .MuiToggleButton-root': { px: 1.2, py: 0.3 }, mt: 0.5 }}
                  >
                    <Tooltip title="Todos" arrow>
                      <ToggleButton value="all" aria-label="todos">
                        <AllInclusive fontSize="small" />
                      </ToggleButton>
                    </Tooltip>
                    <Tooltip title="Individuais" arrow>
                      <ToggleButton value="individual" aria-label="individuais">
                        <Person fontSize="small" />
                      </ToggleButton>
                    </Tooltip>
                    <Tooltip title="Grupos" arrow>
                      <ToggleButton value="group" aria-label="grupos">
                        <Groups fontSize="small" />
                      </ToggleButton>
                    </Tooltip>
                  </ToggleButtonGroup>
                </Box>
              </TableCell>
              <TableCell align="center">{t("contacts.table.data", { defaultValue: "Dados" })}</TableCell>
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
                    <TableCell align="center">
                      {((contact?.isGroup === true) || (contact?.number && contact.number.includes('@g.us')))
                        ? (
                          <Tooltip title="Grupo" arrow>
                            <span>
                              <Group color="primary" />
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Contato individual" arrow>
                            <span>
                              <Person color="secondary" />
                            </span>
                          </Tooltip>
                        )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={t("contacts.dataModal.title", { defaultValue: "Dados do contato" })} arrow placement="top">
                        <span>
                          <IconButton size="small" onClick={() => handleOpenDataModal(contact)}>
                            <InfoOutlinedIcon color="primary" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={t("contacts.table.viewChannels", { defaultValue: "Ver canais" })} arrow placement="top">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenChannelsModal(contact)}
                          sx={{ color: 'primary.main' }}
                        >
                          <InfoOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {contact.number && (
                          <IconButton size="small" onClick={() => hadleEditContact(contact.id)}>
                            <Edit color="info" />
                          </IconButton>
                        )}
                        {contact.number && !contact.isGroup && (
                          <Tooltip title="Informações Avançadas">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedAdvancedContact(contact);
                                setAdvancedInfoModalOpen(true);
                              }}
                            >
                              <InfoOutlinedIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {contact.number && !contact.isGroup && (
                          <IconButton
                            size="small"
                            disabled={blockLoadingId === contact.id}
                            onClick={() => handleToggleBlock(contact)}
                            onMouseEnter={() => fetchBlockedStatus(contact)}
                          >
                            {blockLoadingId === contact.id ? (
                              <BlockIcon color="disabled" />
                            ) : blockedStatus[contact.id] ? (
                              <Tooltip title={t("contacts.buttons.unblock") || "Desbloquear"}>
                                <span>
                                  <LockIcon color="error" />
                                </span>
                              </Tooltip>
                            ) : (
                              <Tooltip title={t("contacts.buttons.block") || "Bloquear"}>
                                <span>
                                  <LockOpenIcon color="success" />
                                </span>
                              </Tooltip>
                            )}
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
              {loading && <TableRowSkeleton avatar columns={5} />}
            </>
          </TableBody>
        </Table>
      </PaperStyled>
      <Modal open={dataModalOpen} onClose={handleCloseDataModal} closeAfterTransition>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 420, maxWidth: '90%', bgcolor: 'background.paper', boxShadow: 24, p: 3, borderRadius: theme => theme.shape.borderRadius }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
            {t("contacts.dataModal.title", { defaultValue: "Dados do contato" })}
          </Typography>
          <Divider sx={{ mb: 1.5 }} />

          <Tabs value={dataTab} onChange={(e, v) => setDataTab(v)} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 2 }}>
            <Tab label={t('contactModal.form.mainInfo', { defaultValue: 'DADOS DO CONTATO' })} />
            <Tab label={t('contactModal.form.contact', { defaultValue: 'CONTATO' })} />
            <Tab label={t('contactModal.form.address', { defaultValue: 'ENDEREÇO' })} />
            <Tab label={t('contactModal.form.extraInfo', { defaultValue: 'INFORMAÇÕES ADICIONAIS' })} />
          </Tabs>

          {dataTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="subtitle2" color="primary">{t("contacts.table.name", { defaultValue: "Nome" })}</Typography>
                <Typography variant="body2">{selectedDataContact?.name || "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="primary">{t('contacts.fields.cpf', { defaultValue: 'CPF/CNPJ' })}</Typography>
                <Typography variant="body2">
                  {selectedDataContact?.cpf 
                    ? selectedDataContact.cpf.length <= 11
                      ? selectedDataContact.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                      : selectedDataContact.cpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
                    : "—"}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="primary">{t('contacts.fields.birthdate', { defaultValue: 'Data de nascimento' })}</Typography>
                  <Typography variant="body2">{formatDate(selectedDataContact?.birthdate)}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="primary">{t('contacts.fields.gender', { defaultValue: 'Gênero' })}</Typography>
                  <Typography variant="body2">{selectedDataContact?.gender || "—"}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="primary">{t('contacts.fields.status', { defaultValue: 'Status' })}</Typography>
                <Typography variant="body2">{selectedDataContact?.status || "—"}</Typography>
              </Box>
            </Box>
          )}

          {dataTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="primary">{t('contacts.fields.createdAt', { defaultValue: 'Data de cadastrado' })}</Typography>
                  <Typography variant="body2">{formatDate(selectedDataContact?.createdAt)}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="primary">{t('contacts.fields.lastContactAt', { defaultValue: 'Último contato' })}</Typography>
                  <Typography variant="body2">{formatDate(selectedDataContact?.lastContactAt)}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="primary">{t('contactModal.form.number', { defaultValue: 'Número do WhatsApp' })}</Typography>
                <Typography variant="body2">
                  {selectedDataContact?.number 
                    ? (user?.isTricked === "enabled" 
                        ? formatPhoneNumber(selectedDataContact.number) 
                        : formatPhoneNumber(selectedDataContact.number).slice(0, -4) + "****")
                    : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="primary">Email</Typography>
                <Typography variant="body2">{selectedDataContact?.email || "—"}</Typography>
              </Box>
            </Box>
          )}

          {dataTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Box>
                <Typography variant="subtitle2" color="primary">{t('contacts.fields.country', { defaultValue: 'País' })}</Typography>
                <Typography variant="body2">{selectedDataContact?.country || "—"}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="primary">{t('contacts.fields.zip', { defaultValue: 'CEP' })}</Typography>
                  <Typography variant="body2">{selectedDataContact?.zip || selectedDataContact?.cep || "—"}</Typography>
                </Box>
                <Box sx={{ flex: 2 }}>
                  <Typography variant="subtitle2" color="primary">{t("contacts.table.address", { defaultValue: "Endereço" })}</Typography>
                  <Typography variant="body2">{selectedDataContact?.address || "—"}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="primary">{t('contacts.fields.number', { defaultValue: 'Número' })}</Typography>
                  <Typography variant="body2">{selectedDataContact?.addressNumber || selectedDataContact?.numberAddress || "—"}</Typography>
                </Box>
                <Box sx={{ flex: 2 }}>
                  <Typography variant="subtitle2" color="primary">{t('contacts.fields.complement', { defaultValue: 'Complemento' })}</Typography>
                  <Typography variant="body2">{selectedDataContact?.addressComplement || selectedDataContact?.complement || "—"}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="primary">{t('contacts.fields.neighborhood', { defaultValue: 'Bairro' })}</Typography>
                  <Typography variant="body2">{selectedDataContact?.neighborhood || selectedDataContact?.district || "—"}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="primary">{t('contacts.fields.city', { defaultValue: 'Cidade' })}</Typography>
                  <Typography variant="body2">{selectedDataContact?.city || "—"}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="primary">{t('contacts.fields.state', { defaultValue: 'Estado' })}</Typography>
                  <Typography variant="body2">{selectedDataContact?.state || selectedDataContact?.uf || "—"}</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {dataTab === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {Array.isArray(selectedDataContact?.extraInfo) && selectedDataContact.extraInfo.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {selectedDataContact.extraInfo.map((info, index) => (
                    <Box key={info.id || `${info.name}-${info.value}-${index}`} sx={{ pb: 0.5, borderBottom: index < selectedDataContact.extraInfo.length - 1 ? '1px solid #eee' : 'none' }}>
                      <Typography variant="subtitle2" color="primary">{info.name}</Typography>
                      <Typography variant="body2">{info.value}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">{t('contacts.fields.noAdditional', { defaultValue: 'Sem informações adicionais' })}</Typography>
              )}
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseDataModal} variant="contained" color="primary" sx={{ borderRadius: 20 }}>
              {t("common.close", { defaultValue: "Fechar" })}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={channelsModalOpen}
        onClose={handleCloseChannelsModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.4)"
            }
          }
        }}
      >
        <Fade in={channelsModalOpen}>
          <ModalPaper>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
              {t("contacts.channelsModal.title", { defaultValue: "Canais" })}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("contacts.channelsModal.id", { defaultValue: "ID" })}</TableCell>
                  <TableCell>{t("contacts.channelsModal.name", { defaultValue: "Nome" })}</TableCell>
                  <TableCell>{t("contacts.channelsModal.type", { defaultValue: "Tipo" })}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedChannels.map((channel, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ padding: 0, width: "5px", position: "relative" }}>
                      <ColorIndicator sx={{ backgroundColor: channel.color }}></ColorIndicator>
                      <IdContainer>{index + 1}</IdContainer>
                    </TableCell>
                    <TableCell>{channel.name}</TableCell>
                    <TableCell>{channel.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ModalPaper>
        </Fade>
      </Modal>

      <ExportFieldsModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExportContacts}
        t={t}
      />

      <Dialog
        open={exportProgressOpen}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>
          <Typography variant="h6" align="center">
            {t("contacts.exportProgress.title", { defaultValue: "Exportando Contatos" })}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={exportProgress} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  {`${Math.round(exportProgress)}%`}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" align="center">
              {exportProgress < 20 && t("contacts.exportProgress.preparing", { defaultValue: "Preparando exportação..." })}
              {exportProgress >= 20 && exportProgress < 40 && t("contacts.exportProgress.fetching", { defaultValue: "Buscando contatos..." })}
              {exportProgress >= 40 && exportProgress < 95 && t("contacts.exportProgress.processing", { defaultValue: "Processando dados..." })}
              {exportProgress >= 95 && t("contacts.exportProgress.finishing", { defaultValue: "Finalizando..." })}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      <ContactAdvancedInfoModal
        open={advancedInfoModalOpen}
        onClose={() => {
          setAdvancedInfoModalOpen(false);
          setSelectedAdvancedContact(null);
        }}
        contactId={selectedAdvancedContact?.id}
        whatsappId={null}
      />
    </MainContainer>
  );
};

export default Contacts;