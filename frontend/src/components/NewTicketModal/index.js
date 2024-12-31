import {
	FormControl,
	InputLabel,
	makeStyles,
	MenuItem,
	Select
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Autocomplete, {
	createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ContactModal from "../ContactModal";

const useStyles = makeStyles((theme) => ({
	autoComplete: {
		width: 300,
	},
	maxWidth: {
		width: "100%",
	},
	buttonColorError: {
		color: theme.palette.error.main,
		borderColor: theme.palette.error.main,
	},
}));

const filter = createFilterOptions({
	trim: true,
});

const NewTicketModal = ({ modalOpen, onClose }) => {
	const history = useHistory();
	const { t } = useTranslation();
	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [selectedContact, setSelectedContact] = useState(null);
	const [newContact, setNewContact] = useState({});
	const [contactModalOpen, setContactModalOpen] = useState(false);
	const { user } = useContext(AuthContext);
	const [selectedQueue, setSelectedQueue] = useState("");
	const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
	const [settings, setSettings] = useState([]);
	const classes = useStyles();

	console.log("USER: ", user)

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

	const getSettingValue = (key) => {
		const setting = settings.find((s) => s.key === key);
		return setting?.value || null;
	};

	useEffect(() => {
		if (!modalOpen || searchParam.length < 3) {
			setLoading(false);
			return;
		}
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				try {
					const { data } = await api.get("contacts", {
						params: { searchParam },
					});
					setOptions(data.contacts);
					setLoading(false);
				} catch (err) {
					setLoading(false);
					toastError(err);
				}
			};

			fetchContacts();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, modalOpen]);

	const handleClose = () => {
		onClose();
		setSearchParam("");
		setSelectedContact(null);
	};

	const checkOpenTickets = useCallback(async (contactId) => {
		try {
			const response = await api.get(`/tickets/contact/${contactId}/open`);

			if (response?.data?.hasOpenTicket) {
				return response.data.ticket;
			}

			return null;
		} catch (err) {
			console.error("Erro ao verificar tickets abertos:", err);
			toastError(err);
			return null;
		}
	}, []);

	const handleSaveTicket = async (contactId) => {
		if (!contactId) return;

		setLoading(true);

		try {
			const openTicketsSetting = getSettingValue("openTickets");

			if (openTicketsSetting !== "disabled") {
				const openTicket = await checkOpenTickets(contactId);

				if (openTicket) {
					const assignedUserName = openTicket.user?.name || "Atendente desconhecido";

					setLoading(false);
					toastError({
						message: t("ticketsList.errors.ticketAlreadyOpen", {
							atendente: assignedUserName,
						}),
					});
					return;
				}
			}

			const { data: ticket } = await api.post("/tickets", {
				contactId: contactId,
				userId: user.id,
				status: "open",
				queueId: selectedQueue,
				whatsappId: selectedWhatsapp
			});
			history.push(`/tickets/${ticket.id}`);
		} catch (err) {
			toastError(err);
		}
		setLoading(false);
		handleClose();
	};

	const handleSelectOption = (e, newValue) => {
		if (newValue?.number) {
			setSelectedContact(newValue);
		} else if (newValue?.name) {
			setNewContact({ name: newValue.name });
			setContactModalOpen(true);
		}
	};

	const handleCloseContactModal = () => {
		setContactModalOpen(false);
	};

	const handleAddNewContactTicket = (contact) => {
		handleSaveTicket(contact.id);
	};

	const createAddContactOption = (filterOptions, params) => {
		const filtered = filter(filterOptions, params);

		if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
			filtered.push({
				name: `${params.inputValue}`,
			});
		}

		return filtered;
	};

	const renderOption = (option) => {
		if (option.number) {
			return `${option.name} - ${option.number}`;
		} else {
			return `${t("newTicketModal.add")} ${option.name}`;
		}
	};

	const renderOptionLabel = (option) => {
		if (option.number) {
			return `${option.name} - ${option.number}`;
		} else {
			return `${option.name}`;
		}
	};

	return (
		<>
			<ContactModal
				open={contactModalOpen}
				initialValues={newContact}
				onClose={handleCloseContactModal}
				onSave={handleAddNewContactTicket}
			></ContactModal>
			<Dialog open={modalOpen} onClose={handleClose}>
				<DialogTitle id="form-dialog-title">
					{t("newTicketModal.title")}
				</DialogTitle>
				<DialogContent dividers>
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<Autocomplete
								options={options}
								loading={loading}
								fullWidth
								clearOnBlur
								autoHighlight
								freeSolo
								clearOnEscape
								getOptionLabel={renderOptionLabel}
								renderOption={renderOption}
								filterOptions={createAddContactOption}
								onChange={(e, newValue) => handleSelectOption(e, newValue)}
								renderInput={(params) => (
									<TextField
										{...params}
										label={t("newTicketModal.fieldLabel")}
										variant="outlined"
										required
										onChange={(e) => setSearchParam(e.target.value)}
										onKeyDown={(e) => {
											if (loading || !selectedContact) return;
											else if (e.key === "Enter") {
												handleSaveTicket(selectedContact.id);
											}
										}}
										InputProps={{
											...params.InputProps,
											endAdornment: (
												<>
													{loading ? (
														<CircularProgress color="inherit" size={20} />
													) : null}
													{params.InputProps.endAdornment}
												</>
											),
										}}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12}>
							<FormControl variant="outlined" fullWidth>
								<InputLabel>{t("newTicketModal.select.channel")}</InputLabel>
								<Select
									value={selectedWhatsapp}
									onChange={(e) => setSelectedWhatsapp(e.target.value)}
									label={t("newTicketModal.select.channel")}
								>
									<MenuItem value="">
										{t("newTicketModal.select.none")}
									</MenuItem>
									{Array.isArray(user.whatsapps) &&
										user.whatsapps.map((whatsapp) => (
											<MenuItem key={whatsapp.id} value={whatsapp.id}>
												{whatsapp.name}
											</MenuItem>
										))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<FormControl variant="outlined" fullWidth>
								<InputLabel>{t("newTicketModal.select.queue")}</InputLabel>
								<Select
									value={selectedQueue}
									onChange={(e) => setSelectedQueue(e.target.value)}
									label={t("newTicketModal.select.queue")}
								>
									<MenuItem value="">
										{t("newTicketModal.select.none")}
									</MenuItem>
									{user.queues.map((queue) => (
										<MenuItem key={queue.id} value={queue.id}>
											{queue.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						disabled={loading}
						variant="outlined"
					>
						{t("newTicketModal.buttons.cancel")}
					</Button>
					<ButtonWithSpinner
						variant="contained"
						type="button"
						disabled={!selectedContact || !selectedQueue}
						onClick={() => handleSaveTicket(selectedContact.id)}
						color="primary"
						loading={loading}
					>
						{t("newTicketModal.buttons.ok")}
					</ButtonWithSpinner>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default NewTicketModal;
