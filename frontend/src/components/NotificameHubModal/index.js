import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	MenuItem,
	TextField,
	Tooltip,
	Typography,
	Box,
	Divider,
} from '@mui/material';
import { green } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as Yup from "yup";
import toastError from "../../errors/toastError";
import api from "../../services/api";

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

const IntegrationBox = styled(Box)(({ theme }) => ({
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

const NotificameHubModal = ({ open, onClose }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const initialState = {
		name: "",
	};
	const [whatsApp, setWhatsApp] = useState(initialState);
	const [availableChannels, setAvailableChannels] = useState([]);
	const [selectedChannel, setSelectedChannel] = useState("");
	const [copySuccess, setCopySuccess] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const fetchChannels = async () => {
		try {
			const { data } = await api.get("/hub-channel/");
			setAvailableChannels(data);
		} catch (err) {
			toastError(err);
		}
	};

	useEffect(() => {
		if (open) {
			fetchChannels();
		}
	}, [open]);

	const handleCopy = () => {
		setCopySuccess(true);
		setTimeout(() => setCopySuccess(false), 2000);
	};

	const handleSaveChannel = async values => {
		setIsSubmitting(true);
		try {
			if (selectedChannel) {
				const selectedChannelObj = availableChannels.find(
					channel => channel.id === selectedChannel
				);

				if (selectedChannelObj) {
					const channels = [selectedChannelObj];
					await api.post("/hub-channel/", {
						...values,
						channels
					});
					toast.success(t("notificameHubModal.success"));
					setTimeout(() => {
						window.location.reload();
					}, 100);
				}
			}
		} catch (err) {
			toastError(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		onClose();
		setWhatsApp(initialState);
		setSelectedChannel("");
	};

	return (
		<StyledDialog
			open={open}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
			scroll="paper"
		>
			<DialogTitle>
				<Box display="flex" alignItems="center">
					<EditIcon sx={{ mr: 1 }} />
					<Typography variant="h6" component="div">
						{t("notificameHubModal.title")}
					</Typography>
				</Box>
			</DialogTitle>
			<Formik
				initialValues={whatsApp}
				enableReinitialize={true}
				validationSchema={SessionSchema}
				onSubmit={(values, actions) => {
					setTimeout(() => {
						handleSaveChannel(values);
						actions.setSubmitting(false);
					}, 400);
				}}
			>
				{({ values, touched, errors }) => (
					<Form>
						<DialogContent dividers>
							<Box sx={{ mb: 2 }}>
								<Typography variant="subtitle1" color="text.secondary" gutterBottom>
									{t("notificameHubModal.form.mainInfo")}
								</Typography>
								<Divider sx={{ mb: 2 }} />
							</Box>
							
							<Field
								as={StyledTextField}
								label={t("notificameHubModal.form.name")}
								autoFocus
								name="name"
								error={touched.name && Boolean(errors.name)}
								helperText={touched.name && errors.name}
								variant="outlined"
								margin="normal"
								fullWidth
								placeholder={t("notificameHubModal.form.namePlaceholder")}
							/>

							<Box sx={{ mt: 2 }}>
								<Typography variant="subtitle1" color="text.secondary" gutterBottom>
									{t("notificameHubModal.form.channelSelection")}
								</Typography>
								<Divider sx={{ mb: 2 }} />

								<StyledTextField
									select
									label={t("notificameHubModal.form.selectChannel")}
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
										{t("notificameHubModal.form.selectChannelPlaceholder")}
									</MenuItem>
									{availableChannels.map(channel => (
										<MenuItem key={channel.id} value={channel.id}>
											{channel.name}
										</MenuItem>
									))}
								</StyledTextField>

								<IntegrationBox>
									<IntegrationHeader>
										<InfoOutlinedIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
										<IntegrationTitle variant="h6">{t("notificameHubModal.integration.title")}</IntegrationTitle>
									</IntegrationHeader>

									<IntegrationDescription variant="body2" dangerouslySetInnerHTML={{ 
										__html: t("notificameHubModal.integration.description")
									}} />

									<IntegrationDescription variant="body2" dangerouslySetInnerHTML={{ 
										__html: t("notificameHubModal.integration.discount")
									}} />

									<CouponBox>
										<CouponText variant="subtitle1">
											PRESS40
										</CouponText>
										<CopyToClipboard text="PRESS60" onCopy={handleCopy}>
											<Tooltip title={copySuccess ? t("notificameHubModal.integration.copied") : t("notificameHubModal.integration.copy")}>
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
										{t("notificameHubModal.integration.register")}
									</RegisterButton>
								</IntegrationBox>
							</Box>
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
								{t("notificameHubModal.buttons.cancel")}
							</Button>
							<ButtonWrapper
								type="submit"
								disabled={isSubmitting}
								variant="contained"
								size="large"
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
								{t("notificameHubModal.buttons.add")}
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
	);
};

export default React.memo(NotificameHubModal);
