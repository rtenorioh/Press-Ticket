import {
	Container,
	Grid,
	IconButton,
	makeStyles,
	Paper,
	TextField,
	Typography,
} from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(2, 2, 3),
	},
	paper: {
		padding: theme.spacing(1),
		marginBottom: 12,
	},
	integrationRow: {
		display: "flex",
		alignItems: "center",
		marginBottom: theme.spacing(1),
		gap: theme.spacing(2),
	},
	textFieldContainer: {
		position: "relative",
		width: "100%",
	},
	textField: {
		width: "100%",
	},
	iconButton: {
		position: "absolute",
		right: theme.spacing(1),
		top: "50%",
		transform: "translateY(-50%)",
	},
}));

const Integrations = () => {
	const classes = useStyles();

	const [integrations, setIntegrations] = useState([]);
	const [showKeys, setShowKeys] = useState({
		organization: false,
		apikey: false,
		urlApiN8N: false,
		hubToken: false,
		apiMaps: false
	});
	const [maskedValues, setMaskedValues] = useState({
		organization: "",
		apikey: "",
		urlApiN8N: "",
		hubToken: "",
		apiMaps: ""
	});

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const { data } = await api.get("/integrations");
				setIntegrations(data);
				setMaskedValues(
					data.reduce((acc, integration) => {
						acc[integration.key] = maskValue(integration.value);
						return acc;
					}, {})
				);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, []);

	const handleChangeIntegration = async (e) => {
		const selectedValue = e.target.value;
		const integrationKey = e.target.name;

		try {
			await api.put(`/integrations/${integrationKey}`, {
				value: selectedValue,
			});
			toast.success(i18n.t("integrations.success"));
			setMaskedValues((prevState) => ({
				...prevState,
				[integrationKey]: maskValue(selectedValue),
			}));
		} catch (err) {
			toastError(err);
		}
	};

	const handleToggleShowKey = (key) => {
		setShowKeys((prevState) => ({
			...prevState,
			[key]: !prevState[key],
		}));
	};

	const getIntegrationValue = (key) => {
		const integration = integrations.find((s) => s.key === key);
		return integration ? integration.value : "";
	};

	const maskValue = (value) => {
		return value.replace(/./g, "•");
	};

	return (
		<div className={classes.root}>
			<Container className={classes.container}>
				<Title>{i18n.t("integrations.title")}</Title>
				<Paper className={classes.paper}>
					<div className={classes.integrationRow}>
						<Typography align="left" variant="body1">
							{i18n.t("integrations.integrations.openai.title")}
						</Typography>

						<div className={classes.textFieldContainer}>
							<TextField
								className={classes.textField}
								id="organization"
								name="organization"
								margin="dense"
								label={i18n.t("integrations.integrations.openai.organization")}
								variant="outlined"
								value={
									showKeys["organization"]
										? getIntegrationValue("organization")
										: maskedValues["organization"]
								}
								onChange={handleChangeIntegration}
								fullWidth
								type="text"
							/>
							<IconButton
								className={classes.iconButton}
								onClick={() => handleToggleShowKey("organization")}
							>
								{showKeys["organization"] ? <VisibilityOff /> : <Visibility />}
							</IconButton>
						</div>

						<div className={classes.textFieldContainer}>
							<TextField
								className={classes.textField}
								id="apikey"
								name="apikey"
								label={i18n.t("integrations.integrations.openai.apikey")}
								margin="dense"
								variant="outlined"
								onChange={handleChangeIntegration}
								fullWidth
								value={
									showKeys["apikey"]
										? getIntegrationValue("apikey")
										: maskedValues["apikey"]
								}
								type="text"
							/>
							<IconButton
								className={classes.iconButton}
								onClick={() => handleToggleShowKey("apikey")}
							>
								{showKeys["apikey"] ? <VisibilityOff /> : <Visibility />}
							</IconButton>
						</div>
					</div>
				</Paper>

				<Paper className={classes.paper}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<div className={classes.integrationRow}>
								<Typography align="left" variant="body1">
									{i18n.t("integrations.integrations.n8n.title")}
								</Typography>

								<div className={classes.textFieldContainer}>
									<TextField
										className={classes.textField}
										id="urlApiN8N"
										name="urlApiN8N"
										margin="dense"
										label={i18n.t("integrations.integrations.n8n.urlApiN8N")}
										variant="outlined"
										onChange={handleChangeIntegration}
										fullWidth
										value={
											showKeys["urlApiN8N"]
												? getIntegrationValue("urlApiN8N")
												: maskedValues["urlApiN8N"]
										}
										type="text"
									/>
									<IconButton
										className={classes.iconButton}
										onClick={() => handleToggleShowKey("urlApiN8N")}
									>
										{showKeys["urlApiN8N"] ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</div>
							</div>
						</Grid>

						<Grid item xs={12} sm={6}>
							<div className={classes.integrationRow}>
								<Typography align="left" variant="body1">
									{i18n.t("integrations.integrations.hub.title")}
								</Typography>

								<div className={classes.textFieldContainer}>
									<TextField
										className={classes.textField}
										id="hubToken"
										name="hubToken"
										margin="dense"
										label={i18n.t("integrations.integrations.hub.hubToken")}
										variant="outlined"
										onChange={handleChangeIntegration}
										fullWidth
										value={
											showKeys["hubToken"]
												? getIntegrationValue("hubToken")
												: maskedValues["hubToken"]
										}
										type="text"
									/>
									<IconButton
										className={classes.iconButton}
										onClick={() => handleToggleShowKey("hubToken")}
									>
										{showKeys["hubToken"] ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</div>
							</div>
						</Grid>
					</Grid>
				</Paper>

				<Paper className={classes.paper}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<div className={classes.integrationRow}>
								<Typography align="left" variant="body1">
									{i18n.t("integrations.integrations.maps.title")}
								</Typography>

								<div className={classes.textFieldContainer}>
									<TextField
										className={classes.textField}
										id="apiMaps"
										name="apiMaps"
										margin="dense"
										label={i18n.t("integrations.integrations.maps.apiMaps")}
										variant="outlined"
										onChange={handleChangeIntegration}
										fullWidth
										value={
											showKeys["apiMaps"]
												? getIntegrationValue("apiMaps")
												: maskedValues["apiMaps"]
										}
										type="text"
									/>
									<IconButton
										className={classes.iconButton}
										onClick={() => handleToggleShowKey("apiMaps")}
									>
										{showKeys["apiMaps"] ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</div>
							</div>
						</Grid>
					</Grid>
				</Paper>
			</Container>
		</div>
	);
};

export default Integrations;
