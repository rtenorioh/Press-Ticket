import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Divider
} from "@mui/material";
import { Close as CloseIcon, CheckCircle } from "@mui/icons-material";
import { QRCodeSVG } from "qrcode.react";
import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
	const [qrCode, setQrCode] = useState("");
	const [status, setStatus] = useState("");
	const [isConnecting, setIsConnecting] = useState(false);
	const [pairingCode, setPairingCode] = useState("");
	const [countdown, setCountdown] = useState(0);
	const { t } = useTranslation();

	// Reset all state when modal opens/closes
	useEffect(() => {
		if (open) {
			setQrCode("");
			setStatus("");
			setIsConnecting(false);
			setPairingCode("");
			setCountdown(0);
		}
	}, [open]);

	// Countdown tick
	useEffect(() => {
		if (countdown <= 0 || !pairingCode) return;
		const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
		return () => clearTimeout(timer);
	}, [countdown, pairingCode]);

	// Initial fetch
	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;
			try {
				const { data } = await api.get(`/whatsapp/${whatsAppId}`);
				setQrCode(data.qrcode || "");
				setStatus(data.status);

				if (data.pairingCode) {
					setPairingCode(data.pairingCode);
					if (data.pairingCodeExpiresAt) {
						const secs = Math.max(0, Math.floor((new Date(data.pairingCodeExpiresAt) - Date.now()) / 1000));
						setCountdown(secs);
					} else {
						setCountdown(180);
					}
				}

				if (data.status === "CONNECTED") {
					toast.success("Canal conectado com sucesso!", { position: "top-right", autoClose: 2000 });
					setTimeout(() => onClose(), 500);
				}
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, [whatsAppId, onClose]);

	// Socket updates
	useEffect(() => {
		if (!whatsAppId) return;
		const socket = openSocket();

		socket.on("whatsappSession", data => {
			if (data.action === "update" && data.session.id === whatsAppId) {
				setQrCode(data.session.qrcode || "");
				setStatus(data.session.status);

				if (data.session.pairingCode) {
					setPairingCode(data.session.pairingCode);
					setCountdown(180);
				}

				if (data.session.status === "OPENING" || data.session.status === "PAIRING") {
					setIsConnecting(true);
				}

				if (data.session.status === "CONNECTED") {
					setPairingCode("");
					setIsConnecting(false);
					toast.success("WhatsApp conectado com sucesso!", { position: "top-right", autoClose: 3000 });
					setTimeout(() => onClose(), 1500);
				}

				// Close only if neither QR nor pairing code is available and not connected
				if (
					!data.session.qrcode &&
					!data.session.pairingCode &&
					data.session.status !== "CONNECTED"
				) {
					onClose();
				}
			}
		});

		socket.on("whatsapp", data => {
			if (data.action === "update" && data.whatsapp && data.whatsapp.id === whatsAppId) {
				setStatus(data.whatsapp.status);
				if (data.whatsapp.status === "CONNECTED") {
					setIsConnecting(false);
					toast.success("WhatsApp conectado com sucesso!", { position: "top-right", autoClose: 3000 });
					setTimeout(() => onClose(), 1500);
				}
			}
		});

		const checkStatus = async () => {
			try {
				const { data } = await api.get(`/whatsapp/${whatsAppId}`);
				if (data.status === "CONNECTED") {
					setStatus("CONNECTED");
					setIsConnecting(false);
					toast.success("WhatsApp conectado com sucesso!", { position: "top-right", autoClose: 3000 });
					setTimeout(() => onClose(), 1500);
				}
			} catch (err) {
				// silent
			}
		};

		const statusInterval = setInterval(checkStatus, 2000);

		return () => {
			socket.disconnect();
			clearInterval(statusInterval);
		};
	}, [whatsAppId, onClose]);

	const formatCountdown = (secs) => {
		const m = Math.floor(secs / 60);
		const s = String(secs % 60).padStart(2, "0");
		return `${m}:${s}`;
	};

	const getStatusMessage = () => {
		if (pairingCode) return "Digite o código no WhatsApp do seu celular";
		switch (status) {
			case "OPENING":  return "Iniciando sessão...";
			case "PAIRING":  return "Conectando...";
			case "CONNECTED": return "Conectado com sucesso!";
			case "qrcode":   return "Escaneie o QR Code com seu WhatsApp";
			default:          return "Aguardando QR Code...";
		}
	};

	const getStatusColor = () => {
		switch (status) {
			case "CONNECTED": return "success.main";
			case "OPENING":
			case "PAIRING":   return "warning.main";
			default:           return "primary.main";
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			scroll="body"
			PaperProps={{
				sx: {
					borderRadius: 3,
					boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
					maxHeight: "90vh",
					margin: 2
				}
			}}
		>
			<DialogTitle
				sx={{
					pb: 1,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
					color: "white"
				}}
			>
				<Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
					Conexão WhatsApp
				</Typography>
				<IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: 2, overflow: "hidden" }}>
				<Box sx={{ textAlign: "center" }}>
					<Box sx={{ mb: 2 }}>
						<Typography
							variant="body1"
							sx={{ color: getStatusColor(), fontWeight: 500, mb: 1 }}
						>
							{getStatusMessage()}
						</Typography>
						{status === "CONNECTED" && (
							<CheckCircle sx={{ color: "success.main", fontSize: 40, mb: 1 }} />
						)}
					</Box>

					<Divider sx={{ mb: 2 }} />

					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							minHeight: 260,
							background: "#f8f9fa",
							borderRadius: 2,
							border: "2px dashed #e0e0e0"
						}}
					>
						{status === "CONNECTED" ? (
							<Box sx={{ textAlign: "center" }}>
								<CheckCircle sx={{ color: "success.main", fontSize: 64, mb: 2 }} />
								<Typography variant="h6" color="success.main">Conectado!</Typography>
							</Box>
						) : pairingCode ? (
							<Box sx={{ textAlign: "center", px: 2 }}>
								<Typography
									variant="h3"
									sx={{
										letterSpacing: 6,
										fontFamily: "monospace",
										fontWeight: 700,
										color: "text.primary",
										mb: 1
									}}
								>
									{pairingCode}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										color: countdown > 30 ? "text.secondary" : "error.main",
										fontWeight: countdown > 30 ? 400 : 600,
										mb: 1
									}}
								>
									{countdown > 0
										? `Expira em ${formatCountdown(countdown)}`
										: "Atualizando código..."}
								</Typography>
							</Box>
						) : qrCode ? (
							<Box sx={{ textAlign: "center" }}>
								<QRCodeSVG
									value={qrCode}
									size={220}
									bgColor="#ffffff"
									fgColor="#000000"
									level="M"
									includeMargin={true}
								/>
								<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
									Abra o WhatsApp no seu celular e escaneie este código
								</Typography>
							</Box>
						) : (
							<Box sx={{ textAlign: "center" }}>
								<CircularProgress size={48} sx={{ mb: 2 }} />
								<Typography variant="body1" color="text.secondary">
									{isConnecting ? "Conectando..." : "Gerando código..."}
								</Typography>
							</Box>
						)}
					</Box>

					{/* QR code instructions */}
					{qrCode && !pairingCode && status !== "CONNECTED" && (
						<Box sx={{ mt: 2, p: 1.5, bgcolor: "#f0f7ff", borderRadius: 2 }}>
							<Typography variant="body2" color="primary" sx={{ fontWeight: 500, mb: 0.5 }}>
								Como conectar:
							</Typography>
							<Typography variant="body2" color="text.secondary" component="div" sx={{ fontSize: "0.8rem" }}>
								1. Abra o WhatsApp no seu celular<br />
								2. Toque em Mais opções (⋮) e Aparelhos conectados<br />
								3. Toque em Conectar um aparelho<br />
								4. Aponte seu celular para esta tela para capturar o código
							</Typography>
						</Box>
					)}

					{/* Pairing code instructions */}
					{pairingCode && status !== "CONNECTED" && (
						<Box sx={{ mt: 2, p: 1.5, bgcolor: "#f0f7ff", borderRadius: 2 }}>
							<Typography variant="body2" color="primary" sx={{ fontWeight: 500, mb: 0.5 }}>
								Como conectar:
							</Typography>
							<Typography variant="body2" color="text.secondary" component="div" sx={{ fontSize: "0.8rem" }}>
								1. Abra o WhatsApp no seu celular<br />
								2. Toque em Mais opções (⋮) e Aparelhos conectados<br />
								3. Toque em Conectar um aparelho<br />
								4. Toque em "Conectar com número de telefone"<br />
								5. Digite o código acima
							</Typography>
						</Box>
					)}
				</Box>
			</DialogContent>
		</Dialog>
	);
};

export default memo(QrcodeModal);
