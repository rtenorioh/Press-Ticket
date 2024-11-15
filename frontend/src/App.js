import { CssBaseline } from "@material-ui/core";
import { ptBR } from "@material-ui/core/locale";
import { ThemeProvider } from "@material-ui/core/styles";
import React, { useEffect, useState } from 'react';
import "react-toastify/dist/ReactToastify.css";
import toastError from "./errors/toastError";
import Routes from "./routes";
import api from "./services/api";
import loadThemeConfig from './themes/themeConfig';

const App = () => {
  const [locale, setLocale] = useState(ptBR);
  const [theme, setTheme] = useState("light");
  const [lightThemeConfig, setLightThemeConfig] = useState({});
  const [darkThemeConfig, setDarkThemeConfig] = useState({});

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const onThemeConfigUpdate = (themeType, updatedConfig) => {
    if (themeType === "light") {
      setLightThemeConfig((prevConfig) => ({ ...prevConfig, ...updatedConfig }));
    } else if (themeType === "dark") {
      setDarkThemeConfig((prevConfig) => ({ ...prevConfig, ...updatedConfig }));
    }
  };

  useEffect(() => {
    const fetchThemeConfig = async () => {
      try {
        const { data } = await api.get("/personalizations");

        if (data && data.length > 0) {
          const lightConfig = data.find(themeConfig => themeConfig.theme === "light");
          const darkConfig = data.find(themeConfig => themeConfig.theme === "dark");

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

    fetchThemeConfig();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, [theme]);

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

    const faviconPath = theme === "dark" ? "/assets/favicoDark.ico" : "/assets/favico.ico";
    fetch(faviconPath, { method: "HEAD" })
      .then(response => {
        if (response.ok) {
          favicon.href = faviconPath;
        } else {
          favicon.href = "/favicon.ico";
        }
      })
      .catch(() => {
        favicon.href = "/favicon.ico";
      });

    document.head.appendChild(favicon);
  }, [theme]);

  const selectedTheme = loadThemeConfig(theme, theme === "light" ? lightThemeConfig : darkThemeConfig, locale);

  return (
    <ThemeProvider theme={selectedTheme}>
      <Routes toggleTheme={toggleTheme} onThemeConfigUpdate={onThemeConfigUpdate} />
      <CssBaseline />
    </ThemeProvider>
  );
};

export default App;
