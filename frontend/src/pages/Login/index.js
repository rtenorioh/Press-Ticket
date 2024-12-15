import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography
} from '@material-ui/core';

import { makeStyles } from "@material-ui/core/styles";
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { useTranslation } from "react-i18next";
import defaultLogo from '../../assets/logo.jpg';
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const PUBLIC_ASSET_PATH = '/assets/';

const Copyright = ({ companyName, companyUrl }) => {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      © {new Date().getFullYear()}
      {" - "}
      <Link color="inherit" href={companyUrl || "https://github.com/rtenorioh/Press-Ticket"}>
        {companyName || "Press Ticket"}
      </Link>
      {"."}
    </Typography>
  );
};

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const Login = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin } = useContext(AuthContext);
  const [theme, setTheme] = useState("light");
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

    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    fetchCompanyData();
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await api.get("/personalizations");

        if (data && data.length > 0) {
          const lightConfig = data.find(themeConfig => themeConfig.theme === "light");
          const darkConfig = data.find(themeConfig => themeConfig.theme === "dark");

          if (theme === "light" && lightConfig && lightConfig.logo) {
            setCompanyData(prevData => ({
              ...prevData,
              logo: PUBLIC_ASSET_PATH + lightConfig.logo
            }));
          } else if (theme === "dark" && darkConfig && darkConfig.logo) {
            setCompanyData(prevData => ({
              ...prevData,
              logo: PUBLIC_ASSET_PATH + darkConfig.logo
            }));
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
  }, [theme]);

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <img alt="logo" src={companyData.logo} style={{ height: 120, marginBottom: 20 }} />
        <Typography component="h1" variant="h5">
          {t("login.title")}
        </Typography>
        <form className={classes.form} noValidate onSubmit={handlSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label={t("login.form.email")}
            name="email"
            value={user.email}
            onChange={handleChangeInput}
            autoComplete="email"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label={t("login.form.password")}
            id="password"
            value={user.password}
            onChange={handleChangeInput}
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((e) => !e)}
                  >
                    {showPassword ? <VisibilityOff color="secondary" /> : <Visibility color="secondary" />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {t("login.buttons.submit")}
          </Button>
          <Grid container>
            <Grid item>
              <Link
                href="#"
                variant="body2"
                component={RouterLink}
                to="/signup"
              >
                {t("login.buttons.register")}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={5}><Copyright companyName={companyData.name} companyUrl={companyData.url} /></Box>
    </Container>
  );
};

export default Login;