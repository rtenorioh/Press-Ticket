import {
	Box,
	Button,
	Card,
	CardContent,
	CardActions,
	CircularProgress,
	Grid,
	IconButton,
	LinearProgress,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	ToggleButton,
	ToggleButtonGroup,
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
	GridView,
	Instagram,
	PlayCircleOutline,
	QrCode2,
	Replay,
	SignalCellular4Bar,
	SignalCellularConnectedNoInternet0Bar,
	SignalCellularConnectedNoInternet2Bar,
	Sms,
	SyncOutlined,
	TableRows,
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

const ChannelCard = styled(Card)(({ theme }) => ({
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	borderRadius: theme.spacing(2),
	boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
	border: `1px solid ${theme.palette.divider}`,
	'&:hover': {
		boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)',
		transform: 'translateY(-6px)',
	},
}));

const ChannelCardHeader = styled(Box)(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: theme.spacing(2),
	borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ChannelInfo = styled(Box)({
	display: 'flex',
	alignItems: 'center',
	gap: '12px',
});

const ChannelDetails = styled(Box)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	gap: theme.spacing(1.5),
	padding: theme.spacing(2),
}));

const DetailRow = styled(Box)({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
});

const DetailLabel = styled(Typography)(({ theme }) => ({
	fontWeight: 600,
	color: theme.palette.text.secondary,
	fontSize: '0.875rem',
}));

const DetailValue = styled(Typography)(({ theme }) => ({
	color: theme.palette.text.primary,
	fontSize: '0.875rem',
}));

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

