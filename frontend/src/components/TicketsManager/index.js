import {
  Badge,
  Button,
  FormControlLabel,
  Paper,
  Switch,
  Tab,
  Tabs,
  Tooltip,
  Menu,
  MenuItem
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  AddCircleOutline,
  CheckCircle,
  HighlightOffRounded,
  HourglassEmptyRounded,
  MoveToInbox,
  Search
} from "@mui/icons-material";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import NewTicketModal from "../NewTicketModal";
import TabPanel from "../TabPanel";
import TicketsList from "../TicketsList";
import TicketsQueueSelect from "../TicketsQueueSelect";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { toast } from "react-toastify";
import ConfirmationModal from "../ConfirmationModal";

const TicketWrapperStyled = styled(Paper)(({ theme }) => ({
  position: "relative",
  display: "flex",
  height: "100%",
  flexDirection: "column",
  overflow: "hidden",
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
}));

const TabPanelStyled = styled(TabPanel)(({ theme }) => ({
  position: "relative",
  display: "flex",
  height: "100%",
  flexDirection: "column",
  overflow: "hidden",
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
}));

  const SearchContainerStyled = styled(Paper)(({ theme }) => ({
    display: "flex",
    padding: "10px",
    borderBottom: "2px solid rgba(0, 0, 0, .12)",
  }));

  const SearchIconStyled = styled(Search)(({ theme }) => ({
    color: theme.palette.primary.main,
    marginLeft: 6,
    marginRight: 6,
    alignSelf: "center",
  }));
 
  const SearchInputStyled = styled("input")(theme => ({
    flex: 1,
    border: "none",
    borderRadius: 25,
    padding: "10px",
    outline: "none",
  }));

  const TabsHeaderStyled = styled(Paper)(({ theme }) => ({
    flex: "none",
    backgroundColor: theme.palette.background.default,
  }));

  const TicketOptionsBoxStyled = styled(Paper)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
  }));

const TicketsManager = () => {
  const { t } = useTranslation();
  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [closeAction, setCloseAction] = useState(null);
  const { user } = useContext(AuthContext);
  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [closedCount, setClosedCount] = useState(0);
  const userQueueIds = user?.queues?.map((q) => q.id);
  const [settings, setSettings] = useState([]);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

  useEffect(() => {
    if (user?.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const applyPanelStyle = (status) => {
    if (tab !== status) {
      return { width: 0, height: 0 };
    }
  };

  const handleCloseTickets = async (status) => {
    try {
      const { data } = await api.put(`/tickets/close-all?status=${status}`);
      setAnchorEl(null);
      
      if (status === "open") {
        setTab(tab => tab === "open" ? "pending" : "open");
        setTimeout(() => setTab("open"), 100);
      } else if (status === "pending") {
        setTab(tab => tab === "pending" ? "open" : "pending");
        setTimeout(() => setTab("pending"), 100);
      } else if (status === "all") {
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
      variant="outlined"
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
          : t("ticketsManager.confirmationModal.closePendingMessage")}
      </ConfirmationModal>
      <SearchContainerStyled elevation={0} square>
        <SearchIconStyled />
        <SearchInputStyled
          type="text"
          placeholder={t("tickets.search.placeholder")}
          value={searchParam}
          onChange={handleSearch}
        />
      </SearchContainerStyled>
      <TabsHeaderStyled elevation={0} square >
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
        >          
          <Tab
            value={"open"}
            icon={
              <Badge
                sx={{right: 0}}
                badgeContent={openCount}
                overlap="rectangular"
                max={999999}
                color="secondary"
              >
                <Tooltip title={t("tickets.tabs.open.title")} placement="top" arrow>
                  <MoveToInbox />
                </Tooltip>
              </Badge>
            }
            sx={{ minWidth: 120, width: 120 }}
          /> 
          {canTabsSettings("tabsPending") && (         
            <Tab
              value={"pending"}
              icon={
                <Badge
                  sx={{right: 0}}
                  badgeContent={pendingCount}
                  overlap="rectangular"
                  max={999999}
                  color="secondary"
                >
                  <Tooltip title={t("tickets.tabs.pending.title")} placement="top" arrow>
                    <HourglassEmptyRounded />
                  </Tooltip>
                </Badge>
              }
              sx={{ minWidth: 120, width: 120 }}
            />
          )}
          {canTabsSettings("tabsClosed") && (
            <Tab
              value={"closed"}
              icon={
                <Badge
                  sx={{right: 0}}
                  badgeContent={closedCount}
                  overlap="rectangular"
                  max={999999}
                  color="secondary"
                >
                  <Tooltip title={t("tickets.tabs.closed.title")} placement="top" arrow>
                    <CheckCircle />
                  </Tooltip>
                </Badge>
              }  
              sx={{ minWidth: 120, width: 120 }}
            />
          )}
        </Tabs>  
      </TabsHeaderStyled>
      <TicketOptionsBoxStyled square elevation={0}>
        <Tooltip title={t("ticketsManager.buttons.newTicket")} placement="top" arrow>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setNewTicketModalOpen(true)}
          >
            <AddCircleOutline />
          </Button>
        </Tooltip>
        <Tooltip title={t("ticketsManager.buttons.closed")} placement="top" arrow>
          <Button
            variant="outlined"
            color="primary"
            onClick={(event) => setAnchorEl(event.currentTarget)}
          >
            <HighlightOffRounded />
          </Button>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => handleOpenConfirmation("all")}>{t("ticketsManager.menu.all")}</MenuItem>
          <MenuItem onClick={() => handleOpenConfirmation("open")}>{t("ticketsManager.menu.open")}</MenuItem>
          <MenuItem onClick={() => handleOpenConfirmation("pending")}>{t("ticketsManager.menu.pending")}</MenuItem>
        </Menu>
        <Can
          role={user?.profile || ""}
          perform="tickets-manager:showall"
          yes={() => (
            <FormControlLabel
              label={t("tickets.buttons.showAll")}
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
            />
          )}
        />
        <TicketsQueueSelect
          sx={{ marginLeft: 6 }}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
      </TicketOptionsBoxStyled>
      <TabPanelStyled value={tab} name="open">
        <TicketWrapperStyled>
          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
          />
          <TicketsList
            status="pending"
            showAll={true}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
          />
          <TicketsList
            status="closed"
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setClosedCount(val)}
            style={applyPanelStyle("closed")}
          />
        </TicketWrapperStyled>
      </TabPanelStyled>
      <TabPanelStyled value={tab} name="pending">
        <TicketsList
          status="open"
          showAll={showAllTickets}
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setOpenCount(val)}
          style={applyPanelStyle("open")}
        />
        <TicketsList
          status="pending"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setPendingCount(val)}
          style={applyPanelStyle("pending")}
        />
      </TabPanelStyled>
      <TabPanelStyled value={tab} name="closed">
      <TicketsList
          status="open"
          showAll={showAllTickets}
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setOpenCount(val)}
          style={applyPanelStyle("open")}
        />
        <TicketsList
          status="pending"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setPendingCount(val)}
          style={applyPanelStyle("pending")}
        />
        <TicketsList
          status="closed"
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setClosedCount(val)}
          style={applyPanelStyle("closed")}
        />
      </TabPanelStyled>
      <TabPanelStyled value={tab} name="search">
        <TicketsList
          searchParam={searchParam}
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanelStyled>
    </TicketWrapperStyled>
  );
};

export default TicketsManager;