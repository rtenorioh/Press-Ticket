import {
    Button,
    FormControl,
    IconButton,
    MenuItem,
    Modal,
    Select,
    Typography,
    Box,
    Fade,
    InputLabel,
    Paper
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CodeIcon from "@mui/icons-material/Code";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import React, { useCallback, useState } from "react";
import codeSnippets from "./codeSnippets.js";

const Root = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    width: "100%",
}));

const ModalContent = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    maxWidth: 700,
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    outline: "none",
    position: "relative",
    margin: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
        margin: theme.spacing(1),
        maxWidth: 'calc(100% - 32px)',
        maxHeight: "85vh",
    },
}));

const ModalTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    marginBottom: theme.spacing(3),
    color: theme.palette.text.primary,
    textAlign: "center",
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.25rem',
    },
}));

const SelectContainer = styled(FormControl)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    width: "100%",
}));

const StyledSelect = styled(Select)(({ theme }) => ({
    '& .MuiSelect-select': {
        padding: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
        minHeight: '20px',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.divider,
    },
    '& .MuiInputLabel-outlined': {
        transform: 'translate(14px, 16px) scale(1)',
    },
    '& .MuiInputLabel-shrink': {
        transform: 'translate(14px, -6px) scale(0.75)',
    },
}));

const PlaceholderMenuItem = styled(MenuItem)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
}));

const CodeContainer = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    width: "100%",
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    maxHeight: "400px",
    overflow: "auto",
    ...theme.scrollbarStyles,
}));

const CodeContent = styled('pre')(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(2),
    fontFamily: "'Roboto Mono', monospace",
    fontSize: '0.875rem',
    whiteSpace: "pre",
    overflowWrap: "normal",
    color: theme.palette.mode === 'dark' ? '#e6e6e6' : '#333',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
    position: "absolute",
    right: theme.spacing(1.5),
    top: theme.spacing(1.5),
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.default,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    zIndex: 1,
}));

const CopyButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(3),
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

const GenerateButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1, 2),
    fontWeight: 500,
    transition: "all 0.2s",
    '&:hover': {
        transform: "translateY(-2px)",
    },
}));

const CodeSnippetGenerator = ({ number, body, userId, queueId, whatsappId, token }) => {
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
        <Root>
            <SelectContainer>
                <InputLabel 
                    id="language-select-label"
                    shrink={true}
                >
                    Linguagem de Programação
                </InputLabel>
                <StyledSelect
                    labelId="language-select-label"
                    id="language-select"
                    value={selectedLanguage}
                    onChange={handleChange}
                    displayEmpty
                    variant="outlined"
                    notched={true}
                    label="Linguagem de Programação"
                    renderValue={selected => {
                        if (!selected) {
                            return <Typography color="text.secondary" fontStyle="italic">Selecione uma linguagem</Typography>;
                        }
                        return selected;
                    }}
                >
                    <PlaceholderMenuItem value="" disabled>
                        Selecione uma linguagem
                    </PlaceholderMenuItem>
                    {Object.keys(codeSnippets).map((lang) => (
                        <MenuItem key={lang} value={lang}>
                            {lang}
                        </MenuItem>
                    ))}
                </StyledSelect>
            </SelectContainer>

            <GenerateButton
                variant="contained"
                color="primary"
                onClick={handleOpen}
                disabled={!selectedLanguage}
                startIcon={<CodeIcon />}
                fullWidth
            >
                Gerar Snippet
            </GenerateButton>

            <Modal 
                open={open} 
                onClose={handleClose}
                closeAfterTransition
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Fade in={open}>
                    <ModalContent>
                        <CloseButton
                            onClick={handleClose}
                            aria-label="close"
                            size="small"
                        >
                            <CloseIcon fontSize="small" />
                        </CloseButton>

                        <ModalTitle variant="h5">
                            Snippet de código para {selectedLanguage}
                        </ModalTitle>
                        
                        <CodeContainer>
                            <CodeContent>
                                {snippet}
                            </CodeContent>
                        </CodeContainer>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <CopyButton
                                variant="contained"
                                color="primary"
                                onClick={handleCopy}
                                startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                            >
                                {copied ? "Código Copiado!" : "Copiar Código"}
                            </CopyButton>
                        </Box>
                    </ModalContent>
                </Fade>
            </Modal>
        </Root>
    );
};

export default CodeSnippetGenerator;
