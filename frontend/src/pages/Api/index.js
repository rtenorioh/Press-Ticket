import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import axios from "axios";
import React, { useEffect, useState } from "react";
import CodeSnippetGenerator from "../../components/CodeSnippetGenerator";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        justifyContent: "center",
        padding: theme.spacing(2),
    },
    formContainer: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxHeight: "550px",
        maxWidth: 600,
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(3),
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        position: "sticky",
        top: theme.spacing(8),
    },
    instructionContainer: {
        padding: theme.spacing(3),
        backgroundColor: theme.palette.background.paper,
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    input: {
        marginBottom: theme.spacing(2),
    },
    button: {
        marginTop: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
    },
    fileInput: {
        marginTop: theme.spacing(1),
    },
    color: {
        color: theme.palette.primary.main,
    },
    text: {
        marginBottom: theme.spacing(0.5),
    },
    textP: {
        marginBottom: theme.spacing(1),
    },
    observacao: {
        marginBottom: theme.spacing(1),
        color: theme.palette.text.secondary,
        fontSize: '0.85rem',
    },
    permissao: {
        marginBottom: theme.spacing(1),
        color: theme.palette.primary.main,
        fontWeight: 'bold',
        fontSize: '0.85rem',
    },
    apiUrl: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(0.5),
        borderRadius: '4px',
        fontFamily: 'monospace',
        overflowX: 'auto',
        marginBottom: theme.spacing(1),
    },
    apiMethod: {
        backgroundColor: '#e3f2fd',
        color: '#0d47a1',
        padding: theme.spacing(0.5, 1),
        borderRadius: '4px',
        fontWeight: 'bold',
        display: 'inline-block',
        marginBottom: theme.spacing(0.5),
    },
    apiHeader: {
        backgroundColor: '#fff8e1',
        padding: theme.spacing(0.5),
        borderRadius: '4px',
        fontFamily: 'monospace',
        marginBottom: theme.spacing(1),
    },
    formTitle: {
        marginBottom: theme.spacing(1),
        fontSize: '1.4rem',
    },
    gridContainer: {
        marginBottom: theme.spacing(1),
    }
}));

