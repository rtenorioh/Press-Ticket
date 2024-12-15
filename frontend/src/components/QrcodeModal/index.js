import { Dialog, DialogContent, Paper, Typography } from "@material-ui/core";
import QRCode from "qrcode.react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
	const [qrCode, setQrCode] = useState("");
	const { t } = useTranslation();

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;

			try {
				const { data } = await api.get(`/whatsapp/${whatsAppId}`);
				setQrCode(data.qrcode);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, [whatsAppId]);

	useEffect(() => {
		if (!whatsAppId) return;
		const socket = openSocket();

		socket.on("whatsappSession", data => {
			if (data.action === "update" && data.session.id === whatsAppId) {
				setQrCode(data.session.qrcode);
			}

			if (data.action === "update" && data.session.qrcode === "") {
				onClose();
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [whatsAppId, onClose]);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg" scroll="paper">
			<DialogContent style={{ background: '#ffffff' }}>
				<Paper elevation={0} style={{ background: '#ffffff' }}>
					<Typography color="primary" gutterBottom>
						{t("qrCode.message")}
					</Typography>
					{qrCode ? (
						<QRCode value={qrCode} size={256} />
					) : (
						<span>Waiting for QR Code</span>
					)}
				</Paper>
			</DialogContent>
		</Dialog>
	);
};

export default React.memo(QrcodeModal);
