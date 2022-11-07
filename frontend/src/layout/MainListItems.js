import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
  Badge,
  Divider,
  Link,
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
  LocalOffer,
  MenuBook,
  PeopleAltOutlined,
  QuestionAnswerOutlined,
  SettingsOutlined,
  SyncAlt,
  VpnKeyRounded,
  WhatsApp
} from "@material-ui/icons";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { systemVersion } from "../../package.json";
import { system } from "../config.json";

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.secondary.main
  },
  li: {
    backgroundColor: theme.palette.menuItens.main
  },
  sub: {
    backgroundColor: theme.palette.sub.main
  },
  divider: {
    backgroundColor: theme.palette.divide.main
  },
  systemCss: {
    display: "flex",
    justifyContent: "center",
    opacity: 0.5,
    fontSize: 12
  }
}));

function ListItemLink(props) {
  const { icon, primary, to, className } = props;
  const classes = useStyles();

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li className={classes.li}>
      <ListItem button component={renderLink} className={className}>
        {icon ? <ListItemIcon className={classes.icon}>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const MainListItems = (props) => {
  const { drawerClose } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const classes = useStyles();

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
      <ListItemLink
        to="/"
        primary="Dashboard"
        icon={<DashboardOutlined />}
      />
      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<WhatsApp />}
      />
      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<ContactPhoneOutlined />}
      />
      <ListItemLink
        to="/quickAnswers"
        primary={i18n.t("mainDrawer.listItems.quickAnswers")}
        icon={<QuestionAnswerOutlined />}
      />
      <ListItemLink
        to="/tags"
        primary={i18n.t("mainDrawer.listItems.tags")}
        icon={<LocalOffer />}
      />
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider className={classes.divider}/>
            <ListSubheader inset className={classes.sub}>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>
            <ListItemLink
              to="/connections"
              primary={i18n.t("mainDrawer.listItems.connections")}
              icon={
                <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                  <SyncAlt />
                </Badge>
              }
            />
            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<PeopleAltOutlined />}
            />
            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<AccountTreeOutlined />}
            />
            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<SettingsOutlined />}
            />
            <Divider className={classes.divider} />
            <ListSubheader inset className={classes.sub}>
              {i18n.t("mainDrawer.listItems.apititle")}
            </ListSubheader>
            <ListItemLink
              to="/api"
              primary={i18n.t("mainDrawer.listItems.api")}
              icon={
                <Code />
              }
            />
            <ListItemLink
              to="/apidocs"
              primary={i18n.t("mainDrawer.listItems.apidocs")}
              icon={
                <MenuBook />
              }
            />
            <ListItemLink
              to="/apikey"
              primary={i18n.t("mainDrawer.listItems.apikey")}
              icon={
                <VpnKeyRounded />
              }
            />
          </>
        )}
      />
      <span className={classes.systemCss}>
        <Link color="inherit" href={system.url || "https://github.com/rtenorioh/Press-Ticket"}>
          v{systemVersion}
        </Link>
      </span>
    </div>
  );
};

export default MainListItems;