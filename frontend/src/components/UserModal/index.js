import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	IconButton,
	InputAdornment,
	InputLabel,
	makeStyles,
	MenuItem,
	Select,
	TextField
} from '@material-ui/core';
import { green } from "@material-ui/core/colors";
import {
	Visibility,
	VisibilityOff
} from '@material-ui/icons';
import {
	Field,
	Form,
	Formik
} from "formik";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { Can } from "../Can";
import ConectionSelect from "../ConectionSelect";
import QueueSelect from "../QueueSelect";

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.background.paper,
		display: "flex",
		flexWrap: "wrap",
	},
	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
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
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},
	container: {
		display: 'flex',
		flexWrap: 'wrap',
	},
}));

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
	email: Yup.string().email("Invalid email").required("Required"),
});

const UserModal = ({ open, onClose, userId }) => {
	const classes = useStyles();
	const { t } = useTranslation();
	const initialState = {
		name: "",
		email: "",
		password: "",
		profile: "user",
		startWork: "",
		endWork: "",
		isTricked: "enabled",
		active: "true"
	};
	const { user: loggedInUser } = useContext(AuthContext);
	const [user, setUser] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [selectedWhatsappIds, setSelectedWhatsappIds] = useState([]);
	const [showPassword, setShowPassword] = useState(false);
	const startWorkRef = useRef();
	const endWorkRef = useRef();
	const history = useHistory();

	useEffect(() => {
		const fetchUser = async () => {
			if (!userId) return;
			try {
				const { data } = await api.get(`/users/${userId}`);
				setUser(prevState => {
					return { ...prevState, ...data };
				});
				const userQueueIds = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(userQueueIds);
				const userWhatsappIds = data.whatsapps?.map(whatsapp => whatsapp.id);
				setSelectedWhatsappIds(userWhatsappIds);
			} catch (err) {
				toastError(err);
			}
		};

		fetchUser();
	}, [userId, open]);

	const handleClose = () => {
		onClose();
		setUser(initialState);
	};

	const handleSaveUser = async values => {
		const userData = { ...values, whatsappIds: selectedWhatsappIds, queueIds: selectedQueueIds };
		try {
			if (userId) {
				await api.put(`/users/${userId}`, userData);
			} else {
				await api.post("/users", userData);
			}
			toast.success(t("userModal.success"));
			history.go(0);
		} catch (err) {
			toastError(err);
		}
		handleClose();
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{userId
						? `${t("userModal.title.edit")}`
						: `${t("userModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={user}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveUser(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={t("userModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
									<Field
										as={TextField}
										name="password"
										variant="outlined"
										margin="dense"
										label={t("userModal.form.password")}
										error={touched.password && Boolean(errors.password)}
										helperText={touched.password && errors.password}
										type={showPassword ? 'text' : 'password'}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														aria-label="toggle password visibility"
														onClick={() => setShowPassword((e) => !e)}
													>
														{showPassword ? <VisibilityOff color="secondary" /> : <Visibility color="secondary" />}
													</IconButton>
												</InputAdornment>
											)
										}}
										fullWidth
									/>
								</div>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={t("userModal.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
									<FormControl
										variant="outlined"
										className={classes.formControl}
										margin="dense"
									>
										<Can
											role={loggedInUser.profile}
											perform="user-modal:editProfile"
											yes={() => (
												<>
													<InputLabel id="profile-selection-input-label">
														{t("userModal.form.profile")}
													</InputLabel>

													<Field
														as={Select}
														label={t("userModal.form.profile")}
														name="profile"
														labelId="profile-selection-label"
														id="profile-selection"
														required
													>
														<MenuItem value="admin">{t("userModal.form.admin")}</MenuItem>
														<MenuItem value="user">{t("userModal.form.user")}</MenuItem>
													</Field>
												</>
											)}
										/>
									</FormControl>
								</div>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editWhatsapps"
									yes={() => (
										<ConectionSelect
											selectedWhatsappIds={selectedWhatsappIds}
											onChange={values => setSelectedWhatsappIds(values)}
										/>
									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editQueues"
									yes={() => (
										<QueueSelect
											selectedQueueIds={selectedQueueIds}
											onChange={values => setSelectedQueueIds(values)}
										/>
									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editProfile"
									yes={() => (
										<form className={classes.container} noValidate>
											<Field
												as={TextField}
												label={t("userModal.form.startWork")}
												type="time"
												ampm={false}
												defaultValue="00:00"
												inputRef={startWorkRef}
												InputLabelProps={{
													shrink: true,
												}}
												inputProps={{
													step: 600, // 5 min
												}}
												fullWidth
												name="startWork"
												error={
													touched.startWork && Boolean(errors.startWork)
												}
												helperText={
													touched.startWork && errors.startWork
												}
												variant="outlined"
												margin="dense"
												className={classes.textField}
											/>
											<Field
												as={TextField}
												label={t("userModal.form.endWork")}
												type="time"
												ampm={false}
												defaultValue="23:59"
												inputRef={endWorkRef}
												InputLabelProps={{
													shrink: true,
												}}
												inputProps={{
													step: 600, // 5 min
												}}
												fullWidth
												name="endWork"
												error={
													touched.endWork && Boolean(errors.endWork)
												}
												helperText={
													touched.endWork && errors.endWork
												}
												variant="outlined"
												margin="dense"
												className={classes.textField}
											/>
										</form>
									)}
								/>
								<FormControl
									variant="outlined"
									className={classes.formControl}
									margin="dense"
								>
									<Can
										role={loggedInUser.profile}
										perform="user-modal:editProfile"
										yes={() => (
											<>
												<InputLabel id="isTricked-selection-input-label">
													{t("userModal.form.isTricked")}
												</InputLabel>

												<Field
													as={Select}
													fullWidth
													label={t("userModal.form.isTricked")}
													name="isTricked"
													labelId="isTricked-selection-label"
													id="isTricked-selection"
												>
													<MenuItem value="enabled">{t("userModal.form.enabled")}</MenuItem>
													<MenuItem value="disabled">{t("userModal.form.disabled")}</MenuItem>
												</Field>
											</>
										)}
									/>
								</FormControl>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{t("userModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{userId
										? `${t("userModal.buttons.okEdit")}`
										: `${t("userModal.buttons.okAdd")}`}
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
		</div>
	);
};

export default UserModal;