import React, { useState, useEffect } from "react";
import Routes from "./routes";
import "react-toastify/dist/ReactToastify.css";

import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { ptBR } from "@material-ui/core/locale";

import {
  CssBaseline,
  Switch,
  FormGroup,
  FormControlLabel,
  makeStyles
} from "@material-ui/core";
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import lightBackground from "../src/assets/wa-background-light.png";
import darkBackground from "../src/assets/wa-background-dark.jpg";

const useStyles = makeStyles(() => ({
  switch: {
    margin: "2px",
    position: "absolute",
    right: "0",
  },
  visible: {
    display: "none",
  },
}));

const App = () => {
  const [locale, setLocale] = useState();
  const [checked, setChecked] = React.useState(false);
  const classes = useStyles();

  const lightTheme = createTheme(
    {
      scrollbarStyles: {
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#e8e8e8",
        },
      },
      palette: {
        primary: { main: "#2576d2" },
      },
      backgroundImage: `url(${lightBackground})`,
    },
    locale
  );

  const darkTheme = createTheme(
    {
      overrides: {
        MuiCssBaseline: {
          '@global': {
            body: {
              backgroundColor: "#080d14",
            }
          }
        }
      },
      scrollbarStyles: {
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#ffffff",
        },
      },
      palette: {
        primary: { main: "#d500f9" },
        secondary: { main: "#ff9100" },
        background: {
          default: "#080d14",
          paper: "#181d22",
        },
        text: {
          primary: "#d500f9",
          secondary: "#ffffff",
        },
      },
      backgroundImage: `url(${darkBackground})`,
    },
    locale
  );

  const [theme, setTheme] = useState("light");

  const themeToggle = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  const handleChange = (event) => {
    setChecked(event.target.checked);
    if (checked === false) {
      themeToggle();
    } else if (checked === true) {
      themeToggle();
    }
  };

  useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng");
    const browserLocale = i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

    if (browserLocale === "ptBR") {
      setLocale(ptBR);
    }
  }, []);

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <Routes />
      <CssBaseline />
      <FormGroup row className={classes.switch}>
        <FormControlLabel control={
          <Switch
            className={classes.visible}
            checked={checked}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        } label={theme === "light" ?
          <Brightness4Icon color="primary" /> :
          <Brightness7Icon color="primary" />
        }
        />
      </FormGroup>
    </ThemeProvider>
  );
};

export default App;
