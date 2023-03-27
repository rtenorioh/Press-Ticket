import React, { useState, useEffect } from "react";
import openSocket from "socket.io-client";
import { useHistory } from "react-router-dom";

import { makeStyles, withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Select from "@material-ui/core/Select";
import { toast } from "react-toastify";

import Tooltip from "@material-ui/core/Tooltip";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.background.default,
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(4),
	},

	paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
	},

	settingOption: {
		marginLeft: "auto",
	},
	margin: {
		margin: theme.spacing(1),
	},

}));

const IOSSwitch = withStyles((theme) => ({
	root: {
		width: 42,
		height: 26,
		padding: 0,
		margin: theme.spacing(1),
	},
	switchBase: {
		padding: 1,
		'&$checked': {
			transform: 'translateX(16px)',
			color: theme.palette.common.white,
			'& + $track': {
				backgroundColor: '#52d869',
				opacity: 1,
				border: 'none',
			},
		},
		'&$focusVisible $thumb': {
			color: '#52d869',
			border: '6px solid #fff',
		},
	},
	thumb: {
		width: 24,
		height: 24,
	},
	track: {
		borderRadius: 26 / 2,
		border: `1px solid ${theme.palette.grey[400]}`,
		backgroundColor: theme.palette.grey[50],
		opacity: 1,
		transition: theme.transitions.create(['background-color', 'border']),
	},
	checked: {},
	focusVisible: {},
}))
	(({ classes, ...props }) => {
		return (
			<Switch
				focusVisibleClassName={classes.focusVisible}
				disableRipple
				classes={{
					root: classes.root,
					switchBase: classes.switchBase,
					thumb: classes.thumb,
					track: classes.track,
					checked: classes.checked,
				}}
				{...props}
			/>
		);
	});

const Settings = () => {
	const classes = useStyles();
	const history = useHistory();

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

	const handleChangeBooleanSetting = async e => {
		const selectedValue = e.target.checked ? "enabled" : "disabled";
		const settingKey = e.target.name;

		try {
			await api.put(`/settings/${settingKey}`, {
				value: selectedValue,
			});
			toast.success(i18n.t("settings.success"));
			history.go(0);
		} catch (err) {
			toastError(err);
		}
	};
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
			<Container className={classes.container} maxWidth="xs">
				<Typography variant="body2" gutterBottom>
					{i18n.t("settings.title")}
				</Typography>

				<Paper className={classes.paper}>
					<Tooltip title={i18n.t("settings.settings.userCreation.note")}>
						<FormControlLabel
							control={
								<IOSSwitch
									checked={settings && settings.length > 0 && getSettingValue("userCreation") === "enabled"}
									onChange={handleChangeBooleanSetting} name="userCreation"
								/>
							}
							label={i18n.t("settings.settings.userCreation.name")}
						/>
					</Tooltip>
				</Paper>

				<Typography variant="body2" gutterBottom></Typography>

				<Paper className={classes.paper}>
					<Tooltip title={i18n.t("settings.settings.allTicket.note")}>
						<FormControlLabel
							control={
								<IOSSwitch
									checked={settings && settings.length > 0 && getSettingValue("allTicket") === "enabled"}
									onChange={handleChangeBooleanSetting} name="allTicket"
								/>}
							label={i18n.t("settings.settings.allTicket.name")}
						/>
					</Tooltip>
				</Paper>

				<Typography variant="body2" gutterBottom></Typography>

				<Paper className={classes.paper}>
					<Tooltip title={i18n.t("settings.settings.CheckMsgIsGroup.note")}>
						<FormControlLabel
							control={
								<IOSSwitch
									checked={settings && settings.length > 0 && getSettingValue("CheckMsgIsGroup") === "enabled"}
									onChange={handleChangeBooleanSetting} name="CheckMsgIsGroup"
								/>
							} label={i18n.t("settings.settings.CheckMsgIsGroup.name")}
						/>
					</Tooltip>
				</Paper>

				<Typography variant="body2" gutterBottom></Typography>
				<Paper className={classes.paper}>
					<Tooltip title={i18n.t("settings.settings.call.note")}>
						<FormControlLabel
							control={
								<IOSSwitch
									checked={settings && settings.length > 0 && getSettingValue("call") === "enabled"}
									onChange={handleChangeBooleanSetting} name="call"
								/>}
							label={i18n.t("settings.settings.call.name")}
						/>
					</Tooltip>
				</Paper>

				<Typography variant="body2" gutterBottom></Typography>
				<Paper className={classes.paper}>
					<Tooltip title={i18n.t("settings.settings.sideMenu.note")}>
						<FormControlLabel
							control={
								<IOSSwitch
									checked={settings && settings.length > 0 && getSettingValue("sideMenu") === "enabled"}
									onChange={handleChangeBooleanSetting} name="sideMenu"
								/>}
							label={i18n.t("settings.settings.sideMenu.name")}
						/>
					</Tooltip>
				</Paper>


			</Container>
			<Container className={classes.container} maxWidth="xs">

				<Typography variant="body2" gutterBottom></Typography>
				<Paper className={classes.paper}>
					<Tooltip title={i18n.t("settings.settings.closeTicketApi.note")}>
						<FormControlLabel
							control={
								<IOSSwitch
									checked={settings && settings.length > 0 && getSettingValue("closeTicketApi") === "enabled"}
									onChange={handleChangeBooleanSetting} name="closeTicketApi"
								/>}
							label={i18n.t("settings.settings.closeTicketApi.name")}
						/>
					</Tooltip>
				</Paper>

				<Typography variant="body2" gutterBottom></Typography>
				<Paper className={classes.paper}>
					<Tooltip title={i18n.t("settings.settings.darkMode.note")}>
						<FormControlLabel
							control={
								<IOSSwitch
									checked={settings && settings.length > 0 && getSettingValue("darkMode") === "enabled"}
									onChange={handleChangeBooleanSetting} name="darkMode"
								/>}
							label={i18n.t("settings.settings.darkMode.name")}
						/>
					</Tooltip>
				</Paper>

				<Typography variant="body2" gutterBottom></Typography>
				<Paper className={classes.paper}>
					<Tooltip title={i18n.t("settings.settings.ASC.note")}>
						<FormControlLabel
							control={
								<IOSSwitch
									checked={settings && settings.length > 0 && getSettingValue("ASC") === "enabled"}
									onChange={handleChangeBooleanSetting} name="ASC"
								/>}
							label={i18n.t("settings.settings.ASC.name")}
						/>
					</Tooltip>
				</Paper>

				<Typography variant="body2" gutterBottom></Typography>
				<Paper className={classes.paper}>
					<Tooltip title={i18n.t("settings.settings.created.note")}>
						<FormControlLabel
							control={
								<IOSSwitch
									checked={settings && settings.length > 0 && getSettingValue("created") === "enabled"}
									onChange={handleChangeBooleanSetting} name="created"
								/>}
							label={i18n.t("settings.settings.created.name")}
						/>
					</Tooltip>
				</Paper>

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
							<option value="86400">
								{i18n.t("settings.settings.timeCreateNewTicket.options.86400")}
							</option>
							<option value="604800">
								{i18n.t("settings.settings.timeCreateNewTicket.options.604800")}
							</option>
							<option value="1296000">
								{i18n.t("settings.settings.timeCreateNewTicket.options.1296000")}
							</option>
							<option value="2592000">
								{i18n.t("settings.settings.timeCreateNewTicket.options.2592000")}
							</option>
						</Select>
					</Paper>
				</Tooltip>
			</Container>
		</div>
	);
};

export default Settings;
