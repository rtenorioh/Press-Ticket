import React, { useState, useEffect } from "react";
import openSocket from "socket.io-client";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Select from "@material-ui/core/Select";
import { toast } from "react-toastify";

import Tooltip from "@material-ui/core/Tooltip";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.background.default,
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(8, 8, 3),
	},

	paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
		marginBottom: 12,
		backgroundColor: theme.palette.background.paper,
	},

	settingOption: {
		marginLeft: "auto",
	},
	margin: {
		margin: theme.spacing(1),
	},

}));

const Settings = () => {
	const classes = useStyles();

	const [settings, setSettings] = useState([]);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const { data } = await api.get("/settings");
				setSettings(data);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, []);

	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

		socket.on("settings", data => {
			if (data.action === "update") {
				setSettings(prevState => {
					const aux = [...prevState];
					const settingIndex = aux.findIndex(s => s.key === data.setting.key);
					aux[settingIndex].value = data.setting.value;
					return aux;
				});
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleChangeSetting = async e => {
		const selectedValue = e.target.value;
		const settingKey = e.target.name;

		try {
			await api.put(`/settings/${settingKey}`, {
				value: selectedValue,
			});
			toast.success(i18n.t("settings.success"));
		} catch (err) {
			toastError(err);
		}
	};

	const getSettingValue = key => {
		const { value } = settings.find(s => s.key === key);
		return value;
	};

	return (
		<div className={classes.root}>
			<Container className={classes.container} maxWidth="sm">
				<Typography variant="body2" gutterBottom>
					{i18n.t("settings.title")}
				</Typography>
				<Paper className={classes.paper}>
					<Typography variant="body1">
						{i18n.t("settings.settings.userCreation.name")}
					</Typography>
					<Select
						margin="dense"
						variant="outlined"
						native
						id="userCreation-setting"
						name="userCreation"
						value={
							settings && settings.length > 0 && getSettingValue("userCreation")
						}
						className={classes.settingOption}
						onChange={handleChangeSetting}
					>
						<option value="enabled">
							{i18n.t("settings.settings.userCreation.options.enabled")}
						</option>
						<option value="disabled">
							{i18n.t("settings.settings.userCreation.options.disabled")}
						</option>
					</Select>
				</Paper>

				<Typography variant="body2" gutterBottom></Typography>
				<Tooltip title={i18n.t("settings.settings.call.note")}>
					<Paper className={classes.paper}>

						<Typography variant="body1">
							{i18n.t("settings.settings.call.name")}
						</Typography>
						<Select
							margin="dense"
							variant="outlined"
							native
							id="call-setting"
							name="call"
							value={
								settings && settings.length > 0 && getSettingValue("call")
							}
							className={classes.settingOption}
							onChange={handleChangeSetting}
						>
							<option value="enabled">
								{i18n.t("settings.settings.call.options.enabled")}
							</option>
							<option value="disabled">
								{i18n.t("settings.settings.call.options.disabled")}
							</option>
						</Select>
					</Paper>
				</Tooltip>

				<Typography variant="body2" gutterBottom></Typography>
				<Paper className={classes.paper}>
					<Typography variant="body1">
						{i18n.t("settings.settings.CheckMsgIsGroup.name")}
					</Typography>
					<Select
						margin="dense"
						variant="outlined"
						native
						id="CheckMsgIsGroup-setting"
						name="CheckMsgIsGroup"
						value={
							settings && settings.length > 0 && getSettingValue("CheckMsgIsGroup")
						}
						className={classes.settingOption}
						onChange={handleChangeSetting}
					>
						<option value="enabled">
							{i18n.t("settings.settings.CheckMsgIsGroup.options.enabled")}
						</option>
						<option value="disabled">
							{i18n.t("settings.settings.CheckMsgIsGroup.options.disabled")}
						</option>
					</Select>
				</Paper>

				<Typography variant="body2" gutterBottom></Typography>
				<Tooltip title={i18n.t("settings.settings.sideMenu.note")}>
					<Paper className={classes.paper} elevation={3}>
						<Typography variant="body1">
							{i18n.t("settings.settings.sideMenu.name")}
						</Typography>
						<Select
							margin="dense"
							variant="outlined"
							native
							id="sideMenu-setting"
							name="sideMenu"
							value={
								settings && settings.length > 0 && getSettingValue("sideMenu")
							}
							className={classes.settingOption}
							onChange={handleChangeSetting}
						>
							<option value="enabled">
								{i18n.t("settings.settings.sideMenu.options.enabled")}
							</option>
							<option value="disabled">
								{i18n.t("settings.settings.sideMenu.options.disabled")}
							</option>
						</Select>
					</Paper>
				</Tooltip>

				<Typography variant="body2" gutterBottom></Typography>
				<Tooltip title={i18n.t("settings.settings.timeCreateNewTicket.note")}>
					<Paper className={classes.paper} elevation={3}>
						<Typography variant="body1">
							{i18n.t("settings.settings.timeCreateNewTicket.name")}
						</Typography>
						<Select
							margin="dense"
							variant="outlined"
							native
							id="timeCreateNewTicket-setting"
							name="timeCreateNewTicket"
							value={
								settings && settings.length > 0 && getSettingValue("timeCreateNewTicket")
							}
							className={classes.settingOption}
							onChange={handleChangeSetting}
						>
							<option value="10">
								{i18n.t("settings.settings.timeCreateNewTicket.options.10")}
							</option>
							<option value="30">
								{i18n.t("settings.settings.timeCreateNewTicket.options.30")}
							</option>
							<option value="60">
								{i18n.t("settings.settings.timeCreateNewTicket.options.60")}
							</option>
							<option value="300">
								{i18n.t("settings.settings.timeCreateNewTicket.options.300")}
							</option>
							<option value="1800">
								{i18n.t("settings.settings.timeCreateNewTicket.options.1800")}
							</option>
							<option value="3600">
								{i18n.t("settings.settings.timeCreateNewTicket.options.3600")}
							</option>
							<option value="7200">
								{i18n.t("settings.settings.timeCreateNewTicket.options.7200")}
							</option>
							<option value="21600">
								{i18n.t("settings.settings.timeCreateNewTicket.options.21600")}
							</option>
							<option value="43200">
								{i18n.t("settings.settings.timeCreateNewTicket.options.43200")}
							</option>
						</Select>
					</Paper>
				</Tooltip>

			</Container>
		</div>
	);
};

export default Settings;