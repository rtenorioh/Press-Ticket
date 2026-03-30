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
    const [number, setNumber] = useState("");
    const [body, setBody] = useState("");
    const [media, setMedia] = useState(null);
    const [userId, setUserId] = useState("");
    const [queueId, setQueueId] = useState("");
    const [whatsappId, setWhatsappId] = useState("");
    const [manualToken, setManualToken] = useState("");
    const [users, setUsers] = useState([]);
    const [queues, setQueues] = useState([]);
    const [whatsapps, setWhatsapps] = useState([]);

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
            toast.error("É necessário fornecer um token de API válido para enviar mensagens.");
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

            toast.success("Mensagem enviada com sucesso!");
            setBody("");
            setMedia(null);

        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            toast.error(`Erro ao enviar mensagem: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <Root>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <InstructionContainer>
                        <InstructionContent>
                            <SectionTitle variant="h5">Documentação para envio de mensagens</SectionTitle>
                            <PermissionTag>
                                <InfoIcon /> Permissão necessária: <code>create:messages</code>
                            </PermissionTag>

                            <SubTitle variant="h6">Métodos de Envio</SubTitle>
                            <ListItem>Mensagens de Texto</ListItem>
                            <ListItem>Mensagens de Mídia</ListItem>

                            <Divider sx={{ my: 2 }} />

                            <SubTitle variant="h6">Instruções</SubTitle>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1, mb: 1 }}>
                                Observações Importantes
                            </Typography>
                            
                            <ListItem>
                                <Typography variant="body2">
                                    Para obter o token da API, acesse a seção <b>API key</b> no menu lateral. Sem este token não será possível enviar mensagens.
                                </Typography>
                            </ListItem>
                            <ListItem>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        O número para envio deve estar no formato internacional, sem caracteres especiais:
                                    </Typography>
                                    <Box sx={{ pl: 2 }}>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>• Código do país - Ex: 55 (Brasil)</Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>• DDD - Ex: 22</Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>• Número - Ex: 999999999</Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>• Formato final: 5522999999999</Typography>
                                    </Box>
                                </Box>
                            </ListItem>

                            <Divider sx={{ my: 2 }} />

                            <SubTitle variant="h6">1. Mensagens de Texto</SubTitle>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Informações necessárias para envio de mensagens de texto:
                            </Typography>

                            <ApiUrl>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>URL:</Typography>
                                <Typography variant="body2" fontFamily="monospace">
                                    {process.env.REACT_APP_BACKEND_URL}/v1/messages/send
                                </Typography>
                            </ApiUrl>

                            <ApiMethod>
                                <CodeIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> Método: POST
                            </ApiMethod>

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Headers:</Typography>
                            <ApiHeader>
                                <Typography variant="body2" fontFamily="monospace">
                                    x-api-token: [seu_token]<br />
                                    Content-Type: application/json
                                </Typography>
                            </ApiHeader>

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Corpo da requisição (JSON):</Typography>
                            <CodeBlock>
{`{
  "number": "5522999999999",
  "body": "Mensagem de teste via API",
  "userId": 1,
  "queueId": 1,
  "whatsappId": 1
}`}
                            </CodeBlock>

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Parâmetros obrigatórios:</Typography>
                            <Box sx={{ mb: 2 }}>
                                <ListItem>
                                    <Typography variant="body2"><b>number:</b> Número do destinatário no formato DDI+DDD+NÚMERO</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>body:</b> Conteúdo da mensagem</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>userId:</b> ID do usuário que está enviando a mensagem</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>queueId:</b> ID do Setor</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>whatsappId:</b> ID do Canal WhatsApp(wwebjs)</Typography>
                                </ListItem>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <SubTitle variant="h6">2. Mensagens de Mídia</SubTitle>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Informações necessárias para envio de mensagens com mídia:
                            </Typography>

                            <ApiUrl>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>URL:</Typography>
                                <Typography variant="body2" fontFamily="monospace">
                                    {process.env.REACT_APP_BACKEND_URL}/v1/messages/send-media
                                </Typography>
                            </ApiUrl>

                            <ApiMethod>
                                <CodeIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> Método: POST
                            </ApiMethod>

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Headers:</Typography>
                            <ApiHeader>
                                <Typography variant="body2" fontFamily="monospace">
                                    x-api-token: [seu_token]<br />
                                    Content-Type: multipart/form-data
                                </Typography>
                            </ApiHeader>

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Corpo da requisição (FormData):</Typography>
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

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Parâmetros obrigatórios:</Typography>
                            <Box sx={{ mb: 2 }}>
                                <ListItem>
                                    <Typography variant="body2"><b>number:</b> Número do destinatário no formato DDI+DDD+NÚMERO</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>body:</b> Mensagem que acompanha a mídia</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>medias:</b> Arquivo de mídia (imagem, vídeo, áudio ou documento)</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>userId:</b> ID do usuário que está enviando</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>queueId:</b> ID do Setor</Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography variant="body2"><b>whatsappId:</b> ID do Canal WhatsApp(wwebjs)</Typography>
                                </ListItem>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Respostas da API:</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ResponseCode status={200}>200</ResponseCode>
                                    <Typography variant="body2">Mensagem enviada com sucesso</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ResponseCode status={401}>401</ResponseCode>
                                    <Typography variant="body2">Token inválido ou não fornecido</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ResponseCode status={403}>403</ResponseCode>
                                    <Typography variant="body2">Token não tem permissão 'create:messages'</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ResponseCode status={500}>500</ResponseCode>
                                    <Typography variant="body2">Erro interno!</Typography>
                                </Box>
                            </Box>
                        </InstructionContent>
                    </InstructionContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormContainer>
                        <FormContent>
                            <SectionTitle variant="h5">Envie Mensagens de Texto ou Mídia</SectionTitle>
                            <form onSubmit={handleSubmit}>
                                <StyledInput
                                    label="Token da API"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={manualToken}
                                    onChange={(e) => setManualToken(e.target.value)}
                                    placeholder="Insira seu token da API aqui (sem 'Bearer')"
                                    helperText="Usar apenas token com permissão 'create:messages'"
                                />
                                <StyledInput
                                    label="Número de telefone"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                    placeholder="Ex: 5522999999999"
                                    required
                                />
                                <StyledInput
                                    label="Corpo da mensagem"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    required
                                    multiline
                                    rows={3}
                                    placeholder="Digite sua mensagem aqui"
                                />
                                <GridContainer container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <StyledInput
                                        select
                                        label="Canal"
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
                                        label="Setor"
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
                                        label="Usuário"
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
                                            Selecionar Arquivo
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
                                            "Nenhum arquivo selecionado"
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
                                    Enviar Mensagem
                                </StyledButton>
                            </form>
                            
                            <Box sx={{ mt: 4, pt: 3, borderTop: '1px dashed', borderColor: 'divider' }}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                                    Gerador de Snippets
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
