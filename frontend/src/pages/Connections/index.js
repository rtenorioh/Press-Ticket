import {
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
	Typography,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import Zoom from "@material-ui/core/Zoom";
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
} from "@material-ui/icons";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import RefreshIcon from "@material-ui/icons/Refresh";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { format, parseISO } from "date-fns";
import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import QrcodeModal from "../../components/QrcodeModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import WhatsAppModal from "../../components/WhatsAppModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
	mainPaper: {
		flex: 1,
		padding: theme.spacing(2),
		margin: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
	customTableCell: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	tooltip: {
		backgroundColor: "#f5f5f9",
		color: "rgba(0, 0, 0, 0.87)",
		fontSize: theme.typography.pxToRem(14),
		border: "1px solid #dadde9",
		maxWidth: 450,
	},
	tooltipPopper: {
		textAlign: "center",
	},
	buttonProgress: {
		color: green[500],
		margin: theme.spacing(1)
	},
	actionFeedback: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: '4px'
	}
}));

const CustomToolTip = ({ title, content, children }) => {
	const classes = useStyles();

	return (
		<Tooltip
			arrow
			classes={{
				tooltip: classes.tooltip,
				popper: classes.tooltipPopper,
			}}
			title={
				<React.Fragment>
					<Typography gutterBottom color="inherit">
						{title}
					</Typography>
					{content && <Typography>{content}</Typography>}
				</React.Fragment>
			}
			TransitionComponent={Zoom}
		>
			<div>
				{children}
			</div>
		</Tooltip>
	);
};

