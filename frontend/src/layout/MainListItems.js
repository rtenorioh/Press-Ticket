import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import {
  Badge,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Collapse
} from "@mui/material";
import { styled } from "@mui/material/styles";

import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import Code from "@mui/icons-material/Code";
import ContactPhoneOutlined from "@mui/icons-material/ContactPhoneOutlined";
import BlockIcon from "@mui/icons-material/Block";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import LocalOffer from "@mui/icons-material/LocalOffer";
import LabelOutlined from "@mui/icons-material/LabelOutlined";
import MenuBook from "@mui/icons-material/MenuBook";
import MemoryIcon from '@mui/icons-material/Memory';
import CpuIcon from '@mui/icons-material/DeveloperBoard';
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import QuestionAnswerOutlined from "@mui/icons-material/QuestionAnswerOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import SyncAlt from "@mui/icons-material/SyncAlt";
import StorageIcon from "@mui/icons-material/Storage";
import VpnKeyRounded from "@mui/icons-material/VpnKeyRounded";
import WhatsApp from "@mui/icons-material/WhatsApp";
import BugReportOutlined from "@mui/icons-material/BugReportOutlined";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import SystemUpdateIcon from "@mui/icons-material/SystemUpdate";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import DatabaseIcon from "@mui/icons-material/Storage";
import BackupIcon from "@mui/icons-material/Backup";
import HistoryIcon from "@mui/icons-material/History";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import QueueIcon from "@mui/icons-material/Queue";
import QueueMonitorIcon from '@mui/icons-material/Assessment';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SystemHealthIcon from '@mui/icons-material/HealthAndSafety';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import GroupIcon from '@mui/icons-material/Group';
import { useTranslation } from "react-i18next";
import { Can } from "../components/Can";
import { AuthContext } from "../context/Auth/AuthContext";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import api from "../services/api";

const IconStyled = styled(ListItemIcon)(({ theme, active }) => ({
  color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
  minWidth: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.2s',
}));

const ListItemStyled = styled('li')(({ theme }) => ({
  background: 'none',
  padding: 0,
  margin: 0,
  width: '100%',
  paddingRight: theme.spacing(2),
}));

const SubheaderStyled = styled(ListSubheader)(({ theme }) => ({
  background: theme.palette.background.paper,
  fontWeight: 700,
  fontSize: '1rem',
  color: theme.palette.primary.main,
  lineHeight: '28px',
  padding: theme.spacing(1, 2),
  letterSpacing: '0.5px',
  textAlign: 'center',
  position: 'sticky',
  top: 0,
  zIndex: 10,
  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'inherit',
    zIndex: -1,
  }
}));

const DividerStyled = styled(Divider)(({ theme }) => ({
  backgroundColor: theme.palette.divider,
  margin: theme.spacing(0.5, 2),
  opacity: 0.6,
}));

const ActiveItemStyled = styled(ListItem)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: 10,
  boxShadow: '0 2px 8px 0 rgba(80, 80, 160, 0.09)',
  margin: theme.spacing(0.5, 1, 0.5, 1),
  transition: 'background 0.2s, color 0.2s',
  '& .MuiListItemIcon-root': {
    color: theme.palette.primary.contrastText,
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-dot': {
    backgroundColor: theme.palette.error.main || "#F44336",
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, active, drawerClose, sx: customSx, ...rest } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  const ItemComponent = active ? ActiveItemStyled : ListItem;

  return (
    <ListItemStyled>
      <ItemComponent 
        button 
        component={renderLink} 
        onClick={drawerClose}
        sx={{
          py: 0.5,
          minHeight: '44px',
          borderRadius: 10,
          mx: 1,
          my: 0.5,
          px: 1.5,
          color: active ? 'primary.contrastText' : 'text.primary',
          '&:hover': {
            background: (theme) => theme.palette.action.hover,
            color: (theme) => theme.palette.primary.main,
            '& .MuiListItemIcon-root': {
              color: (theme) => theme.palette.primary.main,
            },
          },
          ...customSx,
        }}
        {...rest}
      >
        {icon ? <IconStyled active={active ? 1 : 0}>{icon}</IconStyled> : null}
        <ListItemText 
          primary={primary}
          primaryTypographyProps={{ fontSize: '1rem', fontWeight: active ? 700 : 500, letterSpacing: '0.01em' }}
        />
      </ItemComponent>
    </ListItemStyled>
  );
}

