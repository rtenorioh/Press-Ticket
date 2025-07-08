import {
	Box,
	Button,
	CircularProgress,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Tooltip,
	tooltipClasses,
	Typography,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { styled } from '@mui/material/styles';
import { Zoom } from "@mui/material"
import {
	CheckCircle,
	CropFree,
	DeleteOutline,
	Edit,
	Email,
	Facebook,
	Instagram,
	PlayCircleOutline,
	Replay,
	SignalCellular4Bar,
	SignalCellularConnectedNoInternet0Bar,
	SignalCellularConnectedNoInternet2Bar,
	Sms,
	SyncOutlined,
	Telegram,
	WhatsApp
} from "@mui/icons-material";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility"; 
import { format, parseISO } from "date-fns";
import React, { useCallback, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ToastManager from "../../utils/toastManager";
import ConfirmationModal from "../../components/ConfirmationModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import QrcodeModal from "../../components/QrcodeModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import WhatsAppModal from "../../components/WhatsAppModal";
import NotificameHubModal from "../../components/NotificameHubModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";

const MainPaper = styled(Paper)(({ theme }) => ({
	flex: 1,
	padding: theme.spacing(2),
	margin: theme.spacing(2),
	overflowY: "auto",
	borderRadius: theme.shape.borderRadius,
	boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
	...theme.scrollbarStyles,
}));

const CustomTableCell = styled('div')({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const CustomTooltipStyled = styled(({ className, ...props }) => (
	<Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: theme.palette.background.paper,
		color: theme.palette.text.primary,
		boxShadow: theme.shadows[3],
		fontSize: 12,
		backdropFilter: 'blur(4px)',
		padding: '10px 14px',
		maxWidth: 300,
		borderRadius: theme.shape.borderRadius,
	},
	[`& .${tooltipClasses.arrow}`]: {
		color: theme.palette.background.paper,
	},
}));

const CircularProgressStyled = styled(CircularProgress)(({ theme }) => ({
	color: green[500],
	margin: theme.spacing(1)
}));

const ActionFeedback = styled('div')({
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'center',
	alignItems: 'center',
	gap: '4px'
});

const CustomToolTip = ({ title, content, children }) => {
	return (
		<CustomTooltipStyled
      arrow
      placement="top"
      title={
        <React.Fragment>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom color="inherit">
            {title}
          </Typography>
          {content && <Typography variant="body2">{content}</Typography>}
        </React.Fragment>
      }
      TransitionComponent={Zoom}
    >
      <div>
        {children}
      </div>
    </CustomTooltipStyled>
	);
};

const Connections = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);
	const { whatsApps, loading } = useContext(WhatsAppsContext);
	const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
	const [notificameHubModalOpen, setNotificameHubModalOpen] = useState(false);
	const [qrModalOpen, setQrModalOpen] = useState(false);
	const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const confirmationModalInitialState = {
		action: "",
		title: "",
		message: "",
		whatsAppId: "",
		open: false,
	};
	const [confirmModalInfo, setConfirmModalInfo] = useState(
		confirmationModalInitialState
	);
	const [loadingActions, setLoadingActions] = useState({});
	const [actionMessages, setActionMessages] = useState({});
	const [lastNotificationTime, setLastNotificationTime] = useState({});

	const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

	const checkDisconnectedChannels = useCallback(async () => {
		try {
			if (!whatsApps || whatsApps.length === 0) return;

			const now = Date.now();
			const disconnectedChannels = whatsApps.filter(whatsApp => {
				if (whatsApp.status !== "CONNECTED") {
					const lastTime = lastNotificationTime[whatsApp.id] || 0;
					if (now - lastTime > 1800000) {
						return true;
					}
				}
				return false;
			});

			for (const channel of disconnectedChannels) {
				await api.post(`/whatsapp-notification/${channel.id}`);
				
				setLastNotificationTime(prev => ({
					...prev,
					[channel.id]: now
				}));
			}
		} catch (err) {
			console.error("Erro ao verificar canais desconectados:", err);
		}
	}, [whatsApps, lastNotificationTime]);

	useEffect(() => {
		const interval = setInterval(() => {
			checkDisconnectedChannels();
		}, 1800000);
		checkDisconnectedChannels();

		return () => clearInterval(interval);
	}, [checkDisconnectedChannels]);

	useEffect(() => {
		const socket = openSocket();

		socket.on("checkDisconnectedChannels", () => {
			checkDisconnectedChannels();
		});

		socket.on("whatsapp", async (data) => {
			if (data.action === "update" && data.whatsapp) {
				const { whatsapp } = data;
				
				if (whatsapp.status !== "CONNECTED") {
					const now = Date.now();
					const lastTime = lastNotificationTime[whatsapp.id] || 0;
					
					if (now - lastTime > 300000) {
						try {
							await api.post(`/whatsapp-notification/${whatsapp.id}`);
							
							setLastNotificationTime(prev => ({
								...prev,
								[whatsapp.id]: now
							}));
						} catch (err) {
							console.error("Erro ao notificar sobre canal desconectado:", err);
						}
					}
				}
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [checkDisconnectedChannels, lastNotificationTime]);

	const createCountdownToast = (seconds, initialMessage, finalMessage, onComplete = null, reload = false) => {
		let secondsRemaining = seconds;
		let intervalId = null;
		let toastId = null;

		const showToast = () => {
			if (toastId) {
				toast.update(toastId, {
					render: `${initialMessage} ${secondsRemaining} segundos...`,
					type: "info",
					autoClose: false,
					closeButton: false
				});
			} else {
				toastId = toast.info(`${initialMessage} ${secondsRemaining} segundos...`, {
					autoClose: false,
					closeButton: false,
					draggable: false,
					position: "top-right"
				});
			}
		};

		const startCountdown = () => {
			showToast();

			intervalId = setInterval(() => {
				secondsRemaining -= 1;
				
				showToast();

				if (secondsRemaining <= 0) {
					clearInterval(intervalId);
					
					if (toastId) {
						toast.dismiss(toastId);
					}
					
					toast.success(finalMessage, {
						position: "top-right"
					});
					
					if (onComplete && typeof onComplete === 'function') {
						onComplete();
					}
					
					if (reload) {
						setTimeout(() => {
							navigate(0);
						}, 1000);
					}
				}
			}, 1000);

			return new Promise((resolve) => {
				setTimeout(() => {
					resolve();
				}, (secondsRemaining + 1) * 1000);
			});
		};

		const cancelCountdown = () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
			if (toastId) {
				toast.dismiss(toastId);
			}
		};

		return {
			startCountdown,
			cancelCountdown
		};
	};

	const getChannelIcon = (channel) => {
		switch (channel) {
			case "facebook":
				return <Facebook sx={{ color: "#3b5998" }} />;
			case "instagram":
				return <Instagram sx={{ color: "#cd486b" }} />;
			case "telegram":
				return <Telegram sx={{ color: "#85b2ff" }} />;
			case "email":
				return <Email sx={{ color: "#004f9f" }} />;
			case "webchat":
				return <Sms sx={{ color: "#EB6D58" }} />;
			case null:
				return <WhatsApp sx={{ color: "#075e54" }} />;
			default:
				return null;
		}
	};

	const handleStartWhatsAppSession = async whatsAppId => {
		try {
			setLoadingActions(prev => ({ ...prev, [whatsAppId]: 'startSession' }));
			setActionMessages(prev => ({ ...prev, [whatsAppId]: 'Iniciando sessão...' }));
			
			const startSessionToastId = toast.info('Iniciando sessão do WhatsApp...', {
				autoClose: false,
				closeButton: false,
				draggable: false,
			});
			
			await api.post(`/whatsappsession/${whatsAppId}`);
			
			toast.update(startSessionToastId, {
				render: 'Sessão iniciada com sucesso! Aguarde...',
				type: toast.TYPE.SUCCESS,
			});
			
			setTimeout(() => {
				setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
				setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
				
				toast.dismiss(startSessionToastId);
				
				toast.success('Sessão iniciada com sucesso!');
			}, 3000);
		} catch (err) {
			toastError(err);
			setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
			setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
		}
	};

	const handleRequestNewQrCode = async whatsAppId => {
		try {
			setLoadingActions(prev => ({ ...prev, [whatsAppId]: 'newQrCode' }));
			setActionMessages(prev => ({ ...prev, [whatsAppId]: 'Solicitando novo QR code...' }));
			
			const qrCodeToastId = toast.info('Solicitando novo QR code...', {
				autoClose: false,
				closeButton: false,
				draggable: false,
			});
			
			await api.put(`/whatsappsession/${whatsAppId}`);
			
			toast.update(qrCodeToastId, {
				render: 'Novo QR code gerado com sucesso! Aguarde...',
				type: toast.TYPE.SUCCESS,
			});
			
			setTimeout(() => {
				setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
				setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
				
				toast.dismiss(qrCodeToastId);
				
				toast.success('Novo QR code gerado com sucesso!');
			}, 3000);
		} catch (err) {
			toastError(err);
			setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
			setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
		}
	};

	const handleOpenWhatsAppModal = () => {
		setSelectedWhatsApp(null);
		setWhatsAppModalOpen(true);
	};

	const handleOpenNotificameHubModal = () => {
		setNotificameHubModalOpen(true);
	};

	const handleCloseNotificameHubModal = useCallback(() => {
		setNotificameHubModalOpen(false);
	}, []);

	const handleCloseWhatsAppModal = useCallback(() => {
		setWhatsAppModalOpen(false);
		setSelectedWhatsApp(null);
		
		const fetchWhatsApps = async () => {
			try {
				const { data } = await api.get("/whatsapp/");
				const socket = openSocket();
				data.forEach(whatsapp => {
					socket.emit("whatsapp", {
						action: "update",
						whatsapp
					});
				});
			} catch (err) {
				toastError(err);
			}
		};
		fetchWhatsApps();
	}, [setSelectedWhatsApp, setWhatsAppModalOpen]);

	const handleOpenQrModal = whatsApp => {
		setSelectedWhatsApp(whatsApp);
		setQrModalOpen(true);
	};

	const handleCloseQrModal = useCallback(() => {
		setSelectedWhatsApp(null);
		setQrModalOpen(false);
	}, [setQrModalOpen, setSelectedWhatsApp]);

	const handleEditWhatsApp = whatsApp => {
		setSelectedWhatsApp(whatsApp);
		setWhatsAppModalOpen(true);
	};

	const handleOpenConfirmationModal = (action, whatsAppId) => {
		if (action === "disconnect") {
			setConfirmModalInfo({
				action: action,
				title: t("connections.confirmationModal.disconnectTitle"),
				message: t("connections.confirmationModal.disconnectMessage"),
				whatsAppId: whatsAppId,
			});
		}

		if (action === "delete") {
			setConfirmModalInfo({
				action: action,
				title: t("connections.confirmationModal.deleteTitle"),
				message: t("connections.confirmationModal.deleteMessage"),
				whatsAppId: whatsAppId,
			});
		}
		setConfirmModalOpen(true);
	};

	const handleSubmitConfirmationModal = async () => {
		const whatsAppId = confirmModalInfo.whatsAppId;
		setConfirmModalOpen(false);
		setConfirmModalInfo(confirmationModalInitialState);

		if (confirmModalInfo.action === "disconnect") {
			try {
				setLoadingActions(prev => ({ ...prev, [whatsAppId]: 'disconnect' }));
				setActionMessages(prev => ({ ...prev, [whatsAppId]: 'Desconectando sessão...' }));
				
				ToastManager.info('Desconectando sessão do WhatsApp...', `disconnect-${whatsAppId}`, { autoClose: false });
			
				await api.delete(`/whatsappsession/${whatsAppId}`);
				
				setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
				setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
				
				ToastManager.success('Sessão desconectada com sucesso!', `disconnect-success-${whatsAppId}`);
			} catch (err) {
				toastError(err, t);
				setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
				setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
			}
		}

		if (confirmModalInfo.action === "delete") {
			try {
				setLoadingActions(prev => ({ ...prev, [whatsAppId]: 'delete' }));
				setActionMessages(prev => ({ ...prev, [whatsAppId]: 'Excluindo canal...' }));
				
				ToastManager.info('Excluindo canal do WhatsApp...', `delete-${whatsAppId}`, { autoClose: false });
				
				await api.delete(`/whatsapp/${whatsAppId}`);
				
				setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
				setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
				
				ToastManager.success('Canal excluído com sucesso!', `delete-success-${whatsAppId}`);
			} catch (err) {
				toastError(err);
				setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
				setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
			}
		}
	};

	const handleRestartSession = async (whatsAppId) => {
		try {
			setLoadingActions(prev => ({ ...prev, [whatsAppId]: 'restart' }));
			setActionMessages(prev => ({ ...prev, [whatsAppId]: 'Reiniciando sessão...' }));
			
			const initialToastId = toast.info('Reiniciando sessão do WhatsApp...', {
				autoClose: false,
				position: "top-right"
			});
			
			await api.post(`/whatsapp/${whatsAppId}/restart`);
			
			toast.dismiss(initialToastId);
			
			toast.success('Sessão reiniciada com sucesso!', {
				position: "top-right"
			});
			
			setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
			setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
			
			await delay(500);
			
			const countdown = createCountdownToast(
				1,
				'Atualizando a página em',
				'Página atualizada!',
				null,
				true
			);
			
			await countdown.startCountdown();
		} catch (err) {
			toastError(err);
			setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
			setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
		}
	};

	const handleStartSession = async (whatsAppId) => {
		try {
			setLoadingActions(prev => ({ ...prev, [whatsAppId]: 'start' }));
			setActionMessages(prev => ({ ...prev, [whatsAppId]: 'Iniciando sessão...' }));
			
			const startToastId = toast.info('Iniciando sessão do WhatsApp...', {
				autoClose: false,
				closeButton: false,
				draggable: false,
			});
			
			await api.post(`/whatsapp/${whatsAppId}/start`);
			
			toast.dismiss(startToastId);
			
			const countdownToast = createCountdownToast(
				3,
				'Sessão iniciada com sucesso! Aguarde',
				'Sessão iniciada com sucesso!',
				() => {
					setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
					setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
				},
				false
			);
			
			await countdownToast.startCountdown();
		} catch (err) {
			toastError(err);
			setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
			setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
		}
	};

	const handleShutdownSession = async (whatsAppId) => {
		try {
			setLoadingActions(prev => ({ ...prev, [whatsAppId]: 'shutdown' }));
			setActionMessages(prev => ({ ...prev, [whatsAppId]: 'Desligando sessão...' }));
			
			const shutdownToastId = toast.info('Desligando sessão do WhatsApp...', {
				autoClose: false,
				closeButton: false,
				draggable: false,
			});
			
			await api.post(`/whatsapp/${whatsAppId}/shutdown`);
			
			toast.dismiss(shutdownToastId);
			
			const countdownToast = createCountdownToast(
				5,
				'Sessão desligada com sucesso! Atualizando em',
				'Sessão desligada com sucesso!',
				() => {
					setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
					setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
				},
				true
			);
			
			await countdownToast.startCountdown();
		} catch (err) {
			toastError(err);
			setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
			setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
		}
	};

	const renderActionButtons = (whatsApp) => {
		if (loadingActions[whatsApp.id]) {
			return (
				<ActionFeedback>
					<CircularProgressStyled size={24} />
					{actionMessages[whatsApp.id] && (
						<Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
							{actionMessages[whatsApp.id]}
						</Typography>
					)}
				</ActionFeedback>
			);
		}

		return (
			<>
				{(whatsApp.status === "CONNECTED") && (
					<Tooltip title={t("connections.buttons.shutdown")}>
						<IconButton
							size="small"
							color="secondary"
							onClick={() => handleShutdownSession(whatsApp?.id)}
						>
							<DeleteOutline />
						</IconButton>
					</Tooltip>
				)}
				{whatsApp.status === "qrcode" && (
					<Tooltip title={t("connections.buttons.qrcode")}>
						<IconButton
							size="small"
							color="primary"
							onClick={() => handleOpenQrModal(whatsApp)}
						>
							<VisibilityIcon />
						</IconButton>
					</Tooltip>
				)}
				{whatsApp.status === "DISCONNECTED" && (
					<>
						<Tooltip title={t("connections.buttons.start")}>
							<IconButton
								size="small"
								color="primary"
								onClick={() => handleStartSession(whatsApp?.id)}
							>
								<PlayCircleOutline />
							</IconButton>
						</Tooltip>
						<Tooltip title={t("connections.buttons.tryAgain")}>
							<IconButton
								size="small"
								color="primary"
								onClick={() => handleStartWhatsAppSession(whatsApp.id)}
							>
								<Replay />
							</IconButton>
						</Tooltip>
						<Tooltip title={t("connections.buttons.newQr")}>
							<IconButton
								size="small"
								color="secondary"
								onClick={() => handleRequestNewQrCode(whatsApp.id)}
							>
								<VisibilityIcon />
							</IconButton>
						</Tooltip>
					</>
				)}
				{(whatsApp.status === "CONNECTED" ||
					whatsApp.status === "PAIRING" ||
					whatsApp.status === "TIMEOUT") &&
					whatsApp.type === null && (
						<Tooltip title={t("connections.buttons.disconnect")}>
							<IconButton
								size="small"
								color="secondary"
								onClick={() => handleOpenConfirmationModal("disconnect", whatsApp.id)}
							>
								<PowerSettingsNewIcon />
							</IconButton>
						</Tooltip>
					)}
				{whatsApp.status === "OPENING" && (
					<IconButton size="small" disabled color="default">
						<CircularProgress size={24} />
					</IconButton>
				)}
				{(!whatsApp.type && whatsApp.status === "CONNECTED") && (
					<Tooltip title={t("connections.buttons.restart")}>
						<IconButton
							size="small"
							color="primary"
							onClick={() => handleRestartSession(whatsApp?.id)}
						>
							<RefreshIcon />
						</IconButton>
					</Tooltip>
				)}
			</>
		);
	};

	const renderStatusToolTips = whatsApp => {
		return (
			<CustomTableCell>
				{whatsApp.status === "DISCONNECTED" && (
					<CustomToolTip
						title={t("connections.toolTips.disconnected.title")}
						content={t("connections.toolTips.disconnected.content")}
					>
						<SignalCellularConnectedNoInternet0Bar color="secondary" />
					</CustomToolTip>
				)}
				{whatsApp.status === "OPENING" && (
					<CircularProgressStyled size={24} />
				)}
				{whatsApp.status === "qrcode" && (
					<CustomToolTip
						title={t("connections.toolTips.qrcode.title")}
						content={t("connections.toolTips.qrcode.content")}
					>
						<CropFree />
					</CustomToolTip>
				)}
				{whatsApp.status === "CONNECTED" && (
					<CustomToolTip title={t("connections.toolTips.connected.title")}>
						<SignalCellular4Bar sx={{ color: green[500] }} />
					</CustomToolTip>
				)}
				{(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
					<CustomToolTip
						title={t("connections.toolTips.timeout.title")}
						content={t("connections.toolTips.timeout.content")}
					>
						<SignalCellularConnectedNoInternet2Bar color="secondary" />
					</CustomToolTip>
				)}
			</CustomTableCell>
		);
	};

	const restartpm2 = async () => {
		try {
			await api.post('/restartpm2');

			const countdownToast = createCountdownToast(
				15,
				'Reiniciando o sistema em',
				'Sistema reiniciado com sucesso!',
				null,
				true
			);
			
			await countdownToast.startCountdown();
		} catch (err) {
			if (!(err && err.message && err.message.includes('Network Error'))) {
				toastError(err);
			}
		}
	};

	const formatPhoneNumber = (number) => {
		if (number.startsWith('55') && number.length === 13) {
			const ddd = number.slice(2, 4);
			const firstPart = number.slice(4, 9);
			const secondPart = number.slice(9);
			return `(${ddd}) ${firstPart}-${secondPart}`;
		} else if (number.startsWith('55') && number.length === 12) {
			const ddd = number.slice(2, 4);
			const firstPart = number.slice(4, 8);
			const secondPart = number.slice(8);
			return `(${ddd}) ${firstPart}-${secondPart}`;
		}

		return number;
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={confirmModalInfo.title}
				open={confirmModalOpen}
				onClose={setConfirmModalOpen}
				onConfirm={handleSubmitConfirmationModal}
			>
				{confirmModalInfo.message}
			</ConfirmationModal>
			<QrcodeModal
				open={qrModalOpen}
				onClose={handleCloseQrModal}
				whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
			/>
			<WhatsAppModal
				open={whatsAppModalOpen}
				onClose={handleCloseWhatsAppModal}
				whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
			/>
			<NotificameHubModal
				open={notificameHubModalOpen}
				onClose={handleCloseNotificameHubModal}
			/>
			<MainHeader>
				<Title>{t("connections.title")} {whatsApps.length > 0 ? `(${whatsApps.length})` : ""}</Title>
				<MainHeaderButtonsWrapper>
					<Tooltip title={t("connections.buttons.restart")} arrow>
						<Button
							variant="contained"
							color="primary"
							onClick={restartpm2}
							sx={{
								borderRadius: 2,
								px: { xs: 1, sm: 2 },
								mr: 1
							}}
						>
							<SyncOutlined />
						</Button>
					</Tooltip>
					<Tooltip title={t("connections.buttons.wwebjs")}>
						<Button
							variant="contained"
							color="primary"
							onClick={handleOpenWhatsAppModal}
							sx={{
								borderRadius: 2,
								px: { xs: 1, sm: 2 },
								mr: 1
							}}
						>
							<WhatsApp />
						</Button>
					</Tooltip>
					<Tooltip title={t("connections.buttons.hub")}>
						<Button
							variant="contained"
							color="secondary"
							onClick={handleOpenNotificameHubModal}
							sx={{
								borderRadius: 2,
								px: { xs: 1, sm: 2 },
							}}
						>
							<Sms />
						</Button>
					</Tooltip>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<MainPaper variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell align="center">
								{t("connections.table.id")}
							</TableCell>
							<TableCell align="center">
								{t("connections.table.channel")}
							</TableCell>
							<TableCell align="center">
								{t("connections.table.name")}
							</TableCell>
							<TableCell align="center">
								{t("connections.table.color")}
							</TableCell>
							<TableCell align="center">
								{t("connections.table.status")}
							</TableCell>
							<TableCell align="center">
								{t("connections.table.number")}
							</TableCell>
							<TableCell align="center">
								{t("connections.table.session")}
							</TableCell>
							<TableCell align="center">
								{t("connections.table.lastUpdate")}
							</TableCell>
							<TableCell align="center">
								{t("connections.table.default")}
							</TableCell>
							<TableCell align="center">
								{t("connections.table.actions")}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRowSkeleton />
						) : (
							<>
								{whatsApps?.length > 0 &&
									whatsApps.map(whatsApp => (
										<TableRow key={whatsApp.id}>
											<TableCell align="center">
												{whatsApp.id}
											</TableCell>
											<TableCell align="center">
												{getChannelIcon(whatsApp.type)}
											</TableCell>
											<TableCell align="center">
												{whatsApp.name}
											</TableCell>
											<TableCell align="center">
												<CustomTableCell>
													<Box
														sx={{
															backgroundColor: whatsApp.color,
															width: 40,
															height: 20,
															alignSelf: "center",
															borderRadius: 10
														}}
													/>
												</CustomTableCell>
											</TableCell>
											<TableCell align="center">
												{whatsApp?.type === null || whatsApp?.type === undefined ? renderStatusToolTips(whatsApp) : "-"}
											</TableCell>
											<TableCell align="center">
												{whatsApp.number ? (
													<>
														{user.isTricked === "enabled" ? formatPhoneNumber(whatsApp.number) : formatPhoneNumber(whatsApp.number).slice(0, -4) + "****"}
													</>
												) : "-"}
											</TableCell>
											<TableCell align="center">
												{whatsApp?.type === null || whatsApp?.type === undefined ? (
													<ActionFeedback>
														{renderActionButtons(whatsApp)}
													</ActionFeedback>
												) : "-"}
											</TableCell>
											<TableCell align="center">
												{format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
											</TableCell>
											<TableCell align="center">
												{whatsApp.isDefault && (
													<CustomTableCell>
														<CheckCircle sx={{ color: green[500] }} />
													</CustomTableCell>
												)}
											</TableCell>
											<TableCell align="center">
												<IconButton
													size="small"
													onClick={() => handleEditWhatsApp(whatsApp)}
												>
													<Edit color="info" />
												</IconButton>
												<IconButton
													size="small"
													onClick={e => {
														handleOpenConfirmationModal("delete", whatsApp.id);
													}}
												>
													<DeleteOutline color="error" />
												</IconButton>
											</TableCell>
										</TableRow>
									))}
							</>
						)}
					</TableBody>
				</Table>
			</MainPaper>
		</MainContainer>
	);
};

export default Connections;
