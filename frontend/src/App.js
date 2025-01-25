import { CssBaseline } from "@material-ui/core";
import { ptBR } from "@material-ui/core/locale";
import { ThemeProvider } from "@material-ui/core/styles";
import React, { useCallback, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import toastError from "./errors/toastError";
import Routes from "./routes";
import api from "./services/api";
import openSocket from "./services/socket-io";
import loadThemeConfig from "./themes/themeConfig";
import { getImageUrl } from './helpers/imageHelper';

const App = () => {
  const [locale, setLocale] = useState(ptBR);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [lightThemeConfig, setLightThemeConfig] = useState({});
  const [darkThemeConfig, setDarkThemeConfig] = useState({});

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const onThemeConfigUpdate = useCallback((themeType, updatedConfig) => {
    if (themeType === "light") {
      setLightThemeConfig((prevConfig) => ({ ...prevConfig, ...updatedConfig }));
    } else if (themeType === "dark") {
      setDarkThemeConfig((prevConfig) => ({ ...prevConfig, ...updatedConfig }));
    }
  }, []);

  useEffect(() => {
    const fetchPersonalizations = async () => {
      try {
        const { data } = await api.get("/personalizations");

        if (data && data.length > 0) {
          const lightConfig = data.find((themeConfig) => themeConfig.theme === "light");
          const darkConfig = data.find((themeConfig) => themeConfig.theme === "dark");

          if (lightConfig) {
            setLightThemeConfig(lightConfig);
            document.title = lightConfig.company || "Press Ticket";
          }

          if (darkConfig) {
            setDarkThemeConfig(darkConfig);
          }
        }
      } catch (err) {
        toastError(err);
        document.title = "Erro ao carregar título";
      }
    };

    let socket = null;

    const initSocket = () => {
      try {
        socket = openSocket();
        if (socket) {
          socket.on("personalization", fetchPersonalizations);
          fetchPersonalizations();
        } else {
          console.warn("Socket não inicializado, carregando personalizações sem socket");
          fetchPersonalizations();
        }
      } catch (err) {
        console.error("Erro ao conectar socket:", err);
        toastError(err);
        fetchPersonalizations();
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      initSocket();
    } else {
      fetchPersonalizations();
    }

    return () => {
      if (socket) {
        socket.off("personalization");
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng");
    if (i18nlocale) {
      const browserLocale = i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);
      if (browserLocale === "ptBR") {
        setLocale(ptBR);
      }
    }
  }, []);

  useEffect(() => {
    const favicon = document.querySelector("link[rel*='icon']") || document.createElement("link");
    favicon.type = "image/x-icon";
    favicon.rel = "shortcut icon";

    const favico = theme === "dark" ? "favicoDark.ico" : "favico.ico";
    favicon.href = getImageUrl(favico);
    document.head.appendChild(favicon);
  }, [theme]);

  const selectedTheme = loadThemeConfig(
    theme,
    theme === "light" ? lightThemeConfig : darkThemeConfig,
    locale
  );

  return (
    <ThemeProvider theme={selectedTheme}>
      <Routes toggleTheme={toggleTheme} onThemeConfigUpdate={onThemeConfigUpdate} />
      <CssBaseline />
    </ThemeProvider>
  );
};

export default App;
