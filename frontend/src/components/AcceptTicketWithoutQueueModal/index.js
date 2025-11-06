import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	MenuItem,
	Select,
	Divider,
	Stack,
	Typography
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const StyledDialog = styled(Dialog)(({ theme }) => ({
	'& .MuiDialogTitle-root': {
		backgroundColor: theme.palette.primary.main,
		color: '#fff',
		'& .MuiTypography-root': {
			fontWeight: 500,
		},
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

const INITIAL_QUEUE_VALUE = "";

const AcceptTicketWithouSelectQueue = ({ modalOpen, onClose, ticketId, onSuccess }) => {
	const navigate = useNavigate();
	const [selectedQueue, setSelectedQueue] = useState(INITIAL_QUEUE_VALUE);
	const [loading, setLoading] = useState(false);
	const { user } = useContext(AuthContext);
	const { t } = useTranslation();
	const theme = useTheme();
	const userId = user?.id;
	const [settings, setSettings] = useState([]);

	useEffect(() => {
		const fetchSettings = async () => {
			try {
				const { data } = await api.get("/settings");
				setSettings(data);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSettings();
	}, []);

	const handleClose = useCallback(() => {
		onClose();
		setSelectedQueue(INITIAL_QUEUE_VALUE);
	}, [onClose]);

	const checkOpenTickets = useCallback(async (contactId) => {
		try {
			const response = await api.get(`/tickets/contact/${contactId}/open`);

			if (response?.data?.hasOpenTicket) {
				return response.data.ticket;
			}

			return null;
		} catch (err) {
			console.error("Erro ao verificar tickets abertos:", err);
			toastError(err, t);
			return null;
		}
	}, [t]);

	const handleUpdateTicketStatus = useCallback(async (queueId) => {
		setLoading(true);

		try {
			const getSettingValue = (key) => {
				const setting = settings.find((s) => s.key === key);
				return setting?.value || null;
			};

			const openTicketsSetting = getSettingValue("openTickets");

			if (openTicketsSetting === "disabled") {
				const { data: ticketData } = await api.get(`/tickets/${ticketId}`);
				
				await api.put(`/tickets/${ticketId}`, {
					status: "open",
					userId: userId || null,
					queueId,
				});
				
				const isGroup = ticketData?.contact?.isGroup;
				localStorage.setItem("pressticket:changeTab", isGroup ? "groups" : "open");
				
				setLoading(false);
				if (onSuccess) {
					onSuccess();
				}
				navigate(`/tickets/${ticketId}`);
				handleClose();
				return;
			}

			const { data: ticketData } = await api.get(`/tickets/${ticketId}`);
			const contactId = ticketData.contact.id;

			const openTicket = await checkOpenTickets(contactId);
			if (openTicket) {
				const assignedUserName = openTicket.user?.name || "Atendente desconhecido";
				const assignedUserChannel = openTicket.whatsapp?.name || "Canal desconhecido";
				const ticketCreatedAt = openTicket.createdAt ? new Date(openTicket.createdAt).toLocaleDateString('pt-BR') : "Data desconhecida";

				setLoading(false);
				toastError({
					message: t("ticketsList.errors.ticketAlreadyOpen", {
						userName: assignedUserName,
						userChannel: assignedUserChannel,
						ticketCreatedAt: ticketCreatedAt,
					}),
				});
				return;
			}

			await api.put(`/tickets/${ticketId}`, {
				status: "open",
				userId: userId || null,
				queueId,
			});

			const isGroup = ticketData?.contact?.isGroup;
			localStorage.setItem("pressticket:changeTab", isGroup ? "groups" : "open");

			setLoading(false);
			if (onSuccess) {
				onSuccess();
			}
			navigate(`/tickets/${ticketId}`);
			handleClose();
		} catch (err) {
			setLoading(false);
			toastError(err, t);
		}
	}, [ticketId, userId, navigate, handleClose, checkOpenTickets, t, settings, onSuccess]);

	return (
		<StyledDialog
			open={modalOpen}
			onClose={handleClose}
			aria-labelledby="accept-ticket-dialog-title"
			aria-describedby="accept-ticket-dialog-description"
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 2,
					boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
				}
			}}
		>
			<DialogTitle id="accept-ticket-dialog-title">
				<Stack direction="row" alignItems="center">
					{t("ticketsList.acceptModal.title")}
				</Stack>
			</DialogTitle>
			<DialogContent>
				<FormControl variant="outlined" sx={{ width: "100%", mt: 2 }}>
					<Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
						{t("ticketsList.acceptModal.queue")}
					</Typography>
					<Select
						value={selectedQueue}
						sx={{ width: "100%" }}
						onChange={(e) => setSelectedQueue(e.target.value)}
						variant="outlined"
						displayEmpty
					>
						<MenuItem value={''}>
							<em>{t("ticketsList.acceptModal.selectQueue")}</em>
						</MenuItem>
						{user?.queues?.map((queue) => (
							<MenuItem key={queue.id} value={queue.id}>{queue.name}</MenuItem>
						))}
					</Select>
				</FormControl>
			</DialogContent>
			<Divider />
			<DialogActions sx={{ padding: 2, gap: 1, display: 'flex', justifyContent: 'flex-end' }}>
				<Button
					onClick={handleClose}
					disabled={loading}
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
					{t("ticketsList.buttons.cancel")}
				</Button>
				<Button
					variant="contained"
					type="button"
					disabled={selectedQueue === ""}
					onClick={() => handleUpdateTicketStatus(selectedQueue)}
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
					{loading ? (
						<CircularProgress size={24} color="inherit" sx={{ position: 'absolute' }} />
					) : t("ticketsList.buttons.start")}
				</Button>
			</DialogActions>
		</StyledDialog>
	);
};


AcceptTicketWithouSelectQueue.propTypes = {
	modalOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	ticketId: PropTypes.number.isRequired,
	onSuccess: PropTypes.func,
};

export default AcceptTicketWithouSelectQueue;
