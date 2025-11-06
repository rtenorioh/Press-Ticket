import { IconButton, styled, Box, Tooltip } from "@mui/material";
import { MoreVert, Replay, CheckCircle, ClearOutlined } from "@mui/icons-material";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { Can } from "../Can";
import TicketOptionsMenu from "../TicketOptionsMenu";
import ConfirmationModal from "../ConfirmationModal";
import AcceptTicketWithouSelectQueue from "../AcceptTicketWithoutQueueModal";

const ActionButtonsContainer = styled(Box)(({ theme }) => ({
	marginRight: theme.spacing(1),
	flex: "none",
	alignSelf: "center",
	marginLeft: "auto",
	display: "flex",
	alignItems: "center",
	flexWrap: "nowrap",
	"& > *": {
		margin: theme.spacing(0.5),
	},
	[theme.breakpoints.down("sm")]: {
		marginRight: theme.spacing(0.5),
		marginLeft: 0,
		justifyContent: "flex-end",
		width: "100%",
		"& > *": {
			margin: theme.spacing(0.3),
		},
	},
}));

const ActionIconButton = styled(IconButton)(({ theme, color }) => ({
	borderRadius: "50%",
	padding: theme.spacing(1),
	backgroundColor: color === "primary" ? theme.palette.primary.main : "transparent",
	color: color === "primary" ? theme.palette.primary.contrastText : theme.palette.primary.main,
	boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
	transition: "all 0.2s ease",
	"&:hover": {
		backgroundColor: color === "primary" 
			? theme.palette.primary.dark 
			: theme.palette.mode === "dark" ? theme.palette.action.hover : theme.palette.grey[200],
		boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
	},
	[theme.breakpoints.down("sm")]: {
		padding: theme.spacing(0.7),
	},
}));

const LoadingIconButton = ({ loading, color, onClick, children, title }) => {
	const [isLoading, setIsLoading] = useState(loading);
	
	const handleClick = async (e) => {
		if (loading) return;
		
		setIsLoading(true);
		try {
			await onClick(e);
		} finally {
			setIsLoading(false);
		}
	};
	
	return (
		<Tooltip title={title} arrow placement="top">
			<span>
				<ActionIconButton
					color={color}
					disabled={isLoading}
					onClick={handleClick}
				>
					{children}
				</ActionIconButton>
			</span>
		</Tooltip>
	);
};

const TicketActionButtons = ({ ticket, onTicketAccepted }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState(null);
	const [loading, setLoading] = useState(false);
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [acceptTicketWithouSelectQueueOpen, setAcceptTicketWithouSelectQueueOpen] = useState(false);
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
			await api.put(`/tickets/${ticket.id}`, {
				status: status,
				userId: userId || null
			});
			
		
			
			if (status === "open") {
				const isGroup = ticket?.contact?.isGroup;
				const targetTab = isGroup ? "groups" : "open";
				localStorage.setItem("pressticket:changeTab", targetTab);
				navigate(`/tickets/${ticket.id}`);
			} else if (status === "pending") {
				navigate("/tickets");
			} else if (status === "closed") {
				navigate("/tickets");
			}
			
			setLoading(false);
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

	const handleOpenAcceptTicketWithouSelectQueue = () => {
		setAcceptTicketWithouSelectQueueOpen(true);
	};

	const handleAcceptTicket = async (e) => {
		if (ticket.queue === null || ticket.queue === undefined) {
			handleOpenAcceptTicketWithouSelectQueue();
		} else {
			await handleUpdateTicketStatus(e, "open", user?.id);
			if (onTicketAccepted) {
				await onTicketAccepted();
			}
		}
	};

	return (
		<ActionButtonsContainer>
			{ticket.status === "closed" && (
				<LoadingIconButton
					title={t("messagesList.header.buttons.reopen")}
					loading={loading}
					onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
				>
					<Replay />
				</LoadingIconButton>
			)}
			{ticket.status === "open" && (
				<>
					<LoadingIconButton
						title={t("messagesList.header.buttons.return")}
						loading={loading}
						onClick={e => handleUpdateTicketStatus(e, "pending", null)}
					>
						<Replay />
					</LoadingIconButton>
					<LoadingIconButton
						title={t("messagesList.header.buttons.resolve")}
						loading={loading}
						color="primary"
						onClick={handleCloseTicket}
					>
						<ClearOutlined />
					</LoadingIconButton>
					<ConfirmationModal
						title={t("tickets.confirmationModal.closeTicket.title")}
						open={confirmationOpen}
						onClose={() => setConfirmationOpen(false)}
						onConfirm={handleConfirmClose}
					>
						{t("tickets.confirmationModal.closeTicket.message")}
					</ConfirmationModal>
					<Tooltip title={t("messagesList.header.buttons.options")} arrow placement="top">
						<ActionIconButton
							onClick={handleOpenTicketOptionsMenu}>
							<MoreVert />
						</ActionIconButton>
					</Tooltip>
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
							<LoadingIconButton
								title={t("messagesList.header.buttons.accept")}
								loading={loading}
								color="primary"
								onClick={handleAcceptTicket}
							>
								<CheckCircle />
							</LoadingIconButton>
						)}
					</>
				)}
			/>
			<AcceptTicketWithouSelectQueue
				modalOpen={acceptTicketWithouSelectQueueOpen}
				onClose={(e) => setAcceptTicketWithouSelectQueueOpen(false)}
				ticketId={ticket.id}
				onSuccess={onTicketAccepted}
			/>
		</ActionButtonsContainer>
	);
};

export default TicketActionButtons;
