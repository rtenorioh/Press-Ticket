import { 
    Checkbox, 
    FormControlLabel, 
    Grid, 
    Select, 
    Tooltip, 
    Typography, 
    Box,
    MenuItem,
    FormControl,
    Card,
    TextField
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";

const SettingCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
}));

const SettingItem = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
        borderBottom: 'none',
    },
}));

const GridContainer = styled(Grid)(({ theme }) => ({
    width: '100%',
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    minWidth: 200,
    marginLeft: 'auto',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
    '&:first-of-type': {
        marginTop: 0,
    },
}));

const ComponentSettings = ({ settings, getSettingValue, handleChangeBooleanSetting, handleChangeSetting }) => {
    const { t } = useTranslation();

    const booleanSettings = [
        { key: "userCreation", label: t("settings.general.userCreation.name"), note: t("settings.general.userCreation.note") },
        { key: "allTicket", label: t("settings.general.allTicket.name"), note: t("settings.general.allTicket.note") },
        { key: "CheckMsgIsGroup", label: t("settings.general.CheckMsgIsGroup.name"), note: t("settings.general.CheckMsgIsGroup.note") },
        { key: "call", label: t("settings.general.call.name"), note: t("settings.general.call.note") },
        { key: "sideMenu", label: t("settings.general.sideMenu.name"), note: t("settings.general.sideMenu.note") },
        { key: "quickAnswer", label: t("settings.general.quickAnswer.name"), note: t("settings.general.quickAnswer.note") },
        { key: "closeTicketApi", label: t("settings.general.closeTicketApi.name"), note: t("settings.general.closeTicketApi.note") },
        { key: "ASC", label: t("settings.general.ASC.name"), note: t("settings.general.ASC.note") },
        { key: "created", label: t("settings.general.created.name"), note: t("settings.general.created.note") },
        { key: "openTickets", label: t("settings.general.openTickets.name"), note: t("settings.general.openTickets.note") },
        { key: "signOption", label: t("settings.general.signOption.name"), note: t("settings.general.signOption.note") },
        { key: "tabsPending", label: t("settings.general.tabsPending.name"), note: t("settings.general.tabsPending.note") },
        { key: "tabsClosed", label: t("settings.general.tabsClosed.name"), note: t("settings.general.tabsClosed.note") },
        { key: "listItemSpy", label: t("settings.general.listItemSpy.name"), note: t("settings.general.listItemSpy.note") },
        { key: "queueLength", label: t("settings.general.queueLength.name"), note: t("settings.general.queueLength.note") },
    ];

    const settingsChunks = [];
    for (let i = 0; i < booleanSettings.length; i += 8) {
        settingsChunks.push(booleanSettings.slice(i, i + 8));
    }

    const groupedSettings = [
        {
            title: t("settings.general.systemBehavior"),
            settings: booleanSettings.filter(s => [
                'userCreation'
            ].includes(s.key))
        },
        {
            title: t("settings.general.userInterface"),
            settings: booleanSettings.filter(s => [
                'quickAnswer', 'signOption', 'listItemSpy', 'tabsPending', 'tabsClosed',
            ].includes(s.key))
        },
        {
            title: t("settings.general.ticketManagement"),
            settings: booleanSettings.filter(s => [
                'allTicket', 'CheckMsgIsGroup', 'closeTicketApi', 'ASC', 'created', 'openTickets', 
                'queueLength'
            ].includes(s.key))
        }
    ];

    return (
        <GridContainer container spacing={2}>
            {groupedSettings.map((group, groupIndex) => (
                <Grid item xs={12} key={groupIndex}>
                    <SectionTitle variant="h6">{group.title}</SectionTitle>
                    <SettingCard>
                        {group.settings.map((setting, idx) => (
                            <SettingItem key={setting.key}>
                                <Tooltip title={setting.note} placement="top-start">
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
                                        sx={{ marginRight: 'auto' }}
                                    />
                                </Tooltip>
                            </SettingItem>
                        ))}
                    </SettingCard>
                </Grid>
            ))}
            
            <Grid item xs={12}>
                <SectionTitle variant="h6">{t("settings.general.callSettings")}</SectionTitle>
                <SettingCard>
                    {(getSettingValue("call") !== "enabled" || getSettingValue("autoRejectCalls") === "enabled") && (
                        <SettingItem>
                            <Tooltip title={t("settings.general.autoRejectCalls.note")} placement="top-start">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={settings && settings.length > 0 && getSettingValue("autoRejectCalls") === "enabled"}
                                            onChange={handleChangeBooleanSetting}
                                            name="autoRejectCalls"
                                            color="primary"
                                        />
                                    }
                                    label={t("settings.general.autoRejectCalls.name")}
                                    sx={{ marginRight: 'auto' }}
                                />
                            </Tooltip>
                        </SettingItem>
                    )}
                    {getSettingValue("autoRejectCalls") === "enabled" && (
                        <SettingItem>
                            <Box sx={{ width: '100%' }}>
                                <Tooltip title={t("settings.general.autoRejectCallsMessage.note")} placement="top-start">
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        {t("settings.general.autoRejectCallsMessage.name")}
                                    </Typography>
                                </Tooltip>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    name="autoRejectCallsMessage"
                                    value={settings && settings.length > 0 ? getSettingValue("autoRejectCallsMessage") : ""}
                                    onChange={handleChangeSetting}
                                    placeholder={t("settings.general.autoRejectCallsMessage.placeholder")}
                                />
                            </Box>
                        </SettingItem>
                    )}
                    {(getSettingValue("autoRejectCalls") !== "enabled" || getSettingValue("call") === "enabled") && (
                        <SettingItem>
                            <Tooltip title={t("settings.general.call.note")} placement="top-start">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={settings && settings.length > 0 && getSettingValue("call") === "enabled"}
                                            onChange={handleChangeBooleanSetting}
                                            name="call"
                                            color="primary"
                                        />
                                    }
                                    label={t("settings.general.call.name")}
                                    sx={{ marginRight: 'auto' }}
                                />
                            </Tooltip>
                        </SettingItem>
                    )}
                </SettingCard>
            </Grid>

            <Grid item xs={12}>
                <SectionTitle variant="h6">{t("settings.general.timeSettings")}</SectionTitle>
                <SettingCard>
                    <SettingItem>
                        <Tooltip title={t("settings.general.timeCreateNewTicket.note")} placement="top-start">
                            <Typography variant="body1">
                                {t("settings.general.timeCreateNewTicket.name")}
                            </Typography>
                        </Tooltip>
                        <StyledFormControl variant="outlined" size="small">
                            <Select
                                id="timeCreateNewTicket-setting"
                                name="timeCreateNewTicket"
                                value={settings && settings.length > 0 ? getSettingValue("timeCreateNewTicket") : ""}
                                onChange={handleChangeSetting}
                            >
                                <MenuItem value="10">{t("settings.general.timeCreateNewTicket.options.10")}</MenuItem>
                                <MenuItem value="30">{t("settings.general.timeCreateNewTicket.options.30")}</MenuItem>
                                <MenuItem value="60">{t("settings.general.timeCreateNewTicket.options.60")}</MenuItem>
                                <MenuItem value="300">{t("settings.general.timeCreateNewTicket.options.300")}</MenuItem>
                                <MenuItem value="1800">{t("settings.general.timeCreateNewTicket.options.1800")}</MenuItem>
                                <MenuItem value="3600">{t("settings.general.timeCreateNewTicket.options.3600")}</MenuItem>
                                <MenuItem value="7200">{t("settings.general.timeCreateNewTicket.options.7200")}</MenuItem>
                                <MenuItem value="21600">{t("settings.general.timeCreateNewTicket.options.21600")}</MenuItem>
                                <MenuItem value="43200">{t("settings.general.timeCreateNewTicket.options.43200")}</MenuItem>
                                <MenuItem value="86400">{t("settings.general.timeCreateNewTicket.options.86400")}</MenuItem>
                                <MenuItem value="604800">{t("settings.general.timeCreateNewTicket.options.604800")}</MenuItem>
                                <MenuItem value="1296000">{t("settings.general.timeCreateNewTicket.options.1296000")}</MenuItem>
                                <MenuItem value="2592000">{t("settings.general.timeCreateNewTicket.options.2592000")}</MenuItem>
                            </Select>
                        </StyledFormControl>
                    </SettingItem>
                </SettingCard>
            </Grid>

            <Grid item xs={12}>
                <SectionTitle variant="h6">Configurações de Email</SectionTitle>
                <SettingCard>
                    <SettingItem>
                        <Box sx={{ width: '100%' }}>
                            <Tooltip title="Endereço de email usado para envio de notificações" placement="top-start">
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    Email do Remetente
                                </Typography>
                            </Tooltip>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                name="emailUser"
                                value={settings && settings.length > 0 ? getSettingValue("emailUser") : ""}
                                onChange={handleChangeSetting}
                                placeholder="seu-email@gmail.com"
                                type="email"
                            />
                        </Box>
                    </SettingItem>
                    <SettingItem>
                        <Box sx={{ width: '100%' }}>
                            <Tooltip title="Senha de aplicativo do Gmail (não use sua senha normal)" placement="top-start">
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    Senha de Aplicativo
                                </Typography>
                            </Tooltip>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                name="emailPass"
                                value={settings && settings.length > 0 ? getSettingValue("emailPass") : ""}
                                onChange={handleChangeSetting}
                                placeholder="xxxx xxxx xxxx xxxx"
                                type="password"
                            />
                        </Box>
                    </SettingItem>
                    <SettingItem>
                        <Box sx={{ width: '100%' }}>
                            <Tooltip title="Servidor SMTP (padrão: smtp.gmail.com)" placement="top-start">
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    Servidor SMTP
                                </Typography>
                            </Tooltip>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                name="emailHost"
                                value={settings && settings.length > 0 ? getSettingValue("emailHost") : "smtp.gmail.com"}
                                onChange={handleChangeSetting}
                                placeholder="smtp.gmail.com"
                            />
                        </Box>
                    </SettingItem>
                    <SettingItem>
                        <Box sx={{ width: '100%' }}>
                            <Tooltip title="Porta do servidor SMTP (padrão: 587)" placement="top-start">
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    Porta SMTP
                                </Typography>
                            </Tooltip>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                name="emailPort"
                                value={settings && settings.length > 0 ? getSettingValue("emailPort") : "587"}
                                onChange={handleChangeSetting}
                                placeholder="587"
                                type="number"
                            />
                        </Box>
                    </SettingItem>
                </SettingCard>
            </Grid>
        </GridContainer>
    );
};

export default ComponentSettings;
