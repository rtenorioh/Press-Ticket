import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Cancel, CheckCircle } from "@material-ui/icons";
import React from "react";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
	dialogTitle: {
		backgroundColor: theme.palette.background.default,
		color: theme.palette.text.primary,
	},
	dialogActions: {
		justifyContent: "space-between",
		padding: theme.spacing(2),
	},
	cancelButton: {
		color: theme.palette.error.main,
	},
	confirmButton: {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
		"&:hover": {
			backgroundColor: theme.palette.primary.dark,
		},
	},
}));

const ConfirmationModal = ({ title, children, open, onClose, onConfirm }) => {
	const classes = useStyles();

	return (
		<Dialog
			open={open}
			onClose={() => onClose(false)}
			aria-labelledby="confirm-dialog"
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle id="confirm-dialog" className={classes.dialogTitle}>
				{title}
			</DialogTitle>
			<DialogContent dividers>
				<Typography>{children}</Typography>
			</DialogContent>
			<DialogActions className={classes.dialogActions}>
				<Button
					variant="outlined"
					onClick={() => onClose(false)}
					className={classes.cancelButton}
					startIcon={<Cancel />}
				>
					{i18n.t("confirmationModal.buttons.cancel")}
				</Button>
				<Button
					variant="contained"
					onClick={() => {
						onClose(false);
						onConfirm();
					}}
					className={classes.confirmButton}
					startIcon={<CheckCircle />}
				>
					{i18n.t("confirmationModal.buttons.confirm")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmationModal;
