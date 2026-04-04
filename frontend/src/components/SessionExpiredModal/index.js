import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    Box
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useTranslation } from "react-i18next";

const SessionExpiredModal = ({ open, onConfirm }) => {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            maxWidth="xs"
            fullWidth
            disableEscapeKeyDown
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon color="warning" />
                    <Typography variant="h6" component="span">
                        {t("sessionExpiredModal.title")}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" color="text.secondary">
                    {t("sessionExpiredModal.message")}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={onConfirm}
                >
                    {t("sessionExpiredModal.confirm")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SessionExpiredModal;
