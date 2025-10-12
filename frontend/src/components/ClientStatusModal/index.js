import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField,
    Box,
    Typography,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { styled, useTheme } from "@mui/material/styles";
import { Colorize } from "@mui/icons-material";
import {
    Field,
    Form,
    Formik
} from "formik";
import { HexColorPicker } from "react-colorful";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

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

const FormContainer = styled('div')({
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "16px",
});

const FieldContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    marginBottom: theme.spacing(2),
    width: "100%",
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
    color: theme.palette.error.main,
    fontSize: '0.75rem',
    marginTop: '3px',
    marginLeft: '14px',
}));

const ButtonProgress = styled(CircularProgress)({
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
});

const ColorAdorment = styled('div')({
    width: 24,
    height: 24,
    borderRadius: 4,
    border: '1px solid rgba(0, 0, 0, 0.12)',
});

const ColorPickerContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: "100%",
    '& .react-colorful': {
        width: '100%',
        maxWidth: 300,
        boxShadow: theme.shadows[3],
        borderRadius: theme.shape.borderRadius,
    },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.shape.borderRadius,
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: ({ error }) => error ? theme.palette.error.main : 'rgba(0, 0, 0, 0.23)',
    },
    '& .MuiFormLabel-root': {
        color: ({ error }) => error ? theme.palette.error.main : 'rgba(0, 0, 0, 0.6)',
    },
}));

const ClientStatusSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, "Mensagem muito curta")
        .required("Obrigatório")
});

const ClientStatusModal = ({ open, onClose, clientStatusId, reload }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const { user } = useContext(AuthContext);
    const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
    const initialState = {
        name: "",
        color: "#000000"
    };
    const [clientStatus, setClientStatus] = useState(initialState);

    useEffect(() => {
        try {
            (async () => {
                if (!clientStatusId) return;

                const { data } = await api.get(`/client-status/${clientStatusId}`);
                setClientStatus(prevState => {
                    return { ...prevState, ...data };
                });
            })()
        } catch (err) {
            toastError(err);
        }
    }, [clientStatusId, open]);

    const handleClose = () => {
        setClientStatus(initialState);
        setColorPickerModalOpen(false);
        onClose();
    };

    const handleSaveClientStatus = async values => {
        const clientStatusData = { ...values, userId: user.id };
        try {
            let response;
            if (clientStatusId) {
                response = await api.put(`/client-status/${clientStatusId}`, clientStatusData);
            } else {
                response = await api.post("/client-status", clientStatusData);
            }
            toast.success(t("clientStatusModal.success"));
            
            if (onClose && response && response.data) {
                const statusResponse = {
                    id: response.data.id || clientStatusId,
                    name: response.data.name || values.name,
                    color: response.data.color || values.color,
                    userId: response.data.userId || user.id
                };
                onClose(statusResponse);
            }
        } catch (err) {
            toastError(err);
        } finally {
            handleClose();
        }
    };

    return (
        <StyledDialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            scroll="paper"
        >
            <DialogTitle id="form-dialog-title">
                {clientStatusId ? t("clientStatusModal.title.edit") : t("clientStatusModal.title.add")}
            </DialogTitle>
            <Formik
                initialValues={clientStatus}
                enableReinitialize={true}
                validationSchema={ClientStatusSchema}
                onSubmit={(values, actions) => {
                    setTimeout(() => {
                        handleSaveClientStatus(values);
                        actions.setSubmitting(false);
                    }, 400);
                }}
            >
                {({ touched, errors, isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <DialogContent dividers>
                            <FormContainer>
                                <FieldContainer>
                                    <Field
                                        as={StyledTextField}
                                        label={t("clientStatusModal.form.name")}
                                        name="name"
                                        error={touched.name && Boolean(errors.name)}
                                        variant="outlined"
                                        fullWidth
                                        onChange={(e) => {
                                            setClientStatus(prev => ({ ...prev, name: e.target.value }));
                                            setFieldValue("name", e.target.value);
                                        }}
                                        placeholder={t("clientStatusModal.form.name")}
                                    />
                                    {touched.name && errors.name && (
                                        <ErrorMessage>{errors.name}</ErrorMessage>
                                    )}
                                </FieldContainer>
                                
                                <FieldContainer>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        {t("clientStatusModal.form.color")}
                                    </Typography>
                                    <Field
                                        as={StyledTextField}
                                        fullWidth
                                        name="color"
                                        id="color"
                                        error={touched.color && Boolean(errors.color)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <ColorAdorment
                                                        sx={{ backgroundColor: values.color }}
                                                    />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => setColorPickerModalOpen(!colorPickerModalOpen)}
                                                >
                                                    <Colorize />
                                                </IconButton>
                                            ),
                                        }}
                                        variant="outlined"
                                        value={values.color}
                                        onChange={(e) => {
                                            setClientStatus(prev => ({ ...prev, color: e.target.value }));
                                            setFieldValue("color", e.target.value);
                                        }}
                                        placeholder={t("clientStatusModal.form.color")}
                                    />
                                    {touched.color && errors.color && (
                                        <ErrorMessage>{errors.color}</ErrorMessage>
                                    )}
                                </FieldContainer>
                                
                                {colorPickerModalOpen && (
                                    <ColorPickerContainer>
                                        <HexColorPicker
                                            color={values.color}
                                            onChange={(color) => {
                                                setClientStatus(prev => ({ ...prev, color }));
                                                setFieldValue("color", color);
                                            }}
                                        />
                                    </ColorPickerContainer>
                                )}
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
                                {t("clientStatusModal.buttons.cancel")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                variant="contained"
                                sx={{ 
                                    position: "relative",
                                    borderRadius: 20,
                                    px: 3,
                                    backgroundColor: theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.dark
                                    },
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                }}
                            >
                                {clientStatusId
                                    ? t("clientStatusModal.buttons.okEdit")
                                    : t("clientStatusModal.buttons.okAdd")}
                                {isSubmitting && (
                                    <ButtonProgress
                                        size={24}
                                    />
                                )}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </StyledDialog>
    );
};

export default ClientStatusModal;
