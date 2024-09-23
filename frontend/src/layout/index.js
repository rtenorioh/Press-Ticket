import clsx from "clsx";
import React, { useContext, useEffect, useState } from "react";

import {
  AppBar,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  makeStyles,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography
} from "@material-ui/core";

import AccountCircle from "@material-ui/icons/AccountCircle";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import MenuIcon from "@material-ui/icons/Menu";

import BackdropLoading from "../components/BackdropLoading";
import NotificationsPopOver from "../components/NotificationsPopOver";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import { i18n } from "../translate/i18n";
import MainListItems from "./MainListItems";

import { CheckCircle, Info } from "@material-ui/icons";
import { systemVersion } from "../../package.json";
import logodash from "../assets/logo-dash.png";
import { system } from "../config.json";
import toastError from "../errors/toastError";
import api from "../services/api";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    [theme.breakpoints.down("sm")]: {
      height: "calc(100vh - 56px)",
    },
  },
  toolbar: {
    paddingRight: 24,
    color: "#ffffff",
    background: theme.palette.toolbar.main
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    minHeight: "48px",
    backgroundColor: theme.palette.toolbarIcon.main
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: {
    minHeight: "48px",
  },
  content: {
    flex: 1,
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  systemCss: {
    display: "flex",
    justifyContent: "center",
    fontSize: 12
  }
}));

const LoggedInLayout = ({ children }) => {
  const classes = useStyles();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const { user } = useContext(AuthContext);
  const [latestVersion, setLatestVersion] = useState("");

  useEffect(() => {
    const compareVersions = async () => {
      const latest = await fetchLatestRelease();

      if (latest) {
        setLatestVersion(latest);
        if (systemVersion < latest) {
          console.warn(`Uma nova versão está disponível: ${latest}. Atualize para a versão mais recente.`);
        }
      }
    };

    compareVersions();
  }, []);

  const fetchLatestRelease = async () => {
    try {
      const response = await fetch("https://api.github.com/repos/rtenorioh/Press-Ticket/releases/latest");
      const data = await response.json();
      return data.tag_name;
    } catch (error) {
      console.error("Erro ao buscar a versão mais recente no GitHub:", error);
      return null;
    }
  };

  useEffect(() => {

    if (document.body.offsetWidth > 600) {
      const fetchDrawerState = async () => {
        try {
          const { data } = await api.get("/settings");

          const settingIndex = data.filter(s => s.key === 'sideMenu');

          setDrawerOpen(settingIndex[0].value === "disabled" ? false : true);

        } catch (err) {
          setDrawerOpen(true);
          toastError(err);
        }
      };
      fetchDrawerState();
    }
  }, []);

  useEffect(() => {
    if (document.body.offsetWidth < 600) {
      setDrawerVariant("temporary");
    } else {
      setDrawerVariant("permanent");
    }
  }, [drawerOpen]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const drawerClose = () => {
    if (document.body.offsetWidth < 600) {
      setDrawerOpen(false);
    }
  };

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className={classes.root}>
      <Drawer
        variant={drawerVariant}
        className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !drawerOpen && classes.drawerPaperClose
          ),
        }}
        open={drawerOpen}
      >
        <div className={classes.toolbarIcon}>
          <img src={logodash} alt="logo" />
          <IconButton color="secondary" onClick={() => setDrawerOpen(!drawerOpen)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
          <MainListItems drawerClose={drawerClose} />
        </List>
        <Divider />
      </Drawer>
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}
        color={process.env.NODE_ENV === "development" ? "inherit" : "primary"}
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={clsx(
              classes.menuButton,
              drawerOpen && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            {i18n.t("mainDrawer.appBar.message.hi")} {user.name}, {i18n.t("mainDrawer.appBar.message.text")} {system.name || "Press Ticket"}
          </Typography>
          {user.id && <NotificationsPopOver />}

          <div>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={menuOpen}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleOpenUserModal}>
                {i18n.t("mainDrawer.appBar.user.profile")}
              </MenuItem>
              <MenuItem onClick={handleClickLogout}>
                {i18n.t("mainDrawer.appBar.user.logout")}
              </MenuItem>
              <Divider />
              <span className={classes.systemCss}>
                <Link
                  color="inherit"
                  href={system.url || "https://github.com/rtenorioh/Press-Ticket"}
                  style={{ display: "flex", alignItems: "center", marginTop: 10 }}
                >
                  {latestVersion && latestVersion > systemVersion ? (
                    <span style={{ color: "#eee8aa" }}>
                      <Tooltip title="Entrar em contato com o Suporte para solicitar Atualização!" arrow placement="left-start" >
                        <Info fontSize="small" />
                      </Tooltip>
                    </span>
                  ) : (
                    <span style={{ color: "green" }}>
                      <Tooltip title="Versão atualizada!" arrow placement="left-start" >
                        <CheckCircle fontSize="small" />
                      </Tooltip>
                    </span>
                  )}
                  <span style={{ marginLeft: "5px" }}>{systemVersion}</span>
                </Link>
              </span>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />

        {children ? children : null}
      </main>
    </div>
  );
};

export default LoggedInLayout;