import React, { useEffect, useState } from "react";
import openSocket from "socket.io-client";

import {
	Container,
	Grid,
	IconButton,
	makeStyles,
	Paper,
	TextField,
	Typography
} from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";

import { toast } from "react-toastify";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";

const useStyles = makeStyles(theme => ({
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
		transform: "translateY(-50%)"
	}
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

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const { data } = await api.get("/integrations");
				setIntegrations(data);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, []);

	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

		socket.on("integrations", data => {
			if (data.action === "update") {
				setIntegrations(prevState => {
					const aux = [...prevState];
					const integrationIndex = aux.findIndex(s => s.key === data.integration.key);
					aux[integrationIndex].value = data.integration.value;
					return aux;
				});
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleChangeIntegration = async e => {
		const selectedValue = e.target.value;
		const integrationKey = e.target.name;

		try {
			await api.put(`/integrations/${integrationKey}`, {
				value: selectedValue,
			});
			toast.success(i18n.t("integrations.success"));
		} catch (err) {
			toastError(err);
		}
	};

	const handleToggleShowKey = key => {
		setShowKeys(prevState => ({
			...prevState,
			[key]: !prevState[key]
		}));
	};

	const getIntegrationValue = key => {
		const integration = integrations.find(s => s.key === key);
		return integration ? integration.value : "";
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
								value={integrations && integrations.length > 0 && getIntegrationValue("organization")}
								onChange={handleChangeIntegration}
								fullWidth
								type={showKeys["organization"] ? "text" : "password"}
							/>
							<IconButton className={classes.iconButton} onClick={() => handleToggleShowKey("organization")}>
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
								value={integrations && integrations.length > 0 && getIntegrationValue("apikey")}
								type={showKeys["apikey"] ? "text" : "password"}
							/>
							<IconButton className={classes.iconButton} onClick={() => handleToggleShowKey("apikey")}>
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
										value={integrations && integrations.length > 0 && getIntegrationValue("urlApiN8N")}
										onChange={handleChangeIntegration}
										fullWidth
										type={showKeys["urlApiN8N"] ? "text" : "password"}
									/>
									<IconButton className={classes.iconButton} onClick={() => handleToggleShowKey("urlApiN8N")}>
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
										value={integrations && integrations.length > 0 && getIntegrationValue("hubToken")}
										onChange={handleChangeIntegration}
										fullWidth
										type={showKeys["hubToken"] ? "text" : "password"}
									/>
									<IconButton className={classes.iconButton} onClick={() => handleToggleShowKey("hubToken")}>
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
										value={integrations && integrations.length > 0 && getIntegrationValue("apiMaps")}
										onChange={handleChangeIntegration}
										fullWidth
										type={showKeys["apiMaps"] ? "text" : "password"}
									/>
									<IconButton className={classes.iconButton} onClick={() => handleToggleShowKey("apiMaps")}>
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
