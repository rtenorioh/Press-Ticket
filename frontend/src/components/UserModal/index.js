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
	MenuItem,
	Select,
	TextField,
	Typography,
	Tooltip,
	Divider
} from '@mui/material';
import { green } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import {
	Field,
	Form,
	Formik
} from "formik";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { Can } from "../Can";
import ConectionSelect from "../ConectionSelect";
import QueueSelect from "../QueueSelect";

const Root = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
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

const MultFieldLine = styled('div')(({ theme }) => ({
	display: "flex",
	gap: theme.spacing(2),
	"& > *": {
		flex: 1
	},
	[theme.breakpoints.down('sm')]: {
		flexDirection: 'column'
	}
}));

const ButtonProgress = styled(CircularProgress)(({ theme }) => ({
	color: green[500],
	position: "absolute",
	top: "50%",
	left: "50%",
	marginTop: -12,
	marginLeft: -12,
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
	margin: theme.spacing(1),
	minWidth: 120,
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

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
	email: Yup.string().email("Invalid email").required("Required"),
});

const UserModal = ({ open, onClose, userId }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const initialState = {
		name: "",
		email: "",
		password: "",
		profile: "user",
		startWork: "00:00",
		endWork: "23:59",
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

	useEffect(() => {
		const fetchUser = async () => {
			if (!userId) return;
			try {
				const { data } = await api.get(`/users/${userId}`);
				setUser(prevState => {
					return { ...prevState, ...data };
				});
				const userQueueIds = data?.queues?.map(queue => queue.id);
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
			let response;
			if (userId) {
				response = await api.put(`/users/${userId}`, userData);
			} else {
				response = await api.post("/users", userData);
			}
			toast.success(t("userModal.success"));
			if (onClose) {
				onClose(response.data);
			}
		} catch (err) {
			toastError(err, t);
		}
		handleClose();
	};

	return (
		<Root>
			<StyledDialog
				open={open}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				scroll="paper"
			>
				<DialogTitle>
					<Typography variant="h6" component="div" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
						{userId ? (
							<>
								<EditIcon sx={{ mr: 1, fontSize: 24 }} />
								{t("userModal.title.edit")}
							</>
						) : (
							<>
								<PersonAddIcon sx={{ mr: 1, fontSize: 24 }} />
								{t("userModal.title.add")}
							</>
						)}
					</Typography>
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
								<MultFieldLine>
									<Field
										as={StyledTextField}
										label={t("userModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										placeholder={t("userModal.form.namePlaceholder")}
										fullWidth
									/>
									<Field
										as={StyledTextField}
										name="password"
										variant="outlined"
										margin="dense"
										label={t("userModal.form.password")}
										error={touched.password && Boolean(errors.password)}
										helperText={touched.password && errors.password}
										type={showPassword ? 'text' : 'password'}
										placeholder={t("userModal.form.passwordPlaceholder")}
										InputProps={{
											sx: { borderRadius: 8 },
											endAdornment: (
												<InputAdornment position="end">
													<Tooltip title={t("userModal.form.toggleVisibility")} arrow placement="top">
														<IconButton
															aria-label="toggle password visibility"
															onClick={() => setShowPassword((e) => !e)}
															size="small"
															color="primary"
														>
															{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
														</IconButton>
													</Tooltip>
												</InputAdornment>
											)
										}}
										fullWidth
									/>
								</MultFieldLine>
								<MultFieldLine>
									<Field
										as={StyledTextField}
										label={t("userModal.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										variant="outlined"
										margin="dense"
										placeholder={t("userModal.form.emailPlaceholder")}
										InputProps={{
											sx: { borderRadius: 8 }
										}}
										fullWidth
									/>
									<StyledFormControl
										variant="outlined"
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
									</StyledFormControl>
								</MultFieldLine>
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
										<form noValidate>
											<MultFieldLine>
												<Field
													as={StyledTextField}
													label={t("userModal.form.startWork")}
													type="time"
													ampm={false}
													defaultValue="00:00"
													inputRef={startWorkRef}
													InputLabelProps={{
														shrink: true,
													}}
													inputProps={{
														step: 600, 
													}}
													name="startWork"
													error={
														touched.startWork && Boolean(errors.startWork)
													}
													helperText={
														touched.startWork && errors.startWork
													}
													variant="outlined"
													margin="dense"
													InputProps={{
														sx: { borderRadius: 8 }
													}}
													sx={{
														flex: 1,
													}}
												/>
												<Field
													as={StyledTextField}
													label={t("userModal.form.endWork")}
													type="time"
													ampm={false}
													defaultValue="23:59"
													inputRef={endWorkRef}
													InputLabelProps={{
														shrink: true,
													}}
													inputProps={{
														step: 600, 
													}}
													name="endWork"
													error={
														touched.endWork && Boolean(errors.endWork)
													}
													helperText={
														touched.endWork && errors.endWork
													}
													variant="outlined"
													margin="dense"
													InputProps={{
														sx: { borderRadius: 8 }
													}}
													sx={{
														flex: 1,
													}}
												/>
											</MultFieldLine>
										</form>
									)}
								/>
								<StyledFormControl
									variant="outlined"
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
								</StyledFormControl>
							</DialogContent>
							<Divider />
							<DialogActions sx={{ padding: 2, gap: 1, display: 'flex', justifyContent: 'flex-end' }}>
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
										textTransform: 'uppercase',
										fontWeight: 'bold',
										transition: 'all 0.3s ease',
										'&:hover': {
											backgroundColor: '#d5d5d5',
										}
									}}
								>
									{t("userModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting}
									variant="contained"
									size="large"
									sx={{
										position: "relative",
										borderRadius: 20,
										minWidth: '120px',
										backgroundColor: theme.palette.primary.main,
										transition: 'all 0.3s ease',
										textTransform: 'uppercase',
										fontWeight: 'bold',
										'&:hover': {
											backgroundColor: theme.palette.primary.dark
										}
									}}
								>
									{userId
										? `${t("userModal.buttons.okEdit")}`
										: `${t("userModal.buttons.okAdd")}`}
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
		</Root>
	);
};

export default UserModal;