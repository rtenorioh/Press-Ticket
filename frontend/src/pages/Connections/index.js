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
			await api.post(`/whatsappsession/${whatsAppId}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleRequestNewQrCode = async whatsAppId => {
		try {
			await api.put(`/whatsappsession/${whatsAppId}`);
		} catch (err) {
			toastError(err);
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
		if (confirmModalInfo.action === "disconnect") {
			try {
				await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
				toast.success('Sessão desconectada com sucesso!');
			} catch (err) {
				toastError(err);
			}
		}

		if (confirmModalInfo.action === "delete") {
			try {
				await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
				toast.success(t("connections.toasts.deleted"));
			} catch (err) {
				toastError(err);
			}
		}

		setConfirmModalOpen(false);
		setConfirmModalInfo(confirmationModalInitialState);
	};

	const handleRestartSession = async (whatsAppId) => {
		try {
			await api.post(`/whatsapp/${whatsAppId}/restart`);
			toast.success(t("connections.toasts.sessionRestarted"));
		} catch (err) {
			toastError(err);
		}
	};

	const handleStartSession = async (whatsAppId) => {
		try {
			await api.post(`/whatsapp/${whatsAppId}/start`);
			toast.success(t("connections.toasts.sessionStarted"));
		} catch (err) {
			toastError(err);
		}
	};

	const handleShutdownSession = async (whatsAppId) => {
		try {
			await api.post(`/whatsapp/${whatsAppId}/shutdown`);
			toast.success(t("connections.toasts.sessionShutdown"));
			history.go(0);
		} catch (err) {
			toastError(err);
		}
	};

	const renderActionButtons = (whatsApp) => {
		return (
			<>
				{whatsApp.status === "DISCONNECTED" && (
					<Tooltip title={t("connections.buttons.start")}>
						<IconButton
							size="small"
							color="primary"
							onClick={() => handleStartSession(whatsApp?.id)}
						>
							<PowerSettingsNewIcon />
						</IconButton>
					</Tooltip>
				)}
				{(whatsApp.status === "qrcode" && whatsApp.status === "CONNECTED") && (
					<Tooltip title={t("connections.buttons.shutdown")}>
						<IconButton
							size="small"
							color="secondary"
							onClick={() => handleShutdownSession(whatsApp?.id)}
						>
							<PowerSettingsNewIcon />
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
						<Tooltip title={t("connections.buttons.tryAgain")}>
							<IconButton
								size="small"
								color="primary"
								onClick={() => handleStartWhatsAppSession(whatsApp.id)}
							>
								<PowerSettingsNewIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title={t("connections.buttons.newQr")}>
							<IconButton
								size="small"
								color="secondary"
								onClick={() => handleRequestNewQrCode(whatsApp.id)}
							>
								<RefreshIcon />
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
		const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
		let secondsRemaining = 10;

		const countdownToastId = toast.info(`O sistema será reiniciado em ${secondsRemaining} segundos...`, {
			autoClose: false,
		});

		const updateToast = () => {
			toast.update(countdownToastId, {
				render: `O sistema será reiniciado em ${secondsRemaining} segundos...`,
			});
		};

		try {
			await api.post('/restartpm2');

			const intervalId = setInterval(() => {
				secondsRemaining -= 1;
				updateToast();

				if (secondsRemaining <= 0) {
					clearInterval(intervalId);
					toast.dismiss(countdownToastId);
				}
			}, 1000);

			await delay(10000);
			history.go(0);
		} catch (err) {
			toast.dismiss(countdownToastId);
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
												{whatsApp?.type === null || whatsApp?.type === undefined ? renderActionButtons(whatsApp) : "-"}
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
