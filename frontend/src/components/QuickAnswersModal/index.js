import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Collapse,
  IconButton,
  Avatar,
} from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import { styled, useTheme } from "@mui/material/styles";
import { Form, Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as Yup from "yup";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import FormikTextField from "../FormikTextField";
import MessageVariablesPicker from "../MessageVariablesPicker";
import WithSkeleton from "../WithSkeleton";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogTitle-root': {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    '& .MuiTypography-root': {
      fontWeight: 500,
    },
    padding: theme.spacing(2),
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
    backgroundColor: '#f5f5f5',
  },
}));

const FormContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: theme.spacing(3),
}));

const FieldContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  marginBottom: theme.spacing(1),
}));

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : '#e3f2fd',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.3)' : '#90caf9'}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ExampleBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : '#f5f5f5',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(0.5),
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(1),
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  whiteSpace: 'pre-wrap',
  color: theme.palette.text.primary,
}));

const QuickAnswerSchema = Yup.object().shape({
  shortcut: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  message: Yup.string()
    .min(8, "Too Short!")
    .max(30000, "Too Long!")
    .required("Required"),
});

const QuickAnswersModal = ({
  open,
  onClose,
  onSave,
  quickAnswerId,
  initialValues
}) => {
  const initialState = {
    shortcut: "",
    message: "",
    mediaPath: "",
  };
  const { t } = useTranslation();
  const theme = useTheme();
  const isMounted = useRef(true);
  const messageInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [quickAnswer, setQuickAnswer] = useState(initialState);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (quickAnswerId) {
      const fetchQuickAnswer = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/quickAnswers/${quickAnswerId}`);
          if (isMounted.current) {
            setQuickAnswer(data);
            
            if (data.mediaPath) {
              setFilePreview({
                url: `${process.env.REACT_APP_BACKEND_URL}/public/${data.mediaPath}`,
                name: data.mediaPath,
                type: 'application/octet-stream',
                size: 0
              });
            }
          }
        } catch (err) {
          toastError(err);
        } finally {
          setLoading(false);
        }
      };

      fetchQuickAnswer();
    }
  }, [quickAnswerId]);

  useEffect(() => {
    if (open && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [open]);

  const handleClose = () => {
    onClose();
    setQuickAnswer(initialState);
    setSelectedFile(null);
    setFilePreview(null);
    setLoading(false);
  };

  const handleSaveQuickAnswer = async values => {
    try {
      const formData = new FormData();
      formData.append("shortcut", values.shortcut);
      formData.append("message", values.message);
      
      if (selectedFile) {
        formData.append("media", selectedFile);
      }

      if (quickAnswerId) {
        const response = await api.put(`/quickAnswers/${quickAnswerId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        onClose();
      } else {
        const { data } = await api.post("/quickAnswers", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (onSave) {
          onSave(data);
        }
        onClose();
      }
      toast.success(t("quickAnswersModal.success"));
    } catch (err) {
      toastError(err, t);
    }
  };

  const handleClickMsgVar = (msgVar, setValueFunc) => {
    const el = messageInputRef.current;
    const firstHalfText = el.value.substring(0, el.selectionStart);
    const secondHalfText = el.value.substring(el.selectionEnd);

    setValueFunc("message", `${firstHalfText}${msgVar}${secondHalfText}`);

    const newCursorPos = el.selectionStart + msgVar.length;
    setTimeout(() => {
      el.setSelectionRange(newCursorPos, newCursorPos);
      el.focus();
    }, 100);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview({
          url: reader.result,
          name: file.name,
          type: file.type,
          size: file.size
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <ImageIcon />;
    if (type.startsWith('video/')) return <VideoLibraryIcon />;
    if (type.startsWith('audio/')) return <AudiotrackIcon />;
    return <InsertDriveFileIcon />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <StyledDialog
      maxWidth="sm"
      fullWidth
      open={open}
      onClose={handleClose}
      scroll="paper"
    >
      <DialogTitle>
        {quickAnswerId
          ? t("quickAnswersModal.title.edit")
          : t("quickAnswersModal.title.add")}
      </DialogTitle>
      <Formik
        initialValues={quickAnswer || initialState}
        enableReinitialize={true}
        validationSchema={QuickAnswerSchema}
        onSubmit={handleSaveQuickAnswer}
      >
        {({ touched, errors, isSubmitting, setFieldValue, values }) => (
          <Form>
            <DialogContent dividers>
              <FormContainer>
                <FieldContainer>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {t("quickAnswersModal.form.shortcut")}
                  </Typography>
                  <WithSkeleton loading={loading}>
                    <FormikTextField
                      autoFocus
                      name="shortcut"
                      touched={touched}
                      errors={errors}
                      variant="outlined"
                      fullWidth
                      value={values.shortcut || ""}
                      onChange={(e) => setFieldValue("shortcut", e.target.value)}
                      disabled={isSubmitting}
                      placeholder={t("quickAnswersModal.form.shortcut")}
                    />
                  </WithSkeleton>
                </FieldContainer>
                
                <FieldContainer>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">
                      {t("quickAnswersModal.form.message")}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<InfoOutlinedIcon />}
                      endIcon={<ExpandMoreIcon sx={{ transform: showHelp ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />}
                      onClick={() => setShowHelp(!showHelp)}
                      sx={{ 
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        color: theme.palette.primary.main
                      }}
                    >
                      Como dividir mensagens
                    </Button>
                  </Box>
                  
                  <Collapse in={showHelp}>
                    <InfoBox>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>
                        💡 Divisão Automática de Mensagens
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                        Use <strong>|q</strong> para dividir sua mensagem em partes que serão enviadas com delay automático.
                      </Typography>
                      
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        ⏱️ Delay por quantidade de pipes:
                      </Typography>
                      <Typography variant="body2" component="div" sx={{ mb: 1.5, pl: 2 }}>
                        • <strong>|q</strong> = 4 segundos<br/>
                        • <strong>||q</strong> = 8 segundos<br/>
                        • <strong>|||q</strong> = 12 segundos<br/>
                        • <strong>||||q</strong> = 16 segundos
                      </Typography>
                      
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        📝 Exemplo:
                      </Typography>
                      <ExampleBox>
                        Olá, tudo bem? |q
                        Seu pedido foi processado com sucesso! ||q
                        O código de rastreamento é: ABC123 |||q
                        Obrigado pela preferência!
                      </ExampleBox>
                      
                      <Typography variant="caption" sx={{ display: 'block', mt: 1.5, fontStyle: 'italic', color: theme.palette.text.secondary }}>
                        ✅ Resultado: 1ª mensagem enviada imediatamente, 2ª após 4s, 3ª após 8s e 4ª após 12s
                      </Typography>
                    </InfoBox>
                  </Collapse>
                  
                  <WithSkeleton fullWidth loading={loading}>
                    <FormikTextField
                      multiline
                      inputRef={messageInputRef}
                      minRows={5}
                      fullWidth
                      name="message"
                      touched={touched}
                      errors={errors}
                      variant="outlined"
                      value={values.message || ""}
                      onChange={(e) => setFieldValue("message", e.target.value)}
                      disabled={isSubmitting}
                      placeholder={t("quickAnswersModal.form.message")}
                    />
                  </WithSkeleton>
                </FieldContainer>

                <FieldContainer>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      Anexar Arquivo (Opcional)
                    </Typography>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AttachFileIcon />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      sx={{ textTransform: 'none' }}
                    >
                      Selecionar Arquivo
                    </Button>
                  </Box>

                  {filePreview && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : '#f5f5f5',
                      }}
                    >
                      <Avatar
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          width: 40,
                          height: 40,
                        }}
                      >
                        {getFileIcon(filePreview.type)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {filePreview.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatFileSize(filePreview.size)}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={handleRemoveFile}
                        disabled={isSubmitting}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </FieldContainer>
                
                <WithSkeleton loading={loading}>
                  <MessageVariablesPicker
                    disabled={isSubmitting}
                    onClick={(value) => handleClickMsgVar(value, setFieldValue)}
                  />
                </WithSkeleton>
              </FormContainer>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleClose} 
                disabled={isSubmitting}
                variant="contained"
                sx={{ 
                  borderRadius: 20,
                  px: 3,
                  backgroundColor: '#e0e0e0',
                  color: '#757575',
                  '&:hover': {
                    backgroundColor: '#d5d5d5',
                  },
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                }}
              >
                {t("quickAnswersModal.buttons.cancel")}
              </Button>
              <ButtonWithSpinner
                type="submit"
                disabled={loading || isSubmitting}
                loading={isSubmitting}
                variant="contained"
                sx={{ 
                  borderRadius: 20,
                  px: 3,
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                }}
              >
                {quickAnswerId
                  ? t("quickAnswersModal.buttons.okEdit")
                  : t("quickAnswersModal.buttons.okAdd")}
              </ButtonWithSpinner>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </StyledDialog>
  );
};

export default QuickAnswersModal;