const Connections = () => {
	const classes = useStyles();
	const { t } = useTranslation();
	const history = useHistory();
	const { user } = useContext(AuthContext);
	const { whatsApps, loading } = useContext(WhatsAppsContext);
	const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
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

	const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

	const createCountdownToast = (seconds, initialMessage, finalMessage, onComplete = null, reload = false) => {
		let secondsRemaining = seconds;
		let intervalId = null;
		let toastId = null;

		const showToast = () => {
			if (toastId) {
				toast.update(toastId, {
					render: `${initialMessage} ${secondsRemaining} segundos...`,
					type: toast.TYPE.INFO,
					autoClose: false,
					closeButton: false
				});
			} else {
				toastId = toast.info(`${initialMessage} ${secondsRemaining} segundos...`, {
					autoClose: false,
					closeButton: false,
					draggable: false,
					position: toast.POSITION.TOP_RIGHT
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
						position: toast.POSITION.TOP_RIGHT
					});
					
					if (onComplete && typeof onComplete === 'function') {
						onComplete();
					}
					
					if (reload) {
						setTimeout(() => {
							history.go(0);
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
				return <Facebook style={{ color: "#3b5998" }} />;
			case "instagram":
				return <Instagram style={{ color: "#cd486b" }} />;
			case "telegram":
				return <Telegram style={{ color: "#85b2ff" }} />;
			case "email":
				return <Email style={{ color: "#004f9f" }} />;
			case "webchat":
				return <Sms style={{ color: "#EB6D58" }} />;
			case null:
				return <WhatsApp style={{ color: "#075e54" }} />;
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

	const handleCloseWhatsAppModal = useCallback(() => {
		setWhatsAppModalOpen(false);
		setSelectedWhatsApp(null);
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
				
				const disconnectToastId = toast.info('Desconectando sessão do WhatsApp...', {
					autoClose: false,
					closeButton: false,
					draggable: false,
				});
				
				await api.delete(`/whatsappsession/${whatsAppId}`);
				
				toast.update(disconnectToastId, {
					render: 'Sessão desconectada com sucesso! Aguarde...',
					type: toast.TYPE.SUCCESS,
				});
				
				setTimeout(() => {
					setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
					setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
					
					toast.dismiss(disconnectToastId);
					
					toast.success('Sessão desconectada com sucesso!');
				}, 3000);
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
				
				const deleteToastId = toast.info('Excluindo canal do WhatsApp...', {
					autoClose: false,
					closeButton: false,
					draggable: false,
				});
				
				await api.delete(`/whatsapp/${whatsAppId}`);
				
				toast.update(deleteToastId, {
					render: 'Canal excluído com sucesso! Aguarde...',
					type: toast.TYPE.SUCCESS,
				});
				
				setTimeout(() => {
					setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
					setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
					
					toast.dismiss(deleteToastId);
					
					toast.success(t("connections.toasts.deleted"));
				}, 3000);
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
				position: toast.POSITION.TOP_RIGHT
			});
			
			await api.post(`/whatsapp/${whatsAppId}/restart`);
			
			toast.dismiss(initialToastId);
			
			toast.success('Sessão reiniciada com sucesso!', {
				position: toast.POSITION.TOP_RIGHT
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
			// Iniciar o indicador de carregamento
			setLoadingActions(prev => ({ ...prev, [whatsAppId]: 'start' }));
			setActionMessages(prev => ({ ...prev, [whatsAppId]: 'Iniciando sessão...' }));
			
			// Criar um toast inicial
			const startToastId = toast.info('Iniciando sessão do WhatsApp...', {
				autoClose: false,
				closeButton: false,
				draggable: false,
			});
			
			// Fazer a chamada para iniciar a sessão
			await api.post(`/whatsapp/${whatsAppId}/start`);
			
			// Fechar o toast inicial
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
			
			// Iniciar a contagem regressiva
			await countdownToast.startCountdown();
		} catch (err) {
			toastError(err);
			setLoadingActions(prev => ({ ...prev, [whatsAppId]: undefined }));
			setActionMessages(prev => ({ ...prev, [whatsAppId]: undefined }));
		}
	};

	const handleShutdownSession = async (whatsAppId) => {
		try {
			// Iniciar o indicador de carregamento
			setLoadingActions(prev => ({ ...prev, [whatsAppId]: 'shutdown' }));
			setActionMessages(prev => ({ ...prev, [whatsAppId]: 'Desligando sessão...' }));
			
			// Criar um toast inicial
			const shutdownToastId = toast.info('Desligando sessão do WhatsApp...', {
				autoClose: false,
				closeButton: false,
				draggable: false,
			});
			
			// Fazer a chamada para desligar a sessão
			await api.post(`/whatsapp/${whatsAppId}/shutdown`);
			
			// Fechar o toast inicial
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
				<div className={classes.actionFeedback}>
					<CircularProgress size={24} className={classes.buttonProgress} />
					{actionMessages[whatsApp.id] && (
						<Typography variant="caption" style={{ fontSize: '0.7rem' }}>
							{actionMessages[whatsApp.id]}
						</Typography>
					)}
				</div>
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
			<div className={classes.customTableCell}>
				{whatsApp.status === "DISCONNECTED" && (
					<CustomToolTip
						title={t("connections.toolTips.disconnected.title")}
						content={t("connections.toolTips.disconnected.content")}
					>
						<SignalCellularConnectedNoInternet0Bar color="secondary" />
					</CustomToolTip>
				)}
				{whatsApp.status === "OPENING" && (
					<CircularProgress size={24} className={classes.buttonProgress} />
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
						<SignalCellular4Bar style={{ color: green[500] }} />
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
			</div>
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
			toastError(err);
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
			<MainHeader>
				<Title>{t("connections.title")} ({whatsApps.length})</Title>
				<MainHeaderButtonsWrapper>
					<Tooltip title={t("connections.buttons.restart")}>
						<Button
							variant="contained"
							color="primary"
							onClick={restartpm2}
						>
							<SyncOutlined />
						</Button>
					</Tooltip>
					<Tooltip title={t("connections.buttons.add")}>
						<Button
							variant="contained"
							color="primary"
							onClick={handleOpenWhatsAppModal}
						>
							<WhatsApp />
						</Button>
					</Tooltip>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<Paper className={classes.mainPaper} variant="outlined">
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
												<div className={classes.customTableCell}>
													<span
														style={{
															backgroundColor: whatsApp.color,
															width: 20,
															height: 20,
															alignSelf: "center",
															borderRadius: 10
														}}
													/>
												</div>
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
													<div className={classes.actionFeedback}>
														{renderActionButtons(whatsApp)}
													</div>
												) : "-"}
											</TableCell>
											<TableCell align="center">
												{format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
											</TableCell>
											<TableCell align="center">
												{whatsApp.isDefault && (
													<div className={classes.customTableCell}>
														<CheckCircle style={{ color: green[500] }} />
													</div>
												)}
											</TableCell>
											<TableCell align="center">
												<IconButton
													size="small"
													onClick={() => handleEditWhatsApp(whatsApp)}
												>
													<Edit color="secondary" />
												</IconButton>
												<IconButton
													size="small"
													onClick={e => {
														handleOpenConfirmationModal("delete", whatsApp.id);
													}}
												>
													<DeleteOutline color="secondary" />
												</IconButton>
											</TableCell>
										</TableRow>
									))}
							</>
						)}
					</TableBody>
				</Table>
			</Paper>
		</MainContainer>
	);
};

export default Connections;
