import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Checkbox,
    FormControlLabel,
    FormHelperText,
    Grid,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
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
                <SectionTitle variant="h6">{t("settings.general.notifyQueueUsersMessage.title")}</SectionTitle>
                <SettingCard>
                    <SettingItem>
                        <Box sx={{ width: '100%' }}>
                            <Tooltip title={t("settings.general.notifyQueueUsersMessage.note")} placement="top-start">
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    {t("settings.general.notifyQueueUsersMessage.name")}
                                </Typography>
                            </Tooltip>
                            <TextField
                                fullWidth
                                multiline
                                rows={5}
                                variant="outlined"
                                name="notifyQueueUsersMessage"
                                defaultValue={settings && settings.length > 0 ? getSettingValue("notifyQueueUsersMessage") : ""}
                                onBlur={handleChangeSetting}
                                placeholder={t("settings.general.notifyQueueUsersMessage.placeholder")}
                            />
                            <FormHelperText sx={{ mt: 1 }}>
                                {t("settings.general.notifyQueueUsersMessage.variables")}
                            </FormHelperText>
                        </Box>
                    </SettingItem>
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
                    <SettingItem>
                        <Tooltip title={t("settings.general.sessionTimeout.note")} placement="top-start">
                            <Typography variant="body1">
                                {t("settings.general.sessionTimeout.name")}
                            </Typography>
                        </Tooltip>
                        <StyledFormControl variant="outlined" size="small">
                            <Select
                                id="sessionTimeout-setting"
                                name="sessionTimeout"
                                value={settings && settings.length > 0 ? (getSettingValue("sessionTimeout") || "8") : "8"}
                                onChange={handleChangeSetting}
                            >
                                <MenuItem value="1">{t("settings.general.sessionTimeout.options.1")}</MenuItem>
                                <MenuItem value="2">{t("settings.general.sessionTimeout.options.2")}</MenuItem>
                                <MenuItem value="4">{t("settings.general.sessionTimeout.options.4")}</MenuItem>
                                <MenuItem value="6">{t("settings.general.sessionTimeout.options.6")}</MenuItem>
                                <MenuItem value="8">{t("settings.general.sessionTimeout.options.8")}</MenuItem>
                                <MenuItem value="12">{t("settings.general.sessionTimeout.options.12")}</MenuItem>
                                <MenuItem value="24">{t("settings.general.sessionTimeout.options.24")}</MenuItem>
                                <MenuItem value="48">{t("settings.general.sessionTimeout.options.48")}</MenuItem>
                                <MenuItem value="72">{t("settings.general.sessionTimeout.options.72")}</MenuItem>
                                <MenuItem value="168">{t("settings.general.sessionTimeout.options.168")}</MenuItem>
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
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Email do Remetente
                            </Typography>
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
                            <FormHelperText>Email que aparecerá como remetente nos envios do sistema</FormHelperText>
                        </Box>
                    </SettingItem>

                    <SettingItem>
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Senha
                            </Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                name="emailPass"
                                value={settings && settings.length > 0 ? getSettingValue("emailPass") : ""}
                                onChange={handleChangeSetting}
                                placeholder="Senha do email ou senha de app"
                                type="password"
                            />
                            <FormHelperText>
                                Senha do email. Para Gmail use uma Senha de App em: Conta Google → Segurança → Verificação em 2 etapas → Senhas de app
                            </FormHelperText>
                        </Box>
                    </SettingItem>

                    <SettingItem>
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Servidor SMTP
                            </Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                name="emailHost"
                                value={settings && settings.length > 0 ? getSettingValue("emailHost") : "smtp.gmail.com"}
                                onChange={handleChangeSetting}
                                placeholder="smtp.gmail.com"
                            />
                            <FormHelperText>Endereço do servidor de envio do seu provedor de email</FormHelperText>
                        </Box>
                    </SettingItem>

                    <SettingItem>
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Porta SMTP
                            </Typography>
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
                            <FormHelperText>587 para TLS (recomendado) ou 465 para SSL</FormHelperText>
                        </Box>
                    </SettingItem>

                    <SettingItem>
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Segurança
                            </Typography>
                            <FormControl fullWidth size="small" variant="outlined">
                                <Select
                                    name="smtpSecure"
                                    value={settings && settings.length > 0 ? (getSettingValue("smtpSecure") || "tls") : "tls"}
                                    onChange={handleChangeSetting}
                                >
                                    <MenuItem value="tls">TLS — STARTTLS (porta 587)</MenuItem>
                                    <MenuItem value="ssl">SSL (porta 465)</MenuItem>
                                    <MenuItem value="none">Nenhuma (não recomendado)</MenuItem>
                                </Select>
                            </FormControl>
                            <FormHelperText>Escolha conforme a porta: TLS para 587, SSL para 465</FormHelperText>
                        </Box>
                    </SettingItem>

                    <SettingItem>
                        <Box sx={{ width: '100%' }}>
                            <Accordion
                                elevation={0}
                                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '4px !important' }}
                            >
                                <AccordionSummary expandIcon={<Typography sx={{ fontSize: '1rem' }}>▾</Typography>}>
                                    <Typography variant="body2" color="text.secondary">
                                        Configurações por provedor
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600 }}>Provedor</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Servidor</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Porta</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Segurança</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {[
                                                    ["Gmail",      "smtp.gmail.com",                       "587", "TLS", true],
                                                    ["Gmail",      "smtp.gmail.com",                       "465", "SSL", false],
                                                    ["Hostinger",  "smtp.hostinger.com",                   "587", "TLS", true],
                                                    ["Hostinger",  "smtp.hostinger.com",                   "465", "SSL", false],
                                                    ["Outlook",    "smtp.office365.com",                   "587", "TLS", true],
                                                    ["Yahoo",      "smtp.mail.yahoo.com",                  "587", "TLS", true],
                                                    ["Yahoo",      "smtp.mail.yahoo.com",                  "465", "SSL", false],
                                                    ["Locaweb",    "email.locaweb.com.br",                 "587", "TLS", true],
                                                    ["Locaweb",    "email.locaweb.com.br",                 "465", "SSL", false],
                                                    ["SendGrid",   "smtp.sendgrid.net",                    "587", "TLS", true],
                                                    ["Amazon SES", "email-smtp.[região].amazonaws.com",    "587", "TLS", true],
                                                    ["Amazon SES", "email-smtp.[região].amazonaws.com",    "465", "SSL", false],
                                                ].map(([provider, server, port, security, recommended], _idx, arr) => {
                                                    const providerOrder = [...new Set(arr.map(r => r[0]))];
                                                    const isEvenGroup = providerOrder.indexOf(provider) % 2 === 0;
                                                    return (
                                                        <TableRow key={`${provider}-${port}`} hover sx={{ bgcolor: isEvenGroup ? 'transparent' : 'action.hover' }}>
                                                            <TableCell sx={{ fontWeight: recommended ? 600 : 400 }}>{provider}</TableCell>
                                                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: recommended ? 600 : 400 }}>{server}</TableCell>
                                                            <TableCell sx={{ fontWeight: recommended ? 600 : 400 }}>{port}</TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <Typography variant="body2" sx={{ fontWeight: recommended ? 600 : 400 }}>{security}</Typography>
                                                                    {recommended && (
                                                                        <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, fontSize: '0.7rem' }}>
                                                                            ✓ rec.
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            💡 TLS (porta 587) é recomendado para a maioria dos casos. Use SSL (porta 465) se TLS não funcionar no seu provedor.
                                        </Typography>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </Box>
                    </SettingItem>
                </SettingCard>
            </Grid>
        </GridContainer>
    );
};

export default ComponentSettings;
