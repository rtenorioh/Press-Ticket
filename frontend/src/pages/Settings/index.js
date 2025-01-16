import { Box, Container, makeStyles, Tab, Tabs } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io.js";
import Integrations from "../Integrations";
import ComponentSettings from "./ComponentSettings";
import Personalize from "./Personalize.js";

const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1,
		display: "flex",
		height: "92%",
		backgroundColor: theme.palette.background.paper,
		padding: theme.spacing(1),
	},
	tabs: {
		borderRight: `1px solid ${theme.palette.divider}`,
		minWidth: 200,
	},
	container: {
		padding: theme.spacing(0),
	},
}));

const Settings = ({ onThemeConfigUpdate }) => {
	const classes = useStyles();
	const { t } = useTranslation();
	const [settings, setSettings] = useState([]);
	const [tabValue, setTabValue] = useState(0);
	const { user } = useContext(AuthContext);
	const isMasterAdmin = process.env.REACT_APP_MASTERADMIN === 'ON';
	const isUserMaster = user?.profile === 'masteradmin';

	useEffect(() => {
		let isMounted = true;

		const fetchSession = async () => {
			try {
				const { data } = await api.get("/settings");
				if (isMounted) {
					setSettings(data);
				}
			} catch (err) {
				toastError(err);
			}
		};

		fetchSession();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		let isMounted = true;
		const socket = openSocket();

		socket.on("settings", (data) => {
			if (isMounted && data.action === "update") {
				setSettings((prevState) => {
					const aux = [...prevState];
					const settingIndex = aux.findIndex((s) => s.key === data.setting.key);
					if (settingIndex !== -1) {
						aux[settingIndex].value = data.setting.value;
					}
					return aux;
				});
			}
		});

		return () => {
			isMounted = false;
			socket.disconnect();
		};
	}, []);

	if (!t) {
		return <div>Loading...</div>;
	}

	const handleChangeBooleanSetting = async (e) => {
		const selectedValue = e.target.checked ? "enabled" : "disabled";
		const settingKey = e.target.name;

		try {
			await api.put(`/settings/${settingKey}`, {
				value: selectedValue,
			});
			toast.success(t("settings.success"));
		} catch (err) {
			toastError(err);
		}
	};

	const handleChangeSetting = async (e) => {
		const selectedValue = e.target.value;
		const settingKey = e.target.name;

		try {
			await api.put(`/settings/${settingKey}`, {
				value: selectedValue,
			});
			toast.success(t("settings.success"));
		} catch (err) {
			toastError(err);
		}
	};

	const getSettingValue = (key) => {
		const setting = settings.find((s) => s.key === key);
		return setting ? setting.value : "";
	};

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	const shouldShowTab = (tabName) => {
		const restrictedTabs = ['personalize'];
			
		if (!isMasterAdmin) {
			return true;
		}

		if (isUserMaster) {
			return true;
		}
			
		return !restrictedTabs.includes(tabName);
	};

	const tabList = [
		{ key: "personalize", label: t("settings.tabs.personalize"), component: <Personalize onThemeConfigUpdate={onThemeConfigUpdate} /> },
		{ key: "general", label: t("settings.tabs.general"), component: <ComponentSettings settings={settings} getSettingValue={getSettingValue} handleChangeBooleanSetting={handleChangeBooleanSetting} handleChangeSetting={handleChangeSetting} /> },
		{ key: "integrations", label: t("settings.tabs.integrations"), component: <Integrations /> }
	];

	const visibleTabs = tabList.filter(tab => shouldShowTab(tab.key));
	
	return (
		<div className={classes.root}>
			<Tabs
				orientation="vertical"
				variant="scrollable"
				value={tabValue}
				onChange={handleTabChange}
				className={classes.tabs}
			>
				{visibleTabs.map((tab, index) => (
				<Tab key={tab.key} label={tab.label} />
			))}
			</Tabs>
			<Box p={3}>
			{visibleTabs.map((tab, index) => (
				tabValue === index && (
					<Container key={tab.key} className={classes.container}>
						{tab.component}
					</Container>
				)
			))}
			</Box>
		</div>
	);
};

export default Settings;
