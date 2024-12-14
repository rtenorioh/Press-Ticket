import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	makeStyles,
	MenuItem,
	Select,
} from "@material-ui/core";
import PropTypes from "prop-types";
import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";

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

const INITIAL_QUEUE_VALUE = "";

const AcceptTicketWithouSelectQueue = ({ modalOpen, onClose, ticketId }) => {
	const history = useHistory();
	const classes = useStyles();
	const [selectedQueue, setSelectedQueue] = useState(INITIAL_QUEUE_VALUE);
	const [loading, setLoading] = useState(false);
	const { user } = useContext(AuthContext);
	const { t } = useTranslation();
	const userId = user?.id;

	const handleClose = useCallback(() => {
		onClose();
		setSelectedQueue(INITIAL_QUEUE_VALUE);
	}, [onClose]);

	const handleUpdateTicketStatus = useCallback(async (queueId) => {
		setLoading(true);
		try {
			await api.put(`/tickets/${ticketId}`, {
				status: "open",
				userId: userId || null,
				queueId,
			});

			setLoading(false);
			history.push(`/tickets/${ticketId}`);
			handleClose();
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	}, [ticketId, userId, history, handleClose]);

	return (
		<Dialog
			open={modalOpen}
			onClose={handleClose}
			aria-labelledby="accept-ticket-dialog-title"
			aria-describedby="accept-ticket-dialog-description"
		>
			<DialogTitle id="accept-ticket-dialog-title">
				{t("ticketsList.acceptModal.title")}
			</DialogTitle>
			<DialogContent dividers>
				<FormControl variant="outlined" className={classes.maxWidth}>
					<InputLabel>{t("ticketsList.acceptModal.queue")}</InputLabel>
					<Select
						value={selectedQueue}
						className={classes.autoComplete}
						onChange={(e) => setSelectedQueue(e.target.value)}
						label={t("ticketsList.acceptModal.queue")}
					>
						<MenuItem value={''}>&nbsp;</MenuItem>
						{user.queues.map((queue) => (
							<MenuItem key={queue.id} value={queue.id}>{queue.name}</MenuItem>
						))}
					</Select>
				</FormControl>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={handleClose}
					className={classes.buttonColorError}
					disabled={loading}
					variant="outlined"
				>
					{t("ticketsList.buttons.cancel")}
				</Button>
				<ButtonWithSpinner
					variant="contained"
					type="button"
					disabled={selectedQueue === ""}
					onClick={() => handleUpdateTicketStatus(selectedQueue)}
					color="primary"
					loading={loading}
				>
					{t("ticketsList.buttons.start")}
				</ButtonWithSpinner>
			</DialogActions>
		</Dialog>
	);
};


AcceptTicketWithouSelectQueue.propTypes = {
	modalOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	ticketId: PropTypes.number.isRequired,
};

export default AcceptTicketWithouSelectQueue;
