import {
	Autocomplete,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	TextField,
	Typography,
	Box,
	MenuItem,
	Select,
	Tabs,
	Tab
} from "@mui/material";
import { green } from "@mui/material/colors";
import { styled, useTheme } from "@mui/material/styles";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
	Field,
	FieldArray,
	Form,
	Formik,
} from "formik";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const StyledDialog = styled(Dialog)(({ theme }) => ({
	'& .MuiDialogTitle-root': {
		backgroundColor: theme.palette.primary.main,
		color: '#fff',
		'& .MuiTypography-root': {
			fontWeight: 500,
		},
		padding: theme.spacing(2),
	},
	'& .MuiDialogContent-root': {
		padding: theme.spacing(3),
	},
	'& .MuiDialogActions-root': {
		padding: theme.spacing(2),
		backgroundColor: '#f5f5f5',
	},
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
	flex: 1,
	'& .MuiOutlinedInput-root': {
		borderRadius: theme.shape.borderRadius,
	},
}));

const ExtraAttr = styled('div')(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: theme.spacing(1),
	marginBottom: theme.spacing(2),
}));

const BtnWrapper = styled('div')(({ theme }) => ({
	position: "relative",
}));

const FieldContainer = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	width: "100%",
	marginBottom: theme.spacing(2),
}));

const FieldLabel = styled(Typography)(({ theme }) => ({
	marginBottom: theme.spacing(0.5),
	fontWeight: 500,
	fontSize: '0.875rem',
}));

const FormContainer = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	width: "100%",
	gap: theme.spacing(1),
}));

const FieldRow = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "row",
	gap: theme.spacing(2),
	width: "100%",
	marginBottom: theme.spacing(2),
	[theme.breakpoints.down('sm')]: {
		flexDirection: "column",
	},
}));

const ButtonProgress = styled(CircularProgress)(({ theme }) => ({
	color: green[500],
	position: "absolute",
	top: "50%",
	left: "50%",
	marginTop: -12,
	marginLeft: -12,
}));

const initialState = {
	name: "",
	number: "",
	address: "",
	email: "",
	extraInfo: [],
	birthdate: "",
	gender: "",
	status: "",
	createdAt: "",
	lastContactAt: "",
	country: "",
	zip: "",
	addressNumber: "",
	addressComplement: "",
	neighborhood: "",
	city: "",
	state: "",
	cpf: "",
};

const ContactSchema = Yup.object().shape({
	name: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
	email: Yup.string().email("Invalid email"),
});

