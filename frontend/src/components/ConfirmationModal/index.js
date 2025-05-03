import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
	Divider,
	Stack
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";

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

const ConfirmationModal = ({ title, children, open, onClose, onConfirm }) => {
	const { t } = useTranslation();
	const theme = useTheme();

	return (
		<StyledDialog
			open={open}
			onClose={() => onClose(false)}
			aria-labelledby="confirm-dialog"
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 2,
					boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
				}
			}}
		>
			<DialogTitle id="confirm-dialog">
				<Stack direction="row" alignItems="center">
					{title}
				</Stack>
			</DialogTitle>
			<DialogContent>
				<Typography sx={{ mt: 1 }}>{children}</Typography>
			</DialogContent>
			<Divider />
			<DialogActions sx={{ padding: 2, gap: 1, display: 'flex', justifyContent: 'flex-end' }}>
				<Button
					variant="contained"
					onClick={() => onClose(false)}
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
					{t("confirmationModal.buttons.cancel")}
				</Button>
				<Button
					variant="contained"
					onClick={() => {
						onClose(false);
						onConfirm();
					}}
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
					{t("confirmationModal.buttons.confirm")}
				</Button>
			</DialogActions>
		</StyledDialog>
	);
};

export default ConfirmationModal;
