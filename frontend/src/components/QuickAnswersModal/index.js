import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form } from "formik";
import { toast } from "react-toastify";
import WithSkeleton from "../WithSkeleton";
import MessageVariablesPicker from "../MessageVariablesPicker";
import ButtonWithSpinner from "../ButtonWithSpinner";
import FormikTextField from "../FormikTextField";

import {
  makeStyles,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";

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
    if (initialValues && isMounted.current) {
      setQuickAnswer(prevState => {
        return { ...prevState, ...initialValues  };
      });
    }

(async () => {
      if (!quickAnswerId) return ;
      
      setLoading(true);
      try {
        const { data } = await api.get(`/quickAnswers/${quickAnswerId}`);
                if (!isMounted.current) return; 

        setQuickAnswer(prevState => {
          return { ...prevState, ...data };
        });
        
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toastError(err);
      }       
    })();    
    setQuickAnswer(initialState);
    // eslint-disable-next-line
  }, [quickAnswerId, open, initialValues]);

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
      toast.success(i18n.t("quickAnswersModal.success"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleClickMsgVar = async (msgVar, setValueFunc) => {
    const el = messageInputRef.current;
    const firstHalfText = el.value.substring(0, el.selectionStart);
    const secondHalfText = el.value.substring(el.selectionEnd);
    const newCursorPos = el.selectionStart + msgVar.length;

    setValueFunc("message", `${firstHalfText}${msgVar}${secondHalfText}`);

    await new Promise(r => setTimeout(r, 100));
    messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
  };

  return (
    <div className={classes.root}>
      <Dialog
        maxWidth="sm"
        fullWidth
        open={open}
        onClose={onClose}
        scroll="paper"
      >
        <DialogTitle>
          {quickAnswerId
            ? i18n.t("quickAnswersModal.title.edit")
            : i18n.t("quickAnswersModal.title.add")}
        </DialogTitle>
        <Formik
          initialValues={quickAnswer}
          enableReinitialize={true}
          validationSchema={QuickAnswerSchema}
          onSubmit={handleSaveQuickAnswer}
        >
          {({ touched, errors, isSubmitting, setFieldValue }) => (
            <Form>
              <DialogContent dividers>
                <WithSkeleton loading={loading}>
                  <FormikTextField
                    label={i18n.t("quickAnswersModal.form.shortcut")}
                    autoFocus
                    name="shortcut"
                    touched={touched}
                    errors={errors}
                    variant="outlined"
                    margin="dense"
                    disabled={isSubmitting}
                  />
                </WithSkeleton>
                <WithSkeleton fullWidth loading={loading}>
                  <FormikTextField
                    label={i18n.t("quickAnswersModal.form.message")}
                    multiline
                    inputRef={messageInputRef}
                    minRows={5}
                    fullWidth
                    name="message"
                    touched={touched}
                    errors={errors}
                    variant="outlined"
                    margin="dense"
                    disabled={isSubmitting}
                  />
                </WithSkeleton>
                <WithSkeleton loading={loading}>
                  <MessageVariablesPicker
                    disabled={isSubmitting}
                    onClick={value => handleClickMsgVar(value, setFieldValue)}
                  />
                </WithSkeleton>
              </DialogContent>
              <DialogActions>
                <Button
                onClick={onClose}
                disabled={isSubmitting}
                >
                  {i18n.t("quickAnswersModal.buttons.cancel")}
                </Button>
                <ButtonWithSpinner
                  type="submit"
                  color="primary"
                  disabled={loading || isSubmitting}
                  loading={isSubmitting}
                  variant="contained"
                >
                  {quickAnswerId
                    ? i18n.t("quickAnswersModal.buttons.okEdit")
                    : i18n.t("quickAnswersModal.buttons.okAdd")}                  
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