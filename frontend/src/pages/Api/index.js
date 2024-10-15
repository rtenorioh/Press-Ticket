import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import axios from "axios";
import React, { useEffect, useState } from "react";
import CodeSnippetGenerator from "../../components/CodeSnippetGenerator"; // Import do componente
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
        maxWidth: 600,
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(4),
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        position: "sticky",
        top: theme.spacing(8),
    },
    instructionContainer: {
        padding: theme.spacing(4),
        backgroundColor: theme.palette.background.paper,
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    input: {
        marginBottom: theme.spacing(3),
    },
    button: {
        marginTop: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
    },
    fileInput: {
        marginTop: theme.spacing(2),
    },
    color: {
        color: theme.palette.primary.main,
    },
    text: {
        marginBottom: theme.spacing(1),
    },
    textP: {
        marginBottom: theme.spacing(2),
    },
    observacao: {
        marginBottom: theme.spacing(2),
        color: theme.palette.text.secondary,
        fontSize: '0.9rem',
    }
}));

const Api = () => {
    const classes = useStyles();
    const [number, setNumber] = useState("");
    const [body, setBody] = useState("");
    const [media, setMedia] = useState(null);
    const [userId, setUserId] = useState();
    const [queueId, setQueueId] = useState();
    const [whatsappId, setWhatsappId] = useState();
    const [settings, setSettings] = useState([]);
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

    const getSettingValue = key => {
        const { value } = settings.find(s => s.key === key);
        return value;
    };

    const handleMediaChange = (e) => {
        setMedia(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = settings && settings.length > 0 && getSettingValue("userApiToken");

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
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/messages/send`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": media ? "multipart/form-data" : "application/json"
                }
            });

            console.log("Mensagem enviada com sucesso:", response.data);
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
    };

    return (
        <Container className={classes.root}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Paper className={classes.instructionContainer}>
                        <h2>Documentação para envio de mensagens</h2>
                        <h2 className={classes.color}>Métodos de Envio</h2>
                        <p className={classes.text}>1. Mensagens de Texto</p>
                        <p className={classes.text}>2. Mensagens de Mídia</p>

                        <h2 className={classes.color}>Instruções</h2>
                        <p><b>Observações Importantes</b></p>
                        <ul>
                            <li className={classes.text}>Para pegar o token da API, vá em API key que seu token estará lá, sem ele não será possível enviar mensagens.</li>
                            <li className={classes.text}>O número para envio não deve ter máscara ou caracteres especiais e deve ser composto por:</li>
                            <ul>
                                <li className={classes.text}>Código do país - Ex: 55 (Brasil)</li>
                                <li className={classes.text}>DDD</li>
                                <li className={classes.text}>Número</li>
                            </ul>
                        </ul>

                        <h2 className={classes.color}>1. Mensagens de Texto</h2>
                        <p>Seguem abaixo lista de informações necessárias para envio das mensagens de texto:</p>
                        <p className={classes.textP}><b>URL: </b>{process.env.REACT_APP_BACKEND_URL}/api/messages/send</p>
                        <p className={classes.textP}><b>Método: </b>POST</p>
                        <p className={classes.textP}><b>Headers: </b>Authorization: Bearer (token) e Content-Type application/json</p>
                        <p className={classes.textP}><b>Body: </b>"number": "5599999999999", "body": "Enviado via api", "userId": "1", "queueId": "1", "whatsappId": "1"</p>

                        <h2 className={classes.color}>2. Mensagens de Mídia</h2>
                        <p>Seguem abaixo lista de informações necessárias para envio de mídias:</p>
                        <p className={classes.textP}><b>URL: </b>{process.env.REACT_APP_BACKEND_URL}/api/messages/send</p>
                        <p className={classes.textP}><b>Método: </b>POST</p>
                        <p className={classes.textP}><b>Headers: </b>Authorization: Bearer (token) e Content-Type multipart/form-data</p>
                        <p className={classes.textP}><b>Body: </b>"number": "5599999999999", "medias": "aqui vai sua mídia", "body": "Enviado via api", "userId": "1", "queueId": "1", "whatsappId": "1"</p>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper className={classes.formContainer}>
                        <h2>Envie Mensagens de Texto ou Mídia</h2>
                        <p className={classes.observacao}>
                            Observação: Neste formulário, o token é puxado automaticamente. Para utilizar em outros locais, é necessário ter o token.
                        </p>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                className={classes.input}
                                label="Número de telefone"
                                variant="outlined"
                                fullWidth
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                required
                            />
                            <TextField
                                className={classes.input}
                                label="Corpo da mensagem"
                                variant="outlined"
                                fullWidth
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                required
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <TextField
                                        select
                                        className={classes.input}
                                        label="User ID"
                                        variant="outlined"
                                        fullWidth
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        required
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
                                        label="Setor ID"
                                        variant="outlined"
                                        fullWidth
                                        value={queueId}
                                        onChange={(e) => setQueueId(e.target.value)}
                                        required
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
                                        label="WhatsApp ID"
                                        variant="outlined"
                                        fullWidth
                                        value={whatsappId}
                                        onChange={(e) => setWhatsappId(e.target.value)}
                                        required
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
                            <input
                                className={classes.fileInput}
                                type="file"
                                onChange={handleMediaChange}
                            />
                            <Button
                                className={classes.button}
                                type="submit"
                                fullWidth
                                variant="contained"
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
                            token={settings && settings.length > 0 && getSettingValue("userApiToken")}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Api;
