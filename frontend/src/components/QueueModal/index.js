import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	InputAdornment,
	makeStyles,
	TextField,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { useTheme } from "@material-ui/core/styles";
import { Colorize } from "@material-ui/icons";
import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as Yup from "yup";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ColorPicker from "../ColorPicker";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},
	container: {
		display: "flex",
		flexWrap: "wrap",
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
	colorAdorment: {
		width: 20,
		height: 20,
	},
}));

const QueueModal = ({ open, onClose, queueId }) => {
	const classes = useStyles();
	const theme = useTheme();
	const { t } = useTranslation();

	const QueueSchema = Yup.object().shape({
		name: Yup.string()
			.min(2, t("queueModal.validation.tooShort"))
			.max(50, t("queueModal.validation.tooLong"))
			.required(t("queueModal.validation.required")),
		color: Yup.string().min(3, t("queueModal.validation.tooShort")).max(9, t("queueModal.validation.tooLong")).required(),
		greetingMessage: Yup.string(),
		startWork: Yup.string(),
		endWork: Yup.string(),
		absenceMessage: Yup.string(),
	});

	const initialState = {
		name: "",
		color: "",
		greetingMessage: "",
		startWork: "",
		endWork: "",
		absenceMessage: "",
	};

	const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
	const [queue, setQueue] = useState(initialState);

	useEffect(() => {
		const initializeQueue = async () => {
			if (!queueId) return;
			try {
				const { data } = await api.get(`/queue/${queueId}`);
				setQueue((prevState) => ({ ...prevState, ...data }));
			} catch (err) {
				toastError(err);
			}
		};

		initializeQueue();

		return () => {
			setQueue(initialState);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [queueId, open]);

	const handleClose = () => {
		onClose();
		setQueue(initialState);
	};

	const handleSaveQueue = async (values) => {
		try {
			if (queueId) {
				await api.put(`/queue/${queueId}`, values);
			} else {
				await api.post("/queue", values);
			}
			toast.success(t("queueModal.notification.title"));
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={handleClose} scroll="paper">
				<DialogTitle>
					{queueId ? t("queueModal.title.edit") : t("queueModal.title.add")}
				</DialogTitle>
				<Formik
					initialValues={queue}
					enableReinitialize={true}
					validationSchema={QueueSchema}
					onSubmit={(values, actions) => {
						handleSaveQueue(values);
						actions.setSubmitting(false);
					}}
				>
					{({ touched, errors, isSubmitting, values, setFieldValue }) => (
						<Form>
							<DialogContent dividers>
								<Grid container spacing={2}>
									<Grid item xs={6}>
										<Field
											as={TextField}
											label={t("queueModal.form.name")}
											autoFocus
											name="name"
											error={touched.name && Boolean(errors.name)}
											helperText={touched.name && errors.name}
											variant="outlined"
											margin="dense"
											fullWidth
										/>
									</Grid>
									<Grid item xs={6}>
										<Field
											as={TextField}
											label={t("queueModal.form.color")}
											name="color"
											value={values.color}
											onFocus={() => setColorPickerModalOpen(true)}
											error={touched.color && Boolean(errors.color)}
											helperText={touched.color && errors.color}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<div
															style={{ backgroundColor: values.color || '#fff' }}
															className={classes.colorAdorment}
														></div>
													</InputAdornment>
												),
												endAdornment: (
													<IconButton
														size="small"
														color="default"
														onClick={() => setColorPickerModalOpen(true)}
													>
														<Colorize />
													</IconButton>
												),
											}}
											variant="outlined"
											margin="dense"
											fullWidth
										/>
									</Grid>
									<ColorPicker
										open={colorPickerModalOpen}
										handleClose={() => setColorPickerModalOpen(false)}
										onChange={(color) => {
											setFieldValue("color", color);
										}}
										theme={theme}
									/>
									<Grid item xs={12}>
										<Field
											as={TextField}
											label={t("queueModal.form.greetingMessage")}
											type="greetingMessage"
											multiline
											minRows={4}
											fullWidth
											name="greetingMessage"
											error={touched.greetingMessage && Boolean(errors.greetingMessage)}
											helperText={touched.greetingMessage && errors.greetingMessage}
											variant="outlined"
											margin="dense"
										/>
									</Grid>
									<Grid item xs={6}>
										<Field
											as={TextField}
											label={t("queueModal.form.startWork")}
											type="time"
											InputLabelProps={{
												shrink: true,
											}}
											inputProps={{
												step: 600, // 10 minutes
											}}
											fullWidth
											name="startWork"
											error={touched.startWork && Boolean(errors.startWork)}
											helperText={touched.startWork && errors.startWork}
											variant="outlined"
											margin="dense"
										/>
									</Grid>
									<Grid item xs={6}>
										<Field
											as={TextField}
											label={t("queueModal.form.endWork")}
											type="time"
											InputLabelProps={{
												shrink: true,
											}}
											inputProps={{
												step: 600, // 10 minutes
											}}
											fullWidth
											name="endWork"
											error={touched.endWork && Boolean(errors.endWork)}
											helperText={touched.endWork && errors.endWork}
											variant="outlined"
											margin="dense"
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											as={TextField}
											label={t("queueModal.form.absenceMessage")}
											type="absenceMessage"
											multiline
											minRows={2}
											fullWidth
											name="absenceMessage"
											error={touched.absenceMessage && Boolean(errors.absenceMessage)}
											helperText={touched.absenceMessage && errors.absenceMessage}
											variant="outlined"
											margin="dense"
										/>
									</Grid>
								</Grid>
							</DialogContent>

							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{t("queueModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{queueId ? t("queueModal.buttons.okEdit") : t("queueModal.buttons.okAdd")}
									{isSubmitting && (
										<CircularProgress size={24} className={classes.buttonProgress} />
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default QueueModal;
