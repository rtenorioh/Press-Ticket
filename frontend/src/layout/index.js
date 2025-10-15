import AppBar from '@mui/material/AppBar';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';  
import AccountCircle from '@mui/icons-material/AccountCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
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

const drawerWidth = 350;

const Root = styled('div')(({ theme }) => ({
  display: "flex",
  height: "100vh",
  [theme.breakpoints.down("sm")]: {
    height: "calc(100vh - 56px)",
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  paddingRight: 24,
  color: "#ffffff",
  background: theme.palette?.primary?.main || "#6B62FE",
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

const ToolbarIcon = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 8px",
  minHeight: "40px",
  backgroundColor: theme.palette.background.paper,
}));

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const MenuButton = styled(IconButton)(({ theme, hidden }) => ({
  marginRight: theme.spacing(2),
  borderRadius: 8,
  padding: theme.spacing(1),
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  ...(hidden && {
    display: "none",
  }),
}));

const Title = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  fontWeight: 500,
  marginLeft: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '40vw',
  },
}));

const AppBarSpacer = styled('div')(({ theme }) => ({
  minHeight: "15px",
}));

const Content = styled('main')(({ theme }) => ({
  flex: 1,
  overflow: "auto",
  marginTop: theme.spacing(6),
}));

const LoggedInLayout = ({ children, toggleTheme, onThemeConfigUpdate }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const themeStorage = localStorage.getItem("theme");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [companyData, setCompanyData] = useState({
    logo: defaultLogo,
    name: "Press Ticket®",
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
              name: lightConfig.company || "Press Ticket®",
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
        if (!(err && err.message && err.message.includes('Network Error'))) {
          toastError(err);
        }
      }
    };

    fetchLogo();
  }, [themeStorage, onThemeConfigUpdate]);

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
    setDrawerOpen(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Erro ao tentar entrar em tela cheia: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <Root>
      <Drawer
        variant="temporary"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          overflowX: 'hidden',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
          },
        }}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        <ToolbarIcon>
          <img alt="logo" src={getImageUrl(companyData.logo)} style={{ height: 35, marginBottom: 0, marginTop: 0, maxWidth: '70%', objectFit: 'contain' }} />
          <IconButton 
            color="secondary" 
            onClick={() => setDrawerOpen(false)}
            sx={{ 
              borderRadius: 1.5,
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } 
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </ToolbarIcon>
        <Divider sx={{ my: 0.5 }} />
        <List sx={{ py: 0.5, width: '100%', overflowX: 'hidden' }}>
          <MainListItems drawerClose={drawerClose} location={location} />
        </List>
        <Divider sx={{ my: 0.5 }} />
      </Drawer>
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />
      <StyledAppBar
        position="absolute"
        color={process.env.NODE_ENV === "development" ? "inherit" : "primary"}
      >
        <StyledToolbar variant="dense" >
          <MenuButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <MenuIcon />
          </MenuButton>
          <Title
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
          >
            {document.body.offsetWidth < 600 ? 
              companyData.name || "Press Ticket®" :
              `${t("mainDrawer.appBar.message.hi")} ${user?.name || "Visitante"}, ${t("mainDrawer.appBar.message.text")} ${companyData.name || "Press Ticket®"}.`
            }
          </Title>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tooltip title={isFullscreen ? t("mainDrawer.appBar.fullscreen.exit") : t("mainDrawer.appBar.fullscreen.enter")}>
              <IconButton
                onClick={toggleFullscreen}
                color="inherit"
                sx={{
                  borderRadius: '50%',
                  padding: 0.75,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
            <ThemeSelector toggleTheme={toggleTheme} />
            <LanguageSelector />
            {user?.id && <NotificationsPopOver />}
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{
                borderRadius: '50%',
                padding: 0.5,
                border: '2px solid rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <AccountCircle sx={{ fontSize: '28px' }} />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
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
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  minWidth: '180px',
                  overflow: 'visible',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                }
              }}
            >
              <MenuItem onClick={handleOpenUserModal} sx={{ py: 1.5, px: 2.5, borderRadius: 1, mx: 0.5, my: 0.5 }}>
                {t("mainDrawer.appBar.user.profile")}
              </MenuItem>
              <MenuItem onClick={handleClickLogout} sx={{ py: 1.5, px: 2.5, borderRadius: 1, mx: 0.5, my: 0.5 }}>
                {t("mainDrawer.appBar.user.logout")}
              </MenuItem>
            </Menu>
          </div>
        </StyledToolbar>
      </StyledAppBar>
      <Content>
        <AppBarSpacer />

        {children ? children : null}
      </Content>
    </Root>
  );
};

export default LoggedInLayout;