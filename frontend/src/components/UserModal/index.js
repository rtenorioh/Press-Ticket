import React, { useState, useEffect, useContext, useRef } from "react";

import * as Yup from "yup";
import {
	Formik,
	Form,
	Field
} from "formik";
import { toast } from "react-toastify";

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	CircularProgress,
	Select,
	InputLabel,
	makeStyles,
	MenuItem,
	FormControl,
	TextField,
	InputAdornment,
	IconButton
} from '@material-ui/core';

import {
	Visibility,
	VisibilityOff
} from '@material-ui/icons';

import { green } from "@material-ui/core/colors";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import useWhatsApps from "../../hooks/useWhatsApps";

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
	formWrapper: {
		display: 'flex',
	},
	formWrapperChild: {
		width: '50%',
		marginRight: '16px',
	},
	divider: {
		borderBottom: `1px solid ${theme.palette.divider}`,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: theme.spacing(2),
		marginTop: '20px'
	},
	dividerText: {
		backgroundColor: theme.palette.background.paper,
		color: theme.palette.text.secondary,
		padding: theme.spacing(0, 1),
		zIndex: 1,
	},
}));

const UserSchema = Yup.object().shape({
	allHistoric: Yup.string().nullable(),
	isRemoveTags: Yup.string().nullable(),
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
	email: Yup.string().email("Invalid email").required("Required"),
});

