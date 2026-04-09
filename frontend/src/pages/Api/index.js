import AttachFileIcon from "@mui/icons-material/AttachFile";
import CodeIcon from "@mui/icons-material/Code";
import InfoIcon from "@mui/icons-material/Info";
import SendIcon from "@mui/icons-material/Send";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    Grid,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import CodeSnippetGenerator from "../../components/CodeSnippetGenerator";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const Root = styled(Container)(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(2),
    maxWidth: 1400,
}));

const FormContainer = styled(Card)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    position: "sticky",
    top: theme.spacing(2),
    overflow: "visible",
    [theme.breakpoints.down('md')]: {
        position: "static",
    },
}));

const FormContent = styled(CardContent)(({ theme }) => ({
    padding: theme.spacing(3),
    '&:last-child': {
        paddingBottom: theme.spacing(3),
    },
}));

const InstructionContainer = styled(Card)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
}));

const InstructionContent = styled(CardContent)(({ theme }) => ({
    padding: theme.spacing(3),
    '&:last-child': {
        paddingBottom: theme.spacing(3),
    },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
    position: "relative",
    '&:after': {
        content: '""',
        position: "absolute",
        bottom: -8,
        left: 0,
        width: 40,
        height: 3,
        backgroundColor: theme.palette.primary.main,
        borderRadius: 3,
    },
}));

const SubTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
}));

const StyledInput = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.shape.borderRadius,
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1, 3),
    fontWeight: 500,
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s",
    '&:hover': {
        boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
        transform: "translateY(-2px)",
    },
}));

const FileInputContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    border: `1px dashed ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
}));

const FileInput = styled('input')(({ theme }) => ({
    display: "none",
}));

const CodeBlock = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    overflowX: 'auto',
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
}));

const ApiMethod = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.primary.lighter || '#e3f2fd',
    color: theme.palette.primary.dark,
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.shape.borderRadius,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    fontSize: '0.85rem',
}));

const ApiUrl = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    overflowX: 'auto',
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    wordBreak: 'break-all',
}));

const ApiHeader = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.warning.lighter || '#fff8e1',
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
}));

const PermissionTag = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: theme.palette.primary.lighter || '#e3f2fd',
    color: theme.palette.primary.dark,
    padding: theme.spacing(0.5, 1.5),
    borderRadius: 20,
    fontWeight: 500,
    fontSize: '0.75rem',
    marginBottom: theme.spacing(2),
    '& .MuiSvgIcon-root': {
        fontSize: '0.875rem',
        marginRight: theme.spacing(0.5),
    },
}));

const ListItem = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'flex-start',
    '&:before': {
        content: '"•"',
        marginRight: theme.spacing(1),
        color: theme.palette.primary.main,
        fontWeight: 'bold',
    },
}));

const ResponseCode = styled(Box)(({ theme, status }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 
        status === 200 ? theme.palette.success.lighter || '#e8f5e9' :
        status === 401 || status === 403 ? theme.palette.warning.lighter || '#fff8e1' :
        theme.palette.error.lighter || '#ffebee',
    color: 
        status === 200 ? theme.palette.success.dark :
        status === 401 || status === 403 ? theme.palette.warning.dark :
        theme.palette.error.dark,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    fontWeight: 600,
    fontSize: '0.75rem',
    marginRight: theme.spacing(1),
}));

const GridContainer = styled(Grid)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const SelectedFileChip = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: theme.palette.primary.lighter || '#e3f2fd',
    color: theme.palette.primary.dark,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    fontSize: '0.75rem',
    marginLeft: theme.spacing(1),
    maxWidth: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const Api = () => {
    const { t } = useTranslation();
    const [number, setNumber] = useState("");
    const [body, setBody] = useState("");
    const [media, setMedia] = useState(null);
    const [userId, setUserId] = useState("");
    const [queueId, setQueueId] = useState("");
    const [whatsappId, setWhatsappId] = useState("");
    const [manualToken, setManualToken] = useState("");
    const [apiTokens, setApiTokens] = useState([]);
    const [users, setUsers] = useState([]);
    const [queues, setQueues] = useState([]);
    const [whatsapps, setWhatsapps] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/api-tokens", { params: { pageNumber: 1, pageSize: 100 } });
                const filtered = (data.tokens || []).filter(tk =>
                    Array.isArray(tk.permissions) && tk.permissions.includes("create:messages")
                );
                setApiTokens(filtered);
            } catch (err) {
                toastError(err);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/queue");
                setQueues(data);
            } catch (err) {
                toastError(err);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/users");
                setUsers(data.users);
            } catch (err) {
                toastError(err);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/whatsapp");
                setWhatsapps(data);
            } catch (err) {
                toastError(err);
            }
        })();
    }, []);

    const handleMediaChange = (e) => {
        setMedia(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = manualToken;

        if (!token) {
            toast.error(t("apiPage.toasts.noToken"));
            return;
        }

        let payload;

        if (media) {
            const formData = new FormData();
            formData.append("number", number);
            formData.append("body", body);
            formData.append("userId", userId);
            formData.append("queueId", queueId);
            formData.append("whatsappId", whatsappId);
            formData.append("medias", media);
            payload = formData;
        } else {
            payload = {
                number,
                body,
                userId,
                queueId,
                whatsappId
            };
        }

        try {
            const endpoint = media 
                ? `${process.env.REACT_APP_BACKEND_URL}/v1/messages/send-media` 
                : `${process.env.REACT_APP_BACKEND_URL}/v1/messages/send`;
                
            await axios.post(endpoint, payload, {
                headers: {
                    "x-api-token": token,
                    "Content-Type": media ? "multipart/form-data" : "application/json"
                }
            });

            toast.success(t("apiPage.toasts.success"));
            setBody("");
            setMedia(null);

        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            toast.error(`${t("apiPage.toasts.error")} ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <Root>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <InstructionContainer>
                        <InstructionContent>
                            <SectionTitle variant="h5">{t("apiPage.docs.title")}</SectionTitle>
                            <PermissionTag>
                                <InfoIcon /> {t("apiPage.docs.permissionTag")} <code>create:messages</code>
                            </PermissionTag>

                            <SubTitle variant="h6">{t("apiPage.docs.sendMethods")}</SubTitle>
                            <ListItem>{t("apiPage.docs.textMessages")}</ListItem>
                            <ListItem>{t("apiPage.docs.mediaMessages")}</ListItem>

                            <Divider sx={{ my: 2 }} />

                            <SubTitle variant="h6">{t("apiPage.docs.instructions")}</SubTitle>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1, mb: 1 }}>
                                {t("apiPage.docs.importantNotes")}
                            </Typography>
                            
                            <ListItem>
                                <Typography variant="body2">
                                    {t("apiPage.docs.tokenNote")}
                                </Typography>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        {t("apiPage.docs.phoneFormat")}
                                    </Typography>
                                    <Box sx={{ pl: 2 }}>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>• {t("apiPage.docs.countryCode")}</Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>• {t("apiPage.docs.dddEx")}</Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>• {t("apiPage.docs.numberEx")}</Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>• {t("apiPage.docs.finalFormat")}</Typography>
                                    </Box>
                                </Box>
                            </ListItem>

                            <Divider sx={{ my: 2 }} />

                            <SubTitle variant="h6">{t("apiPage.docs.textTitle")}</SubTitle>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                {t("apiPage.docs.textInfo")}
                            </Typography>

                            <ApiUrl>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{t("apiPage.docs.urlLabel")}</Typography>
                                <Typography variant="body2" fontFamily="monospace">
                                    {process.env.REACT_APP_BACKEND_URL}/v1/messages/send
                                </Typography>
                            </ApiUrl>

                            <ApiMethod>
                                <CodeIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> {t("apiPage.docs.method")}
                            </ApiMethod>

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{t("apiPage.docs.headers")}</Typography>
                            <ApiHeader>
                                <Typography variant="body2" fontFamily="monospace">
                                    x-api-token: [seu_token]<br />
                                    Content-Type: application/json
                                </Typography>
                            </ApiHeader>

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{t("apiPage.docs.jsonBody")}</Typography>
                            <CodeBlock>
{`{
  "number": "5522999999999",
  "body": "Mensagem de teste via API",
  "userId": 1,
  "queueId": 1,
  "whatsappId": 1
}`}
                            </CodeBlock>

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{t("apiPage.docs.requiredParams")}</Typography>
                            <Box sx={{ mb: 2 }}>
                                <ListItem>
                                    <Typography variant="body2"><b>number:</b> {t("apiPage.docs.paramNumber")}</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>body:</b> {t("apiPage.docs.paramBody")}</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>userId:</b> {t("apiPage.docs.paramUserId")}</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>queueId:</b> {t("apiPage.docs.paramQueueId")}</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>whatsappId:</b> {t("apiPage.docs.paramWhatsappId")}</Typography>
                                </ListItem>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <SubTitle variant="h6">{t("apiPage.docs.mediaTitle")}</SubTitle>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                {t("apiPage.docs.mediaInfo")}
                            </Typography>

                            <ApiUrl>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{t("apiPage.docs.urlLabel")}</Typography>
                                <Typography variant="body2" fontFamily="monospace">
                                    {process.env.REACT_APP_BACKEND_URL}/v1/messages/send-media
                                </Typography>
                            </ApiUrl>

                            <ApiMethod>
                                <CodeIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> {t("apiPage.docs.method")}
                            </ApiMethod>

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{t("apiPage.docs.headers")}</Typography>
                            <ApiHeader>
                                <Typography variant="body2" fontFamily="monospace">
                                    x-api-token: [seu_token]<br />
                                    Content-Type: multipart/form-data
                                </Typography>
                            </ApiHeader>

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{t("apiPage.docs.formDataBody")}</Typography>
                            <CodeBlock>
{`{
  "number": "5522999999999",
  "body": "Mensagem de teste via API",
  "medias": "arquivo.jpg",
  "userId": 1,
  "queueId": 1,
  "whatsappId": 1
}`}
                            </CodeBlock>

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{t("apiPage.docs.requiredParams")}</Typography>
                            <Box sx={{ mb: 2 }}>
                                <ListItem>
                                    <Typography variant="body2"><b>number:</b> {t("apiPage.docs.paramNumber")}</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>body:</b> {t("apiPage.docs.paramBodyMedia")}</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>medias:</b> {t("apiPage.docs.paramMedias")}</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>userId:</b> {t("apiPage.docs.paramUserIdMedia")}</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>queueId:</b> {t("apiPage.docs.paramQueueId")}</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>whatsappId:</b> {t("apiPage.docs.paramWhatsappId")}</Typography>
                                </ListItem>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{t("apiPage.docs.apiResponses")}</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ResponseCode status={200}>200</ResponseCode>
                                    <Typography variant="body2">{t("apiPage.docs.resp200")}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ResponseCode status={401}>401</ResponseCode>
                                    <Typography variant="body2">{t("apiPage.docs.resp401")}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ResponseCode status={403}>403</ResponseCode>
                                    <Typography variant="body2">{t("apiPage.docs.resp403")}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ResponseCode status={500}>500</ResponseCode>
                                    <Typography variant="body2">{t("apiPage.docs.resp500")}</Typography>
                                </Box>
                            </Box>
                        </InstructionContent>
                    </InstructionContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormContainer>
                        <FormContent>
                            <SectionTitle variant="h5">{t("apiPage.form.title")}</SectionTitle>
                            <form onSubmit={handleSubmit}>
                                <StyledInput
                                    select
                                    label={t("apiPage.tokenSelect.label")}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={manualToken}
                                    onChange={(e) => setManualToken(e.target.value)}
                                    helperText={t("apiPage.tokenSelect.helperText")}
                                    InputLabelProps={{ shrink: true }}
                                    SelectProps={{
                                        displayEmpty: true,
                                        renderValue: (selected) => {
                                            if (!selected) return <em>{t("apiPage.tokenSelect.placeholder")}</em>;
                                            return selected;
                                        }
                                    }}
                                >
                                    {apiTokens.length === 0 ? (
                                        <MenuItem disabled value="">
                                            {t("apiPage.tokenSelect.noTokens")}
                                        </MenuItem>
                                    ) : (
                                        apiTokens.map((tk) => (
                                            <MenuItem key={tk.id} value={tk.token}>
                                                {tk.name} - {tk.token}
                                            </MenuItem>
                                        ))
                                    )}
                                </StyledInput>
                                <StyledInput
                                    label={t("apiPage.form.phoneLabel")}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                    placeholder={t("apiPage.form.phonePlaceholder")}
                                    required
                                />
                                <StyledInput
                                    label={t("apiPage.form.messageLabel")}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    required
                                    multiline
                                    rows={3}
                                    placeholder={t("apiPage.form.messagePlaceholder")}
                                />
                                <GridContainer container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <StyledInput
                                        select
                                        label={t("apiPage.form.channelLabel")}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        value={whatsappId || ""}
                                        onChange={(e) => setWhatsappId(e.target.value)}
                                        >
                                        {whatsapps
                                            ?.filter(whatsapp => whatsapp.type === "wwebjs")
                                            .sort((a, b) => a.id - b.id)
                                            .map((whatsapp) => (
                                            <MenuItem key={whatsapp.id} value={whatsapp.id}>
                                                <strong>{whatsapp.id}</strong> - {whatsapp.name}
                                            </MenuItem>
                                            ))}
                                        </StyledInput>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <StyledInput
                                        select
                                        label={t("apiPage.form.queueLabel")}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        value={queueId || ""}
                                        onChange={(e) => setQueueId(e.target.value)}
                                        >
                                        {queues
                                            ?.sort((a, b) => a.id - b.id)
                                            .map((queue) => (
                                            <MenuItem key={queue.id} value={queue.id}>
                                                <strong>{queue.id}</strong> - {queue.name}
                                            </MenuItem>
                                            ))}
                                        </StyledInput>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <StyledInput
                                        select
                                        label={t("apiPage.form.userLabel")}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        value={userId || ""}
                                        onChange={(e) => setUserId(e.target.value)}
                                        >
                                        {users
                                            ?.sort((a, b) => a.id - b.id)
                                            .map((user) => (
                                            <MenuItem key={user.id} value={user.id}>
                                                <strong>{user.id}</strong> - {user.name}
                                            </MenuItem>
                                            ))}
                                        </StyledInput>
                                    </Grid>
                                    </GridContainer>
                                
                                <FileInputContainer>
                                    <label htmlFor="media-upload">
                                        <Button
                                            component="span"
                                            variant="outlined"
                                            size="small"
                                            startIcon={<AttachFileIcon />}
                                            sx={{ mr: 1 }}
                                        >
                                            {t("apiPage.form.selectFile")}
                                        </Button>
                                    </label>
                                    <FileInput
                                        id="media-upload"
                                        type="file"
                                        onChange={handleMediaChange}
                                        accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    />
                                    <Typography variant="body2" color="textSecondary">
                                        {media ? (
                                            <SelectedFileChip>{media.name}</SelectedFileChip>
                                        ) : (
                                            t("apiPage.form.noFile")
                                        )}
                                    </Typography>
                                </FileInputContainer>
                                
                                <StyledButton
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    endIcon={<SendIcon />}
                                >
                                    {t("apiPage.form.sendButton")}
                                </StyledButton>
                            </form>
                            
                            <Box sx={{ mt: 4, pt: 3, borderTop: '1px dashed', borderColor: 'divider' }}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                                    {t("apiPage.form.snippetTitle")}
                                </Typography>
                                <CodeSnippetGenerator
                                    number={number}
                                    body={body}
                                    userId={userId}
                                    queueId={queueId}
                                    whatsappId={whatsappId}
                                    token={manualToken}
                                />
                            </Box>
                        </FormContent>
                    </FormContainer>
                </Grid>
            </Grid>
        </Root>
    );
};

export default Api;
