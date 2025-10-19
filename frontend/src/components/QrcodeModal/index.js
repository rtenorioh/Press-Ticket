import { 
	Dialog, 
	DialogContent, 
	DialogTitle,
	Paper, 
	Typography, 
	Box,
	CircularProgress,
	IconButton,
	Divider
} from "@mui/material";
import { Close as CloseIcon, CheckCircle } from "@mui/icons-material";
import { QRCodeSVG } from "qrcode.react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
	const [qrCode, setQrCode] = useState("");
	const [status, setStatus] = useState("");
	const [isConnecting, setIsConnecting] = useState(false);
	const { t } = useTranslation();

	useEffect(() => {
		if (open) {
			setQrCode("");
			setStatus("");
			setIsConnecting(false);
		}
	}, [open]);

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;

			try {
				const { data } = await api.get(`/whatsapp/${whatsAppId}`);
				setQrCode(data.qrcode);
				setStatus(data.status);
				
				if (data.status === "CONNECTED") {
					toast.success("Canal conectado com sucesso!", {
						position: "top-right",
						autoClose: 2000
					});
					setTimeout(() => {
						onClose();
					}, 500);
				}
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, [whatsAppId, onClose]);

	useEffect(() => {
		if (!whatsAppId) return;
		const socket = openSocket();

		socket.on("whatsappSession", data => {
			if (data.action === "update" && data.session.id === whatsAppId) {
				setQrCode(data.session.qrcode);
				setStatus(data.session.status);
				
				if (data.session.status === "OPENING" || data.session.status === "PAIRING") {
					setIsConnecting(true);
				}
				
				if (data.session.status === "CONNECTED") {
					setIsConnecting(false);
					toast.success("WhatsApp conectado com sucesso!", {
						position: "top-right",
						autoClose: 3000
					});
					
					setTimeout(() => {
						onClose();
					}, 1500);
				}
				
				if (data.session.qrcode === "" && data.session.status !== "CONNECTED") {
					onClose();
				}
			}
		});

		socket.on("whatsapp", data => {
			if (data.action === "update" && data.whatsapp && data.whatsapp.id === whatsAppId) {
				setStatus(data.whatsapp.status);
				
				if (data.whatsapp.status === "CONNECTED") {
					setIsConnecting(false);
					toast.success("WhatsApp conectado com sucesso!", {
						position: "top-right",
						autoClose: 3000
					});
					
					setTimeout(() => {
						onClose();
					}, 1500);
				}
			}
		});

		const checkStatus = async () => {
			try {
				const { data } = await api.get(`/whatsapp/${whatsAppId}`);
				if (data.status === "CONNECTED") {
					setStatus("CONNECTED");
					setIsConnecting(false);
					toast.success("WhatsApp conectado com sucesso!", {
						position: "top-right",
						autoClose: 3000
					});
					setTimeout(() => {
						onClose();
					}, 1500);
				}
			} catch (err) {
			}
		};

		const statusInterval = setInterval(checkStatus, 2000);

		return () => {
			socket.disconnect();
			clearInterval(statusInterval);
		};
	}, [whatsAppId, onClose]);

	const getStatusMessage = () => {
		switch (status) {
			case "OPENING":
				return "Iniciando sessão...";
			case "PAIRING":
				return "Conectando...";
			case "CONNECTED":
				return "Conectado com sucesso!";
			case "qrcode":
				return "Escaneie o QR Code com seu WhatsApp";
			default:
				return "Aguardando QR Code...";
		}
	};

	const getStatusColor = () => {
		switch (status) {
			case "CONNECTED":
				return "success.main";
			case "OPENING":
			case "PAIRING":
				return "warning.main";
			default:
				return "primary.main";
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
					boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
					maxHeight: '90vh',
					margin: 2
				}
			}}
		>
			<DialogTitle 
				sx={{ 
					pb: 1, 
					display: 'flex', 
					justifyContent: 'space-between', 
					alignItems: 'center',
					background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
					color: 'white'
				}}
			>
				<Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
					Conexão WhatsApp
				</Typography>
				<IconButton 
					onClick={onClose} 
					size="small" 
					sx={{ color: 'white' }}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			
			<DialogContent sx={{ p: 2, overflow: 'hidden' }}>
				<Box sx={{ textAlign: 'center' }}>
					<Box sx={{ mb: 2 }}>
						<Typography 
							variant="body1" 
							sx={{ 
								color: getStatusColor(),
								fontWeight: 500,
								mb: 1
							}}
						>
							{getStatusMessage()}
						</Typography>
						
						{status === "CONNECTED" && (
							<CheckCircle sx={{ color: 'success.main', fontSize: 40, mb: 1 }} />
						)}
					</Box>

					<Divider sx={{ mb: 2 }} />

					<Box 
						sx={{ 
							display: 'flex', 
							justifyContent: 'center', 
							alignItems: 'center',
							minHeight: 260,
							background: '#f8f9fa',
							borderRadius: 2,
							border: '2px dashed #e0e0e0'
						}}
					>
						{status === "CONNECTED" ? (
							<Box sx={{ textAlign: 'center' }}>
								<CheckCircle sx={{ color: 'success.main', fontSize: 64, mb: 2 }} />
								<Typography variant="h6" color="success.main">
									Conectado!
								</Typography>
							</Box>
						) : qrCode ? (
							<Box sx={{ textAlign: 'center' }}>
								<QRCodeSVG 
									value={qrCode} 
									size={220}
									bgColor="#ffffff"
									fgColor="#000000"
									level="M"
									includeMargin={true}
								/>
								<Typography 
									variant="body2" 
									color="text.secondary" 
									sx={{ mt: 1 }}
								>
									Abra o WhatsApp no seu celular e escaneie este código
								</Typography>
							</Box>
						) : (
							<Box sx={{ textAlign: 'center' }}>
								<CircularProgress size={48} sx={{ mb: 2 }} />
								<Typography variant="body1" color="text.secondary">
									{isConnecting ? "Conectando..." : "Gerando QR Code..."}
								</Typography>
							</Box>
						)}
					</Box>

					{qrCode && status !== "CONNECTED" && (
						<Box sx={{ mt: 2, p: 1.5, bgcolor: '#f0f7ff', borderRadius: 2 }}>
							<Typography variant="body2" color="primary" sx={{ fontWeight: 500, mb: 0.5 }}>
								Como conectar:
							</Typography>
							<Typography variant="body2" color="text.secondary" component="div" sx={{ fontSize: '0.8rem' }}>
								1. Abra o WhatsApp no seu celular<br/>
								2. Toque em Mais opções (⋮) e Aparelhos conectados<br/>
								3. Toque em Conectar um aparelho<br/>
								4. Aponte seu celular para esta tela para capturar o código
							</Typography>
						</Box>
					)}
				</Box>
			</DialogContent>
		</Dialog>
	);
};

export default React.memo(QrcodeModal);
