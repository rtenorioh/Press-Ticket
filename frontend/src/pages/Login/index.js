import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { getImageUrl } from '../../helpers/imageHelper';
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const Copyright = ({ companyName, companyUrl }) => {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {new Date().getFullYear()}
      {" - "}
      <Link color="inherit" href={companyUrl || "https://github.com/rtenorioh/Press-Ticket"}>
        {companyName || "Press Ticket®"}
      </Link>
      {"."}
    </Typography>
  );
};

const LoginCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  overflow: 'visible',
  position: 'relative',
  width: '100%',
  maxWidth: 450,
  padding: theme.spacing(2, 3),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3, 4),
  },
}));

const LogoContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
  '& img': {
    height: 80,
    [theme.breakpoints.up('sm')]: {
      height: 100,
    },
  },
}));

const StyledForm = styled('form')(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(2),
}));

const StyledDiv = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  borderRadius: 50,
  padding: theme.spacing(1.2),
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)'
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 2,
    },
  },
}));

const LinksContainer = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const CopyrightContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  textAlign: 'center',
}));

const Login = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin } = useContext(AuthContext);
  const [theme, setTheme] = useState("light");
  const [companyData, setCompanyData] = useState({
    logo: null,
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
              logo: lightConfig.logo
            }));
          } else if (theme === "dark" && darkConfig && darkConfig.logo) {
            setCompanyData(prevData => ({
              ...prevData,
              logo: darkConfig.logo
            }));
          } else {
            setCompanyData(prevData => ({
              ...prevData,
              logo: null
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

  const handlSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleLogin(user);
    } catch (err) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Erro ao realizar login. Tente novamente.");
      }
    }
  };

  return (
    <>
      <CssBaseline />
      <StyledDiv>
        <LoginCard elevation={0}>
          <CardContent sx={{ padding: 0 }}>
            <LogoContainer>
              <img src={getImageUrl(companyData.logo)} alt="logo" />
            </LogoContainer>
            
            <Typography component="h1" variant="h5" align="center" fontWeight="600" gutterBottom>
              {t("login.title")}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
              {t("login.subtitle", "Faça o seu login para acessar o sistema")}
            </Typography>
            
            <StyledForm noValidate onSubmit={handlSubmit}>
              <StyledTextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label={t("login.form.email")}
                name="email"
                value={user.email}
                onChange={handleChangeInput}
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <StyledTextField
                variant="outlined"
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((e) => !e)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disableElevation
              >
                {t("login.buttons.submit")}
              </StyledButton>
              
              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  {t("login.or", "ou")}
                </Typography>
              </Divider>
              
              <LinksContainer container spacing={1} justifyContent="space-between">
                <Grid item>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    color="primary"
                    underline="hover"
                  >
                    {t("login.buttons.forgotPassword")}
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    component={RouterLink}
                    to="/signup"
                    variant="body2"
                    color="primary"
                    underline="hover"
                  >
                    {t("login.buttons.register")}
                  </Link>
                </Grid>
              </LinksContainer>
            </StyledForm>
          </CardContent>
        </LoginCard>
        
        <CopyrightContainer>
          <Copyright companyName={companyData.name} companyUrl={companyData.url} />
        </CopyrightContainer>
      </StyledDiv>
    </>
  );
};

export default Login;