function ListItemLinkWithDropdown(props) {
  const { icon, primary, to, active, drawerClose, open, onToggle, children } = props;
  const navigate = (e) => {
    // Navega para a página
    window.location.href = to;
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  const ItemComponent = active ? ActiveItemStyled : ListItem;

  return (
    <>
      <ListItemStyled>
        <ItemComponent 
          button 
          onClick={navigate}
          sx={{
            py: 0.5,
            minHeight: '44px',
            borderRadius: 10,
            mx: 1,
            my: 0.5,
            px: 1.5,
            color: active ? 'primary.contrastText' : 'text.primary',
            '&:hover': {
              background: (theme) => theme.palette.action.hover,
              color: (theme) => theme.palette.primary.main,
              '& .MuiListItemIcon-root': {
                color: (theme) => theme.palette.primary.main,
              },
            },
          }}
        >
          {icon ? <IconStyled active={active ? 1 : 0}>{icon}</IconStyled> : null}
          <ListItemText 
            primary={primary}
            primaryTypographyProps={{ fontSize: '1rem', fontWeight: active ? 700 : 500, letterSpacing: '0.01em' }}
          />
          <IconStyled 
            active={0} 
            onClick={handleClick}
            sx={{ 
              minWidth: 'auto',
              cursor: 'pointer',
              '&:hover': {
                color: (theme) => theme.palette.primary.main,
              }
            }}
          >
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconStyled>
        </ItemComponent>
      </ListItemStyled>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </>
  );
}

const MainListItems = (props) => {
  const { drawerClose } = props;
  const location = useLocation();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [systemWarning, setSystemWarning] = useState(false);
  const [libWarning, setLibWarning] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const { t } = useTranslation();

  // Abrir dropdown de Contatos se estiver na página de bloqueados (apenas para admin)
  useEffect(() => {
    if (location.pathname === '/blocked-contacts' && user?.profile?.toUpperCase() === "ADMIN") {
      setContactsOpen(true);
    }
  }, [location.pathname, user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  useEffect(() => {
    if (user?.profile?.toUpperCase() !== "MASTERADMIN") {
      return;
    }

    const checkVersion = async () => {
      try {
        const { data } = await api.get("/version");
        if (data) {
          setSystemWarning(!!data.needsUpdate);
          setLibWarning(!!data.whatsappLibNeedsUpdate);
        } else {
          setSystemWarning(false);
          setLibWarning(false);
        }
      } catch (err) {
        setSystemWarning(false);
        setLibWarning(false);
      }
    };
    
    checkVersion();
    
    const interval = setInterval(checkVersion, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div onClick={drawerClose ? drawerClose : undefined}>

      <DividerStyled />
        <SubheaderStyled inset>
          {t("mainDrawer.listItems.general")}
        </SubheaderStyled>
      <DividerStyled />
      <ListItemLink
        to="/documentation"
        primary={t("documentation.menuItem")}
        icon={<HelpOutlineIcon />}
        active={location.pathname === '/documentation'}
        drawerClose={drawerClose}
      />
      <ListItemLink
        to="/"
        primary="Dashboard"
        icon={<DashboardOutlined />}
        active={location.pathname === '/'}
        drawerClose={drawerClose}
      />
      <ListItemLink
        to="/tickets"
        primary={t("mainDrawer.listItems.tickets")}
        icon={<WhatsApp />}
        active={location.pathname === '/tickets'}
        drawerClose={drawerClose}
      />
      <ListItemLinkWithDropdown
        to="/contacts"
        primary={t("mainDrawer.listItems.contacts")}
        icon={<ContactPhoneOutlined />}
        active={location.pathname === '/contacts' || location.pathname === '/blocked-contacts'}
        drawerClose={drawerClose}
        open={contactsOpen}
        onToggle={() => setContactsOpen(!contactsOpen)}
      >
        {user?.profile?.toUpperCase() === "ADMIN" && (
          <ListItemLink
            to="/blocked-contacts"
            primary={t("mainDrawer.listItems.blockedContacts")}
            icon={<BlockIcon />}
            active={location.pathname === '/blocked-contacts'}
            drawerClose={drawerClose}
            sx={{ pl: 6 }}
          />
        )}
      </ListItemLinkWithDropdown>
      <ListItemLink
        to="/quickAnswers"
        primary={t("mainDrawer.listItems.quickAnswers")}
        icon={<QuestionAnswerOutlined />}
        active={location.pathname === '/quickAnswers'}
        drawerClose={drawerClose}
      />
      <ListItemLink
        to="/tags"
        primary={t("mainDrawer.listItems.tags")}
        icon={<LocalOffer />}
        active={location.pathname === '/tags'}
        drawerClose={drawerClose}
      />
      <ListItemLink
        to="/ClientStatus"
        primary={t("mainDrawer.listItems.clientStatus")}
        icon={<LabelOutlined />}
        active={location.pathname === '/ClientStatus'}
        drawerClose={drawerClose}
      />
      <ListItemLink
        to="/videos"
        primary={t("mainDrawer.listItems.videos")}
        icon={<VideoLibraryIcon />}
        active={location.pathname === '/videos'}
        drawerClose={drawerClose}
      />
      {user?.profile && (
        <Can
          role={user?.profile}
          perform="drawer-admin-items:view"
          yes={() => (
            <>
              <DividerStyled />
                <SubheaderStyled inset>
                  {t("mainDrawer.listItems.administration")}
                </SubheaderStyled>
              <DividerStyled />
              <ListItemLink
                to="/queues"
                primary={t("mainDrawer.listItems.queues")}
                icon={<AccountTreeOutlined />}
                active={location.pathname === '/queues'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="/channels"
                primary={t("mainDrawer.listItems.channels")}
                icon={
                  <StyledBadge badgeContent={connectionWarning ? "!" : 0} color="error" overlap="rectangular">
                    <SyncAlt />
                  </StyledBadge>
                }
                active={location.pathname === '/channels'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="/users"
                primary={t("mainDrawer.listItems.users")}
                icon={<PeopleAltOutlined />}
                active={location.pathname === '/users'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="/group-management"
                primary={t("mainDrawer.listItems.groups")}
                icon={<GroupIcon />}
                active={location.pathname === '/group-management'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="queue-monitor"
                primary={t("mainDrawer.listItems.queueMonitor")}
                icon={<QueueMonitorIcon />}
                active={location.pathname === '/queue-monitor'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="user-monitor"
                primary={t("mainDrawer.listItems.userMonitor")}
                icon={<PeopleAltIcon />}
                active={location.pathname === '/user-monitor'}
                drawerClose={drawerClose}
              />  
              <ListItemLink
                to="/settings"
                primary={t("mainDrawer.listItems.settings")}
                icon={<SettingsOutlined />}
                active={location.pathname === '/settings'}
                drawerClose={drawerClose}
              />                          
              <DividerStyled />
              <SubheaderStyled inset>
                {t("mainDrawer.listItems.apititle")}
              </SubheaderStyled>
              <DividerStyled />
              <ListItemLink
                to="/apidocs"
                primary={t("mainDrawer.listItems.apidocs")}
                icon={<MenuBook />}
                active={location.pathname === '/apidocs'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="/apikey"
                primary={t("mainDrawer.listItems.apikey")}
                icon={<VpnKeyRounded />}
                active={location.pathname === '/apikey'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="/api"
                primary={t("mainDrawer.listItems.api")}
                icon={<Code />}
                active={location.pathname === '/api'}
                drawerClose={drawerClose}
              />             
              <DividerStyled />
              <SubheaderStyled inset>
                {t("mainDrawer.listItems.system")}
              </SubheaderStyled>
              <DividerStyled />
              <ListItemLink
                to="/memoryUsage"
                primary={t("mainDrawer.listItems.memoryUsage")}
                icon={<MemoryIcon />}
                active={location.pathname === '/memoryUsage'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="cpuUsage"
                primary={t("mainDrawer.listItems.cpuUsage")}
                icon={<CpuIcon />}
                active={location.pathname === '/cpuUsage'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="/diskSpace"
                primary={t("mainDrawer.listItems.diskSpace")}
                icon={<StorageIcon />}
                active={location.pathname === '/diskSpace'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="databaseStatus"
                primary={t("mainDrawer.listItems.databaseStatus")}
                icon={<DatabaseIcon />}
                active={location.pathname === '/databaseStatus'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="/health-check"
                primary="Monitoramento"
                icon={<MonitorHeartIcon />}
                active={location.pathname === '/health-check'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="network-status"
                primary={t("mainDrawer.listItems.networkStatus")}
                icon={<NetworkCheckIcon />}
                active={location.pathname === '/network-status'}
                drawerClose={drawerClose}
              />
              <DividerStyled />
              <SubheaderStyled inset>
                {t("mainDrawer.listItems.maintenance")}
              </SubheaderStyled>
              <DividerStyled />
              <ListItemLink
                to="backup"
                primary={t("mainDrawer.listItems.backup")}
                icon={<BackupIcon />}
                active={location.pathname === '/backup'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="/errorLogs"
                primary={t("mainDrawer.listItems.errorLogs")}
                icon={<BugReportOutlined />}
                active={location.pathname === '/errorLogs'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="activity-logs"
                primary={t("mainDrawer.listItems.activityLogs")}
                icon={<HistoryIcon />}
                active={location.pathname === '/activity-logs'}
                drawerClose={drawerClose}
              />
              {user?.profile?.toUpperCase() === "MASTERADMIN" && (
                <>
                  <ListItemLink
                    to="system-update"
                    primary={t("mainDrawer.listItems.systemUpdate")}
                    icon={
                      <StyledBadge badgeContent={systemWarning ? "!" : 0} color="error" overlap="rectangular">
                        <SystemUpdateAltIcon />
                      </StyledBadge>
                    }
                    active={location.pathname === '/system-update'}
                    drawerClose={drawerClose}
                  />
                  <ListItemLink
                    to="versionCheck"
                    primary={t("mainDrawer.listItems.versionCheck")}
                    icon={
                      <StyledBadge badgeContent={libWarning ? "!" : 0} color="error" overlap="rectangular">
                        <SystemUpdateIcon />
                      </StyledBadge>
                    }
                    active={location.pathname === '/versionCheck'}
                    drawerClose={drawerClose}
                  />
                </>
              )}
            </>
          )}
        />
      )}
    </div>
  );
};

export default MainListItems;
