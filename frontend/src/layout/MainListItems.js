import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import {
  Badge,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader
} from "@mui/material";
import { styled } from "@mui/material/styles";

import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import Code from "@mui/icons-material/Code";
import ContactPhoneOutlined from "@mui/icons-material/ContactPhoneOutlined";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import LocalOffer from "@mui/icons-material/LocalOffer";
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
import { useTranslation } from "react-i18next";
import { Can } from "../components/Can";
import { AuthContext } from "../context/Auth/AuthContext";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";

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
  background: 'none',
  fontWeight: 700,
  fontSize: '1rem',
  color: theme.palette.text.primary,
  lineHeight: '28px',
  padding: theme.spacing(0.5, 2, 0.5, 2),
  letterSpacing: '0.5px',
  textAlign: 'center',
}));

const DividerStyled = styled(Divider)(({ theme }) => ({
  backgroundColor: theme.palette.divider,
  margin: theme.spacing(0.5, 0),
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
  const { icon, primary, to, active, drawerClose } = props;

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
        }}
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

const MainListItems = (props) => {
  const { drawerClose } = props;
  const location = useLocation();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const { t } = useTranslation();

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

  return (
    <div onClick={drawerClose ? drawerClose : undefined}>

      <DividerStyled />
        <SubheaderStyled inset>
          {t("mainDrawer.listItems.general")}
        </SubheaderStyled>
      <DividerStyled />
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
      <ListItemLink
        to="/contacts"
        primary={t("mainDrawer.listItems.contacts")}
        icon={<ContactPhoneOutlined />}
        active={location.pathname === '/contacts'}
        drawerClose={drawerClose}
      />
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
                to="/connections"
                primary={t("mainDrawer.listItems.connections")}
                icon={
                  <StyledBadge badgeContent={connectionWarning ? "!" : 0} color="error" overlap="rectangular">
                    <SyncAlt />
                  </StyledBadge>
                }
                active={location.pathname === '/connections'}
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
                to="/queues"
                primary={t("mainDrawer.listItems.queues")}
                icon={<AccountTreeOutlined />}
                active={location.pathname === '/queues'}
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
                to="/api"
                primary={t("mainDrawer.listItems.api")}
                icon={<Code />}
                active={location.pathname === '/api'}
                drawerClose={drawerClose}
              />
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
              <DividerStyled />
              <SubheaderStyled inset>
                {t("mainDrawer.listItems.system")}
              </SubheaderStyled>
              <DividerStyled />
              <ListItemLink
                to="/errorLogs"
                primary={t("mainDrawer.listItems.errorLogs")}
                icon={<BugReportOutlined />}
                active={location.pathname === '/errorLogs'}
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
                to="/memoryUsage"
                primary={t("mainDrawer.listItems.memoryUsage")}
                icon={<MemoryIcon />}
                active={location.pathname === '/memoryUsage'}
                drawerClose={drawerClose}
              />
              <ListItemLink
                to="/cpuUsage"
                primary={t("mainDrawer.listItems.cpuUsage")}
                icon={<CpuIcon />}
                active={location.pathname === '/cpuUsage'}
                drawerClose={drawerClose}
              />
            </>
          )}
        />
      )}
    </div>
  );
};

export default MainListItems;
