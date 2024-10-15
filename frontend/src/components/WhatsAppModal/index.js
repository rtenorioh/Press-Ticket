import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";

import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	IconButton,
	MenuItem,
	Select,
	Switch,
	TextField,
	Tooltip
} from "@material-ui/core";

import { FileCopyOutlined, InfoOutlined } from "@material-ui/icons";

import { CopyToClipboard } from 'react-copy-to-clipboard';
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import QueueSelect from "../QueueSelect";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	multiFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
	},
	btnWrapper: {
		position: "relative",
	},
	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
	integrationBox: {
		display: 'flex',
		flexDirection: 'column',
		marginTop: theme.spacing(2),
		padding: theme.spacing(2),
		border: '1px solid #ddd',
		borderRadius: theme.shape.borderRadius,
		backgroundColor: '#f9f9f9',
	},
	integrationHeader: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: theme.spacing(1),
	},
	integrationTitle: {
		fontSize: '16px',
		color: theme.palette.primary.main,
		textAlign: 'center',
	},
	integrationDescription: {
		lineHeight: 1.6,
		fontSize: '14px',
		color: '#333',
		textAlign: 'justify',
		marginTop: theme.spacing(1),
	},
	couponBox: {
		marginTop: theme.spacing(1),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		padding: theme.spacing(1.5),
		border: `2px dashed ${theme.palette.primary.main}`,
		backgroundColor: '#e0f7fa',
		borderRadius: theme.shape.borderRadius,
	},
	couponText: {
		fontSize: '18px',
		color: theme.palette.primary.main,
		marginRight: theme.spacing(1),
	},
	registerButton: {
		display: 'inline-block',
		marginTop: theme.spacing(2.5),
		fontSize: '14px',
		color: theme.palette.primary.main,
		fontWeight: 'bold',
		textDecoration: 'none',
		backgroundColor: '#e0e7ff',
		padding: theme.spacing(1, 2),
		borderRadius: theme.shape.borderRadius,
		textAlign: 'center',
		alignSelf: 'center',
	},
}));

const SessionSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
});

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
	const classes = useStyles();
	const initialState = {
		name: "",
		greetingMessage: "",
		farewellMessage: "",
		isDefault: false,
		isDisplay: false
	};
	const [whatsApp, setWhatsApp] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [isHubSelected, setIsHubSelected] = useState(false);
	const [availableChannels, setAvailableChannels] = useState([]);
	const [selectedChannel, setSelectedChannel] = useState("");
	const [copySuccess, setCopySuccess] = useState(false);

	const fetchChannels = async () => {
		try {
			const { data } = await api.get("/hub-channel/");
			setAvailableChannels(data);
		} catch (err) {
			toastError(err);
		}
	};

	useEffect(() => {
		console.log("selectedChannel has changed:", selectedChannel);
	}, [selectedChannel]);

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;

			try {
				const { data } = await api.get(`whatsapp/${whatsAppId}`);
				setWhatsApp(data);

				const whatsQueueIds = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(whatsQueueIds);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, [whatsAppId]);

	const handleCopy = () => {
		setCopySuccess(true);
		setTimeout(() => setCopySuccess(false), 2000);
	};

	const handleSaveWhatsApp = async values => {
		const whatsappData = { ...values, queueIds: selectedQueueIds };

		try {
			if (isHubSelected && selectedChannel) {
				const selectedChannelObj = availableChannels.find(
					channel => channel.id === selectedChannel
				);

				if (selectedChannelObj) {
					const channels = [selectedChannelObj];
					await api.post("/hub-channel/", {
						...whatsappData,
						channels
					});
					setTimeout(() => {
						window.location.reload();
					}, 100);
				}
			} else {
				if (whatsAppId) {
					await api.put(`/whatsapp/${whatsAppId}`, ...whatsappData);
				} else {
					await api.post("/whatsapp", whatsappData);
				}
			}
			toast.success(i18n.t("whatsappModal.success"));
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};

	const handleClose = () => {
		onClose();
		setWhatsApp(initialState);
		setIsHubSelected(false);
		setSelectedChannel("");
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				scroll="paper"
			>
				<DialogTitle>
					{whatsAppId
						? i18n.t("whatsappModal.title.edit")
						: i18n.t("whatsappModal.title.add")}
				</DialogTitle>
				<Formik
					initialValues={whatsApp}
					enableReinitialize={true}
					validationSchema={SessionSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveWhatsApp(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, touched, errors, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
								<div className={classes.multiFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("whatsappModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										className={classes.textField}
									/>
									{!isHubSelected && (
										<>
											<FormControlLabel
												control={
													<Field
														as={Switch}
														color="primary"
														name="isDefault"
														checked={values.isDefault}
													/>
												}
												label={i18n.t("whatsappModal.form.default")}
											/>
										</>
									)}
									<FormControlLabel
										control={
											<Switch
												checked={isHubSelected}
												onChange={() => {
													setIsHubSelected(prev => !prev);
													if (!isHubSelected) {
														fetchChannels();
													}
												}}
												color="primary"
											/>
										}
										label="Ativar Canais"
									/>
								</div>

								{isHubSelected && (
									<div>
										<Select
											label="Select Channel"
											fullWidth
											value={selectedChannel || ""}
											onChange={e => {
												const value = e.target.value;
												setSelectedChannel(value);
											}}
											displayEmpty
										>
											<MenuItem value="" disabled>
												Selecione um canal
											</MenuItem>
											{availableChannels.map(channel => (
												<MenuItem key={channel.id} value={channel.id}>
													{channel.name}
												</MenuItem>
											))}
										</Select>

										<div className={classes.integrationBox}>
											<div className={classes.integrationHeader}>
												<InfoOutlined style={{ marginRight: '10px', color: '#3f51b5' }} />
												<strong className={classes.integrationTitle}>Integração de Canais</strong>
											</div>

											<span className={classes.integrationDescription}>
												Para ativar <strong>Facebook</strong>, <strong>Instagram</strong>, <strong>Telegram</strong> e <strong>WebChat</strong>, cadastre-se pelo botão abaixo, depois adquirir os canais desejados usando o cupom abaixo. Insira o token da sua <strong>Account</strong> na página de Configurações para finalizar a integração.
											</span>

											<span className={classes.integrationDescription}>
												Use o cupom abaixo para <strong>50% de desconto</strong> na compra dos canais!
											</span>

											<div className={classes.couponBox}>
												<strong className={classes.couponText}>
													PRESS60
												</strong>
												<CopyToClipboard text="PRESS60" onCopy={handleCopy}>
													<Tooltip title={copySuccess ? "Copiado!" : "Copiar cupom"}>
														<IconButton size="small" style={{ padding: '0' }}>
															<FileCopyOutlined fontSize="small" />
														</IconButton>
													</Tooltip>
												</CopyToClipboard>
											</div>

											<a
												href="https://hub.notificame.com.br/signup/registrar?from=@pressticket"
												target="_blank"
												rel="noopener noreferrer"
												className={classes.registerButton}
											>
												REALIZE O CADASTRO AQUI
											</a>
										</div>
									</div>
								)}

								{!isHubSelected && (
									<>
										<div>
											<Field
												as={TextField}
												label={i18n.t("queueModal.form.greetingMessage")}
												type="greetingMessage"
												multiline
												rows={5}
												fullWidth
												name="greetingMessage"
												error={
													touched.greetingMessage && Boolean(errors.greetingMessage)
												}
												helperText={
													touched.greetingMessage && errors.greetingMessage
												}
												variant="outlined"
												margin="dense"
											/>
										</div>
										<div>
											<Field
												as={TextField}
												label={i18n.t("whatsappModal.form.farewellMessage")}
												type="farewellMessage"
												multiline
												rows={5}
												fullWidth
												name="farewellMessage"
												error={
													touched.farewellMessage && Boolean(errors.farewellMessage)
												}
												helperText={
													touched.farewellMessage && errors.farewellMessage
												}
												variant="outlined"
												margin="dense"
											/>
										</div>
										<QueueSelect
											selectedQueueIds={selectedQueueIds}
											onChange={selectedIds => setSelectedQueueIds(selectedIds)}
										/>
										<FormControlLabel
											control={
												<Field
													as={Switch}
													color="primary"
													name="isDisplay"
													checked={values.isDisplay}
												/>
											}
											label={i18n.t("whatsappModal.form.display")}
										/>
									</>
								)}

							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("whatsappModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{whatsAppId
										? i18n.t("whatsappModal.buttons.okEdit")
										: i18n.t("whatsappModal.buttons.okAdd")}
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default React.memo(WhatsAppModal);
