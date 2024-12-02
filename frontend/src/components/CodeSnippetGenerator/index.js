import {
    Button,
    FormControl,
    IconButton,
    MenuItem,
    Modal,
    Select,
    TextField
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import React, { useCallback, useState } from "react";
import codeSnippets from "./codeSnippets.js";
const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    modalContent: {
        padding: theme.spacing(4),
        maxWidth: 600,
        backgroundColor: theme.palette.background.default,
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        outline: "none",
        position: "relative",
        textAlign: "center",
    },
    selectContainer: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(2),
        width: "100%",
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
    copyButton: {
        marginTop: theme.spacing(2),
    },
}));

const CodeSnippetGenerator = ({ number, body, userId, queueId, whatsappId, token }) => {
    const classes = useStyles();
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [open, setOpen] = useState(false);
    const [snippet, setSnippet] = useState("");
    const [copied, setCopied] = useState(false);

    const handleOpen = useCallback(() => {
        const generateSnippet = codeSnippets[selectedLanguage];
        if (generateSnippet) {
            setSnippet(
                generateSnippet(number, body, userId, queueId, whatsappId, token)
            );
            setOpen(true);
        }
    }, [selectedLanguage, number, body, userId, queueId, whatsappId, token]);

    const handleClose = useCallback(() => {
        setOpen(false);
        setCopied(false);
    }, []);

    const handleChange = (e) => {
        setSelectedLanguage(e.target.value);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={classes.root}>
            <FormControl className={classes.selectContainer}>
                <Select
                    labelId="language-select-label"
                    value={selectedLanguage}
                    onChange={handleChange}
                >
                    <MenuItem value="" disabled>
                        Selecione uma linguagem
                    </MenuItem>
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
                    <IconButton
                        className={classes.closeButton}
                        onClick={handleClose}
                        aria-label="close"
                    >
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
                        className={classes.copyButton}
                        onClick={handleCopy}
                    >
                        {copied ? "Copiado!" : "Copiar código"}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default CodeSnippetGenerator;
