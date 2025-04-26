import {
    Box,
    Button,
    Container,
    CssBaseline,
    Grid,
    Link,
    TextField,
    Typography
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
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
                {companyName || "Press Ticket®"}
            </Link>
            {"."}
        </Typography>
    );
};

const FormContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
}));

const StyledForm = styled('form')(({ theme }) => ({
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(3, 0, 2),
}));

const ForgotPassword = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [theme, setTheme] = useState("light");
    const [companyData, setCompanyData] = useState({
        logo: 'logo.jpg',
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
        try {
            await api.post("/auth/forgot-password", { email });
            toast.success(t("forgotPassword.success"));
        } catch (err) {
            toast.error(t("forgotPassword.error"));
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <FormContainer>
                <img src={getImageUrl(companyData.logo)} alt="logo" sx={{ height: 120, marginBottom: 20 }} />
                <Typography component="h1" variant="h5">
                    {t("forgotPassword.title")}
                </Typography>
                <StyledForm noValidate onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label={t("forgotPassword.form.email")}
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <SubmitButton
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                    >
                        {t("forgotPassword.buttons.submit")}
                    </SubmitButton>
                    <Grid container>
                        <Grid item xs>
                            <Link
                                href="#"
                                variant="body2"
                                component={RouterLink}
                                to="/login"
                            >
                                {t("forgotPassword.buttons.backToLogin")}
                            </Link>
                        </Grid>
                    </Grid>
                </StyledForm>
            </FormContainer>
            <Box mt={5}><Copyright companyName={companyData.name} companyUrl={companyData.url} /></Box>
        </Container>
    );
};

export default ForgotPassword;
