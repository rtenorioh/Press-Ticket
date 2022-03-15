import React, { useState, useEffect } from "react";
import openSocket from "../../services/socket-io";

import { makeStyles, withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import { toast } from "react-toastify";

import Tooltip from "@material-ui/core/Tooltip";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

const useStyles = makeStyles(theme => ({
	root: {
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
  }))(({ classes, ...props }) => {
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
		} catch (err) {
			toastError(err);
		}
	};
	const handleChangeSetting = async e => {
		const selectedValue = e.target.checked ? "enabled" : "disabled";
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
					<FormControlLabel
						control={<IOSSwitch checked={settings && settings.length > 0 && getSettingValue("userCreation") === "enabled"} onChange={handleChangeBooleanSetting} name="userCreation" />}
						label={i18n.t("settings.settings.userCreation.name")}
					/>
				</Paper>
				<Paper className={classes.paper}>
					<FormControlLabel
						control={<IOSSwitch checked={settings && settings.length > 0 && getSettingValue("CheckMsgIsGroup") === "enabled"} onChange={handleChangeBooleanSetting} name="CheckMsgIsGroup" />}
						label={i18n.t("settings.settings.CheckMsgIsGroup.name")}
					/>
				</Paper>
				
				<Paper className={classes.paper}>
					<FormControlLabel
						control={<IOSSwitch checked={settings && settings.length > 0 && getSettingValue("call") === "enabled"} onChange={handleChangeBooleanSetting} name="call" />}
						label={i18n.t("settings.settings.call.name")}
					/>
				</Paper>
				<Paper className={classes.paper}>
					<TextField
						id="api-token-setting"
						readonly
						label="Token Api"
						margin="dense"
						variant="outlined"
						fullWidth
						value={settings && settings.length > 0 && getSettingValue("userApiToken")}
					/>
				</Paper>
				

			</Container>
		</div>
	);
};

export default Settings;
