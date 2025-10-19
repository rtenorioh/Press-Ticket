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
	TextField,
	Typography,
	Tooltip,
	Box,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import { AccountTreeOutlined, Colorize, Edit } from "@mui/icons-material";
import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as Yup from "yup";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ColorPicker from "../ColorPicker";

const Root = styled('div')(({ theme }) => ({
	display: "flex",
	flexWrap: "wrap",
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
	'& .MuiDialogTitle-root': {
		backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.primary.main,
		color: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.contrastText,
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

const ButtonProgress = styled(CircularProgress)(({ theme }) => ({
	color: green[500],
	position: "absolute",
	top: "50%",
	left: "50%",
	marginTop: -12,
	marginLeft: -12,
}));

const ColorAdorment = styled('div')(({ theme }) => ({
	width: 24,
	height: 24,
	borderRadius: '50%',
	border: `1px solid ${theme.palette.divider}`,
	transition: 'all 0.3s ease',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
	'& .MuiOutlinedInput-root': {
		borderRadius: 8,
		transition: 'all 0.3s ease',
		'&:hover': {
			boxShadow: `0 0 0 2px ${theme.palette.primary.light}25`,
		},
		'&.Mui-focused': {
			boxShadow: `0 0 0 2px ${theme.palette.primary.light}40`,
		},
	},
}));

const QueueModal = ({ open, onClose, queueId }) => {
	const theme = useTheme();
	const { t } = useTranslation();

	const QueueSchema = Yup.object().shape({
		name: Yup.string()
			.min(2, t("queueModal.validation.tooShort"))
			.max(50, t("queueModal.validation.tooLong"))
			.required(t("queueModal.validation.requiredName")),
		color: Yup.string()
		.min(3, t("queueModal.validation.tooShort"))
		.max(9, t("queueModal.validation.tooLong"))
		.required(t("queueModal.validation.requiredColor")),
		greetingMessage: Yup.string(),
		startWork: Yup.string(),
		endWork: Yup.string(),
		absenceMessage: Yup.string(),
		startBreak: Yup.string().nullable(),
		endBreak: Yup.string().nullable(),
		breakMessage: Yup.string().nullable(),
	});

	const initialState = {
		name: "",
		color: "",
		greetingMessage: "",
		startWork: "00:00",
		endWork: "23:59",
		absenceMessage: "",
		startBreak: "00:00",
		endBreak: "00:00",
		breakMessage: "",
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

	const handleColorChange = (color, setFieldValue) => {
		setFieldValue("color", color);
	};

	return (
		<Root>
			<StyledDialog 
				open={open} 
				onClose={handleClose} 
				scroll="paper"
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>
					<Typography variant="h6" component="div" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
						{queueId ? (
							<>
								<Edit sx={{ mr: 1, fontSize: 24 }} />
								{t("queueModal.title.edit")}
							</>
						) : (
							<>
								<Box sx={{ mr: 1, width: 24, height: 24, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
									<Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}><AccountTreeOutlined /></Typography>
								</Box>
								{t("queueModal.title.add")}
							</>
						)}
					</Typography>
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
											as={StyledTextField}
											label={t("queueModal.form.name")}
											autoFocus
											name="name"
											error={touched.name && Boolean(errors.name)}
											helperText={touched.name && errors.name}
											variant="outlined"
											margin="dense"
											fullWidth
											placeholder={t("queueModal.form.namePlaceholder")}
											InputProps={{
												sx: { borderRadius: 2 }
											}}
										/>
									</Grid>
									<Grid item xs={6}>
										<Field
											as={StyledTextField}
											label={t("queueModal.form.color")}
											name="color"
											value={values.color}
											onClick={() => setColorPickerModalOpen(true)}
											error={touched.color && Boolean(errors.color)}
											helperText={touched.color && errors.color}
											InputProps={{
												readOnly: true,
												placeholder: "#000000",
												sx: { borderRadius: 2 },
												startAdornment: (
													<InputAdornment position="start">
														<Tooltip title={t("queueModal.form.colorTooltip")} arrow placement="top">
															<ColorAdorment
																sx={{ 
																	backgroundColor: values.color || "#fff",
																	cursor: 'pointer',
																	'&:hover': { transform: 'scale(1.1)' } 
																}}
															/>
														</Tooltip>
													</InputAdornment>
												),
												endAdornment: (
													<Tooltip title={t("queueModal.form.selectColor")} arrow placement="top">
														<IconButton
															color="primary"
															onClick={() => setColorPickerModalOpen(true)}
														>
															<Colorize />
														</IconButton>
													</Tooltip>
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
										currentColor={values.color}
										onChange={(color) => handleColorChange(color, setFieldValue)}
										theme={theme}
									/>
									<Grid item xs={12}>
										<Field
											as={StyledTextField}
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
											placeholder={t("queueModal.form.greetingMessagePlaceholder")}
											InputProps={{
												sx: { borderRadius: 2 }
											}}
										/>
									</Grid>
									<Grid item xs={6}>
										<Field
											as={StyledTextField}
											label={t("queueModal.form.startWork")}
											type="time"
											InputLabelProps={{
												shrink: true,
											}}
											inputProps={{
												step: 300, 
											}}
											fullWidth
											name="startWork"
											error={touched.startWork && Boolean(errors.startWork)}
											helperText={touched.startWork && errors.startWork}
											variant="outlined"
											margin="dense"
											InputProps={{
												sx: { borderRadius: 2 }
											}}
										/>
									</Grid>
									<Grid item xs={6}>
										<Field
											as={StyledTextField}
											label={t("queueModal.form.endWork")}
											type="time"
											InputLabelProps={{
												shrink: true,
											}}
											inputProps={{
												step: 300, 
											}}
											fullWidth
											name="endWork"
											error={touched.endWork && Boolean(errors.endWork)}
											helperText={touched.endWork && errors.endWork}
											variant="outlined"
											margin="dense"
											InputProps={{
												sx: { borderRadius: 2 }
											}}
										/>
									</Grid>
									<Grid item xs={12}>
										<Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>
											{t("queueModal.form.breakTitle")}
										</Typography>
									</Grid>
									<Grid container item spacing={2}>
										<Grid item xs={6}>
											<Field
												as={StyledTextField}
												label={t("queueModal.form.startBreak")}
												type="time"
												InputLabelProps={{
													shrink: true,
												}}
												inputProps={{
													step: 300, 
												}}
												fullWidth
												name="startBreak"
												error={touched.startBreak && Boolean(errors.startBreak)}
												helperText={touched.startBreak && errors.startBreak}
												variant="outlined"
												margin="dense"
												InputProps={{
													sx: { borderRadius: 2 }
												}}
											/>
										</Grid>
										<Grid item xs={6}>
											<Field
												as={StyledTextField}
												label={t("queueModal.form.endBreak")}
												type="time"
												InputLabelProps={{
													shrink: true,
												}}
												inputProps={{
													step: 300, 
												}}
												fullWidth
												name="endBreak"
												error={touched.endBreak && Boolean(errors.endBreak)}
												helperText={touched.endBreak && errors.endBreak}
												variant="outlined"
												margin="dense"
												InputProps={{
													sx: { borderRadius: 2 }
												}}
											/>
										</Grid>
									</Grid>
									<Grid item xs={12}>
										<Field
											as={StyledTextField}
											label={t("queueModal.form.breakMessage")}
											type="text"
											multiline
											minRows={2}
											fullWidth
											name="breakMessage"
											error={touched.breakMessage && Boolean(errors.breakMessage)}
											helperText={touched.breakMessage && errors.breakMessage}
											variant="outlined"
											margin="dense"
											placeholder={t("queueModal.form.breakMessagePlaceholder")}
											InputProps={{
												sx: { borderRadius: 2 }
											}}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											as={StyledTextField}
											label={t("queueModal.form.absenceMessage")}
											type="text"
											multiline
											minRows={2}
											fullWidth
											name="absenceMessage"
											error={touched.absenceMessage && Boolean(errors.absenceMessage)}
											helperText={touched.absenceMessage && errors.absenceMessage}
											variant="outlined"
											margin="dense"
											placeholder={t("queueModal.form.absenceMessagePlaceholder")}
											InputProps={{
												sx: { borderRadius: 2 }
											}}
										/>
									</Grid>
								</Grid>
							</DialogContent>

							<DialogActions sx={{ padding: 2, gap: 1 }}>
								<Button
									onClick={handleClose}
									disabled={isSubmitting}
									variant="contained"
									size="large"
									sx={{
										borderRadius: 20,
										backgroundColor: '#e0e0e0',
										color: '#757575',
										minWidth: '120px',
										transition: 'all 0.3s ease',
										'&:hover': {
											backgroundColor: '#d5d5d5',
										}
									}}
								>
									{t("queueModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									size="large"
									sx={{
										position: 'relative',
										borderRadius: 20,
										minWidth: '120px',
										transition: 'all 0.3s ease',
										fontWeight: 'bold',
										'&:hover': {
											boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
										}
									}}
								>
									{queueId ? t("queueModal.buttons.okEdit") : t("queueModal.buttons.okAdd")}
									{isSubmitting && (
										<ButtonProgress size={24} />
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</StyledDialog>
		</Root>
	);
};

export default QueueModal;