const UserModal = ({ open, onClose, userId }) => {
	const classes = useStyles();

	const initialState = {
		name: "",
		email: "",
		password: "",
		profile: "user",
		allHistoric: "enabled",
		isRemoveTags: "enabled",
		viewConection: "enabled",
		viewSector: "enabled",
		viewName: "enabled",
		viewTags: "enabled",
		allTicket: "desabled",
		startWork: "",
		endWork: "",
	};

	const { user: loggedInUser } = useContext(AuthContext);

	const [user, setUser] = useState(initialState);
	// const [allHistoric, setAllHistoric] = useState(initialState);
	// const [isRemoveTags, setIsRemoveTags] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [showPassword, setShowPassword] = useState(false);
	const [whatsappId, setWhatsappId] = useState(false);
	const { loading, whatsApps } = useWhatsApps();
	const startWorkRef = useRef();
	const endWorkRef = useRef();

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
				setWhatsappId(data.whatsappId ? data.whatsappId : '');
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
		const userData = {
			...values,
			whatsappId,
			queueIds: selectedQueueIds,
			allHistoric: values.allHistoric,
			isRemoveTags: values.isRemoveTags,
			viewConection: values.viewConection,
			viewSector: values.viewSector,
			viewName: values.viewName,
			viewTags: values.viewTags,
			allTicket: values.allTicket,
		};
		console.log(values.allHistoric)
		try {
			if (userId) {
				await api.put(`/users/${userId}`, userData);
			} else {
				await api.post("/users", userData);
			}
			toast.success(i18n.t("userModal.success"));
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
						? `${i18n.t("userModal.title.edit")}`
						: `${i18n.t("userModal.title.add")}`}
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
										label={i18n.t("userModal.form.name")}
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
										label={i18n.t("userModal.form.password")}
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
										label={i18n.t("userModal.form.email")}
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
														{i18n.t("userModal.form.profile")}
													</InputLabel>

													<Field
														as={Select}
														label={i18n.t("userModal.form.profile")}
														name="profile"
														labelId="profile-selection-label"
														id="profile-selection"
														required
													>
														<MenuItem value="admin">{i18n.t("userModal.form.admin")}</MenuItem>
														<MenuItem value="user">{i18n.t("userModal.form.user")}</MenuItem>
													</Field>
												</>
											)}
										/>
									</FormControl>
								</div>
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
									perform="user-modal:editQueues"
									yes={() => (!loading &&
										<FormControl variant="outlined" margin="dense" className={classes.maxWidth} fullWidth>
											<InputLabel>{i18n.t("userModal.form.whatsapp")}</InputLabel>
											<Field
												as={Select}
												value={whatsappId}
												onChange={(e) => setWhatsappId(e.target.value)}
												label={i18n.t("userModal.form.whatsapp")}
											>
												<MenuItem value={''}>&nbsp;</MenuItem>
												{whatsApps.map((whatsapp) => (
													<MenuItem key={whatsapp.id} value={whatsapp.id}>{whatsapp.name}</MenuItem>
												))}
											</Field>
										</FormControl>
									)}
								/>



								<Can
									role={loggedInUser.profile}
									perform="user-modal:editProfile"
									yes={() => (!loading &&
										<form className={classes.container} noValidate>
											<Field
												as={TextField}
												label={i18n.t("userModal.form.startWork")}
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
												label={i18n.t("userModal.form.endWork")}
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





								<div className={classes.divider}>
									<span className={classes.dividerText}>Liberações</span>
								</div>

								<Can
									role={loggedInUser.profile}
									perform="user-modal:editProfile"
									yes={() => (!loading &&
										<div className={classes.textField}>
											<FormControl
												variant="outlined"
												className={classes.maxWidth}
												margin="dense"
												fullWidth
											>
												<>
													<InputLabel id="profile-selection-input-label">
														{i18n.t("userModal.form.allTicket")}
													</InputLabel>

													<Field
														as={Select}
														label={i18n.t("allTicket.form.viewTags")}
														name="allTicket"
														labelId="allTicket-selection-label"
														id="allTicket-selection"
														required
													>
														<MenuItem value="enabled">{i18n.t("userModal.form.allTicketEnabled")}</MenuItem>
														<MenuItem value="desabled">{i18n.t("userModal.form.allTicketDesabled")}</MenuItem>
													</Field>
												</>
											</FormControl>
										</div>

									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editProfile"
									yes={() => (!loading &&



										<div className={classes.formWrapper}>
											<div className={classes.textField}>
												<FormControl
													variant="outlined"
													className={classes.maxWidth}
													margin="dense"
													fullWidth
												>
													<>
														<InputLabel id="profile-selection-input-label">
															{i18n.t("userModal.form.allHistoric")}
														</InputLabel>

														<Field
															as={Select}
															label={i18n.t("userModal.form.allHistoric")}
															name="allHistoric"
															labelId="allHistoric-selection-label"
															id="allHistoric-selection"
															required
														>
															<MenuItem value="enabled">{i18n.t("userModal.form.allHistoricEnabled")}</MenuItem>
															<MenuItem value="desabled">{i18n.t("userModal.form.allHistoricDesabled")}</MenuItem>
														</Field>
													</>
												</FormControl>
											</div>
											<div className={classes.textField}>
												<FormControl
													variant="outlined"
													className={classes.maxWidth}
													margin="dense"
													fullWidth
												>
													<>
														<InputLabel id="profile-selection-input-label">
															{i18n.t("userModal.form.isRemoveTags")}
														</InputLabel>

														<Field
															as={Select}
															label={i18n.t("userModal.form.isRemoveTags")}
															name="isRemoveTags"
															labelId="isRemoveTags-selection-label"
															id="isRemoveTags-selection"
															required
														>
															<MenuItem value="enabled">{i18n.t("userModal.form.isRemoveTagsEnabled")}</MenuItem>
															<MenuItem value="desabled">{i18n.t("userModal.form.isRemoveTagsDesabled")}</MenuItem>
														</Field>
													</>
												</FormControl>
											</div>
										</div>


									)}
								/>

								<div className={classes.formWrapper}>
									<div className={classes.textField}>
										<FormControl
											variant="outlined"
											className={classes.maxWidth}
											margin="dense"
											fullWidth
										>
											<>
												<InputLabel id="profile-selection-input-label">
													{i18n.t("userModal.form.viewConection")}
												</InputLabel>

												<Field
													as={Select}
													label={i18n.t("userModal.form.viewConection")}
													name="viewConection"
													labelId="viewConection-selection-label"
													id="viewConection-selection"
													required
												>
													<MenuItem value="enabled">{i18n.t("userModal.form.viewConectionEnabled")}</MenuItem>
													<MenuItem value="desabled">{i18n.t("userModal.form.viewConectionDesabled")}</MenuItem>
												</Field>
											</>
										</FormControl>
									</div>
									<div className={classes.textField}>
										<FormControl
											variant="outlined"
											className={classes.maxWidth}
											margin="dense"
											fullWidth
										>
											<>
												<InputLabel id="profile-selection-input-label">
													{i18n.t("userModal.form.viewSector")}
												</InputLabel>

												<Field
													as={Select}
													label={i18n.t("userModal.form.viewSector")}
													name="viewSector"
													labelId="viewSector-selection-label"
													id="viewSector-selection"
													required
												>
													<MenuItem value="enabled">{i18n.t("userModal.form.viewSectorEnabled")}</MenuItem>
													<MenuItem value="desabled">{i18n.t("userModal.form.viewSectorDesabled")}</MenuItem>
												</Field>
											</>
										</FormControl>
									</div>
								</div>

								<div className={classes.formWrapper}>
									<div className={classes.textField}>
										<FormControl
											variant="outlined"
											className={classes.maxWidth}
											margin="dense"
											fullWidth
										>
											<>
												<InputLabel id="profile-selection-input-label">
													{i18n.t("userModal.form.viewName")}
												</InputLabel>

												<Field
													as={Select}
													label={i18n.t("userModal.form.viewName")}
													name="viewName"
													labelId="viewName-selection-label"
													id="viewName-selection"
													required
												>
													<MenuItem value="enabled">{i18n.t("userModal.form.viewNameEnabled")}</MenuItem>
													<MenuItem value="desabled">{i18n.t("userModal.form.viewNameDesabled")}</MenuItem>
												</Field>
											</>
										</FormControl>
									</div>
									<div className={classes.textField}>
										<FormControl
											variant="outlined"
											className={classes.maxWidth}
											margin="dense"
											fullWidth
										>
											<>
												<InputLabel id="profile-selection-input-label">
													{i18n.t("userModal.form.viewTags")}
												</InputLabel>

												<Field
													as={Select}
													label={i18n.t("userModal.form.viewTags")}
													name="viewTags"
													labelId="viewTags-selection-label"
													id="viewTags-selection"
													required
												>
													<MenuItem value="enabled">{i18n.t("userModal.form.viewTagsEnabled")}</MenuItem>
													<MenuItem value="desabled">{i18n.t("userModal.form.viewTagsDesabled")}</MenuItem>
												</Field>
											</>
										</FormControl>
									</div>
								</div>

							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("userModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{userId
										? `${i18n.t("userModal.buttons.okEdit")}`
										: `${i18n.t("userModal.buttons.okAdd")}`}
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