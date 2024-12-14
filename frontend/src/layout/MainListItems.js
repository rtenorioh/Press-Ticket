import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
  Badge,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  makeStyles
} from "@material-ui/core";

import {
  AccountTreeOutlined,
  Code,
  ContactPhoneOutlined,
  DashboardOutlined,
  DeveloperModeOutlined,
  LocalOffer,
  MenuBook,
  PeopleAltOutlined,
  QuestionAnswerOutlined,
  SettingsOutlined,
  SyncAlt,
  VpnKeyRounded,
  WhatsApp
} from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { Can } from "../components/Can";
import { AuthContext } from "../context/Auth/AuthContext";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.secondary.main,
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  li: {
    backgroundColor: theme.palette.menuItens.main || "#FFFFFF",
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
    },
  },
  sub: {
    backgroundColor: theme.palette.sub.main || "#F7F7F7",
    fontWeight: 600,
    fontSize: '1rem',
  },
  divider: {
    backgroundColor: theme.palette.divide.main || "#E0E0E0",
  },
  activeItem: {
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
    },
  },
  badge: {
    '& .MuiBadge-dot': {
      backgroundColor: theme.palette.error.main || "#F44336",
    },
  },
}));


function ListItemLink(props) {
  const { icon, primary, to, className, active } = props;
  const classes = useStyles();

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li className={className}>
      <ListItem button component={renderLink} className={active ? classes.activeItem : ''}>
        {icon ? <ListItemIcon className={classes.icon}>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const MainListItems = (props) => {
  const { drawerClose, location } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const classes = useStyles();
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
    <div onClick={drawerClose}>

      <Divider className={classes.divider} />
      <ListSubheader inset className={classes.sub}>
        {t("mainDrawer.listItems.general")}
      </ListSubheader>
      <Divider className={classes.divider} />
      <ListItemLink
        to="/"
        primary="Dashboard"
        icon={<DashboardOutlined />}
        active={location.pathname === '/'}
      />
      <ListItemLink
        to="/tickets"
        primary={t("mainDrawer.listItems.tickets")}
        icon={<WhatsApp />}
        active={location.pathname === '/tickets'}
      />
      <ListItemLink
        to="/contacts"
        primary={t("mainDrawer.listItems.contacts")}
        icon={<ContactPhoneOutlined />}
        active={location.pathname === '/contacts'}
      />
      <ListItemLink
        to="/quickAnswers"
        primary={t("mainDrawer.listItems.quickAnswers")}
        icon={<QuestionAnswerOutlined />}
        active={location.pathname === '/quickAnswers'}
      />
      <ListItemLink
        to="/tags"
        primary={t("mainDrawer.listItems.tags")}
        icon={<LocalOffer />}
        active={location.pathname === '/tags'}
      />
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider className={classes.divider} />
            <ListSubheader inset className={classes.sub}>
              {t("mainDrawer.listItems.administration")}
            </ListSubheader>
            <Divider className={classes.divider} />
            <ListItemLink
              to="/connections"
              primary={t("mainDrawer.listItems.connections")}
              icon={
                <Badge badgeContent={connectionWarning ? "!" : 0} color="error" overlap="rectangular" className={classes.badge}>
                  <SyncAlt />
                </Badge>
              }
              active={location.pathname === '/connections'}
            />
            <ListItemLink
              to="/users"
              primary={t("mainDrawer.listItems.users")}
              icon={<PeopleAltOutlined />}
              active={location.pathname === '/users'}
            />
            <ListItemLink
              to="/queues"
              primary={t("mainDrawer.listItems.queues")}
              icon={<AccountTreeOutlined />}
              active={location.pathname === '/queues'}
            />
            <ListItemLink
              to="/Integrations"
              primary={t("mainDrawer.listItems.integrations")}
              icon={<DeveloperModeOutlined />}
              active={location.pathname === '/Integrations'}
            />
            <ListItemLink
              to="/settings"
              primary={t("mainDrawer.listItems.settings")}
              icon={<SettingsOutlined />}
              active={location.pathname === '/settings'}
            />
            <Divider className={classes.divider} />
            <ListSubheader inset className={classes.sub}>
              {t("mainDrawer.listItems.apititle")}
            </ListSubheader>
            <Divider className={classes.divider} />
            <ListItemLink
              to="/api"
              primary={t("mainDrawer.listItems.api")}
              icon={<Code />}
              active={location.pathname === '/api'}
            />
            <ListItemLink
              to="/apidocs"
              primary={t("mainDrawer.listItems.apidocs")}
              icon={<MenuBook />}
              active={location.pathname === '/apidocs'}
            />
            <ListItemLink
              to="/apikey"
              primary={t("mainDrawer.listItems.apikey")}
              icon={<VpnKeyRounded />}
              active={location.pathname === '/apikey'}
            />
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;
