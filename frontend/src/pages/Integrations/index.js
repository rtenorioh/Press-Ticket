import React, { useState, useEffect } from "react";
import openSocket from "socket.io-client";

import {
	Container,
	makeStyles,
	Paper,
	TextField,
	Typography
} from "@material-ui/core";

import { toast } from "react-toastify";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(8, 8, 3),
	},
	paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
		marginBottom: 12,

	}
}));

const Integrations = () => {
	const classes = useStyles();

	const [integrations, setIntegrations] = useState([]);

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

	const getIntegrationValue = key => {
		const { value } = integrations.find(s => s.key === key);
		return value;
	};

	return (
		<div className={classes.root}>
			<Container className={classes.container} >
				<Typography variant="body2" gutterBottom>
					<Title>{i18n.t("integrations.title")}</Title>
				</Typography>


				<Paper className={classes.paper1}>
					<Typography align="center" variant="body1">
						{i18n.t("integrations.integrations.openai.title")}
					</Typography>
					<Paper elevation={4} className={classes.paper}>
						<TextField
							style={{ marginRight: "1%", width: "50%" }}
							id="organization"
							name="organization"
							margin="dense"
							label={i18n.t("integrations.integrations.openai.organization")}
							variant="outlined"
							value={integrations && integrations.length > 0 && getIntegrationValue("organization")}
							onChange={handleChangeIntegration}
							fullWidth
						/>
						<TextField
							style={{ marginRight: "1%", width: "50%" }}
							id="apikey"
							name="apikey"
							label={i18n.t("integrations.integrations.openai.apikey")}
							margin="dense"
							variant="outlined"
							onChange={handleChangeIntegration}
							fullWidth
							value={integrations && integrations.length > 0 && getIntegrationValue("apikey")}
						/>
					</Paper>
				</Paper>

				<Paper className={classes.paper1}>
					<Typography align="center" variant="body1">
						{i18n.t("integrations.integrations.n8n.title")}
					</Typography>
					<Paper elevation={4} className={classes.paper}>
						<TextField
							style={{ width: "100%" }}
							id="urlApiN8N"
							name="urlApiN8N"
							margin="dense"
							label={i18n.t("integrations.integrations.n8n.urlApiN8N")}
							variant="outlined"
							value={integrations && integrations.length > 0 && getIntegrationValue("urlApiN8N")}
							onChange={handleChangeIntegration}
							fullWidth
						/>
					</Paper>
				</Paper>

			</Container>
		</div>
	);
};

export default Integrations;
