import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { Cancel, CheckCircle } from "@mui/icons-material";
import React from "react";
import { useTranslation } from "react-i18next";

const DialogTitleStyled = styled(DialogTitle)(({ theme }) => ({
	backgroundColor: theme.palette.background.default,
	color: theme.palette.text.primary,
}));

const DialogActionsStyled = styled(DialogActions)(({ theme }) => ({
	justifyContent: "space-between",
	padding: theme.spacing(2),
}));

const CancelButton = styled(Button)(({ theme }) => ({
	color: theme.palette.error.main,
}));

const ConfirmButton = styled(Button)(({ theme }) => ({
	backgroundColor: theme.palette.primary.main,
	color: theme.palette.primary.contrastText,
	"&:hover": {
		backgroundColor: theme.palette.primary.dark,
	},
}));

const ConfirmationModal = ({ title, children, open, onClose, onConfirm }) => {
	const { t } = useTranslation();

	return (
		<Dialog
			open={open}
			onClose={() => onClose(false)}
			aria-labelledby="confirm-dialog"
			maxWidth="sm"
			fullWidth
		>
			<DialogTitleStyled id="confirm-dialog">
				{title}
			</DialogTitleStyled>
			<DialogContent dividers>
				<Typography>{children}</Typography>
			</DialogContent>
			<DialogActionsStyled>
				<CancelButton
					variant="outlined"
					onClick={() => onClose(false)}
					startIcon={<Cancel />}
				>
					{t("confirmationModal.buttons.cancel")}
				</CancelButton>
				<ConfirmButton
					variant="contained"
					onClick={() => {
						onClose(false);
						onConfirm();
					}}
					startIcon={<CheckCircle />}
				>
					{t("confirmationModal.buttons.confirm")}
				</ConfirmButton>
			</DialogActionsStyled>
		</Dialog>
	);
};

export default ConfirmationModal;
