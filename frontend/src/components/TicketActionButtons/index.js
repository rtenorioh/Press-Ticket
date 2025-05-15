import { IconButton, styled, Box, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { MoreVert, Replay, CheckCircle, ArrowBack, Done } from "@mui/icons-material";
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
		backgroundColor: color === "primary" ? theme.palette.primary.dark : theme.palette.grey[200],
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

const TicketActionButtons = ({ ticket }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
						<ArrowBack />
					</LoadingIconButton>
					<LoadingIconButton
						title={t("messagesList.header.buttons.resolve")}
						loading={loading}
						color="primary"
						onClick={handleCloseTicket}
					>
						<Done />
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
								onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
							>
								<CheckCircle />
							</LoadingIconButton>
						)}
					</>
				)}
			/>
		</ActionButtonsContainer>
	);
};

export default TicketActionButtons;
