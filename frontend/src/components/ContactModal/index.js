import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	makeStyles,
	TextField,
	Typography,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
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

const useStyles = makeStyles((theme) => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},
	extraAttr: {
		display: "flex",
		alignItems: "center",
	},
	btnWrapper: {
		position: "relative",
	},
	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
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
	const classes = useStyles();
	const { user } = useContext(AuthContext);
	const [contact, setContact] = useState(initialState);
	const { t } = useTranslation();

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
		<Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
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
							<Typography variant="subtitle1" gutterBottom>
								{t("contactModal.form.mainInfo")}
							</Typography>
							<Field
								as={TextField}
								label={t("contactModal.form.name")}
								name="name"
								autoFocus
								error={touched.name && Boolean(errors.name)}
								helperText={touched.name && errors.name}
								variant="outlined"
								margin="dense"
								className={classes.textField}
							/>
							{user.isTricked === "enabled" && (
								<Field
									as={TextField}
									label={t("contactModal.form.number")}
									name="number"
									error={touched.number && Boolean(errors.number)}
									helperText={touched.number && errors.number}
									placeholder="5522999999999"
									variant="outlined"
									margin="dense"
								/>
							)}
							<Field
								as={TextField}
								label={t("contactModal.form.email")}
								name="email"
								error={touched.email && Boolean(errors.email)}
								helperText={touched.email && errors.email}
								fullWidth
								margin="dense"
								variant="outlined"
							/>
							<Field
								as={TextField}
								label={t("contactModal.form.address")}
								name="address"
								error={touched.address && Boolean(errors.address)}
								helperText={touched.address && errors.address}
								fullWidth
								margin="dense"
								variant="outlined"
							/>
							<Typography
								style={{ marginBottom: 8, marginTop: 12 }}
								variant="subtitle1"
							>
								{t("contactModal.form.extraInfo")}
							</Typography>
							<FieldArray name="extraInfo">
								{({ push, remove }) => (
									<>
										{values.extraInfo &&
											values.extraInfo.map((info, index) => (
												<div
													className={classes.extraAttr}
													key={`${index}-info`}
												>
													<Field
														as={TextField}
														label={t("contactModal.form.extraName")}
														name={`extraInfo[${index}].name`}
														variant="outlined"
														margin="dense"
														className={classes.textField}
													/>
													<Field
														as={TextField}
														label={t("contactModal.form.extraValue")}
														name={`extraInfo[${index}].value`}
														variant="outlined"
														margin="dense"
														className={classes.textField}
													/>
													<IconButton
														size="small"
														onClick={() => remove(index)}
													>
														<DeleteOutlineIcon />
													</IconButton>
												</div>
											))}
										<div className={classes.extraAttr}>
											<Button
												style={{ flex: 1, marginTop: 8 }}
												variant="outlined"
												color="primary"
												onClick={() => push({ name: "", value: "" })}
											>
												+ {t("contactModal.buttons.addExtraInfo")}
											</Button>
										</div>
									</>
								)}
							</FieldArray>
						</DialogContent>
						<DialogActions>
							<Button
								onClick={handleClose}
								color="secondary"
								disabled={isSubmitting}
								variant="outlined"
							>
								{t("contactModal.buttons.cancel")}
							</Button>
							<Button
								type="submit"
								color="primary"
								disabled={isSubmitting}
								variant="contained"
								className={classes.btnWrapper}
							>
								{contactId
									? t("contactModal.buttons.okEdit")
									: t("contactModal.buttons.okAdd")}
								{isSubmitting && (
									<CircularProgress
										size={24}
										className={classes.buttonProgress}
									/>
								)}
							</Button>
						</DialogActions>
					</Form>
				)}
			</Formik>
		</Dialog>
	);
};

export default ContactModal;
