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
import { CheckCircle, Info } from "@material-ui/icons";
import AccountCircle from "@material-ui/icons/AccountCircle";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import MenuIcon from "@material-ui/icons/Menu";
import clsx from "clsx";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import defaultLogo from '../assets/logo.jpg';
import { getImageUrl } from '../helpers/imageHelper';
import BackdropLoading from "../components/BackdropLoading";
import LanguageSelector from "../components/LanguageSelector";
import NotificationsPopOver from "../components/NotificationsPopOver";
import ThemeSelector from '../components/ThemeSelector';
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import toastError from "../errors/toastError";
import api from "../services/api";
import openSocket from "../services/socket-io";
import MainListItems from "./MainListItems";

const systemVersion = "v1.13.2";

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
    background: theme.palette?.primary?.main || "#6B62FE",
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    minHeight: "48px",
    backgroundColor: theme.palette.background.paper,
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
    fontSize: 12,
  },
}));

const LoggedInLayout = ({ children, toggleTheme, onThemeConfigUpdate }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const location = useLocation();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const { user } = useContext(AuthContext);
  const [latestVersion, setLatestVersion] = useState("");
  const themeStorage = localStorage.getItem("theme");
  const [companyData, setCompanyData] = useState({
    logo: defaultLogo,
    name: "Press Ticket",
    url: "https://github.com/rtenorioh/Press-Ticket"
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const { data } = await api.get("/personalizations");

        if (data && data.length > 0) {

          const lightConfig = data.find(themeConfig => themeConfig.theme === "light");

          if (lightConfig) {
            setCompanyData(prevData => ({
              ...prevData,
              name: lightConfig.company || "Press Ticket",
              url: lightConfig.url || "https://github.com/rtenorioh/Press-Ticket"
            }));
          }
        }
      } catch (err) {
        toastError(err);
      }
    };

    const socket = openSocket();
    socket.on("personalization", data => {
      if (data.action === "update") {
        fetchCompanyData();
      }
    });

    fetchCompanyData();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await api.get("/personalizations");

        if (data && data.length > 0) {
          const lightConfig = data.find(themeConfig => themeConfig.theme === "light");
          const darkConfig = data.find(themeConfig => themeConfig.theme === "dark");

          if (themeStorage === "light" && lightConfig && lightConfig.logo) {
            setCompanyData(prevData => ({
              ...prevData,
              logo: lightConfig.logo
            }));
            onThemeConfigUpdate("light", { logo: lightConfig.logo });
          } else if (themeStorage === "dark" && darkConfig && darkConfig.logo) {
            setCompanyData(prevData => ({
              ...prevData,
              logo: darkConfig.logo
            }));
            onThemeConfigUpdate("dark", { logo: darkConfig.logo });
          } else {
            setCompanyData(prevData => ({
              ...prevData,
              logo: defaultLogo
            }));
          }
        }

      } catch (err) {
        toastError(err);
      }
    };

    fetchLogo();
  }, [themeStorage, onThemeConfigUpdate]);

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
          if (err.response && err.response.status === 403) {
            toastError("Acesso negado. Você não tem permissão para acessar esta configuração.");
          } else {
            setDrawerOpen(true);
            toastError(err);
          }
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
          <img alt="logo" src={getImageUrl(companyData.logo)} style={{ height: 50, marginBottom: 10, marginTop: 5 }} />
          <IconButton color="secondary" onClick={() => setDrawerOpen(!drawerOpen)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
          <MainListItems drawerClose={drawerClose} location={location} />
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
            {t("mainDrawer.appBar.message.hi")} {user.name}, {t("mainDrawer.appBar.message.text")} {companyData.name || "Press Ticket"}.
          </Typography>

          <ThemeSelector toggleTheme={toggleTheme} />

          <LanguageSelector />

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
                {t("mainDrawer.appBar.user.profile")}
              </MenuItem>
              <MenuItem onClick={handleClickLogout}>
                {t("mainDrawer.appBar.user.logout")}
              </MenuItem>
              <Divider />
              <span className={classes.systemCss}>
                <Link
                  color="inherit"
                  href={companyData.url || "https://github.com/rtenorioh/Press-Ticket"}
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