const Channels = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);
	const { whatsApps, loading, fetchWhatsApps } = useContext(WhatsAppsContext);
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
	const [loadingProgress, setLoadingProgress] = useState({});
	const [loadingMessages, setLoadingMessages] = useState({});
	const [viewMode, setViewMode] = useState(() => {
		return localStorage.getItem('channelsViewMode') || 'list';
	});

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
				
				if (whatsapp.status === "CONNECTED" || whatsapp.number) {
					setTimeout(() => {
						fetchWhatsApps();
					}, 500);
				}
				
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

		socket.on("whatsappSession", (data) => {
			if (data.action === "update") {
				if (data.session?.loadingProgress !== undefined) {
					setLoadingProgress(prev => ({
						...prev,
						[data.session.id]: data.session.loadingProgress
					}));
					setLoadingMessages(prev => ({
						...prev,
						[data.session.id]: data.session.loadingMessage
					}));
				}
				
				setTimeout(() => {
					fetchWhatsApps();
				}, 500);
			}
		});

		socket.on("connect", () => {
			console.log("Socket conectado para atualizações em tempo real");
		});

		socket.on("disconnect", () => {
			console.log("Socket desconectado");
		});

		return () => {
			socket.disconnect();
		};
	}, [checkDisconnectedChannels, lastNotificationTime, fetchWhatsApps]);

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
			case "wwebjs":
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
				
				fetchWhatsApps();
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
				
				fetchWhatsApps();
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

	const handleCloseWhatsAppModal = useCallback(async () => {
		setWhatsAppModalOpen(false);
		setSelectedWhatsApp(null);
		
		setTimeout(() => {
			fetchWhatsApps();
		}, 300);
	}, [fetchWhatsApps]);

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
				title: t("channels.confirmationModal.disconnectTitle"),
				message: t("channels.confirmationModal.disconnectMessage"),
				whatsAppId: whatsAppId,
			});
		}

		if (action === "delete") {
			setConfirmModalInfo({
				action: action,
				title: t("channels.confirmationModal.deleteTitle"),
				message: t("channels.confirmationModal.deleteMessage"),
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
			
				setTimeout(() => {
					fetchWhatsApps();
				}, 300);
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
				
				setTimeout(() => {
					fetchWhatsApps();
				}, 300);
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
			
			await api.post(`/whatsappsession/${whatsAppId}`);
			
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
			setTimeout(() => {
				fetchWhatsApps();
			}, 300);
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
					<Tooltip title={t("channels.buttons.shutdown")}>
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
					<Tooltip title={t("channels.buttons.qrcode")}>
						<IconButton
							size="small"
							color="primary"
							onClick={() => handleOpenQrModal(whatsApp)}
						>
							<QrCode2 />
						</IconButton>
					</Tooltip>
				)}
				{whatsApp.status === "DISCONNECTED" && (
					<>
						<Tooltip title={t("channels.buttons.start")}>
							<IconButton
								size="small"
								color="primary"
								onClick={() => handleStartSession(whatsApp?.id)}
							>
								<PlayCircleOutline />
							</IconButton>
						</Tooltip>
						<Tooltip title={t("channels.buttons.newQr")}>
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
					whatsApp.type === "wwebjs" && (
						<Tooltip title={t("channels.buttons.disconnect")}>
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
					<Box sx={{ width: '100%', minWidth: 200 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
							<CircularProgress size={20} />
							<Typography variant="caption" color="primary">
								{loadingMessages[whatsApp.id] || 'Carregando...'}
							</Typography>
						</Box>
						{loadingProgress[whatsApp.id] !== undefined && (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<LinearProgress 
									variant="determinate" 
									value={loadingProgress[whatsApp.id]} 
									sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
								/>
								<Typography variant="caption" color="textSecondary" sx={{ minWidth: 35 }}>
									{loadingProgress[whatsApp.id]}%
								</Typography>
							</Box>
						)}
					</Box>
				)}
				{(!whatsApp.type && whatsApp.status === "CONNECTED") && (
					<Tooltip title={t("channels.buttons.restart")}>
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
						title={t("channels.toolTips.disconnected.title")}
						content={t("channels.toolTips.disconnected.content")}
					>
						<SignalCellularConnectedNoInternet0Bar color="secondary" />
					</CustomToolTip>
				)}
				{whatsApp.status === "OPENING" && (
					<CircularProgressStyled size={24} />
				)}
				{whatsApp.status === "qrcode" && (
					<CustomToolTip
						title={t("channels.toolTips.qrcode.title")}
						content={t("channels.toolTips.qrcode.content")}
					>
						<CropFree />
					</CustomToolTip>
				)}
				{whatsApp.status === "CONNECTED" && (
					<CustomToolTip title={t("channels.toolTips.connected.title")}>
						<SignalCellular4Bar sx={{ color: green[500] }} />
					</CustomToolTip>
				)}
				{(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
					<CustomToolTip
						title={t("channels.toolTips.timeout.title")}
						content={t("channels.toolTips.timeout.content")}
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

	const handleViewModeChange = (event, newMode) => {
		if (newMode !== null) {
			setViewMode(newMode);
			localStorage.setItem('channelsViewMode', newMode);
		}
	};

	const renderCardView = () => {
		return (
			<Grid container spacing={3}>
				{whatsApps?.length > 0 &&
					whatsApps.map(whatsApp => (
						<Grid item xs={12} sm={6} md={4} lg={3} key={whatsApp.id}>
							<ChannelCard>
								<ChannelCardHeader>
									<ChannelInfo>
										{getChannelIcon(whatsApp.type)}
										<Box>
											<Typography variant="h6" fontWeight={600}>
												{whatsApp.name}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												ID: {whatsApp.id}
											</Typography>
										</Box>
									</ChannelInfo>
									{whatsApp?.type === "wwebjs" && renderStatusToolTips(whatsApp)}
								</ChannelCardHeader>

								<CardContent sx={{ flexGrow: 1, p: 0 }}>
									<ChannelDetails>
										<DetailRow>
											<DetailLabel>Cor:</DetailLabel>
											<Box
												sx={{
													backgroundColor: whatsApp.color,
													width: 60,
													height: 24,
													borderRadius: 2
												}}
											/>
										</DetailRow>

										<DetailRow>
											<DetailLabel>Número:</DetailLabel>
											<DetailValue>
												{whatsApp.number ? (
													user.isTricked === "enabled" 
														? formatPhoneNumber(whatsApp.number) 
														: formatPhoneNumber(whatsApp.number).slice(0, -4) + "****"
												) : "-"}
											</DetailValue>
										</DetailRow>

										<DetailRow>
											<DetailLabel>Atualizado:</DetailLabel>
											<DetailValue>
												{whatsApp.updatedAt ? format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm") : "-"}
											</DetailValue>
										</DetailRow>

										{whatsApp.isDefault && (
											<DetailRow>
												<DetailLabel>Padrão:</DetailLabel>
												<CheckCircle sx={{ color: green[500] }} />
											</DetailRow>
										)}
									</ChannelDetails>
								</CardContent>

								<CardActions sx={{ p: 2, pt: 0, flexWrap: 'wrap', gap: 1, justifyContent: 'space-between' }}>
									<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
										{whatsApp?.type === "wwebjs" ? (
											<ActionFeedback>
												{renderActionButtons(whatsApp)}
											</ActionFeedback>
										) : null}
									</Box>
									<Box sx={{ display: 'flex', gap: 1 }}>
										<Tooltip title={t("channels.buttons.edit")}>
											<IconButton
												size="small"
												onClick={() => handleEditWhatsApp(whatsApp)}
											>
												<Edit color="info" />
											</IconButton>
										</Tooltip>
										<Tooltip title={t("channels.buttons.delete")}>
											<IconButton
												size="small"
												onClick={() => handleOpenConfirmationModal("delete", whatsApp.id)}
											>
												<DeleteOutline color="error" />
											</IconButton>
										</Tooltip>
									</Box>
								</CardActions>
							</ChannelCard>
						</Grid>
					))}
			</Grid>
		);
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
				<Title>{t("channels.title")} {whatsApps.length > 0 ? `(${whatsApps.length})` : ""}</Title>
				<MainHeaderButtonsWrapper>
					<ToggleButtonGroup
						value={viewMode}
						exclusive
						onChange={handleViewModeChange}
						size="small"
						sx={{ mr: 2 }}
					>
						<ToggleButton value="list" aria-label="visualização em lista">
							<Tooltip title="Visualização em Lista">
								<TableRows />
							</Tooltip>
						</ToggleButton>
						<ToggleButton value="grid" aria-label="visualização em grade">
							<Tooltip title="Visualização em Grade">
								<GridView />
							</Tooltip>
						</ToggleButton>
					</ToggleButtonGroup>
					<Tooltip title={t("channels.buttons.restart")} arrow>
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
					<Tooltip title={t("channels.buttons.wwebjs")}>
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
					<Tooltip title={t("channels.buttons.hub")}>
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
				{loading ? (
					viewMode === 'list' ? (
						<Table size="small">
							<TableHead>
								<TableRow>
									<TableCell align="center">{t("channels.table.id")}</TableCell>
									<TableCell align="center">{t("channels.table.channel")}</TableCell>
									<TableCell align="center">{t("channels.table.name")}</TableCell>
									<TableCell align="center">{t("channels.table.color")}</TableCell>
									<TableCell align="center">{t("channels.table.status")}</TableCell>
									<TableCell align="center">{t("channels.table.number")}</TableCell>
									<TableCell align="center">{t("channels.table.session")}</TableCell>
									<TableCell align="center">{t("channels.table.lastUpdate")}</TableCell>
									<TableCell align="center">{t("channels.table.default")}</TableCell>
									<TableCell align="center">{t("channels.table.actions")}</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								<TableRowSkeleton />
							</TableBody>
						</Table>
					) : (
						<Grid container spacing={3}>
							{[1, 2, 3, 4].map((item) => (
								<Grid item xs={12} sm={6} md={4} lg={3} key={item}>
									<ChannelCard>
										<CardContent>
											<CircularProgress />
										</CardContent>
									</ChannelCard>
								</Grid>
							))}
						</Grid>
					)
				) : viewMode === 'list' ? (
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell align="center">
									{t("channels.table.id")}
								</TableCell>
								<TableCell align="center">
									{t("channels.table.channel")}
								</TableCell>
								<TableCell align="center">
									{t("channels.table.name")}
								</TableCell>
								<TableCell align="center">
									{t("channels.table.color")}
								</TableCell>
								<TableCell align="center">
									{t("channels.table.status")}
								</TableCell>
								<TableCell align="center">
									{t("channels.table.number")}
								</TableCell>
								<TableCell align="center">
									{t("channels.table.session")}
								</TableCell>
								<TableCell align="center">
									{t("channels.table.lastUpdate")}
								</TableCell>
								<TableCell align="center">
									{t("channels.table.default")}
								</TableCell>
								<TableCell align="center">
									{t("channels.table.actions")}
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
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
											{whatsApp?.type === "wwebjs" ? renderStatusToolTips(whatsApp) : "-"}
										</TableCell>
										<TableCell align="center">
											{whatsApp.number ? (
												<>
													{user.isTricked === "enabled" ? formatPhoneNumber(whatsApp.number) : formatPhoneNumber(whatsApp.number).slice(0, -4) + "****"}
												</>
											) : "-"}
										</TableCell>
										<TableCell align="center">
											{whatsApp?.type === "wwebjs" ? (
												<ActionFeedback>
													{renderActionButtons(whatsApp)}
												</ActionFeedback>
											) : "-"}
										</TableCell>
										<TableCell align="center">
											{whatsApp.updatedAt ? format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm") : "-"}
										</TableCell>
										<TableCell align="center">
											{whatsApp.isDefault && (
												<CustomTableCell>
													<CheckCircle sx={{ color: green[500] }} />
												</CustomTableCell>
											)}
										</TableCell>
										<TableCell align="center">
											<Tooltip title={t("channels.buttons.edit")}>
												<IconButton
													size="small"
													onClick={() => handleEditWhatsApp(whatsApp)}
												>
													<Edit color="info" />
												</IconButton>
											</Tooltip>
											<Tooltip title={t("channels.buttons.delete")}>
												<IconButton
													size="small"
													onClick={e => {
														handleOpenConfirmationModal("delete", whatsApp.id);
													}}
												>
													<DeleteOutline color="error" />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				) : (
					renderCardView()
				)}
			</MainPaper>
		</MainContainer>
	);
};

export default Channels;
