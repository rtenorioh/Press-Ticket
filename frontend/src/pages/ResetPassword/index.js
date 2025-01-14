import {
    Box,
    Button,
    Container,
    CssBaseline,
    Grid,
    Link,
    TextField,
    Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getImageUrl } from '../../helpers/imageHelper';
import toastError from "../../errors/toastError";
import api from "../../services/api";

const Copyright = ({ companyName, companyUrl }) => {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {new Date().getFullYear()}
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

const ResetPassword = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    const location = useLocation();
    const token = new URLSearchParams(location.search).get("token");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [theme, setTheme] = useState("light");
    const [companyData, setCompanyData] = useState({
        logo: 'logo.jpg',
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
                            logo: 'logo.jpg'
                        }));
                    }
                }

            } catch (err) {
                toastError(err);
            }
        };

        fetchLogo();
    }, [theme]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error(t("resetPassword.error.passwordMismatch"));
            return;
        }

        try {
            await api.post("/auth/reset-password", {
                token,
                newPassword: password,
            });
            toast.success(t("resetPassword.success"));
        } catch (err) {
            toast.error(t("resetPassword.error.generic"));
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <img src={getImageUrl(companyData.logo)} alt="logo" style={{ height: 120, marginBottom: 20 }} />
                <Typography component="h1" variant="h5">
                    {t("resetPassword.title")}
                </Typography>
                <form className={classes.form} noValidate onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label={t("resetPassword.form.password")}
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label={t("resetPassword.form.confirmPassword")}
                        type="password"
                        id="confirmPassword"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        {t("resetPassword.buttons.submit")}
                    </Button>
                    <Grid container>
                        <Grid item>
                            <Link
                                href="#"
                                variant="body2"
                                component={RouterLink}
                                to="/login"
                            >
                                {t("resetPassword.buttons.backToLogin")}
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </div>
            <Box mt={5}><Copyright companyName={companyData.name} companyUrl={companyData.url} /></Box>
        </Container>
    );
};

export default ResetPassword;
