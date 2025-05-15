import { Menu, MenuItem, ListItemIcon, ListItemText, styled } from "@mui/material";
import { SwapHoriz, Delete } from "@mui/icons-material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { Can } from "../Can";
import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModal from "../TransferTicketModal";

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
	padding: theme.spacing(1, 2),
	"&:hover": {
		backgroundColor: theme.palette.grey[100],
	},
}));

const MenuItemIcon = styled(ListItemIcon)(({ theme }) => ({
	minWidth: "40px",
	color: theme.palette.primary.main,
}));

const TicketOptionsMenu = ({ ticket, menuOpen, handleClose, anchorEl }) => {
	const { t } = useTranslation();
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const handleDeleteTicket = async () => {
		try {
			await api.delete(`/tickets/${ticket.id}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleOpenConfirmationModal = e => {
		setConfirmationOpen(true);
		handleClose();
	};

	const handleOpenTransferModal = e => {
		setTransferTicketModalOpen(true);
		handleClose();
	};

	const handleCloseTransferTicketModal = () => {
		if (isMounted.current) {
			setTransferTicketModalOpen(false);
		}
	};

	return (
		<>
			<Menu
				id="menu-appbar"
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				keepMounted
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				open={menuOpen}
				onClose={handleClose}
			>
				<StyledMenuItem onClick={handleOpenTransferModal}>
					<MenuItemIcon>
						<SwapHoriz />
					</MenuItemIcon>
					<ListItemText primary={t("ticketOptionsMenu.transfer")} />
				</StyledMenuItem>
				<Can
					role={user.profile}
					perform="ticket-options:deleteTicket"
					yes={() => (
						<StyledMenuItem onClick={handleOpenConfirmationModal}>
							<MenuItemIcon>
								<Delete />
							</MenuItemIcon>
							<ListItemText primary={t("ticketOptionsMenu.delete")} />
						</StyledMenuItem>
					)}
				/>
			</Menu>
			<ConfirmationModal
				title={`${t("ticketOptionsMenu.confirmationModal.title")}${ticket.id
					} ${t("ticketOptionsMenu.confirmationModal.titleFrom")} ${ticket.contact.name
					}?`}
				open={confirmationOpen}
				onClose={setConfirmationOpen}
				onConfirm={handleDeleteTicket}
			>
				{t("ticketOptionsMenu.confirmationModal.message")}
			</ConfirmationModal>
			<TransferTicketModal
				modalOpen={transferTicketModalOpen}
				onClose={handleCloseTransferTicketModal}
				ticketid={ticket.id}
			/>
		</>
	);
};

export default TicketOptionsMenu;