const Api = () => {
    const classes = useStyles();
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
            alert("É necessário fornecer um token de API válido para enviar mensagens.");
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

            alert("Mensagem enviada com sucesso!");

        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            alert(`Erro ao enviar mensagem: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <Container className={classes.root}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Paper className={classes.instructionContainer}>
                        <h2>Documentação para envio de mensagens</h2>
                        <p className={classes.permissao}>Permissão necessária: <code>create:messages</code></p>

                        <h2 className={classes.color}>Métodos de Envio</h2>
                        <p className={classes.text}>1. Mensagens de Texto</p>
                        <p className={classes.text}>2. Mensagens de Mídia</p>

                        <h2 className={classes.color}>Instruções</h2>
                        <p><b>Observações Importantes</b></p>
                        <ul>
                            <li className={classes.text}>Para obter o token da API, acesse a seção <b>API key</b> no menu lateral. Sem este token não será possível enviar mensagens.</li>
                            <li className={classes.text}>O número para envio deve estar no formato internacional, sem caracteres especiais:</li>
                            <ul>
                                <li className={classes.text}>Código do país - Ex: 55 (Brasil)</li>
                                <li className={classes.text}>DDD - Ex: 22</li>
                                <li className={classes.text}>Número - Ex: 999999999</li>
                                <li className={classes.text}>Formato final: 5522999999999</li>
                            </ul>
                        </ul>

                        <h2 className={classes.color}>1. Mensagens de Texto</h2>
                        <p>Informações necessárias para envio de mensagens de texto:</p>

                        <div className={classes.apiUrl}>
                            <b>URL:</b> {process.env.REACT_APP_BACKEND_URL}/v1/messages/send
                        </div>

                        <div className={classes.apiMethod}>Método: POST</div>

                        <p><b>Headers:</b></p>
                        <div className={classes.apiHeader}>
                            x-api-token: [seu_token]<br />
                            Content-Type: application/json
                        </div>

                        <p><b>Corpo da requisição (JSON):</b></p>
                        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
                            {`{
"number": "5522999999999",
"body": "Mensagem de teste via API",
"userId": 1,
"queueId": 1,
"whatsappId": 1
}`}
                        </pre>

                        <p><b>Parâmetros obrigatórios:</b></p>
                        <ul>
                            <li><b>number:</b> Número do destinatário no formato DDI+DDD+NÚMERO</li>
                            <li><b>body:</b> Conteúdo da mensagem</li>
                            <li><b>userId:</b> ID do usuário que está enviando a mensagem</li>
                            <li><b>queueId:</b> ID do Setor</li>
                            <li><b>whatsappId:</b> ID do Canal WhatsApp(wwebjs) </li>
                        </ul>

                        <h2 className={classes.color}>2. Mensagens de Mídia</h2>
                        <p>Informações necessárias para envio de mensagens com mídia:</p>

                        <div className={classes.apiUrl}>
                            <b>URL:</b> {process.env.REACT_APP_BACKEND_URL}/v1/messages/send-media
                        </div>

                        <div className={classes.apiMethod}>Método: POST</div>

                        <p><b>Headers:</b></p>
                        <div className={classes.apiHeader}>
                            x-api-token: [seu_token]<br />
                            Content-Type: multipart/form-data
                        </div>

                        <p><b>Corpo da requisição (FormData):</b></p>
                        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
                            {`{
"number": "5522999999999",
"body": "Mensagem de teste via API",
"medias": "arquivo.jpg",
"userId": 1,
"queueId": 1,
"whatsappId": 1
}`}
                        </pre>

                        <p><b>Parâmetros obrigatórios:</b></p>
                        <ul>
                            <li><b>number:</b> 5522999999999</li>
                            <li><b>body:</b> Mensagem que acompanha a mídia</li>
                            <li><b>medias:</b> Arquivo de mídia (imagem, vídeo, áudio ou documento)</li>
                            <li><b>userId:</b> ID do usuário que está enviando</li>
                            <li><b>queueId:</b> ID do Setor</li>
                            <li><b>whatsappId:</b> ID do Canal WhatsApp(wwebjs) </li>
                        </ul>

                        <p><b>Respostas da API:</b></p>
                        <ul>
                            <li><b>200:</b> Mensagem enviada com sucesso</li>
                            <li><b>401:</b> Token inválido ou não fornecido</li>
                            <li><b>403:</b> Token não tem permissão 'create:messages'</li>
                            <li><b>500:</b> Erro interno!</li>
                        </ul>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper className={classes.formContainer}>
                        <h3 className={classes.formTitle}>Envie Mensagens de Texto ou Mídia</h3>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                className={classes.input}
                                label="Token da API"
                                variant="outlined"
                                size="small"
                                fullWidth
                                value={manualToken}
                                onChange={(e) => setManualToken(e.target.value)}
                                placeholder="Insira seu token da API aqui (sem 'Bearer')"
                                helperText="Usar apenas token com permissão 'create:messages'"
                            />
                            <TextField
                                className={classes.input}
                                label="Número de telefone"
                                variant="outlined"
                                size="small"
                                fullWidth
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                required
                            />
                            <TextField
                                className={classes.input}
                                label="Corpo da mensagem"
                                variant="outlined"
                                size="small"
                                fullWidth
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                required
                                multiline
                                rows={2}
                            />
                            <Grid container spacing={1} className={classes.gridContainer}>
                                <Grid item xs={4}>
                                    <TextField
                                        select
                                        className={classes.input}
                                        label="Usuário"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        value={userId || ""}
                                        onChange={(e) => setUserId(e.target.value)}
                                    >
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        select
                                        className={classes.input}
                                        label="Setor"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        value={queueId || ""}
                                        onChange={(e) => setQueueId(e.target.value)}
                                    >
                                        {queues.map((queue) => (
                                            <option key={queue.id} value={queue.id}>
                                                {queue.name}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        select
                                        className={classes.input}
                                        label="Conexão WhatsApp"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        value={whatsappId || ""}
                                        onChange={(e) => setWhatsappId(e.target.value)}
                                    >
                                        {whatsapps
                                            .filter(whatsapp => whatsapp.type === null)
                                            .map((whatsapp) => (
                                                <option key={whatsapp.id} value={whatsapp.id}>
                                                    {whatsapp.name}
                                                </option>
                                            ))
                                        }
                                    </TextField>
                                </Grid>
                            </Grid>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', marginRight: '8px' }}>Arquivo de mídia (opcional):</span>
                                <input
                                    className={classes.fileInput}
                                    type="file"
                                    onChange={handleMediaChange}
                                    accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    style={{ fontSize: '0.85rem' }}
                                />
                            </div>
                            <Button
                                className={classes.button}
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="small"
                            >
                                ENVIAR MENSAGEM
                            </Button>
                        </form>
                        <CodeSnippetGenerator
                            number={number}
                            body={body}
                            userId={userId}
                            queueId={queueId}
                            whatsappId={whatsappId}
                            token={manualToken}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Api;