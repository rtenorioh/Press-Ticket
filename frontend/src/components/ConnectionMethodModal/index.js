import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	InputAdornment,
	TextField,
	Typography,
	Box
} from "@mui/material";
import { Phone, QrCode } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import toastError from "../../errors/toastError";

const STEP_SELECT  = "select";
const STEP_LOADING = "loading";
const STEP_CODE    = "code";

const ConnectionMethodModal = ({ open, onClose, onSelectMethod, whatsAppId }) => {
	const { t } = useTranslation();
	const [step, setStep] = useState(STEP_SELECT);
	const [phoneNumber, setPhoneNumber] = useState("");
	const [phoneError, setPhoneError] = useState("");
	const [pairingCode, setPairingCode] = useState("");
	const [expiresAt, setExpiresAt] = useState(null);
	const [countdown, setCountdown] = useState("05:00");
	const [elapsed, setElapsed] = useState(0);

	// Refs to avoid stale closures inside socket/interval callbacks
	const handleCloseRef = useRef(null);
	const whatsAppIdRef  = useRef(whatsAppId);

	useEffect(() => { whatsAppIdRef.current = whatsAppId; }, [whatsAppId]);

	// Reset when modal closes
	useEffect(() => {
		if (!open) {
			setStep(STEP_SELECT);
			setPhoneNumber("");
			setPhoneError("");
			setPairingCode("");
			setExpiresAt(null);
			setCountdown("05:00");
			setElapsed(0);
		}
	}, [open]);

	// Elapsed timer — counts up only while in loading step
	useEffect(() => {
		if (step !== STEP_LOADING) {
			setElapsed(0);
			return;
		}
		const interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
		return () => clearInterval(interval);
	}, [step]);

	// Countdown tick
	useEffect(() => {
		if (!expiresAt) return;
		const interval = setInterval(() => {
			const remaining = expiresAt - new Date();
			if (remaining <= 0) {
				setCountdown("00:00");
				clearInterval(interval);
				return;
			}
			const mins = Math.floor(remaining / 60000);
			const secs = Math.floor((remaining % 60000) / 1000);
			setCountdown(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
		}, 1000);
		return () => clearInterval(interval);
	}, [expiresAt]);

	// Single socket for the entire modal lifetime — created once when open,
	// destroyed when closed. No re-creation on step changes (avoids missed events).
	useEffect(() => {
		if (!open || !whatsAppId) return;

		const socket = openSocket();

		socket.on("whatsappSession", (data) => {
			const session = data.session;
			if (!session || session.id !== whatsAppIdRef.current) return;

			// Backend failed to generate the pairing code — go back to input step
			if (session.pairingCodeError) {
				setPhoneError(session.pairingCodeError);
				setStep(STEP_SELECT);
				return;
			}

			// New pairing code received
			if (session.pairingCode) {
				setPairingCode(session.pairingCode);
				const exp = session.pairingCodeExpiresAt
					? new Date(session.pairingCodeExpiresAt)
					: new Date(Date.now() + 5 * 60 * 1000);
				setExpiresAt(exp);
				setStep(STEP_CODE);
			}

			// Connected — close modal (only on CONNECTED; session.number can be set
			// from a previous connection before CONNECTED is reached, which would
			// prematurely dismiss the pairing-code screen)
			if (session.status === "CONNECTED") {
				setTimeout(() => handleCloseRef.current?.(), 1500);
			}
		});

		return () => socket.disconnect();
	}, [open, whatsAppId]); // eslint-disable-line react-hooks/exhaustive-deps

	// Polling fallback while showing code — catches the CONNECTED state
	// in case the socket event is missed
	useEffect(() => {
		if (step !== STEP_CODE || !whatsAppId) return;

		const poll = setInterval(async () => {
			try {
				const { data } = await api.get(`/whatsapp/${whatsAppId}`);
				if (data.status === "CONNECTED") {
					clearInterval(poll);
					setTimeout(() => handleCloseRef.current?.(), 500);
				}
			} catch {
				// silent
			}
		}, 3000);

		return () => clearInterval(poll);
	}, [step, whatsAppId]);

	// ── Helpers ───────────────────────────────────────────────────────────────

	const handlePhoneChange = (event) => {
		const value = event.target.value.replace(/\D/g, "");
		setPhoneNumber(value);
		setPhoneError("");
	};

	const validatePhoneNumber = (phone) => {
		if (!phone) return "Número de telefone é obrigatório";
		if (phone.length < 10) return "Número muito curto";
		if (phone.length > 15) return "Número muito longo";
		if (phone.length === 11 && !phone.startsWith("55"))
			return "Para números brasileiros, use o formato: 5511999999999";
		return "";
	};

	const formatPhoneDisplay = (phone) => {
		if (phone.length === 11)
			return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
		if (phone.length === 13 && phone.startsWith("55"))
			return `+55 (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
		return phone;
	};

	const handleClose = () => {
		setPhoneNumber("");
		setPhoneError("");
		setStep(STEP_SELECT);
		setPairingCode("");
		setExpiresAt(null);
		onClose();
	};

	// Keep ref up-to-date so socket/poll callbacks always call the latest version
	handleCloseRef.current = handleClose;

	const handlePairingCodeSubmit = async () => {
		const error = validatePhoneNumber(phoneNumber);
		if (error) {
			setPhoneError(error);
			return;
		}

		let formattedNumber = phoneNumber;
		if (phoneNumber.length === 11 && !phoneNumber.startsWith("55")) {
			formattedNumber = "55" + phoneNumber;
		}

		setStep(STEP_LOADING);

		try {
			await api.post(`/whatsapp/${whatsAppId}/request-pairing-code`, {
				phoneNumber: formattedNumber
			});
			// Stay open — code arrives via socket
		} catch (err) {
			toastError(err);
			setStep(STEP_SELECT);
		}
	};

	const handleQRCodeSelect = () => {
		onSelectMethod("qrcode");
		handleClose();
	};

	// ── Render steps ──────────────────────────────────────────────────────────

	const renderSelect = () => (
		<>
			<DialogTitle sx={{ textAlign: "center", pb: 1 }}>
				<Typography variant="h6" component="div" fontWeight={600}>
					Escolha o Método de Conexão
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
					Selecione como deseja conectar seu WhatsApp
				</Typography>
			</DialogTitle>

			<DialogContent sx={{ px: 3, py: 2 }}>
				<Box sx={{ mb: 3 }}>
					<Button
						variant="outlined"
						fullWidth
						size="large"
						startIcon={<QrCode />}
						onClick={handleQRCodeSelect}
						sx={{
							py: 2,
							borderRadius: 2,
							textTransform: "none",
							fontSize: "1rem",
							fontWeight: 500,
							borderColor: "primary.main",
							"&:hover": { backgroundColor: "primary.light", color: "white" }
						}}
					>
						<Box sx={{ textAlign: "left", flex: 1 }}>
							<Typography variant="subtitle1" fontWeight={600}>QR Code</Typography>
							<Typography variant="body2" color="text.secondary">
								Escaneie o código QR com seu celular
							</Typography>
						</Box>
					</Button>
				</Box>

				<Divider sx={{ my: 2 }}>
					<Typography variant="body2" color="text.secondary">OU</Typography>
				</Divider>

				<Box>
					<Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
						<Phone sx={{ mr: 1, verticalAlign: "middle" }} />
						Código de Pareamento
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						Informe seu número de telefone para receber um código de pareamento
					</Typography>

					<TextField
						fullWidth
						label="Número de Telefone"
						placeholder="5511999999999"
						value={phoneNumber}
						onChange={handlePhoneChange}
						error={!!phoneError}
						helperText={phoneError || "Formato: código do país + DDD + número (ex: 5511999999999)"}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Phone color="action" />
								</InputAdornment>
							)
						}}
						sx={{ mb: 2 }}
					/>

					{phoneNumber && !phoneError && (
						<Box sx={{ p: 2, backgroundColor: "grey.50", borderRadius: 1, mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Número formatado: <strong>{formatPhoneDisplay(phoneNumber)}</strong>
							</Typography>
						</Box>
					)}

					<Button
						variant="contained"
						fullWidth
						size="large"
						onClick={handlePairingCodeSubmit}
						disabled={!phoneNumber || !!phoneError}
						sx={{ py: 1.5, borderRadius: 2, textTransform: "none", fontSize: "1rem", fontWeight: 500 }}
					>
						Gerar Código de Pareamento
					</Button>
				</Box>
			</DialogContent>

			<DialogActions sx={{ px: 3, pb: 3 }}>
				<Button onClick={handleClose} color="inherit" sx={{ textTransform: "none" }}>
					Cancelar
				</Button>
			</DialogActions>
		</>
	);

	const LOADING_STEPS = [
		{ time: 0,  text: "Iniciando conexão com o WhatsApp..." },
		{ time: 8,  text: "Configurando sessão..." },
		{ time: 20, text: "Aguardando resposta do WhatsApp..." },
		{ time: 35, text: "Gerando código de pareamento..." },
		{ time: 50, text: "Quase lá, aguarde mais um momento..." },
	];

	const currentLoadingStep = [...LOADING_STEPS].reverse().find(s => elapsed >= s.time) || LOADING_STEPS[0];

	const renderLoading = () => (
		<>
			<DialogTitle sx={{ textAlign: "center", pb: 1 }}>
				<Typography variant="h6" fontWeight={600}>Código de Pareamento</Typography>
			</DialogTitle>
			<DialogContent sx={{ px: 3, py: 4 }}>
				<Box sx={{ textAlign: "center", py: 3 }}>
					<CircularProgress size={56} sx={{ mb: 3 }} />
					<Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>
						{currentLoadingStep.text}
					</Typography>
					<Typography variant="body2" color="text.disabled" sx={{ fontFamily: "monospace" }}>
						{elapsed}s
					</Typography>
				</Box>
			</DialogContent>
		</>
	);

	const renderCode = () => (
		<>
			<DialogTitle sx={{ textAlign: "center", pb: 1 }}>
				<Typography variant="h6" fontWeight={600}>Código de Pareamento</Typography>
			</DialogTitle>
			<DialogContent sx={{ px: 3, py: 2 }}>
				<Box sx={{ textAlign: "center", py: 2 }}>
					<Typography
						variant="h3"
						sx={{
							letterSpacing: 6,
							fontFamily: "monospace",
							fontWeight: 700,
							color: "primary.main",
							mb: 1
						}}
					>
						{pairingCode}
					</Typography>
					<Typography
						variant="body2"
						sx={{
							color: countdown === "00:00" ? "error.main" : "text.secondary",
							fontWeight: countdown === "00:00" ? 600 : 400,
							mb: 3
						}}
					>
						{countdown === "00:00"
							? "Aguardando novo código..."
							: `Expira em: ${countdown}`}
					</Typography>

					<Divider sx={{ mb: 3 }} />

					<Box sx={{ p: 2, bgcolor: "#f0f7ff", borderRadius: 2, textAlign: "left" }}>
						<Typography variant="body2" color="primary" fontWeight={600} gutterBottom>
							Como conectar:
						</Typography>
						<Typography variant="body2" color="text.secondary" component="div" sx={{ fontSize: "0.85rem", lineHeight: 2 }}>
							1. Abra o WhatsApp no seu celular<br />
							2. Toque em Mais opções (⋮) → Aparelhos conectados<br />
							3. Toque em "Conectar um aparelho"<br />
							4. Toque em "Conectar com número de telefone"<br />
							5. Digite o código acima
						</Typography>
					</Box>

					<Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 1, color: "text.secondary" }}>
						<CircularProgress size={14} thickness={5} />
						<Typography variant="caption">Aguardando conexão...</Typography>
					</Box>
				</Box>
			</DialogContent>
		</>
	);

	return (
		<Dialog
			open={open}
			onClose={step === STEP_SELECT ? handleClose : undefined}
			maxWidth="sm"
			fullWidth
			PaperProps={{ sx: { borderRadius: 2, minHeight: 400 } }}
		>
			{step === STEP_SELECT  && renderSelect()}
			{step === STEP_LOADING && renderLoading()}
			{step === STEP_CODE    && renderCode()}
		</Dialog>
	);
};

export default ConnectionMethodModal;
