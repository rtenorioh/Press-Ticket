import React, { useState, useEffect } from "react";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";

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

const Settings = () => {
    const classes = useStyles();

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
        const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

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
                    {i18n.t("mainDrawer.listItems.token")}
                </Typography>

                <Paper className={classes.paper}>
					<TextField
						id="api-token-setting"
						readonly
						label="Api Key"
						margin="dense"
						variant="outlined"
						fullWidth
						value={settings && settings.length > 0 && getSettingValue("userApiToken")}
					/>
				</Paper>

            </Container>
        </div>
    );
};

export default Settings;