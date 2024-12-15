import {
    Container,
    makeStyles,
    Paper,
    TextField,
    Typography
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CopyToClipboard from "../../components/CopyToClipboard";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import connectToSocket from "../../services/socket-io";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        alignItems: "center",
        padding: theme.spacing(8, 8, 3),
    },
    typography: {
        subtitle6: {
            fontSize: 12,
        }
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(2),
        display: "flex",
        alignItems: "center",
        marginBottom: 12,
    },
    settingOption: {
        marginLeft: "auto",
    },
    margin: {
        margin: theme.spacing(1),
    },
}));

const ApiKey = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    const [settings, setSettings] = useState([]);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const { data } = await api.get("/settings");
                setSettings(data);
            } catch (err) {
                toastError(err);
            }
        };
        fetchSession();
    }, []);

    useEffect(() => {
        const socket = connectToSocket();

        socket.on("settings", data => {
            if (data.action === "update") {
                setSettings(prevState => {
                    const aux = [...prevState];
                    const settingIndex = aux.findIndex(s => s.key === data.setting.key);
                    aux[settingIndex].value = data.setting.value;
                    return aux;
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const getSettingValue = key => {
        const { value } = settings.find(s => s.key === key);
        return value;
    };

    return (
        <div className={classes.root}>
            <Container className={classes.container} maxWidth="sm">
                <Typography variant="body2" gutterBottom>
                    {t("mainDrawer.listItems.token")}
                </Typography>

                <Paper className={classes.paper}>
                    <TextField
                        id="api-token-setting"
                        readOnly
                        label="Api Key"
                        margin="dense"
                        variant="outlined"
                        fullWidth
                        value={settings && settings.length > 0 && getSettingValue("userApiToken")}
                    />
                    <CopyToClipboard
                        content={
                            settings && settings.length > 0 ? getSettingValue("userApiToken") : ""
                        }
                        color="secondary"
                    />

                </Paper>

            </Container>
        </div>
    );
};

export default ApiKey;