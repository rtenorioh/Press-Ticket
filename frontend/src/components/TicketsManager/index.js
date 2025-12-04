import {
  Badge,
  FormControlLabel,
  Paper,
  Switch,
  Tab,
  Tabs,
  Tooltip,
  Menu,
  MenuItem,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CheckCircle,
  HourglassEmptyRounded,
  MoveToInbox,
  Search,
  FilterList,
  Add,
  Close,
  Refresh,
  Group,
  AccountTreeOutlined,
  SyncAlt
} from "@mui/icons-material";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/Auth/AuthContext";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import { Can } from "../Can";
import NewTicketModal from "../NewTicketModal";
import TabPanel from "../TabPanel";
import TicketsList from "../TicketsList";
import QueueMenuItems from "../QueueMenuItems";
import ChannelMenuItems from "../ChannelMenuItems";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { toast } from "react-toastify";
import ConfirmationModal from "../ConfirmationModal";
import openSocket from "../../services/socket-io";

const TicketWrapperStyled = styled(Paper)(({ theme }) => ({
  position: "relative",
  display: "flex",
  height: "100%",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  border: "none",
  backgroundColor: theme.palette.background.default,
}));

const TabPanelStyled = styled(TabPanel)(({ theme }) => ({
  position: "relative",
  display: "flex",
  height: "100%",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: 0,
  backgroundColor: theme.palette.background.default,
}));

const SearchContainerStyled = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1.5, 2),
  borderBottom: "none",
  backgroundColor: theme.palette.background.paper,
  position: "relative",
  boxShadow: theme.shadows[1],
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: theme.spacing(2),
    right: theme.spacing(2),
    height: "1px",
    backgroundColor: theme.palette.divider,
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const SearchIconStyled = styled(Search)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginRight: theme.spacing(1),
  fontSize: "1.2rem",
}));
 
