import { Box, Container, Tab, Tabs, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
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
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

const SettingsContainer = styled(Paper)(({ theme }) => ({
	flex: 1,
	display: "flex",
	backgroundColor: theme.palette.background.paper,
	borderRadius: theme.shape.borderRadius,
	boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
	overflow: "hidden",
	margin: theme.spacing(2),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
	borderRight: `1px solid ${theme.palette.divider}`,
	minWidth: 220,
	backgroundColor: theme.palette.background.default,
	'& .MuiTab-root': {
		textAlign: 'left',
		alignItems: 'flex-start',
		padding: theme.spacing(2, 3),
		minHeight: 48,
		'&.Mui-selected': {
			backgroundColor: theme.palette.background.paper,
			color: theme.palette.primary.main,
			fontWeight: 600,
		},
	},
	'& .MuiTabs-indicator': {
		left: 0,
		right: 'auto',
		width: 4,
	},
}));

const ContentContainer = styled(Box)(({ theme }) => ({
	flex: 1,
	padding: theme.spacing(3),
	overflow: "auto",
	...theme.scrollbarStyles,
}));

const TabContainer = styled(Container)(({ theme }) => ({
	padding: theme.spacing(0),
	width: '100%',
}));

const Settings = ({ toggleTheme, onThemeConfigUpdate }) => {
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
			
			setSettings((prevState) => {
				const aux = [...prevState];
				const settingIndex = aux.findIndex((s) => s.key === settingKey);
				if (settingIndex !== -1) {
					aux[settingIndex].value = selectedValue;
				}
				return aux;
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
			
			setSettings((prevState) => {
				const aux = [...prevState];
				const settingIndex = aux.findIndex((s) => s.key === settingKey);
				if (settingIndex !== -1) {
					aux[settingIndex].value = selectedValue;
				}
				return aux;
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
		{ key: "personalize", label: t("settings.tabs.personalize"), component: <Personalize toggleTheme={toggleTheme} onThemeConfigUpdate={onThemeConfigUpdate} /> },
		{ key: "general", label: t("settings.tabs.general"), component: <ComponentSettings settings={settings} getSettingValue={getSettingValue} handleChangeBooleanSetting={handleChangeBooleanSetting} handleChangeSetting={handleChangeSetting} /> },
		{ key: "integrations", label: t("settings.tabs.integrations"), component: <Integrations /> }
	];

	const visibleTabs = tabList.filter(tab => shouldShowTab(tab.key));
	
	return (
		<MainContainer>
			<MainHeader>
				<Title>{t("settings.title")}</Title>
			</MainHeader>
			<SettingsContainer>
				<StyledTabs
					orientation="vertical"
					variant="scrollable"
					value={tabValue}
					onChange={handleTabChange}
				>
					{visibleTabs.map((tab, index) => (
						<Tab key={tab.key} label={tab.label} />
					))}
				</StyledTabs>
				<ContentContainer>
					{visibleTabs.map((tab, index) => (
						tabValue === index && (
							<TabContainer key={tab.key}>
								{tab.component}
							</TabContainer>
						)
					))}
				</ContentContainer>
			</SettingsContainer>
		</MainContainer>
	);
};

export default Settings;
