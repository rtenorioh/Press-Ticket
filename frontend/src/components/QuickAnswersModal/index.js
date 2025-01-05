import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles
} from "@material-ui/core";
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

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1)
    }
  }
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
  const classes = useStyles();

  const initialState = {
    shortcut: "",
    message: "",
  };
  const { t } = useTranslation();
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
    <div className={classes.root}>
      <Dialog
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
                <WithSkeleton loading={loading}>
                  <FormikTextField
                    label={t("quickAnswersModal.form.shortcut")}
                    autoFocus
                    name="shortcut"
                    touched={touched}
                    errors={errors}
                    variant="outlined"
                    margin="dense"
                    value={values.shortcut || ""}
                    onChange={(e) => setFieldValue("shortcut", e.target.value)}
                    disabled={isSubmitting}
                  />
                </WithSkeleton>
                <WithSkeleton fullWidth loading={loading}>
                  <FormikTextField
                    label={t("quickAnswersModal.form.message")}
                    multiline
                    inputRef={messageInputRef}
                    minRows={5}
                    fullWidth
                    name="message"
                    touched={touched}
                    errors={errors}
                    variant="outlined"
                    margin="dense"
                    value={values.message || ""}
                    onChange={(e) => setFieldValue("message", e.target.value)}
                    disabled={isSubmitting}
                  />
                </WithSkeleton>
                <WithSkeleton loading={loading}>
                  <MessageVariablesPicker
                    disabled={isSubmitting}
                    onClick={(value) => handleClickMsgVar(value, setFieldValue)}
                  />
                </WithSkeleton>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} disabled={isSubmitting}>
                  {t("quickAnswersModal.buttons.cancel")}
                </Button>
                <ButtonWithSpinner
                  type="submit"
                  color="primary"
                  disabled={loading || isSubmitting}
                  loading={isSubmitting}
                  variant="contained"
                >
                  {quickAnswerId
                    ? t("quickAnswersModal.buttons.okEdit")
                    : t("quickAnswersModal.buttons.okAdd")}
                </ButtonWithSpinner>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default QuickAnswersModal;
