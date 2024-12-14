import { AppBar, Box, Button, Card, CardMedia, Grid, IconButton, makeStyles, Tab, Tabs, TextField, Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../services/api";
import openSocket from "../../services/socket-io";

const PUBLIC_ASSET_PATH = '/assets/';

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
    },
    cardMedia: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
    },
    deleteIcon: {
        position: "absolute",
        top: 0,
        right: 0,
        color: theme.palette.error.main,
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
                            favico: lightTheme.favico ? `${PUBLIC_ASSET_PATH}${lightTheme.favico}` : null,
                            logo: lightTheme.logo ? `${PUBLIC_ASSET_PATH}${lightTheme.logo}` : null,
                            logoTicket: lightTheme.logoTicket ? `${PUBLIC_ASSET_PATH}${lightTheme.logoTicket} ` : null,
                        },
                        themeDark: {
                            favico: darkTheme.favico ? `${PUBLIC_ASSET_PATH}${darkTheme.favico}` : null,
                            logo: darkTheme.logo ? `${PUBLIC_ASSET_PATH}${darkTheme.logo}` : null,
                            logoTicket: darkTheme.logoTicket ? `${PUBLIC_ASSET_PATH}${darkTheme.logoTicket}` : null,
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
        if (file) {
            const formData = new FormData();
            formData.append("theme", theme);
            formData.append(type, file);

            try {
                const response = await api.put(`/personalizations/${theme}/logos`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                const updatedLogoName = response.data[type];
                const updatedLogoUrl = `${PUBLIC_ASSET_PATH}${updatedLogoName}`;

                setLogos((prevState) => ({
                    ...prevState,
                    [theme === "light" ? "themeLight" : "themeDark"]: {
                        ...prevState[theme === "light" ? "themeLight" : "themeDark"],
                        [type]: updatedLogoUrl,
                    },
                }));

                if (response.status === 200) {
                    toast.success(`${t("settings.personalize.success.logos")}`);

                    onThemeConfigUpdate(theme, {
                        [type]: updatedLogoUrl
                    });
                } else {
                    throw new Error(`${t("settings.personalize.error.logos")} ${theme}`);
                }
            } catch (error) {
                console.error(`${t("settings.personalize.error.logs")}`, error);
                toast.error(`${t("settings.personalize.error.logos")}`);
            }
        }
    };

    const handleDeleteImage = (theme, type) => {
        setLogos((prevState) => ({
            ...prevState,
            [theme === "light" ? "themeLight" : "themeDark"]: {
                ...prevState[theme === "light" ? "themeLight" : "themeDark"],
                [type]: null
            }
        }));
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
                                {Object.keys(logos.themeLight).map((key) => (
                                    <Grid item xs={12} sm={6} md={4} key={key} className={classes.cardContainer}>
                                        <Card className={classes.card}>
                                            <CardMedia
                                                className={classes.cardMedia}
                                                image={logos.themeLight[key] || "https://via.placeholder.com/150"}
                                                title={key}
                                                onClick={() => !logos.themeLight[key] && handleCardClick("light", key)}
                                            />
                                            <Typography variant="caption" component="div" style={{ position: "absolute", bottom: 0 }}>
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                            </Typography>
                                            {logos.themeLight[key] && (
                                                <IconButton
                                                    className={classes.deleteIcon}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteImage("light", key);
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Card>
                                        <input
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            id={`light-${key}-input`}
                                            type="file"
                                            onChange={(e) => handleLogoChange(e, "light", key)}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" className={classes.title}>{t("settings.personalize.tabpanel.dark")}</Typography>
                            <Grid container spacing={3}>
                                {Object.keys(logos.themeDark).map((key) => (
                                    <Grid item xs={12} sm={6} md={4} key={key} className={classes.cardContainer}>
                                        <Card className={classes.card}>
                                            <CardMedia
                                                className={classes.cardMedia}
                                                image={logos.themeDark[key] || "https://via.placeholder.com/150"}
                                                title={key}
                                                onClick={() => !logos.themeDark[key] && handleCardClick("dark", key)}
                                            />
                                            <Typography variant="caption" component="div" style={{ position: "absolute", bottom: 0 }}>
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                            </Typography>
                                            {logos.themeDark[key] && (
                                                <IconButton
                                                    className={classes.deleteIcon}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteImage("dark", key);
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Card>
                                        <input
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            id={`dark-${key}-input`}
                                            type="file"
                                            onChange={(e) => handleLogoChange(e, "dark", key)}
                                        />
                                    </Grid>
                                ))}
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