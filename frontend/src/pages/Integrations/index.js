import {
	CheckCircleOutlined,
	ErrorOutlined,
	Visibility,
	VisibilityOff,
} from "@mui/icons-material";
import {
	Box,
	CircularProgress,
	Container,
	Grid,
	IconButton,
	Paper,
	TextField,
	Typography
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const Root = styled('div')(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	padding: theme.spacing(2, 2, 3),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(1),
	marginBottom: 12,
}));

const IntegrationRow = styled('div')(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	marginBottom: theme.spacing(1),
	gap: theme.spacing(2),
}));

const TextFieldContainer = styled('div')(({ theme }) => ({
	position: "relative",
	width: "100%",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
	width: "100%",
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
	position: "absolute",
	right: theme.spacing(1),
	top: "50%",
	transform: "translateY(-50%)",
}));

const Integrations = () => {
	const { t } = useTranslation();

	const [integrations, setIntegrations] = useState([]);
	const [showKeys, setShowKeys] = useState({
		organization: false,
		apikey: false,
		hubToken: false,
		apiMaps: false
	});
	const [maskedValues, setMaskedValues] = useState({
		organization: "",
		apikey: "",
		hubToken: "",
		apiMaps: ""
	});
	const [hubTokenInfo, setHubTokenInfo] = useState(null);
	const [hubTokenStatus, setHubTokenStatus] = useState('idle');
	// 'idle' | 'loading' | 'valid' | 'invalid'

	const validateHubToken = async (token) => {
		if (!token) return;
		setHubTokenStatus('loading');
		try {
			const response = await axios.post(
				'https://api.pressticket.com.br/validate-token/',
				{ token },
				{
					timeout: 10000,
					headers: { 'Content-Type': 'application/json' }
				}
			);
			if (response.data?.isValid) {
				setHubTokenInfo(response.data.info);
				setHubTokenStatus('valid');
			} else {
				setHubTokenInfo(null);
				setHubTokenStatus('invalid');
			}
		} catch {
			setHubTokenInfo(null);
			setHubTokenStatus('idle');
		}
	};

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
				const hubIntegration = data.find((s) => s.key === 'hubToken');
				if (hubIntegration?.value) {
					validateHubToken(hubIntegration.value);
				}
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
			toast.success(t("integrations.success"));

			setMaskedValues((prevState) => ({
				...prevState,
				[integrationKey]: maskValue(selectedValue),
			}));

			setIntegrations((prevIntegrations) =>
				prevIntegrations.map((integration) =>
					integration.key === integrationKey
						? { ...integration, value: selectedValue }
						: integration
				)
			);

			if (integrationKey === 'hubToken') {
				validateHubToken(selectedValue);
			}
		} catch (err) {
			toastError(err, t);
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
		<Root>
			<Container>
				<Title>{t("integrations.title")}</Title>
				<StyledPaper>
					<IntegrationRow>
						<Typography align="left" variant="body1">
							{t("integrations.integrations.openai.title")}
						</Typography>

						<TextFieldContainer>
							<StyledTextField
								id="organization"
								name="organization"
								margin="dense"
								label={t("integrations.integrations.openai.organization")}
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
							<StyledIconButton
								onClick={() => handleToggleShowKey("organization")}
							>
								{showKeys["organization"] ? <VisibilityOff /> : <Visibility />}
							</StyledIconButton>
						</TextFieldContainer>

						<TextFieldContainer>
							<StyledTextField
								id="apikey"
								name="apikey"
								label={t("integrations.integrations.openai.apikey")}
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
							<StyledIconButton
								onClick={() => handleToggleShowKey("apikey")}
							>
								{showKeys["apikey"] ? <VisibilityOff /> : <Visibility />}
							</StyledIconButton>
						</TextFieldContainer>
					</IntegrationRow>
				</StyledPaper>

				<StyledPaper>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<IntegrationRow>
								<Typography align="left" variant="body1">
									{t("integrations.integrations.hub.title")}
								</Typography>

								<Box sx={{ flex: 1 }}>
									<TextFieldContainer>
										<StyledTextField
											id="hubToken"
											name="hubToken"
											margin="dense"
											label={t("integrations.integrations.hub.hubToken")}
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
										<StyledIconButton
											onClick={() => handleToggleShowKey("hubToken")}
										>
											{showKeys["hubToken"] ? <VisibilityOff /> : <Visibility />}
										</StyledIconButton>
									</TextFieldContainer>

									{hubTokenStatus === 'loading' && (
										<Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
											<CircularProgress size={12} />
											<Typography variant="caption" color="text.secondary">
												Verificando token...
											</Typography>
										</Box>
									)}

									{hubTokenStatus === 'valid' && hubTokenInfo && (
										<Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
											<CheckCircleOutlined sx={{ color: 'success.main', fontSize: 16 }} />
											<Typography variant="caption" color="success.main">
												{console.log(hubTokenInfo)}
												{hubTokenInfo.name}
												{hubTokenInfo.email ? ` — ${hubTokenInfo.email}` : ''}
											</Typography>
										</Box>
									)}

									{hubTokenStatus === 'invalid' && (
										<Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
											<ErrorOutlined sx={{ color: 'error.main', fontSize: 16 }} />
											<Typography variant="caption" color="error.main">
												Token inválido ou não autorizado
											</Typography>
										</Box>
									)}
								</Box>
							</IntegrationRow>
						</Grid>
					</Grid>
				</StyledPaper>

				<StyledPaper>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<IntegrationRow>
								<Typography align="left" variant="body1">
									{t("integrations.integrations.maps.title")}
								</Typography>

								<TextFieldContainer>
									<StyledTextField
										id="apiMaps"
										name="apiMaps"
										margin="dense"
										label={t("integrations.integrations.maps.apiMaps")}
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
									<StyledIconButton
										onClick={() => handleToggleShowKey("apiMaps")}
									>
										{showKeys["apiMaps"] ? <VisibilityOff /> : <Visibility />}
									</StyledIconButton>
								</TextFieldContainer>
							</IntegrationRow>
						</Grid>
					</Grid>
				</StyledPaper>
			</Container>
		</Root>
	);
};

export default Integrations;
