import {
    Button,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    TextField
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import React, { useState } from "react";
import codeSnippets from './codeSnippets.js';

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
    },
    modalContent: {
        padding: theme.spacing(4),
        maxWidth: 600,
        backgroundColor: theme.palette.background.default,
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        outline: "none",
        position: "relative",
    },
    selectContainer: {
        marginBottom: theme.spacing(2),
    },
    snippetBox: {
        marginTop: theme.spacing(2),
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(2),
        borderRadius: "4px",
        overflowX: "auto",
        fontFamily: "monospace",
        maxHeight: "400px",
        overflowY: "scroll",
    },
    closeButton: {
        position: "absolute",
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.secondary.main,
    },
}));

const CodeSnippetGenerator = ({ number, body, userId, queueId, whatsappId, token }) => {
    const classes = useStyles();
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [open, setOpen] = useState(false);
    const [snippet, setSnippet] = useState("");

    const handleOpen = () => {
        const generateSnippet = codeSnippets[selectedLanguage];
        if (generateSnippet) {
            setSnippet(generateSnippet(number, body, userId, queueId, whatsappId, token));
            setOpen(true);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e) => {
        setSelectedLanguage(e.target.value);
    };

    return (
        <div className={classes.root}>
            <FormControl className={classes.selectContainer}>
                <InputLabel id="language-select-label">Selecione uma linguagem (Apenas para envio de texto)</InputLabel>
                <Select
                    labelId="language-select-label"
                    value={selectedLanguage}
                    onChange={handleChange}
                >
                    {Object.keys(codeSnippets).map((lang) => (
                        <MenuItem key={lang} value={lang}>
                            {lang}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Button
                variant="contained"
                color="primary"
                onClick={handleOpen}
                disabled={!selectedLanguage}
            >
                Gerar Snippet
            </Button>

            <Modal open={open} onClose={handleClose}>
                <div className={classes.modalContent}>
                    {/* Botão de fechar */}
                    <IconButton className={classes.closeButton} onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>

                    <h2>Snippet de código para {selectedLanguage}</h2>
                    <TextField
                        className={classes.snippetBox}
                        multiline
                        minRows={15}
                        value={snippet}
                        variant="outlined"
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigator.clipboard.writeText(snippet)}
                    >
                        Copiar código
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default CodeSnippetGenerator;
