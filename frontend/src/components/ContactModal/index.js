import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	TextField,
	Typography,
	Box,
	Paper,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { styled, useTheme } from "@mui/material/styles";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
	Field,
	FieldArray,
	Form,
	Formik,
} from "formik";
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

const StyledTextField = styled(TextField)(({ theme }) => ({
	flex: 1,
	'& .MuiOutlinedInput-root': {
		borderRadius: theme.shape.borderRadius,
	},
}));

const ExtraAttr = styled('div')(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: theme.spacing(1),
	marginBottom: theme.spacing(2),
}));

const BtnWrapper = styled('div')(({ theme }) => ({
	position: "relative",
}));

const FieldContainer = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	width: "100%",
	marginBottom: theme.spacing(2),
}));

const FieldLabel = styled(Typography)(({ theme }) => ({
	marginBottom: theme.spacing(0.5),
	fontWeight: 500,
	fontSize: '0.875rem',
}));

const FormContainer = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	width: "100%",
	gap: theme.spacing(1),
}));

const FieldRow = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "row",
	gap: theme.spacing(2),
	width: "100%",
	marginBottom: theme.spacing(2),
	[theme.breakpoints.down('sm')]: {
		flexDirection: "column",
	},
}));

const ButtonProgress = styled(CircularProgress)(({ theme }) => ({
	color: green[500],
	position: "absolute",
	top: "50%",
	left: "50%",
	marginTop: -12,
	marginLeft: -12,
}));

const initialState = {
	name: "",
	number: "",
	address: "",
	email: "",
	extraInfo: [],
};

const ContactSchema = Yup.object().shape({
	name: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
	email: Yup.string().email("Invalid email"),
});

const ContactModal = ({ open, onClose, contactId, initialValues, onSave }) => {
	const { user } = useContext(AuthContext);
	const [contact, setContact] = useState(initialState);
	const { t } = useTranslation();
	const theme = useTheme();

	useEffect(() => {
		const abortController = new AbortController();
		const fetchContact = async () => {
			try {
				if (initialValues) {
					setContact((prev) => ({ ...prev, ...initialValues }));
				}

				if (contactId) {
					const { data } = await api.get(`/contacts/${contactId}`, {
						signal: abortController.signal,
					});
					setContact(data);
				}
			} catch (err) {
				if (!abortController.signal.aborted) {
					toastError(err);
				}
			}
		};

		fetchContact();

		return () => abortController.abort();
	}, [contactId, initialValues]);

	const handleClose = () => {
		onClose();
		setContact(initialState);
	};

	const handleSaveContact = async (values) => {
		try {
			if (contactId) {
				await api.put(`/contacts/${contactId}`, values);
			} else {
				const { data } = await api.post("/contacts", values);
				if (onSave) onSave(data);
			}
			toast.success(t("contactModal.success"));
			handleClose();
		} catch (err) {
			if (err.response && err.response.status === 400 &&
				(err.response.data.error?.includes("number") || err.response.data.message?.includes("number"))) {
				toast.error(t("contactModal.numberError") || "Número de WhatsApp inválido. Verifique e tente novamente.");
			} else {
				toastError(err, t);
			}
		}
	};

	return (
		<StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth scroll="paper">
			<DialogTitle>
				{contactId
					? t("contactModal.title.edit")
					: t("contactModal.title.add")}
			</DialogTitle>
			<Formik
				initialValues={contact}
				enableReinitialize
				validationSchema={ContactSchema}
				onSubmit={async (values, actions) => {
					await handleSaveContact(values);
					actions.setSubmitting(false);
				}}
			>
				{({ values, errors, touched, isSubmitting }) => (
					<Form>
						<DialogContent dividers>
							<FormContainer>
								<Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
									{t("contactModal.form.mainInfo")}
								</Typography>
								
								<FieldRow>
									<FieldContainer>
										<FieldLabel>{t("contactModal.form.name")}</FieldLabel>
										<Field
											as={StyledTextField}
											name="name"
											autoFocus
											error={touched.name && Boolean(errors.name)}
											helperText={touched.name && errors.name}
											variant="outlined"
											fullWidth
										/>
									</FieldContainer>
									
									{user.isTricked === "enabled" && (
										<FieldContainer>
											<FieldLabel>{t("contactModal.form.number")}</FieldLabel>
											<Field
												as={StyledTextField}
												name="number"
												error={touched.number && Boolean(errors.number)}
												helperText={touched.number && errors.number}
												placeholder="5522999999999"
												variant="outlined"
												fullWidth
											/>
										</FieldContainer>
									)}
								</FieldRow>
								
								<FieldContainer>
									<FieldLabel>{t("contactModal.form.email")}</FieldLabel>
									<Field
										as={StyledTextField}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										fullWidth
										variant="outlined"
									/>
								</FieldContainer>
								
								<FieldContainer>
									<FieldLabel>{t("contactModal.form.address")}</FieldLabel>
									<Field
										as={StyledTextField}
										name="address"
										error={touched.address && Boolean(errors.address)}
										helperText={touched.address && errors.address}
										fullWidth
										variant="outlined"
									/>
								</FieldContainer>
								
								<Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
									{t("contactModal.form.extraInfo")}
								</Typography>
								<FieldArray name="extraInfo">
									{({ push, remove }) => (
										<>
											{values.extraInfo &&
												values.extraInfo.map((info, index) => (
													<ExtraAttr
														key={`${index}-info`}
													>
														<Field
															as={StyledTextField}
															name={`extraInfo[${index}].name`}
															placeholder={t("contactModal.form.extraName")}
															variant="outlined"
														/>
														<Field
															as={StyledTextField}
															name={`extraInfo[${index}].value`}
															placeholder={t("contactModal.form.extraValue")}
															variant="outlined"
														/>
														<IconButton
															size="small"
															onClick={() => remove(index)}
														>
															<DeleteOutlineIcon />
														</IconButton>
													</ExtraAttr>
												))}
											<Button
												variant="outlined"
												fullWidth
												size="medium"
												startIcon={<span>+</span>}
												onClick={() => push({ name: "", value: "" })}
												sx={{ 
													mt: 1,
													mb: 2,
													color: theme.palette.text.primary,
													textTransform: 'uppercase',
													fontWeight: 'bold',
												}}
											>
												{t("contactModal.buttons.addExtraInfo")}
											</Button>
										</>
									)}
								</FieldArray>
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
								{t("contactModal.buttons.cancel")}
							</Button>
							<BtnWrapper>
								<Button
									type="submit"
									disabled={isSubmitting}
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
										position: "relative",
									}}
								>
									{contactId
										? t("contactModal.buttons.okEdit")
										: t("contactModal.buttons.okAdd")}
								</Button>
								{isSubmitting && (
									<ButtonProgress
										size={24}
									/>
								)}
							</BtnWrapper>
						</DialogActions>
					</Form>
				)}
			</Formik>
		</StyledDialog>
	);
};

export default ContactModal;
