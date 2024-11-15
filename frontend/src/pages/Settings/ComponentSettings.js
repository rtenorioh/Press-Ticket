import { Checkbox, FormControlLabel, Grid, Paper, Select, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { i18n } from "../../translate/i18n.js";

const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(0, 1),
        display: "flex",
        alignItems: "center",
        marginBottom: theme.spacing(2),
    },
    settingOption: {
        marginLeft: "auto",
    },
    gridContainer: {
        padding: theme.spacing(2),
    },
}));

const ComponentSettings = ({ settings, getSettingValue, handleChangeBooleanSetting, handleChangeSetting }) => {
    const classes = useStyles();

    const booleanSettings = [
        { key: "userCreation", label: i18n.t("settings.settings.userCreation.name"), note: i18n.t("settings.settings.userCreation.note") },
        { key: "allTicket", label: i18n.t("settings.settings.allTicket.name"), note: i18n.t("settings.settings.allTicket.note") },
        { key: "CheckMsgIsGroup", label: i18n.t("settings.settings.CheckMsgIsGroup.name"), note: i18n.t("settings.settings.CheckMsgIsGroup.note") },
        { key: "call", label: i18n.t("settings.settings.call.name"), note: i18n.t("settings.settings.call.note") },
        { key: "sideMenu", label: i18n.t("settings.settings.sideMenu.name"), note: i18n.t("settings.settings.sideMenu.note") },
        { key: "quickAnswer", label: i18n.t("settings.settings.quickAnswer.name"), note: i18n.t("settings.settings.quickAnswer.note") },
        { key: "closeTicketApi", label: i18n.t("settings.settings.closeTicketApi.name"), note: i18n.t("settings.settings.closeTicketApi.note") },
        { key: "ASC", label: i18n.t("settings.settings.ASC.name"), note: i18n.t("settings.settings.ASC.note") },
        { key: "created", label: i18n.t("settings.settings.created.name"), note: i18n.t("settings.settings.created.note") },
    ];

    const settingsChunks = [];
    for (let i = 0; i < booleanSettings.length; i += 8) {
        settingsChunks.push(booleanSettings.slice(i, i + 8));
    }

    return (
        <Grid container spacing={3} className={classes.gridContainer}>
            {settingsChunks.map((chunk, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    {chunk.map(setting => (
                        <Paper className={classes.paper} key={setting.key}>
                            <Tooltip title={setting.note}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={settings && settings.length > 0 && getSettingValue(setting.key) === "enabled"}
                                            onChange={handleChangeBooleanSetting}
                                            name={setting.key}
                                            color="primary"
                                        />
                                    }
                                    label={setting.label}
                                />
                            </Tooltip>
                        </Paper>
                    ))}
                </Grid>
            ))}
            <Grid item xs={12} sm={6} md={4}>
                <Tooltip title={i18n.t("settings.settings.timeCreateNewTicket.note")}>
                    <Paper className={classes.paper} elevation={3}>
                        <Typography variant="body1">
                            {i18n.t("settings.settings.timeCreateNewTicket.name")}
                        </Typography>
                        <Select
                            margin="dense"
                            variant="outlined"
                            native
                            id="timeCreateNewTicket-setting"
                            name="timeCreateNewTicket"
                            value={settings && settings.length > 0 && getSettingValue("timeCreateNewTicket")}
                            className={classes.settingOption}
                            onChange={handleChangeSetting}
                        >
                            <option value="10">{i18n.t("settings.settings.timeCreateNewTicket.options.10")}</option>
                            <option value="30">{i18n.t("settings.settings.timeCreateNewTicket.options.30")}</option>
                            <option value="60">{i18n.t("settings.settings.timeCreateNewTicket.options.60")}</option>
                            <option value="300">{i18n.t("settings.settings.timeCreateNewTicket.options.300")}</option>
                            <option value="1800">{i18n.t("settings.settings.timeCreateNewTicket.options.1800")}</option>
                            <option value="3600">{i18n.t("settings.settings.timeCreateNewTicket.options.3600")}</option>
                            <option value="7200">{i18n.t("settings.settings.timeCreateNewTicket.options.7200")}</option>
                            <option value="21600">{i18n.t("settings.settings.timeCreateNewTicket.options.21600")}</option>
                            <option value="43200">{i18n.t("settings.settings.timeCreateNewTicket.options.43200")}</option>
                            <option value="86400">{i18n.t("settings.settings.timeCreateNewTicket.options.86400")}</option>
                            <option value="604800">{i18n.t("settings.settings.timeCreateNewTicket.options.604800")}</option>
                            <option value="1296000">{i18n.t("settings.settings.timeCreateNewTicket.options.1296000")}</option>
                            <option value="2592000">{i18n.t("settings.settings.timeCreateNewTicket.options.2592000")}</option>
                        </Select>
                    </Paper>
                </Tooltip>
            </Grid>
        </Grid>
    );
};

export default ComponentSettings;
