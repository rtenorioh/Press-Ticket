import { AppBar, Box, Button, Card, Grid, IconButton, makeStyles, Tab, Tabs, TextField, Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import { getImageUrl } from '../../helpers/imageHelper';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        width: "100%",
    },
    fullWidthContainer: {
        width: "100%",
        padding: theme.spacing(5),
        boxSizing: "border-box",
    },
    cardContainer: {
        display: "flex",
        alignItems: "center",
        marginBottom: theme.spacing(1),
    },
    card: {
        width: theme.spacing(15),
        height: theme.spacing(15),
        marginRight: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        border: "1px solid #ddd",
        cursor: "pointer",
        backgroundColor: "#f5f5f5",
        "&:hover": {
            backgroundColor: "#eeeeee",
        },
    },
    cardMedia: {
        width: "100%",
        height: "100%",
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "absolute",
        top: 0,
        left: 0,
    },
    deleteIcon: {
        position: "absolute",
        top: 4,
        right: 4,
        color: theme.palette.error.main,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        padding: 4,
        borderRadius: "50%",
        "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 1)",
        },
    },
    textField: {
        marginBottom: theme.spacing(2),
    },
    title: {
        marginBottom: theme.spacing(1),
    },
    titleContainer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing(2),
    },
    button: {
        marginLeft: theme.spacing(2),
    },
    cardLabel: {
        position: "absolute",
        bottom: 4,
        width: "100%",
        textAlign: "center",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        padding: "2px 0",
        fontSize: "0.75rem",
    }
}));

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography variant="caption" component="div">{children}</Typography>
                </Box>
            )}
        </div >
    );
};

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

