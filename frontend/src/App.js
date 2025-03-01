import { CssBaseline } from "@material-ui/core";
import { ptBR } from "@material-ui/core/locale";
import { ThemeProvider } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { SocketProvider, useSocket } from './context/SocketContext';
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
      <Routes toggleTheme={toggleTheme} currentTheme={theme} />
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
