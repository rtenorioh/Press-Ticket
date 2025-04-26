import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	IconButton,
	InputAdornment,
	MenuItem,
	Switch,
	TextField,
	Tooltip,
	Typography,
	Box,
	Divider,
	Paper
} from '@mui/material';
import { green } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EditIcon from '@mui/icons-material/Edit';
import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { SketchPicker } from 'react-color';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as Yup from "yup";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import QueueSelect from "../QueueSelect";

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

const ColorPreview = styled('div')(({ theme }) => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
}));

const MultiFieldLine = styled('div')(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  "& > *": {
    flex: 1
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column'
  }
}));

const ButtonWrapper = styled(Button)(({ theme }) => ({
  position: "relative",
  borderRadius: 20,
  transition: 'all 0.3s ease',
  fontWeight: 'bold',
  '&:hover': {
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
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

const IntegrationBox = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#f5f5f5',
  padding: theme.spacing(2.5),
  marginTop: theme.spacing(2.5),
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.palette.mode === 'dark' ? '0 4px 8px rgba(0, 0, 0, 0.3)' : '0 4px 8px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
}));

const IntegrationHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
}));

const IntegrationTitle = styled(Typography)(({ theme }) => ({
  margin: 0,
  fontSize: '1.1rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
}));

const IntegrationDescription = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(1.5, 0),
  fontSize: '0.95rem',
  color: theme.palette.text.secondary,
  lineHeight: 1.5,
}));

const CouponBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark + '20' : '#e8f4fd',
  padding: theme.spacing(1.5, 2.5),
  borderRadius: 8,
  marginBottom: theme.spacing(2.5),
  width: 'fit-content',
  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.primary.dark + '40' : '#c2e0ff'}`,
  transition: 'all 0.3s ease',
}));

const CouponText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginRight: theme.spacing(1.5),
  color: theme.palette.mode === 'dark' ? theme.palette.primary.light : '#0277bd',
  letterSpacing: '0.5px',
}));

const RegisterButton = styled('a')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(1.5, 2.5),
  borderRadius: 8,
  textDecoration: 'none',
  fontWeight: 700,
  textAlign: 'center',
  display: 'inline-block',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  },
}));

const SessionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const initialState = {
		name: "",
		greetingMessage: "",
		farewellMessage: "",
		isDefault: false,
		isDisplay: false
	};
	const [whatsApp, setWhatsApp] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [isHubSelected, setIsHubSelected] = useState(false);
	const [availableChannels, setAvailableChannels] = useState([]);
	const [selectedChannel, setSelectedChannel] = useState("");
	const [copySuccess, setCopySuccess] = useState(false);
	const [color, setColor] = useState("#5C59A0");
	const [showColorPicker, setShowColorPicker] = useState(false);

	const handleColorChange = (color) => {
		setColor(color.hex);
	};

	const fetchChannels = async () => {
		try {
			const { data } = await api.get("/hub-channel/");
			setAvailableChannels(data);
		} catch (err) {
			toastError(err);
		}
	};

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

			try {
				const { data } = await api.get(`whatsapp/${whatsAppId}`);
				setWhatsApp(data);
				setColor(data?.color)
				const whatsQueueIds = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(whatsQueueIds);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, [whatsAppId]);

	const handleCopy = () => {
		setCopySuccess(true);
		setTimeout(() => setCopySuccess(false), 2000);
	};

	const handleSaveWhatsApp = async values => {
		const whatsappData = { ...values, queueIds: selectedQueueIds, color: color };
		try {
			if (isHubSelected && selectedChannel) {
				const selectedChannelObj = availableChannels.find(
					channel => channel.id === selectedChannel
				);

				if (selectedChannelObj) {
					const channels = [selectedChannelObj];
					await api.post("/hub-channel/", {
						...whatsappData,
						channels
					});
					setTimeout(() => {
						window.location.reload();
					}, 100);
				}
			} else {
				if (whatsAppId) {
					await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
				} else {
					await api.post("/whatsapp", whatsappData);
				}
			}
			toast.success(t("whatsappModal.success"));
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};

	const handleClose = () => {
		onClose();
		setWhatsApp(initialState);
		setIsHubSelected(false);
		setSelectedChannel("");
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
					<Box display="flex" alignItems="center">
						{whatsAppId ? (
							<EditIcon sx={{ mr: 1 }} />
						) : (
							<WhatsAppIcon sx={{ mr: 1 }} />
						)}
						<Typography variant="h6" component="div">
							{whatsAppId
								? t("whatsappModal.title.edit")
								: t("whatsappModal.title.add")}
						</Typography>
					</Box>
				</DialogTitle>
				<Formik
					initialValues={whatsApp}
					enableReinitialize={true}
					validationSchema={SessionSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveWhatsApp(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, touched, errors, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
								<Box sx={{ mb: 2 }}>
									<Typography variant="subtitle1" color="text.secondary" gutterBottom>
										{t("whatsappModal.form.mainInfo")}
									</Typography>
									<Divider sx={{ mb: 2 }} />
								</Box>
								<MultiFieldLine>
									<Field
										as={StyledTextField}
										label={t("whatsappModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="normal"
										fullWidth
										placeholder={t("whatsappModal.form.namePlaceholder")}
									/>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
										{!isHubSelected && (
											<FormControlLabel
												control={
													<Field
														as={Switch}
														color="primary"
														name="isDefault"
														checked={values.isDefault}
													/>
												}
												label={t("whatsappModal.form.default")}
											/>
										)}
										<FormControlLabel
											control={
												<Switch
													checked={isHubSelected}
													onChange={() => {
														setIsHubSelected(prev => !prev);
														if (!isHubSelected) {
															fetchChannels();
														}
													}}
													color="primary"
												/>
											}
											label={t("whatsappModal.form.channels")}
										/>
									</Box>
								</MultiFieldLine>

								{isHubSelected && (
									<Box sx={{ mt: 2 }}>
										<Typography variant="subtitle1" color="text.secondary" gutterBottom>
											{t("whatsappModal.form.channelSelection")}
										</Typography>
										<Divider sx={{ mb: 2 }} />

										<StyledTextField
											select
											label={t("whatsappModal.form.selectChannel")}
											fullWidth
											value={selectedChannel || ""}
											onChange={e => {
												const value = e.target.value;
												setSelectedChannel(value);
											}}
											margin="normal"
											variant="outlined"
										>
											<MenuItem value="" disabled>
												{t("whatsappModal.form.selectChannelPlaceholder")}
											</MenuItem>
											{availableChannels.map(channel => (
												<MenuItem key={channel.id} value={channel.id}>
													{channel.name}
												</MenuItem>
											))}
										</StyledTextField>

										<IntegrationBox elevation={0}>
											<IntegrationHeader>
												<InfoOutlinedIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
												<IntegrationTitle variant="h6">{t("whatsappModal.integration.title")}</IntegrationTitle>
											</IntegrationHeader>

											<IntegrationDescription variant="body2" dangerouslySetInnerHTML={{ 
												__html: t("whatsappModal.integration.description")
											}} />

											<IntegrationDescription variant="body2" dangerouslySetInnerHTML={{ 
												__html: t("whatsappModal.integration.discount")
											}} />

											<CouponBox>
												<CouponText variant="subtitle1">
													PRESS60
												</CouponText>
												<CopyToClipboard text="PRESS60" onCopy={handleCopy}>
													<Tooltip title={copySuccess ? t("whatsappModal.integration.copied") : t("whatsappModal.integration.copy")}>
														<IconButton size="small" color="primary">
															<FileCopyOutlinedIcon fontSize="small" />
														</IconButton>
													</Tooltip>
												</CopyToClipboard>
											</CouponBox>

											<RegisterButton
												href="https://hub.notificame.com.br/signup/registrar?from=@pressticket"
												target="_blank"
												rel="noopener noreferrer"
											>
												{t("whatsappModal.integration.register")}
											</RegisterButton>
										</IntegrationBox>
									</Box>
								)}

								{!isHubSelected && (
									<>
										<Box sx={{ mt: 2 }}>
											<Typography variant="subtitle1" color="text.secondary" gutterBottom>
												{t("whatsappModal.form.messagesTitle")}
											</Typography>
											<Divider sx={{ mb: 2 }} />

											<Field
												as={StyledTextField}
												label={t("queueModal.form.greetingMessage")}
												type="greetingMessage"
												multiline
												minRows={4}
												fullWidth
												name="greetingMessage"
												error={
													touched.greetingMessage && Boolean(errors.greetingMessage)
												}
												helperText={
													touched.greetingMessage && errors.greetingMessage
												}
												variant="outlined"
												margin="normal"
												placeholder={t("whatsappModal.form.greetingMessagePlaceholder")}
												InputProps={{
													sx: { borderRadius: 2 }
												}}
											/>
										</Box>

										<Box sx={{ mt: 2 }}>
											<Field
												as={StyledTextField}
												label={t("whatsappModal.form.farewellMessage")}
												type="farewellMessage"
												multiline
												minRows={4}
												fullWidth
												name="farewellMessage"
												error={
													touched.farewellMessage && Boolean(errors.farewellMessage)
												}
												helperText={
													touched.farewellMessage && errors.farewellMessage
												}
												variant="outlined"
												margin="normal"
												placeholder={t("whatsappModal.form.farewellMessagePlaceholder")}
												InputProps={{
													sx: { borderRadius: 2 }
												}}
											/>
										</Box>

										<Box sx={{ mt: 2 }}>
											<Typography variant="subtitle1" color="text.secondary" gutterBottom>
												{t("whatsappModal.form.appearanceTitle")}
											</Typography>
											<Divider sx={{ mb: 2 }} />

											<StyledTextField
												label={t("whatsappModal.form.color")}
												onClick={() => setShowColorPicker(show => !show)}
												value={color}
												variant="outlined"
												margin="normal"
												fullWidth
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<ColorPreview sx={{ backgroundColor: color }} />
														</InputAdornment>
													),
													endAdornment: (
														<InputAdornment position="end">
															<IconButton aria-label="color picker" color="primary">
																<ColorLensIcon />
															</IconButton>
														</InputAdornment>
													),
												}}
											/>
											{showColorPicker && (
												<Box sx={{ position: 'absolute', zIndex: 2, mt: 1, boxShadow: 3, borderRadius: 1, overflow: 'hidden' }}>
													<SketchPicker color={color} onChangeComplete={handleColorChange} />
												</Box>
											)}
										</Box>

										<Box sx={{ mt: 2 }}>
											<Typography variant="subtitle1" color="text.secondary" gutterBottom>
												{t("whatsappModal.form.queuesTitle")}
											</Typography>
											<Divider sx={{ mb: 2 }} />

											<QueueSelect
												selectedQueueIds={selectedQueueIds}
												onChange={selectedIds => setSelectedQueueIds(selectedIds)}
											/>
											
											<FormControlLabel
												control={
													<Field
														as={Switch}
														color="primary"
														name="isDisplay"
														checked={values.isDisplay}
													/>
												}
												label={t("whatsappModal.form.display")}
												sx={{ mt: 1 }}
											/>
										</Box>
									</>
								)}

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
									{t("whatsappModal.buttons.cancel")}
								</Button>
								<ButtonWrapper
									type="submit"
									disabled={isSubmitting}
									variant="contained"
									size="large"
									starticn={whatsAppId ? <EditIcon /> : <WhatsAppIcon />}
									sx={{ 
										position: "relative",
										borderRadius: 20,
										minWidth: '120px',
										backgroundColor: theme.palette.primary.main,
										textTransform: 'uppercase',
										fontWeight: 'bold',
										transition: 'all 0.3s ease',
										'&:hover': {
											backgroundColor: theme.palette.primary.dark
										}
									}}
								>
									{whatsAppId
										? t("whatsappModal.buttons.okEdit")
										: t("whatsappModal.buttons.okAdd")}
									{isSubmitting && (
										<ButtonProgress
											size={24}
										/>
									)}
								</ButtonWrapper>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</StyledDialog>
		</Root>
	);
};

export default React.memo(WhatsAppModal);
