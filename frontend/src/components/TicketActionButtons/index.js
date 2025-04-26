import { IconButton, styled } from "@mui/material";
import { MoreVert, Replay } from "@mui/icons-material";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { Can } from "../Can";
import TicketOptionsMenu from "../TicketOptionsMenu";
import ConfirmationModal from "../ConfirmationModal";

const ActionButtonsContainer = styled('div')(({ theme }) => ({
	marginRight: 6,
	flex: "none",
	alignSelf: "center",
	marginLeft: "auto",
	"& > *": {
		margin: theme.spacing(1),
	},
}));

const TicketActionButtons = ({ ticket }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState(null);
	const [loading, setLoading] = useState(false);
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const ticketOptionsMenuOpen = Boolean(anchorEl);
	const { user } = useContext(AuthContext);

	const handleOpenTicketOptionsMenu = e => {
		setAnchorEl(e.currentTarget);
	};

	const handleCloseTicketOptionsMenu = e => {
		setAnchorEl(null);
	};

	const handleUpdateTicketStatus = async (e, status, userId) => {
		setLoading(true);
		try {
			if (status === "closed") {
				await api.put(`/tickets/${ticket.id}`, {
					status: status,
					userId: userId || null,
					queueId: null,
				});
			} else {
				await api.put(`/tickets/${ticket.id}`, {
					status: status,
					userId: userId || null,
				});
			}
			setLoading(false);
			if (status === "open") {
				navigate(`/tickets/${ticket.id}`);
			} else {
				navigate("/tickets");
			}
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	};

	const handleCloseTicket = () => {
		setConfirmationOpen(true);
	};

	const handleConfirmClose = () => {
		handleUpdateTicketStatus(null, "closed", user?.id);
	};

	return (
		<ActionButtonsContainer>
			{ticket.status === "closed" && (
				<ButtonWithSpinner
					loading={loading}
					startIcon={<Replay />}
					size="small"
					onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
				>
					{t("messagesList.header.buttons.reopen")}
				</ButtonWithSpinner>
			)}
			{ticket.status === "open" && (
				<>
					<ButtonWithSpinner
						loading={loading}
						startIcon={<Replay />}
						size="small"
						onClick={e => handleUpdateTicketStatus(e, "pending", null)}
					>
						{t("messagesList.header.buttons.return")}
					</ButtonWithSpinner>
					<ButtonWithSpinner
						loading={loading}
						size="small"
						variant="contained"
						color="primary"
						onClick={handleCloseTicket}
					>
						{t("messagesList.header.buttons.resolve")}
					</ButtonWithSpinner>
					<ConfirmationModal
						title={t("tickets.confirmationModal.closeTicket.title")}
						open={confirmationOpen}
						onClose={() => setConfirmationOpen(false)}
						onConfirm={handleConfirmClose}
					>
						{t("tickets.confirmationModal.closeTicket.message")}
					</ConfirmationModal>
					<IconButton
						color="primary"
						onClick={handleOpenTicketOptionsMenu}>
						<MoreVert />
					</IconButton>
					<TicketOptionsMenu
						ticket={ticket}
						anchorEl={anchorEl}
						menuOpen={ticketOptionsMenuOpen}
						handleClose={handleCloseTicketOptionsMenu}
					/>
				</>
			)}
			<Can
				role={user.profile}
				perform="drawer-admin-items:view"
				yes={() => (
					<>
						{ticket.status === "pending" && (
							<ButtonWithSpinner
								loading={loading}
								size="small"
								variant="contained"
								color="primary"
								onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
							>
								{t("messagesList.header.buttons.accept")}
							</ButtonWithSpinner>
						)}
					</>
				)}
			/>
		</ActionButtonsContainer>
	);
};

export default TicketActionButtons;