const ContactModal = ({ open, onClose, contactId, initialValues, onSave }) => {
	const { user } = useContext(AuthContext);
	const [contact, setContact] = useState(initialState);
	const [countries, setCountries] = useState([]);
	const [tab, setTab] = useState(0);
	const { t } = useTranslation();
	const theme = useTheme();
	const [loadingCep, setLoadingCep] = useState(false);
	const [clientStatusList, setClientStatusList] = useState([]);

	const formatPhoneNumber = (number) => {
		if (!number) return "-";
		if (number.startsWith('55') && number.length === 13) {
			const ddd = number.slice(2, 4);
			const firstPart = number.slice(4, 9);
			const secondPart = number.slice(9);
			return `(${ddd}) ${firstPart}-${secondPart}`;
		} else if (number.startsWith('55') && number.length === 12) {
			const ddd = number.slice(2, 4);
			const firstPart = number.slice(4, 8);
			const secondPart = number.slice(8);
			return `(${ddd}) ${firstPart}-${secondPart}`;
		}
		return number;
	};

	const fetchAddressFromViaCep = async (cep, setFieldValue) => {
		try {
			setLoadingCep(true);
			const cleanCep = cep.replace(/\D/g, '');
			
			if (cleanCep.length !== 8) {
				return;
			}

			const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
			const data = await response.json();
			
			if (!data.erro) {
				setFieldValue("address", data.logradouro || "");
				setFieldValue("neighborhood", data.bairro || "");
				setFieldValue("city", data.localidade || "");
				setFieldValue("state", data.uf || "");
				toast.success("Endereço encontrado!");
			} else {
				toast.error("CEP não encontrado!");
			}
		} catch (error) {
			console.error("Erro ao buscar o endereço no ViaCEP:", error);
			toast.error("Erro ao buscar o endereço.");
		} finally {
			setLoadingCep(false);
		}
	};

	useEffect(() => {
		const fetchClientStatus = async () => {
			try {
				const { data } = await api.get("/client-status/");
				setClientStatusList(data.clientStatus || []);
			} catch (err) {
				console.error("Erro ao carregar status de clientes:", err);
			}
		};
		fetchClientStatus();
	}, []);

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const response = await fetch("https://restcountries.com/v3.1/all?fields=name");
				const data = await response.json();
				const countryNames = data
				.map((country) => country.name.common)
				.sort((a, b) => a.localeCompare(b));
				setCountries(countryNames);
			} catch (error) {
				// Falha silenciosa - API externa pode estar indisponível
				// Usuário ainda pode digitar país manualmente
				setCountries([]);
			}
		};
	
		fetchCountries();
	}, []);

	useEffect(() => {
		const abortController = new AbortController();
		const fetchContact = async () => {
			try {
				if (initialValues) {
					setContact((prev) => ({ ...prev, ...initialValues }));
				}

				if (contactId) {
					const { data } = await api.get(`/contacts/${contactId}`, {
						signal: abortController.signal,
					})

					const formattedData = {
						...data,
						birthdate: data.birthdate ? new Date(data.birthdate).toISOString().split('T')[0] : "",
						lastContactAt: data.lastContactAt || null,
					};
					
					setContact(formattedData);
				}
			} catch (err) {
				if (!abortController.signal.aborted) {
					toastError(err);
				}
			}
		};

		if (open) {
			fetchContact();
		}
		return () => abortController.abort();
	}, [open, contactId, initialValues]);

	const handleClose = () => {
		onClose();
		setContact(initialState);
		setTab(0);
	};

	const handleSaveContact = async (values) => {
		try {
			const dataToSend = {
				...values,
				birthdate: values.birthdate || null,
			};

			if (contactId) {
				await api.put(`/contacts/${contactId}`, dataToSend);
			} else {
				const { data } = await api.post("/contacts", dataToSend);
				if (onSave) onSave(data);
			}
			toast.success(t("contactModal.success"));
			handleClose();
		} catch (err) {
			console.error("Erro ao salvar contato:", err.response?.data);
			if (err.response && err.response.status === 400 &&
				(err.response.data.error?.includes("number") || err.response.data.message?.includes("number"))) {
				toast.error(t("contactModal.numberError") || "Número de WhatsApp inválido. Verifique e tente novamente.");
			} else {
				toastError(err, t);
			}
		}
	};

	return (
		<StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth scroll="paper">
			<DialogTitle>
				{contactId
					? t("contactModal.title.edit")
					: t("contactModal.title.add")}
			</DialogTitle>
			<Formik
				initialValues={contact}
				enableReinitialize
				validationSchema={ContactSchema}
				onSubmit={async (values, actions) => {
					await handleSaveContact(values);
					actions.setSubmitting(false);
				}}
			>
				{({ values, errors, touched, isSubmitting, setFieldValue }) => (
					<Form>
						<DialogContent dividers>
							<FormContainer>
								<Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile>
									<Tab label={t("contactModal.form.mainInfo")} />
									<Tab label={t("contactModal.form.contact", { defaultValue: "Contato" })} />
									<Tab label={t("contactModal.form.address")} />
									<Tab label={t("contactModal.form.extraInfo")} />
								</Tabs>

								{tab === 0 && (
									<>
										<FieldRow>
											<FieldContainer>
												<FieldLabel>{t("contactModal.form.name")}</FieldLabel>
												<Field as={StyledTextField} name="name" autoFocus error={touched.name && Boolean(errors.name)} helperText={touched.name && errors.name} variant="outlined" fullWidth />
											</FieldContainer>
											<FieldContainer>
												<FieldLabel>{t("contacts.fields.cpf", { defaultValue: "CPF/CNPJ" })}</FieldLabel>
												<Field 
													as={StyledTextField} 
													name="cpf" 
													fullWidth 
													variant="outlined"
													placeholder="000.000.000-00 ou 00.000.000/0000-00"
													onChange={(e) => {
														const value = e.target.value.replace(/\D/g, '');
														setFieldValue("cpf", value);
													}}
													value={
														values.cpf 
															? values.cpf.length <= 11
																? values.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') 
																: values.cpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') 
															: ''
													}
													inputProps={{ maxLength: 18 }}
												/>
											</FieldContainer>
										</FieldRow>
										<FieldRow>
											<FieldContainer>
												<FieldLabel>{t("contacts.fields.birthdate", { defaultValue: "Data de nascimento" })}</FieldLabel>
												<Field as={StyledTextField} name="birthdate" type="date" InputLabelProps={{ shrink: true }} fullWidth variant="outlined" />
											</FieldContainer>
											<FieldContainer>
												<FieldLabel>{t("contacts.fields.gender", { defaultValue: "Gênero" })}</FieldLabel>
													<Field as={Select} name="gender" fullWidth variant="outlined" displayEmpty>
														<MenuItem value="">{t("common.select", { defaultValue: "Selecione" })}</MenuItem>
														<MenuItem value="Masculino">Masculino</MenuItem>
														<MenuItem value="Feminino">Feminino</MenuItem>
														<MenuItem value="Não-binário">Não-binário</MenuItem>
														<MenuItem value="Prefiro não informar">Prefiro não informar</MenuItem>
														<MenuItem value="Outro">Outro</MenuItem>
													</Field>
												</FieldContainer>

												{values.gender === "Outro" && (
													<FieldContainer>
														<FieldLabel>{t("contactModal.form.otherGender", { defaultValue: "Informe o gênero" })}</FieldLabel>
														<Field as={StyledTextField} name="otherGender" variant="outlined" fullWidth />
													</FieldContainer>
												)}
												<FieldContainer>
												<FieldLabel>{t("contacts.fields.status", { defaultValue: "Status" })}</FieldLabel>
												<Field as={Select} name="status" fullWidth variant="outlined" displayEmpty>
													<MenuItem value="">{t("common.select", { defaultValue: "Selecione" })}</MenuItem>
													{clientStatusList.map((status) => (
														<MenuItem key={status.id} value={status.name}>{status.name}</MenuItem>
													))}
												</Field>
											</FieldContainer>
										</FieldRow>
									</>
								)}

								{tab === 1 && (
									<>
										<FieldRow>
											<FieldContainer>
												<FieldLabel>{t("contacts.fields.createdAt", { defaultValue: "Data de cadastrado" })}</FieldLabel>
												<TextField 
													value={values.createdAt ? new Date(values.createdAt).toLocaleString('pt-BR', { 
														day: '2-digit', 
														month: '2-digit', 
														year: 'numeric', 
														hour: '2-digit', 
														minute: '2-digit' 
													}) : ""} 
													fullWidth 
													variant="outlined" 
													disabled 
												/>
											</FieldContainer>
											<FieldContainer>
												<FieldLabel>{t("contacts.fields.lastContactAt", { defaultValue: "Último contato" })}</FieldLabel>
												<TextField 
													value={values.lastContactAt ? new Date(values.lastContactAt).toLocaleString('pt-BR', { 
														day: '2-digit', 
														month: '2-digit', 
														year: 'numeric', 
														hour: '2-digit', 
														minute: '2-digit' 
													}) : ""} 
													fullWidth 
													variant="outlined" 
													disabled 
												/>
											</FieldContainer>
										</FieldRow>
										<FieldContainer>
											<FieldLabel>{t("contactModal.form.number")}</FieldLabel>
											<Field 
												as={StyledTextField} 
												name="number" 
												error={touched.number && Boolean(errors.number)} 
												helperText={touched.number && errors.number} 
												placeholder="5522999999999" 
												variant="outlined" 
												fullWidth 
												disabled={!!contactId || (user?.isTricked !== "enabled" && !!contactId)}
												value={
													user?.isTricked === "enabled" 
														? values.number
														: values.number 
															? formatPhoneNumber(values.number).slice(0, -4) + "****"
															: ""
												}
												InputProps={{
													readOnly: user?.isTricked !== "enabled" && !!contactId
												}}
											/>
										</FieldContainer>
										<FieldContainer>
											<FieldLabel>{t("contactModal.form.email")}</FieldLabel>
											<Field as={StyledTextField} name="email" error={touched.email && Boolean(errors.email)} helperText={touched.email && errors.email} fullWidth variant="outlined" />
										</FieldContainer>
									</>
								)}

								{tab === 2 && (
									<>
										<FieldRow>
										<FieldContainer>
											<FieldLabel>{t("contacts.fields.country", { defaultValue: "País" })}</FieldLabel>
											<Field as={Autocomplete} 
												name="country"
												options={countries}
												getOptionLabel={(option) => option}
												renderInput={(params) => <TextField {...params} variant="outlined" />}
												fullWidth
												onChange={(event, newValue) => {
												setFieldValue("country", newValue);
												}}
												renderOption={(props, option) => (
												<li {...props} key={option}>
													{option}
												</li>
												)}
											/>
											</FieldContainer>
											<FieldContainer>
												<FieldLabel>{t("contacts.fields.zip", { defaultValue: "CEP" })}</FieldLabel>
												<Field
													as={StyledTextField}
													name="zip"
													fullWidth
													variant="outlined"
													placeholder={values.country === "Brazil" || values.country === "Brasil" ? "00000-000" : ""}
													value={
														(values.country === "Brazil" || values.country === "Brasil") && values.zip
															? values.zip.replace(/(\d{5})(\d)/, '$1-$2')
															: values.zip || ''
													}
													onChange={(e) => {
														const value = e.target.value.replace(/\D/g, '');
														setFieldValue("zip", value);
														
														if ((values.country === "Brazil" || values.country === "Brasil") && value.length === 8) {
															fetchAddressFromViaCep(value, setFieldValue);
														}
													}}
													inputProps={{
														maxLength: (values.country === "Brazil" || values.country === "Brasil") ? 9 : 20
													}}
													InputProps={{
														endAdornment: loadingCep && (
															<CircularProgress size={20} />
														)
													}}
												/>
											</FieldContainer>
										</FieldRow>
										<FieldRow>
											<FieldContainer>
												<FieldLabel>{t("contactModal.form.address")}</FieldLabel>
												<Field 
													as={StyledTextField} 
													name="address" 
													fullWidth 
													variant="outlined"
													disabled={(values.country === "Brazil" || values.country === "Brasil") || loadingCep}
												/>
											</FieldContainer>
										</FieldRow>
										<FieldRow>
											<FieldContainer>
												<FieldLabel>{t("contacts.fields.number", { defaultValue: "Número" })}</FieldLabel>
												<Field 
													as={StyledTextField} 
													name="addressNumber" 
													fullWidth 
													variant="outlined"
													onChange={(e) => {
														const value = e.target.value.replace(/\D/g, '');
														setFieldValue("addressNumber", value);
													}}
												/>
											</FieldContainer>
											<FieldContainer>
												<FieldLabel>{t("contacts.fields.complement", { defaultValue: "Complemento" })}</FieldLabel>
												<Field as={StyledTextField} name="addressComplement" fullWidth variant="outlined" />
											</FieldContainer>
										</FieldRow>
										<FieldRow>
											<FieldContainer>
												<FieldLabel>{t("contacts.fields.neighborhood", { defaultValue: "Bairro" })}</FieldLabel>
												<Field 
													as={StyledTextField} 
													name="neighborhood" 
													fullWidth 
													variant="outlined"
													disabled={(values.country === "Brazil" || values.country === "Brasil") || loadingCep}
												/>
											</FieldContainer>
											<FieldContainer>
												<FieldLabel>{t("contacts.fields.city", { defaultValue: "Cidade" })}</FieldLabel>
												<Field 
													as={StyledTextField} 
													name="city" 
													fullWidth 
													variant="outlined"
													disabled={(values.country === "Brazil" || values.country === "Brasil") || loadingCep}
												/>
											</FieldContainer>
											<FieldContainer>
												<FieldLabel>{t("contacts.fields.state", { defaultValue: "Estado" })}</FieldLabel>
												<Field 
													as={StyledTextField} 
													name="state" 
													fullWidth 
													variant="outlined"
													disabled={(values.country === "Brazil" || values.country === "Brasil") || loadingCep}
												/>
											</FieldContainer>
										</FieldRow>
									</>
								)}

								{tab === 3 && (
									<>
										<FieldArray name="extraInfo">
											{({ push, remove }) => (
												<>
													{values.extraInfo && values.extraInfo.map((info, index) => (
														<ExtraAttr key={`${index}-info`}>
															<Field as={StyledTextField} name={`extraInfo[${index}].name`} placeholder={t("contactModal.form.extraName")} variant="outlined" />
															<Field as={StyledTextField} name={`extraInfo[${index}].value`} placeholder={t("contactModal.form.extraValue")} variant="outlined" />
															<IconButton size="small" onClick={() => remove(index)}>
																<DeleteOutlineIcon />
															</IconButton>
														</ExtraAttr>
													))}
													<Button variant="outlined" fullWidth size="medium" startIcon={<span>+</span>} onClick={() => push({ name: "", value: "" })} sx={{ mt: 1, mb: 2, color: theme.palette.text.primary, textTransform: 'uppercase', fontWeight: 'bold' }}>
														{t("contactModal.buttons.addExtraInfo")}
													</Button>
												</>
											)}
										</FieldArray>
									</>
								)}

							</FormContainer>
						</DialogContent>
						<DialogActions>
							<Button onClick={handleClose} disabled={isSubmitting} variant="contained" sx={{ borderRadius: 20, px: 3, backgroundColor: '#e0e0e0', color: '#757575', '&:hover': { backgroundColor: '#d5d5d5' }, textTransform: 'uppercase', fontWeight: 'bold' }}>
								{t("contactModal.buttons.cancel")}
							</Button>
							<BtnWrapper>
								<Button type="submit" disabled={isSubmitting} variant="contained" sx={{ borderRadius: 20, px: 3, backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark }, textTransform: 'uppercase', fontWeight: 'bold', position: 'relative' }}>
									{contactId ? t("contactModal.buttons.okEdit") : t("contactModal.buttons.okAdd")}
								</Button>
								{isSubmitting && (<ButtonProgress size={24} />)}
							</BtnWrapper>
						</DialogActions>
					</Form>
				)}
			</Formik>
		</StyledDialog>
	);
};

export default ContactModal;
