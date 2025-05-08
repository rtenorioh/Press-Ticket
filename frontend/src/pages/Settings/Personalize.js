import { 
    Box, 
    Button, 
    Card, 
    Grid, 
    IconButton, 
    Tab, 
    Tabs, 
    TextField, 
    Typography,
    Paper
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import { getImageUrl } from '../../helpers/imageHelper';

const Root = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    width: "100%",
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
}));

const TabsContainer = styled(Paper)(({ theme }) => ({
    borderRadius: 0,
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
    '& .MuiTab-root': {
        minWidth: 120,
        fontWeight: 500,
        transition: 'all 0.2s',
        '&.Mui-selected': {
            color: theme.palette.primary.main,
            fontWeight: 600,
        },
    },
}));

const FullWidthContainer = styled(Box)(({ theme }) => ({
    width: "100%",
    padding: theme.spacing(3),
    boxSizing: "border-box",
}));

const CardContainer = styled(Grid)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
}));

const StyledCard = styled(Card)(({ theme }) => ({
    width: theme.spacing(15),
    height: theme.spacing(15),
    marginRight: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    border: `1px solid ${theme.palette.divider}`,
    cursor: "pointer",
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease",
    overflow: "visible",
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
}));

const CardMedia = styled('div')({
    width: "100%",
    height: "100%",
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    pointerEvents: "none",
});

const StyledTextField = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.shape.borderRadius,
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            borderWidth: 2,
        },
    },
}));

const Title = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(4),
    fontWeight: 600,
    '&:first-of-type': {
        marginTop: theme.spacing(1),
    },
}));

const TitleContainer = styled('div')(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
}));

const ActionButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1, 3),
    fontWeight: 500,
}));

const CardLabel = styled(Typography)({
    position: "absolute",
    bottom: 4,
    width: "100%",
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "2px 0",
    fontSize: "0.75rem",
});

const CardDescription = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(1),
    textAlign: "center",
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    padding: theme.spacing(0, 1),
}));