const SearchInputStyled = styled("input")(({ theme }) => ({
  flex: 1,
  border: "none",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 1.5),
  outline: "none",
  backgroundColor: theme.palette.action.hover,
  color: theme.palette.text.primary,
  fontSize: "0.9rem",
  transition: "all 0.2s ease",
  "&:focus": {
    backgroundColor: theme.palette.background.paper,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}30`,
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.8, 1.2),
  },
}));

const TabsHeaderStyled = styled(Paper)(({ theme }) => ({
  flex: "none",
  backgroundColor: theme.palette.background.paper,
  boxShadow: "none",
  borderRadius: 0,
  position: "relative",
  zIndex: 1,
  "& .MuiTabs-indicator": {
    height: 3,
    borderRadius: "3px 3px 0 0",
  },
  "& .MuiTab-root": {
    minHeight: 48,
    transition: "all 0.2s ease",
    fontWeight: 500,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const TicketOptionsBoxStyled = styled(Paper)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1.2, 2),
  boxShadow: theme.shadows[1],
  borderRadius: 0,
  gap: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
    justifyContent: "center",
  },
}));

const ActionButton = styled(IconButton)(({ theme, color = "default" }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1),
  backgroundColor: color === "primary" ? 
    `${theme.palette.primary.main}20` : 
    theme.palette.action.hover,
  color: color === "primary" ? theme.palette.primary.main : theme.palette.text.secondary,
  transition: "all 0.2s ease",
  marginRight: theme.spacing(1),
  "&:hover": {
    backgroundColor: color === "primary" ? 
      `${theme.palette.primary.main}40` : 
      theme.palette.action.selected,
    transform: "translateY(-2px)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.8),
    marginRight: theme.spacing(0.5),
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    fontWeight: "bold",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

const TicketsManager = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [closeAction, setCloseAction] = useState(null);
  const { user } = useContext(AuthContext);
  const { whatsApps } = useContext(WhatsAppsContext);
  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [closedCount, setClosedCount] = useState(0);
  const [openGroupsCount, setOpenGroupsCount] = useState(0);
  const userQueueIds = user?.queues?.map((q) => q.id);
  const [settings, setSettings] = useState([]);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [selectedChannelIds, setSelectedChannelIds] = useState([]);
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState(null);
  const [channelMenuAnchorEl, setChannelMenuAnchorEl] = useState(null);

  const fetchTicketCounts = async () => {
    try {
      const { data } = await api.get("/tickets/count", {
        params: {
          queueIds: selectedQueueIds.length > 0 ? selectedQueueIds.join(",") : undefined,
          showAll: showAllTickets
        }
      });
      
      setOpenCount(data.open || 0);
      setPendingCount(data.pending || 0);
      setClosedCount(data.closed || 0);
      setOpenGroupsCount(data.openGroups || 0);
    } catch (err) {
      console.error("Erro ao buscar contadores:", err);
    }
  };

  useEffect(() => {
    if (user?.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    const checkTabChange = () => {
      const changeTabRequest = localStorage.getItem("pressticket:changeTab");
      if (changeTabRequest) {
        setTab(changeTabRequest);
        localStorage.removeItem("pressticket:changeTab");
      }
    };
    
    checkTabChange();
    const intervalId = setInterval(checkTabChange, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const checkTabChange = () => {
      const changeTabRequest = localStorage.getItem("pressticket:changeTab");
      if (changeTabRequest && changeTabRequest !== tab) {
        setTab(changeTabRequest);
        localStorage.removeItem("pressticket:changeTab");
      }
    };
    
    checkTabChange();
  }, [tab]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        setSettings(data);
      } catch (err) {
        console.error(err);
        toastError(err);
        setSettings([]);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchTicketCounts();
    
    const socket = openSocket();
    if (!socket) {
      console.error("Não foi possível conectar ao socket para contadores");
      return;
    }

    let debounceTimer = null;
    
    const debouncedFetchCounts = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        fetchTicketCounts();
      }, 500);
    };

    const handleTicketUpdate = (data) => {
      if (data.action === "updateCounter" && data.counters) {
        setOpenCount(data.counters.open || 0);
        setPendingCount(data.counters.pending || 0);
        setClosedCount(data.counters.closed || 0);
        setOpenGroupsCount(data.counters.openGroups || 0);
      } else if (data.action === "update" || data.action === "create" || data.action === "delete") {
        debouncedFetchCounts();
      }
    };

    const handleAppMessage = (data) => {    
      if (data.action === "create") {
        debouncedFetchCounts();
      }
    };

    socket.on("ticket", handleTicketUpdate);
    socket.on("appMessage", handleAppMessage);
    socket.emit("joinTickets", "open");
    socket.emit("joinTickets", "pending");
    socket.emit("joinTickets", "closed");

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      socket.off("ticket", handleTicketUpdate);
      socket.off("appMessage", handleAppMessage);
    };
  }, [selectedQueueIds, showAllTickets]);
  
  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    setSearchParam(searchedTerm);
    if (searchedTerm === "") {
      setTab("open");
    } else if (tab !== "search") {
      setTab("search");
    }

  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleCloseTickets = async (status) => {
    try {
      let groupsOnlyParam = '';
      const originalStatus = status;
      
      if (status === 'open') {
        groupsOnlyParam = '&groupsOnly=false';
      } else if (status === 'groups') {
        groupsOnlyParam = '&groupsOnly=true';
        status = 'open';
      }
      
      const { data } = await api.put(`/tickets/close-all?status=${status}${groupsOnlyParam}`);
      setAnchorEl(null);
      
      if (originalStatus === "open") {
        setTab(tab => tab === "open" ? "pending" : "open");
        setTimeout(() => setTab("open"), 100);
      } else if (originalStatus === "pending") {
        setTab(tab => tab === "pending" ? "open" : "pending");
        setTimeout(() => setTab("pending"), 100);
      } else if (originalStatus === "groups") {
        setTab(tab => tab === "groups" ? "open" : "groups");
        setTimeout(() => setTab("groups"), 100);
      } else if (originalStatus === "all") {
        setTab(tab => tab === "open" ? "pending" : "open");
        setTimeout(() => setTab("open"), 100);
      }

      toast.success(
        t("tickets.notifications.closed.success") + 
        (data.count ? ` (${data.count} ${t("tickets.notifications.closed.tickets")})` : "")
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.error || 
        t("tickets.notifications.closed.error")
      );
    }
  };

  const handleOpenConfirmation = (status) => {
    setCloseAction(status);
    setConfirmationOpen(true);
    setAnchorEl(null);
  };

  const handleConfirmClose = async () => {
    await handleCloseTickets(closeAction);
    setConfirmationOpen(false);
    setCloseAction(null);
  };

  const canTabsSettings = (ts) => {
    return (
      (settings && settings.some(s => s.key === ts && s.value === "enabled")) ||
      (user && user?.profile === "admin")
    );
  };

  return (
    <TicketWrapperStyled
      elevation={0}
    >
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(e) => setNewTicketModalOpen(false)}
      />
      <ConfirmationModal
        title={
          closeAction === "all"
            ? t("ticketsManager.confirmationModal.closeAllTitle")
            : closeAction === "open"
            ? t("ticketsManager.confirmationModal.closeOpenTitle")
            : closeAction === "groups"
            ? t("ticketsManager.confirmationModal.closeGroupsTitle")
            : t("ticketsManager.confirmationModal.closePendingTitle")
        }
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleConfirmClose}
      >
        {closeAction === "all"
          ? t("ticketsManager.confirmationModal.closeAllMessage")
          : closeAction === "open"
          ? t("ticketsManager.confirmationModal.closeOpenMessage")
          : closeAction === "groups"
          ? t("ticketsManager.confirmationModal.closeGroupsMessage")
          : t("ticketsManager.confirmationModal.closePendingMessage")}
      </ConfirmationModal>
      <SearchContainerStyled elevation={0}>
        <SearchIconStyled />
        <SearchInputStyled
          type="text"
          placeholder={t("tickets.search.placeholder")}
          value={searchParam}
          onChange={handleSearch}
        />
        <Tooltip title={t("ticketsManager.buttons.newTicket")} arrow placement="top">
          <ActionButton 
            color="primary"
            onClick={() => setNewTicketModalOpen(true)}
          >
            <Add fontSize="small" />
          </ActionButton>
        </Tooltip>
      </SearchContainerStyled>
      <TabsHeaderStyled elevation={0}>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="ticket tabs"
        >          
          <Tab
            value={"open"}
            icon={
              <StyledBadge
                badgeContent={openCount}
                overlap="circular"
                max={999}
                color="secondary"
              >
                <Tooltip title={t("tickets.tabs.open.title")} placement="top" arrow>
                  <MoveToInbox />
                </Tooltip>
              </StyledBadge>
            }
            sx={{ minWidth: 100, width: "auto" }}
          />
          <Tab
            value={"groups"}
            icon={
              <StyledBadge
                badgeContent={openGroupsCount}
                overlap="circular"
                max={999}
                color="secondary"
              >
                <Tooltip title={t("tickets.tabs.groups.title")} placement="top" arrow>
                  <Group />
                </Tooltip>
              </StyledBadge>
            }
            sx={{ minWidth: 100, width: "auto" }}
          /> 
          {canTabsSettings("tabsPending") && (         
            <Tab
              value={"pending"}
              icon={
                <StyledBadge
                  badgeContent={pendingCount}
                  overlap="circular"
                  max={999}
                  color="secondary"
                >
                  <Tooltip title={t("tickets.tabs.pending.title")} placement="top" arrow>
                    <HourglassEmptyRounded />
                  </Tooltip>
                </StyledBadge>
              }
              sx={{ minWidth: 100, width: "auto" }}
            />
          )}
          {canTabsSettings("tabsClosed") && (
            <Tab
              value={"closed"}
              icon={
                <StyledBadge
                  badgeContent={closedCount}
                  overlap="circular"
                  max={999}
                  color="secondary"
                >
                  <Tooltip title={t("tickets.tabs.closed.title")} placement="top" arrow>
                    <CheckCircle />
                  </Tooltip>
                </StyledBadge>
              }  
              sx={{ minWidth: 100, width: "auto" }}
            />
          )}
        </Tabs>  
      </TabsHeaderStyled>
      <TicketOptionsBoxStyled elevation={0}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {user?.profile?.toUpperCase() === "ADMIN" && (
            <Tooltip title={t("ticketsManager.buttons.closed")} placement="top" arrow>
              <ActionButton
                onClick={(event) => setAnchorEl(event.currentTarget)}
                sx={{
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <Close fontSize="small" />
              </ActionButton>
            </Tooltip>
          )}
          <Tooltip title={t("ticketsManager.buttons.refresh")} placement="top" arrow>
            <ActionButton
              onClick={() => {
                setTab(tab => tab === "open" ? "pending" : "open");
                setTimeout(() => setTab("open"), 100);
              }}
              sx={{
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <Refresh fontSize="small" />
            </ActionButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              elevation: 2,
              sx: {
                borderRadius: theme.shape.borderRadius,
                minWidth: "180px",
                padding: "4px 0",
                backgroundColor: theme.palette.background.paper,
                "& .MuiMenuItem-root": {
                  padding: "8px 16px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                },
              },
            }}
          >
            <MenuItem onClick={() => handleOpenConfirmation("all")}>{t("ticketsManager.menu.all")}</MenuItem>
            <MenuItem onClick={() => handleOpenConfirmation("open")}>{t("ticketsManager.menu.open")}</MenuItem>
            <MenuItem onClick={() => handleOpenConfirmation("groups")}>{t("ticketsManager.menu.groups")}</MenuItem>
            <MenuItem onClick={() => handleOpenConfirmation("pending")}>{t("ticketsManager.menu.pending")}</MenuItem>
          </Menu>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Can
            role={user?.profile || ""}
            perform="tickets-manager:showall"
            yes={() => (
              <FormControlLabel
                label={isMobile ? "" : t("tickets.buttons.showAll")}
                labelPlacement="start"
                control={
                  <Switch
                    size="small"
                    checked={showAllTickets}
                    onChange={() =>
                      setShowAllTickets((prevState) => !prevState)
                    }
                    name="showAllTickets"
                    color="primary"
                  />
                }
                sx={{ marginRight: 2 }}
              />
            )}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Canais" placement="top" arrow>
              <ActionButton
                onClick={(event) => setChannelMenuAnchorEl(event.currentTarget)}
                sx={{
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <SyncAlt fontSize="small" />
              </ActionButton>
            </Tooltip>
            <Menu
              anchorEl={channelMenuAnchorEl}
              keepMounted
              open={Boolean(channelMenuAnchorEl)}
              onClose={() => setChannelMenuAnchorEl(null)}
              PaperProps={{
                elevation: 3,
                sx: {
                  borderRadius: theme.shape.borderRadius,
                  minWidth: "280px",
                  padding: "4px",
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: theme.shadows[3],
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'visible',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: theme.palette.background.paper,
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    borderTop: `1px solid ${theme.palette.divider}`
                  }
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <ChannelMenuItems
                selectedChannelIds={selectedChannelIds}
                channels={whatsApps}
                onChange={(values) => setSelectedChannelIds(values)}
                onClose={() => setChannelMenuAnchorEl(null)}
              />
            </Menu>

            <Tooltip title={t("tickets.buttons.queues")} placement="top" arrow>
              <ActionButton
                onClick={(event) => setFilterMenuAnchorEl(event.currentTarget)}
                sx={{
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <AccountTreeOutlined fontSize="small" />
              </ActionButton>
            </Tooltip>
            <Menu
              anchorEl={filterMenuAnchorEl}
              keepMounted
              open={Boolean(filterMenuAnchorEl)}
              onClose={() => setFilterMenuAnchorEl(null)}
              PaperProps={{
                elevation: 3,
                sx: {
                  borderRadius: theme.shape.borderRadius,
                  minWidth: "220px",
                  padding: "4px",
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: theme.shadows[3],
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'visible',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: theme.palette.background.paper,
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    borderTop: `1px solid ${theme.palette.divider}`
                  }
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <QueueMenuItems
                selectedQueueIds={selectedQueueIds}
                userQueues={user?.queues}
                onChange={(values) => setSelectedQueueIds(values)}
                onClose={() => setFilterMenuAnchorEl(null)}
              />
            </Menu>
          </Box>
        </Box>
      </TicketOptionsBoxStyled>
      <TabPanelStyled value={tab} name="open">
        <TicketsList
          status="open"
          showAll={showAllTickets}
          selectedQueueIds={selectedQueueIds}
          selectedChannelIds={selectedChannelIds}
          updateCount={(val) => setOpenCount(val)}
          isGroup={false}
        />
      </TabPanelStyled>
      <TabPanelStyled value={tab} name="groups">
        <TicketsList
          status="open"
          showAll={showAllTickets}
          selectedQueueIds={selectedQueueIds}
          selectedChannelIds={selectedChannelIds}
          updateCount={(val) => setOpenGroupsCount(val)}
          isGroup={true}
        />
      </TabPanelStyled>
      <TabPanelStyled value={tab} name="pending">
        <TicketsList
          status="pending"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
          selectedChannelIds={selectedChannelIds}
          updateCount={(val) => setPendingCount(val)}
        />
      </TabPanelStyled>
      <TabPanelStyled value={tab} name="closed">
        <TicketsList
          status="closed"
          showAll={showAllTickets}
          selectedQueueIds={selectedQueueIds}
          selectedChannelIds={selectedChannelIds}
          updateCount={(val) => setClosedCount(val)}
        />
      </TabPanelStyled>
      <TabPanelStyled value={tab} name="search">
        <TicketsList
          searchParam={searchParam}
          showAll={true}
          selectedQueueIds={selectedQueueIds}
          selectedChannelIds={selectedChannelIds}
        />
      </TabPanelStyled>
    </TicketWrapperStyled>
  );
};

export default TicketsManager;