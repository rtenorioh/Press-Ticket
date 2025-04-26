import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Paper
} from "@mui/material";
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

const VariablesContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  '& .MuiButton-root': {
    margin: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: '#673ab7',
    color: 'white',
    '&:hover': {
      backgroundColor: '#5e35b1',
    },
  },
}));

const VariablesTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  fontWeight: 500,
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
  };
  const { t } = useTranslation();
  const theme = useTheme();
  const isMounted = useRef(true);
  const messageInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [quickAnswer, setQuickAnswer] = useState(initialState);

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
          if (isMounted.current) setQuickAnswer(data);
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
    setLoading(false);
  };

  const handleSaveQuickAnswer = async values => {
    try {
      if (quickAnswerId) {
        await api.put(`/quickAnswers/${quickAnswerId}`, values);
        onClose();
      } else {
        const { data } = await api.post("/quickAnswers", values);
        if (onSave) {
          onSave(data);
        }
        onClose();
      }
      toast.success(t("quickAnswersModal.success"));
    } catch (err) {
      toastError(err);
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
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {t("quickAnswersModal.form.message")}
                  </Typography>
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
                
                <VariablesContainer>
                  <VariablesTitle variant="body2">
                    {t("quickAnswersModal.variables")}
                  </VariablesTitle>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                    <WithSkeleton loading={loading}>
                      <MessageVariablesPicker
                        disabled={isSubmitting}
                        onClick={(value) => handleClickMsgVar(value, setFieldValue)}
                      />
                    </WithSkeleton>
                  </Paper>
                </VariablesContainer>
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