const ImagePreview = styled('div')(({ theme }) => ({
    position: 'relative',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const PreviewThumbnail = styled('img')(({ theme }) => ({
    maxWidth: '60px',
    maxHeight: '60px',
    objectFit: 'contain',
    marginTop: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.background.paper,
}));

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`settings-tabpanel-${index}`}
            aria-labelledby={`settings-tab-${index}`}
            {...other}
            style={{ width: '100%' }}
        >
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
};

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

const PersonalizeSettings = ({ toggleTheme, onThemeConfigUpdate }) => {
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState(0);
    const [data, setData] = useState({ company: "", url: "" });
    const [logos, setLogos] = useState({
        themeLight: { favico: null, logo: null, logoTicket: null },
        themeDark: { favico: null, logo: null, logoTicket: null }
    });
    const [colors, setColors] = useState({
        themeLight: { primaryColor: "#ffffff", secondaryColor: "#ffffff", backgroundDefault: "#ffffff", backgroundPaper: "#ffffff" },
        themeDark: { primaryColor: "#000000", secondaryColor: "#000000", backgroundDefault: "#000000", backgroundPaper: "#000000" },
    });

    useEffect(() => {
        const fetchPersonalizations = async () => {
            try {
                const { data } = await api.get("/personalizations");
                if (data && data.length > 0) {
                    let lightTheme = {};
                    let darkTheme = {};

                    data.forEach(personalization => {
                        if (personalization.theme === "light") {
                            lightTheme = personalization;
                        } else if (personalization.theme === "dark") {
                            darkTheme = personalization;
                        }
                    });

                    setData({
                        company: lightTheme.company || "",
                        url: lightTheme.url || ""
                    });

                    setLogos({
                        themeLight: {
                            favico: lightTheme.favico ? getImageUrl(lightTheme.favico) : null,
                            logo: lightTheme.logo ? getImageUrl(lightTheme.logo) : null,
                            logoTicket: lightTheme.logoTicket ? getImageUrl(lightTheme.logoTicket) : null,
                        },
                        themeDark: {
                            favico: darkTheme.favico ? getImageUrl(darkTheme.favico) : null,
                            logo: darkTheme.logo ? getImageUrl(darkTheme.logo) : null,
                            logoTicket: darkTheme.logoTicket ? getImageUrl(darkTheme.logoTicket) : null,
                        }
                    });

                    setColors({
                        themeLight: {
                            primaryColor: lightTheme.primaryColor || "#ffffff",
                            secondaryColor: lightTheme.secondaryColor || "#ffffff",
                            backgroundDefault: lightTheme.backgroundDefault || "#ffffff",
                            backgroundPaper: lightTheme.backgroundPaper || "#ffffff",
                        },
                        themeDark: {
                            primaryColor: darkTheme.primaryColor || "#000000",
                            secondaryColor: darkTheme.secondaryColor || "#000000",
                            backgroundDefault: darkTheme.backgroundDefault || "#000000",
                            backgroundPaper: darkTheme.backgroundPaper || "#000000",
                        },
                    });
                }
            } catch (err) {
                toast.error(t("settings.personalize.error.invalid"));
            }
        };

        fetchPersonalizations();

        const socket = openSocket();
        socket.on("personalization", data => {
            if (data.action === "update") {
                fetchPersonalizations();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [t]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleCardClick = (theme, key) => {
        document.getElementById(`${theme}-${key}-input`).click();
    };

    const handleCompanyChange = (event) => {
        const value = event.target.value || "";
        setData((prevState) => ({ ...prevState, company: value }));
    };

    const handleUrlChange = (event) => {
        const value = event.target.value || "";
        setData((prevState) => ({ ...prevState, url: value }));
    };

    const handleSaveCompanyData = async () => {
        const payload = {
            company: data.company,
            url: data.url,
        };
        try {
            await api.put("/personalizations/light/company", payload);
            toast.success(t("settings.personalize.success.company"));
        } catch (err) {
            toast.error(t("settings.personalize.error.company"));
        }
    };

    const handleLogoChange = async (event, theme, type) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("theme", theme);
        formData.append(type, file);

        try {
            toast.info("Enviando imagem...", {
                autoClose: false,
                toastId: "uploadingLogo"
            });

            const response = await api.put(`/personalizations/${theme}/logos`, formData, {
                headers: { 
                    "Content-Type": "multipart/form-data"
                },
            });

            if (response.data && response.data[type]) {
                const fileName = response.data[type];
                
                setLogos(prevState => ({
                    ...prevState,
                    [theme === "light" ? "themeLight" : "themeDark"]: {
                        ...prevState[theme === "light" ? "themeLight" : "themeDark"],
                        [type]: getImageUrl(fileName),
                    },
                }));

                onThemeConfigUpdate(theme, {
                    [type]: fileName
                });

                toast.dismiss("uploadingLogo");
                toast.success("Imagem atualizada com sucesso!");
            }
        } catch (error) {
            console.error("Erro ao fazer upload da imagem:", error);
            toast.dismiss("uploadingLogo");
            toast.error(
                error.response?.data?.message || 
                "Erro ao fazer upload da imagem. Tente novamente."
            );
        } finally {
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const handleDeleteLogo = async (theme, type) => {
        try {
            toast.info("Removendo logo...", {
                autoClose: false,
                toastId: "deletingLogo"
            });

            await api.delete(`/personalizations/${theme}/logos/${type}`);

            setLogos(prevState => ({
                ...prevState,
                [theme === "light" ? "themeLight" : "themeDark"]: {
                    ...prevState[theme === "light" ? "themeLight" : "themeDark"],
                    [type]: null,
                },
            }));

            onThemeConfigUpdate(theme, {
                [type]: null
            });

            toast.dismiss("deletingLogo");
            toast.success("Logo removida com sucesso!");
        } catch (error) {
            console.error("Erro ao remover logo:", error);
            toast.dismiss("deletingLogo");
            toast.error(
                error.response?.data?.message || 
                "Erro ao remover logo. Tente novamente."
            );
        }
    };

    const handleColorChange = (event, theme, field) => {
        const newColor = event.target.value;
        setColors((prevState) => ({
            ...prevState,
            [theme]: {
                ...prevState[theme],
                [field]: newColor,
            },
        }));
    };

    const handleSaveColors = async (theme) => {
        const colorsToSave = colors[theme === "light" ? "themeLight" : "themeDark"];
        const payload = {
            primaryColor: colorsToSave.primaryColor,
            secondaryColor: colorsToSave.secondaryColor,
            backgroundDefault: colorsToSave.backgroundDefault,
            backgroundPaper: colorsToSave.backgroundPaper,
        };

        try {
            const response = await api.put(`/personalizations/${theme}/colors`, payload);

            if (response.status === 200) {
                toast.success(`Cores do tema ${theme} salvas com sucesso!`);
                if (typeof onThemeConfigUpdate === 'function') {
                    onThemeConfigUpdate(theme, colorsToSave);
                }
                
                if (toggleTheme && typeof toggleTheme === 'function') {
                    const currentTheme = localStorage.getItem('theme') || 'light';
                    if (currentTheme === theme) {
                        try {
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        } catch (error) {
                            console.error('Erro ao aplicar mudanças de tema:', error);
                        }
                    }
                }
            } else {
                throw new Error(`${t("settings.personalize.error.colors")} ${theme}`);
            }
        } catch (err) {
            console.error(`${t("settings.personalize.error.logs")}`, err);
            toast.error(`${t("settings.personalize.error.colors")} ${theme}`);
        }
    };

    return (
        <Root>
            <TabsContainer>
                <StyledTabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    <Tab label={t("settings.personalize.tabs.company")} />
                    <Tab label={t("settings.personalize.tabs.logos")} />
                    <Tab label={t("settings.personalize.tabs.colors")} />
                </StyledTabs>
            </TabsContainer>
            <TabPanel value={tabValue} index={0}>
                <FullWidthContainer>
                    <SectionTitle variant="h6">{t("settings.personalize.tabpanel.companyInfo")}</SectionTitle>
                    
                    <StyledTextField
                        label={t("settings.personalize.tabpanel.company")}
                        variant="outlined"
                        fullWidth
                        value={data?.company}
                        onChange={handleCompanyChange}
                        placeholder="Press Ticket®"
                    />
                    <StyledTextField
                        label={t("settings.personalize.tabpanel.url")}
                        variant="outlined"
                        fullWidth
                        value={data?.url}
                        onChange={handleUrlChange}
                        placeholder="https://github.com/rtenorioh/Press-Ticket"
                    />
                    <ActionButton
                        variant="contained"
                        color="primary"
                        onClick={handleSaveCompanyData}
                    >
                        {t("settings.personalize.tabpanel.button.save")}
                    </ActionButton>
                </FullWidthContainer>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <FullWidthContainer>
                    <Grid container spacing={5}>
                        <Grid item xs={12}>
                            <Title variant="h6">{t("settings.personalize.tabpanel.light")}</Title>
                            <Grid container spacing={3}>
                                <CardContainer item xs={12} sm={6} md={4} >
                                    <StyledCard onClick={() => !logos.themeLight.favico && handleCardClick("light", "favico")}>
                                        <CardMedia
                                            sx={{
                                                backgroundImage: `url("${logos.themeLight.favico}")`,
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: 'contain'
                                            }}
                                            onError={(e) => {
                                                console.error("Erro ao carregar imagem:", logos.themeLight.favico);
                                                e.target.style.backgroundImage = '';
                                            }}
                                        />
                                        <CardLabel>
                                            Favicon
                                        </CardLabel>
                                        {logos.themeLight.favico && (
                                            <Box 
                                                sx={{ 
                                                    position: 'absolute', 
                                                    top: 4, 
                                                    right: 4, 
                                                    zIndex: 20 
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    sx={{ 
                                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' } 
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteLogo("light", "favico");
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </StyledCard>
                                    <CardDescription>
                                        Ícone pequeno exibido na aba do navegador (16x16 ou 32x32 pixels)
                                    </CardDescription>
                                    {logos.themeLight.favico && (
                                        <ImagePreview>
                                            <Typography variant="caption" color="textSecondary" gutterBottom>
                                                Imagem atual:
                                            </Typography>
                                            <PreviewThumbnail 
                                                src={logos.themeLight.favico} 
                                                alt="Favicon atual" 
                                                onError={(e) => {
                                                    console.error("Erro ao carregar miniatura:", logos.themeLight.favico);
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </ImagePreview>
                                    )}
                                    <input
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        id="light-favico-input"
                                        type="file"
                                        onChange={(e) => handleLogoChange(e, "light", "favico")}
                                    />
                                </CardContainer>
                                <CardContainer item xs={12} sm={6} md={4}>
                                    <StyledCard onClick={() => !logos.themeLight.logo && handleCardClick("light", "logo")}>
                                        <CardMedia
                                            sx={{
                                                backgroundImage: `url("${logos.themeLight.logo}")`,
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: 'contain'
                                            }}
                                            onError={(e) => {
                                                console.error("Erro ao carregar imagem:", logos.themeLight.logo);
                                                e.target.style.backgroundImage = '';
                                            }}
                                        />
                                        <CardLabel>
                                            Logo
                                        </CardLabel>
                                        {logos.themeLight.logo && (
                                            <Box 
                                                sx={{ 
                                                    position: 'absolute', 
                                                    top: 4, 
                                                    right: 4, 
                                                    zIndex: 20 
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    sx={{ 
                                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' } 
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteLogo("light", "logo");
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </StyledCard>
                                    <CardDescription>
                                        Logo principal exibido no menu lateral e no login (tamanho recomendado: 150x150 pixels)
                                    </CardDescription>
                                    {logos.themeLight.logo && (
                                        <ImagePreview>
                                            <Typography variant="caption" color="textSecondary" gutterBottom>
                                                Imagem atual:
                                            </Typography>
                                            <PreviewThumbnail 
                                                src={logos.themeLight.logo} 
                                                alt="Logo atual" 
                                                onError={(e) => {
                                                    console.error("Erro ao carregar miniatura:", logos.themeLight.logo);
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </ImagePreview>
                                    )}
                                    <input
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        id="light-logo-input"
                                        type="file"
                                        onChange={(e) => handleLogoChange(e, "light", "logo")}
                                    />
                                </CardContainer>
                                <CardContainer item xs={12} sm={6} md={4}>
                                    <StyledCard onClick={() => !logos.themeLight.logoTicket && handleCardClick("light", "logoTicket")}>
                                        <CardMedia
                                            sx={{
                                                backgroundImage: `url("${logos.themeLight.logoTicket}")`,
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: 'contain'
                                            }}
                                            onError={(e) => {
                                                console.error("Erro ao carregar imagem:", logos.themeLight.logoTicket);
                                                e.target.style.backgroundImage = '';
                                            }}
                                        />
                                        <CardLabel>
                                            Logo Ticket
                                        </CardLabel>
                                        {logos.themeLight.logoTicket && (
                                            <Box 
                                                sx={{ 
                                                    position: 'absolute', 
                                                    top: 4, 
                                                    right: 4, 
                                                    zIndex: 20 
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    sx={{ 
                                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' } 
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteLogo("light", "logoTicket");
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </StyledCard>
                                    <CardDescription>
                                        Logo exibido na interface de atendimentos (tamanho recomendado: 100x100 pixels)
                                    </CardDescription>
                                    {logos.themeLight.logoTicket && (
                                        <ImagePreview>
                                            <Typography variant="caption" color="textSecondary" gutterBottom>
                                                Imagem atual:
                                            </Typography>
                                            <PreviewThumbnail 
                                                src={logos.themeLight.logoTicket} 
                                                alt="Logo Ticket atual" 
                                                onError={(e) => {
                                                    console.error("Erro ao carregar miniatura:", logos.themeLight.logoTicket);
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </ImagePreview>
                                    )}
                                    <input
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        id="light-logoTicket-input"
                                        type="file"
                                        onChange={(e) => handleLogoChange(e, "light", "logoTicket")}
                                    />
                                </CardContainer>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Title variant="h6">{t("settings.personalize.tabpanel.dark")}</Title>
                            <Grid container spacing={3}>
                                <CardContainer item xs={12} sm={6} md={4}>
                                    <StyledCard onClick={() => !logos.themeDark.favico && handleCardClick("dark", "favico")}>
                                        <CardMedia
                                            sx={{
                                                backgroundImage: `url("${logos.themeDark.favico}")`,
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: 'contain'
                                            }}
                                            onError={(e) => {
                                                console.error("Erro ao carregar imagem:", logos.themeDark.favico);
                                                e.target.style.backgroundImage = '';
                                            }}
                                        />
                                        <CardLabel>
                                            Favicon
                                        </CardLabel>
                                        {logos.themeDark.favico && (
                                            <Box 
                                                sx={{ 
                                                    position: 'absolute', 
                                                    top: 4, 
                                                    right: 4, 
                                                    zIndex: 20 
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    sx={{ 
                                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' } 
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteLogo("dark", "favico");
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </StyledCard>
                                    <CardDescription>
                                        Ícone pequeno exibido na aba do navegador (16x16 ou 32x32 pixels)
                                    </CardDescription>
                                    {logos.themeDark.favico && (
                                        <ImagePreview>
                                            <Typography variant="caption" color="textSecondary" gutterBottom>
                                                Imagem atual:
                                            </Typography>
                                            <PreviewThumbnail 
                                                src={logos.themeDark.favico} 
                                                alt="Favicon atual" 
                                                onError={(e) => {
                                                    console.error("Erro ao carregar miniatura:", logos.themeDark.favico);
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </ImagePreview>
                                    )}
                                    <input
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        id="dark-favico-input"
                                        type="file"
                                        onChange={(e) => handleLogoChange(e, "dark", "favico")}
                                    />
                                </CardContainer>
                                <CardContainer item xs={12} sm={6} md={4}>
                                    <StyledCard onClick={() => !logos.themeDark.logo && handleCardClick("dark", "logo")}>
                                        <CardMedia
                                            sx={{
                                                backgroundImage: `url("${logos.themeDark.logo}")`,
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: 'contain'
                                            }}
                                            onError={(e) => {
                                                console.error("Erro ao carregar imagem:", logos.themeDark.logo);
                                                e.target.style.backgroundImage = '';
                                            }}
                                        />
                                        <CardLabel>
                                            Logo
                                        </CardLabel>
                                        {logos.themeDark.logo && (
                                            <Box 
                                                sx={{ 
                                                    position: 'absolute', 
                                                    top: 4, 
                                                    right: 4, 
                                                    zIndex: 20 
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    sx={{ 
                                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' } 
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteLogo("dark", "logo");
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </StyledCard>
                                    <CardDescription>
                                        Logo principal exibido no menu lateral e no login (tamanho recomendado: 150x150 pixels)
                                    </CardDescription>
                                    {logos.themeDark.logo && (
                                        <ImagePreview>
                                            <Typography variant="caption" color="textSecondary" gutterBottom>
                                                Imagem atual:
                                            </Typography>
                                            <PreviewThumbnail 
                                                src={logos.themeDark.logo} 
                                                alt="Logo atual" 
                                                onError={(e) => {
                                                    console.error("Erro ao carregar miniatura:", logos.themeDark.logo);
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </ImagePreview>
                                    )}
                                    <input
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        id="dark-logo-input"
                                        type="file"
                                        onChange={(e) => handleLogoChange(e, "dark", "logo")}
                                    />
                                </CardContainer>
                                <CardContainer item xs={12} sm={6} md={4}>
                                    <StyledCard onClick={() => !logos.themeDark.logoTicket && handleCardClick("dark", "logoTicket")}>
                                        <CardMedia
                                            sx={{
                                                backgroundImage: `url("${logos.themeDark.logoTicket}")`,
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: 'contain'
                                            }}
                                            onError={(e) => {
                                                console.error("Erro ao carregar imagem:", logos.themeDark.logoTicket);
                                                e.target.style.backgroundImage = '';
                                            }}
                                        />
                                        <CardLabel>
                                            Logo Ticket
                                        </CardLabel>
                                        {logos.themeDark.logoTicket && (
                                            <Box 
                                                sx={{ 
                                                    position: 'absolute', 
                                                    top: 4, 
                                                    right: 4, 
                                                    zIndex: 20 
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    sx={{ 
                                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' } 
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteLogo("dark", "logoTicket");
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </StyledCard>
                                    <CardDescription>
                                        Logo exibido na interface de tickets/atendimentos (tamanho recomendado: 100x100 pixels)
                                    </CardDescription>
                                    {logos.themeDark.logoTicket && (
                                        <ImagePreview>
                                            <Typography variant="caption" color="textSecondary" gutterBottom>
                                                Imagem atual:
                                            </Typography>
                                            <PreviewThumbnail 
                                                src={logos.themeDark.logoTicket} 
                                                alt="Logo Ticket atual" 
                                                onError={(e) => {
                                                    console.error("Erro ao carregar miniatura:", logos.themeDark.logoTicket);
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </ImagePreview>
                                    )}
                                    <input
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        id="dark-logoTicket-input"
                                        type="file"
                                        onChange={(e) => handleLogoChange(e, "dark", "logoTicket")}
                                    />
                                </CardContainer>
                            </Grid>
                        </Grid>
                    </Grid>
                </FullWidthContainer>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <FullWidthContainer>
                    <TitleContainer>
                        <Typography variant="h6">{t("settings.personalize.tabpanel.light")}</Typography>
                        <ActionButton
                            variant="contained"
                            color="primary"
                            onClick={() => handleSaveColors("light")}
                        >
                            {t("settings.personalize.tabpanel.button.saveLight")}
                        </ActionButton>
                    </TitleContainer>
                    <Grid container spacing={5}>
                        <Grid item xs={12} md={3}>
                            <StyledTextField
                                label={t("settings.personalize.tabpanel.input.primary")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                value={colors.themeLight.primaryColor}
                                onChange={(e) => handleColorChange(e, "themeLight", "primaryColor")}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StyledTextField
                                label={t("settings.personalize.tabpanel.input.secondary")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                value={colors.themeLight.secondaryColor}
                                onChange={(e) => handleColorChange(e, "themeLight", "secondaryColor")}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StyledTextField
                                label={t("settings.personalize.tabpanel.input.default")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                value={colors.themeLight.backgroundDefault}
                                onChange={(e) => handleColorChange(e, "themeLight", "backgroundDefault")}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StyledTextField
                                label={t("settings.personalize.tabpanel.input.paper")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                value={colors.themeLight.backgroundPaper}
                                onChange={(e) => handleColorChange(e, "themeLight", "backgroundPaper")}
                            />
                        </Grid>
                    </Grid>
                    <TitleContainer>
                        <Typography variant="h6">{t("settings.personalize.tabpanel.dark")}</Typography>
                        <ActionButton
                            variant="contained"
                            color="primary"
                            onClick={() => handleSaveColors("dark")}
                        >
                            {t("settings.personalize.tabpanel.button.saveDark")}
                        </ActionButton>
                    </TitleContainer>
                    <Grid container spacing={5}>
                        <Grid item xs={12} md={3}>
                            <StyledTextField
                                label={t("settings.personalize.tabpanel.input.primary")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                value={colors.themeDark.primaryColor}
                                onChange={(e) => handleColorChange(e, "themeDark", "primaryColor")}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StyledTextField
                                label={t("settings.personalize.tabpanel.input.secondary")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                value={colors.themeDark.secondaryColor}
                                onChange={(e) => handleColorChange(e, "themeDark", "secondaryColor")}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StyledTextField
                                label={t("settings.personalize.tabpanel.input.default")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                value={colors.themeDark.backgroundDefault}
                                onChange={(e) => handleColorChange(e, "themeDark", "backgroundDefault")}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StyledTextField
                                label={t("settings.personalize.tabpanel.input.paper")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                value={colors.themeDark.backgroundPaper}
                                onChange={(e) => handleColorChange(e, "themeDark", "backgroundPaper")}
                            />
                        </Grid>
                    </Grid>
                </FullWidthContainer>
            </TabPanel>
        </Root>
    );
};

export default PersonalizeSettings;
