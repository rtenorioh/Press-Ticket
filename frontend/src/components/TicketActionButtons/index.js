import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles, createTheme, ThemeProvider } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { MoreVert, Replay } from "@material-ui/icons";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import TicketOptionsMenu from "../TicketOptionsMenu";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';
import CancelIcon from '@material-ui/icons/Cancel';
import Tooltip from '@material-ui/core/Tooltip';
import { green, red } from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
	actionButtons: {
		marginRight: 5,
		flex: "none",
		alignSelf: "center",
		marginLeft: "auto",
		"& > *": {
			margin: theme.spacing(1),
		},
	},
}));

const TicketActionButtons = ({ ticket }) => {
	const classes = useStyles();
	const history = useHistory();
	const [anchorEl, setAnchorEl] = useState(null);
	const [loading, setLoading] = useState("false");
	const ticketOptionsMenuOpen = Boolean(anchorEl);
	const { user } = useContext(AuthContext);

	const customTheme = createTheme({
		palette: {
			primary: green,
			secondary: red,
		}
	});

	const handleOpenTicketOptionsMenu = e => {
		setAnchorEl(e.currentTarget);
	};

	const handleCloseTicketOptionsMenu = e => {
		setAnchorEl(null);
	};

	const handleUpdateTicketStatus = async (e, status, userId, isFinished) => {
		setLoading("true");
		try {
			await api.put(`/tickets/${ticket.id}`, {
				status: status,
				userId: userId || null,
				isFinished: isFinished,
				ticketData: ticket

			});

			setLoading("false");
			if (status === "open") {
				history.push(`/tickets/${ticket.id}`);
			} else {
				history.push("/tickets");
			}
		} catch (err) {
			setLoading("false");
			toastError(err);
		}
	};

	return (
		<div className={classes.actionButtons}>
			{ticket.status === "closed" && (
				<Tooltip title={i18n.t("messagesList.header.buttons.reopen")}>
					<IconButton loading={loading} style={{ marginRight: 20 }} onClick={e => handleUpdateTicketStatus(e, "open", user?.id,false)} color="primary">
						<Replay />
					</IconButton>
				</Tooltip>
			)}
			{ticket.status === "open" && (
				<>
					<Tooltip title={i18n.t("messagesList.header.buttons.return")}>
						<IconButton loading={loading} onClick={e => handleUpdateTicketStatus(e, "pending", null, false)}>
							<UndoRoundedIcon />
						</IconButton>
					</Tooltip>
					<ThemeProvider theme={customTheme}>
						<Tooltip title={i18n.t("messagesList.header.buttons.resolve")}>
							<IconButton 
							loading={loading} 
							onClick={e => handleUpdateTicketStatus(e, "closed", user?.id, false)} 
							color="secondary">
								<CancelIcon />
							</IconButton>
						</Tooltip>
					</ThemeProvider>
					<IconButton loading={loading} onClick={handleOpenTicketOptionsMenu}>
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
			
			{/* {ticket.status === "pending" && (
				<Tooltip title={i18n.t("messagesList.header.buttons.accept")}>
					<IconButton loading={loading} style={{ marginRight: 20 }} onClick={e => handleUpdateTicketStatus(e, "open", user?.id)} color="primary">
						<CheckCircleIcon />
					</IconButton>
				</Tooltip>
			)} */}
				
			
		</div>
	);
};

export default TicketActionButtons;