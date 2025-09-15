import CssBaseline from "@mui/material/CssBaseline";
import { ptBR } from "@mui/material/locale";
import { ThemeProvider } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { SocketProvider, useSocket } from './context/SocketContext';
import { ForwardingMessageProvider } from './context/ForwardingMessage';
import toastError from "./errors/toastError";
import Routes from "./routes";
import api from "./services/api";
import loadThemeConfig from "./themes/themeConfig";

const AppContent = () => {
  const [, setLocale] = useState(ptBR);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [lightThemeConfig, setLightThemeConfig] = useState({});
  const [darkThemeConfig, setDarkThemeConfig] = useState({});
  const { socket } = useSocket();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const onThemeConfigUpdate = (themeType, config) => {
    if (themeType === "light") {
      setLightThemeConfig(prevConfig => ({ ...prevConfig, ...config }));
    } else if (themeType === "dark") {
      setDarkThemeConfig(prevConfig => ({ ...prevConfig, ...config }));
    }
  };

  useEffect(() => {
    const fetchPersonalizations = async () => {
      try {
        const { data } = await api.get("/personalizations");
        if (data && data.length > 0) {
          const lightConfig = data.find((themeConfig) => themeConfig.theme === "light");
          const darkConfig = data.find((themeConfig) => themeConfig.theme === "dark");

          if (lightConfig) {
            setLightThemeConfig(lightConfig);
          }

          if (darkConfig) {
            setDarkThemeConfig(darkConfig);
          }
        }
      } catch (err) {
        toastError(err);
      }
    };

    if (socket) {
      socket.on("personalization", fetchPersonalizations);
      fetchPersonalizations();
    }

    return () => {
      if (socket) {
        socket.off("personalization");
      }
    };
  }, [socket]);

  useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng");
    const browserLocale =
      i18nlocale !== null ? i18nlocale : navigator.language.toLowerCase();

    if (browserLocale === "pt-br") {
      setLocale(ptBR);
    }
  }, []);

  const currentTheme = loadThemeConfig(
    theme,
    theme === "light" ? lightThemeConfig : darkThemeConfig
  );

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <ForwardingMessageProvider>
        <Routes toggleTheme={toggleTheme} onThemeConfigUpdate={onThemeConfigUpdate} currentTheme={theme} />
      </ForwardingMessageProvider>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
};

export default App;