const PersonalizeSettings = ({ onThemeConfigUpdate }) => {
    const classes = useStyles();
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
                onThemeConfigUpdate(theme, colorsToSave);
            } else {
                throw new Error(`${t("settings.personalize.error.colors")} ${theme}`);
            }
        } catch (err) {
            console.error(`${t("settings.personalize.error.logs")}`, err);
            toast.error(`${t("settings.personalize.error.colors")} ${theme}`);
        }
    };

    return (
        <div className={classes.root}>
            <AppBar position="static" color="default">
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    <Tab label={t("settings.personalize.tabs.data")} />
                    <Tab label={t("settings.personalize.tabs.logos")} />
                    <Tab label={t("settings.personalize.tabs.colors")} />
                </Tabs>
            </AppBar>
            <TabPanel value={tabValue} index={0}>
                <div className={classes.fullWidthContainer}>
                    <TextField
                        label={t("settings.personalize.tabpanel.company")}
                        variant="outlined"
                        fullWidth
                        className={classes.textField}
                        value={data?.company}
                        onChange={handleCompanyChange}
                    />
                    <TextField
                        label={t("settings.personalize.tabpanel.url")}
                        variant="outlined"
                        fullWidth
                        className={classes.textField}
                        value={data?.url}
                        onChange={handleUrlChange}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={handleSaveCompanyData}
                    >
                        {t("settings.personalize.tabpanel.button.save")}
                    </Button>
                </div>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <div className={classes.fullWidthContainer}>
                    <Grid container spacing={5}>
                        <Grid item xs={12}>
                            <Typography variant="h6" className={classes.title}>{t("settings.personalize.tabpanel.light")}</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6} md={4} className={classes.cardContainer}>
                                    <Card className={classes.card} onClick={() => !logos.themeLight.favico && handleCardClick("light", "favico")}>
                                        <div
                                            className={classes.cardMedia}
                                            style={{
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
                                        <Typography className={classes.cardLabel}>
                                            Favicon
                                        </Typography>
                                        {logos.themeLight.favico && (
                                            <IconButton
                                                className={classes.deleteIcon}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteLogo("light", "favico");
                                                }}
                                                size="small"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Card>
                                    <input
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        id="light-favico-input"
                                        type="file"
                                        onChange={(e) => handleLogoChange(e, "light", "favico")}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4} className={classes.cardContainer}>
                                    <Card className={classes.card} onClick={() => !logos.themeLight.logo && handleCardClick("light", "logo")}>
                                        <div
                                            className={classes.cardMedia}
                                            style={{
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
                                        <Typography className={classes.cardLabel}>
                                            Logo
                                        </Typography>
                                        {logos.themeLight.logo && (
                                            <IconButton
                                                className={classes.deleteIcon}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteLogo("light", "logo");
                                                }}
                                                size="small"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Card>
                                    <input
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        id="light-logo-input"
                                        type="file"
                                        onChange={(e) => handleLogoChange(e, "light", "logo")}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4} className={classes.cardContainer}>
                                    <Card className={classes.card} onClick={() => !logos.themeLight.logoTicket && handleCardClick("light", "logoTicket")}>
                                        <div
                                            className={classes.cardMedia}
                                            style={{
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
                                        <Typography className={classes.cardLabel}>
                                            Logo Ticket
                                        </Typography>
                                        {logos.themeLight.logoTicket && (
                                            <IconButton
                                                className={classes.deleteIcon}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteLogo("light", "logoTicket");
                                                }}
                                                size="small"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Card>
                                    <input
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        id="light-logoTicket-input"
                                        type="file"
                                        onChange={(e) => handleLogoChange(e, "light", "logoTicket")}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" className={classes.title}>{t("settings.personalize.tabpanel.dark")}</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6} md={4} className={classes.cardContainer}>
                                    <Card className={classes.card} onClick={() => !logos.themeDark.favico && handleCardClick("dark", "favico")}>
                                        <div
                                            className={classes.cardMedia}
                                            style={{
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
                                        <Typography className={classes.cardLabel}>
                                            Favicon
                                        </Typography>
                                        {logos.themeDark.favico && (
                                            <IconButton
                                                className={classes.deleteIcon}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteLogo("dark", "favico");
                                                }}
                                                size="small"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Card>
                                    <input
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        id="dark-favico-input"
                                        type="file"
                                        onChange={(e) => handleLogoChange(e, "dark", "favico")}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4} className={classes.cardContainer}>
                                    <Card className={classes.card} onClick={() => !logos.themeDark.logo && handleCardClick("dark", "logo")}>
                                        <div
                                            className={classes.cardMedia}
                                            style={{
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
                                        <Typography className={classes.cardLabel}>
                                            Logo
                                        </Typography>
                                        {logos.themeDark.logo && (
                                            <IconButton
                                                className={classes.deleteIcon}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteLogo("dark", "logo");
                                                }}
                                                size="small"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Card>
                                    <input
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        id="dark-logo-input"
                                        type="file"
                                        onChange={(e) => handleLogoChange(e, "dark", "logo")}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4} className={classes.cardContainer}>
                                    <Card className={classes.card} onClick={() => !logos.themeDark.logoTicket && handleCardClick("dark", "logoTicket")}>
                                        <div
                                            className={classes.cardMedia}
                                            style={{
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
                                        <Typography className={classes.cardLabel}>
                                            Logo Ticket
                                        </Typography>
                                        {logos.themeDark.logoTicket && (
                                            <IconButton
                                                className={classes.deleteIcon}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteLogo("dark", "logoTicket");
                                                }}
                                                size="small"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Card>
                                    <input
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        id="dark-logoTicket-input"
                                        type="file"
                                        onChange={(e) => handleLogoChange(e, "dark", "logoTicket")}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <div className={classes.fullWidthContainer}>
                    <div className={classes.titleContainer}>
                        <Typography variant="h6">{t("settings.personalize.tabpanel.light")}</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            onClick={() => handleSaveColors("light")}
                        >
                            {t("settings.personalize.tabpanel.button.saveLight")}
                        </Button>
                    </div>
                    <Grid container spacing={5}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label={t("settings.personalize.tabpanel.input.primary")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                className={classes.textField}
                                value={colors.themeLight.primaryColor}
                                onChange={(e) => handleColorChange(e, "themeLight", "primaryColor")}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label={t("settings.personalize.tabpanel.input.secondary")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                className={classes.textField}
                                value={colors.themeLight.secondaryColor}
                                onChange={(e) => handleColorChange(e, "themeLight", "secondaryColor")}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label={t("settings.personalize.tabpanel.input.default")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                className={classes.textField}
                                value={colors.themeLight.backgroundDefault}
                                onChange={(e) => handleColorChange(e, "themeLight", "backgroundDefault")}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label={t("settings.personalize.tabpanel.input.paper")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                className={classes.textField}
                                value={colors.themeLight.backgroundPaper}
                                onChange={(e) => handleColorChange(e, "themeLight", "backgroundPaper")}
                            />
                        </Grid>
                    </Grid>
                    <div className={classes.titleContainer}>
                        <Typography variant="h6">{t("settings.personalize.tabpanel.dark")}</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            onClick={() => handleSaveColors("dark")}
                        >
                            {t("settings.personalize.tabpanel.button.saveDark")}
                        </Button>
                    </div>
                    <Grid container spacing={5}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label={t("settings.personalize.tabpanel.input.primary")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                className={classes.textField}
                                value={colors.themeDark.primaryColor}
                                onChange={(e) => handleColorChange(e, "themeDark", "primaryColor")}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label={t("settings.personalize.tabpanel.input.secondary")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                className={classes.textField}
                                value={colors.themeDark.secondaryColor}
                                onChange={(e) => handleColorChange(e, "themeDark", "secondaryColor")}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label={t("settings.personalize.tabpanel.input.default")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                className={classes.textField}
                                value={colors.themeDark.backgroundDefault}
                                onChange={(e) => handleColorChange(e, "themeDark", "backgroundDefault")}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label={t("settings.personalize.tabpanel.input.paper")}
                                type="color"
                                variant="outlined"
                                fullWidth
                                className={classes.textField}
                                value={colors.themeDark.backgroundPaper}
                                onChange={(e) => handleColorChange(e, "themeDark", "backgroundPaper")}
                            />
                        </Grid>
                    </Grid>
                </div>
            </TabPanel>
        </div>
    );
};

export default PersonalizeSettings;