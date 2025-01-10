import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";

const useAuth = () => {
	const history = useHistory();
	const { t } = useTranslation();
	const [isAuth, setIsAuth] = useState(false);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState({});

	api.interceptors.request.use(
		config => {
			const token = localStorage.getItem("token");
			if (token) {
				config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
				setIsAuth(true);
			}
			return config;
		},
		error => {
			Promise.reject(error);
		}
	);

	api.interceptors.response.use(
		(response) => response,
		async (error) => {
			const originalRequest = error.config;
			if (
				error.response?.status === 401 &&
				!originalRequest._retry &&
				error.response?.data?.error === "ERR_SESSION_EXPIRED"
			) {
				originalRequest._retry = true;
				try {
					const { data } = await api.post("/auth/refresh_token");
					localStorage.setItem("token", JSON.stringify(data.token));
					api.defaults.headers.Authorization = `Bearer ${data.token}`;
					return api(originalRequest);
				} catch (err) {
					localStorage.removeItem("token");
					setIsAuth(false);
					toastError("Sessão expirada. Faça login novamente.");
				}
			}
			return Promise.reject(error);
		}
	);

	useEffect(() => {
		const fetchToken = async () => {
			const token = localStorage.getItem("token");
			if (token) {
				try {
					const { data } = await api.post("/auth/refresh_token");
					localStorage.setItem("token", JSON.stringify(data.token));
					api.defaults.headers.Authorization = `Bearer ${data.token}`;
					setIsAuth(true);
					setUser(data.user);
				} catch (err) {
					setIsAuth(false);
					localStorage.removeItem("token");
					toastError("Sessão expirada. Faça login novamente.");
				}
			}
			setLoading(false);
		};

		fetchToken();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on("user", data => {
			if (data.action === "update" && data.user.id === user.id) {
				setUser(data.user);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [user]);

	const handleLogin = async userData => {
		setLoading(true);

		try {
			const { data } = await api.post("/auth/login", userData);
			localStorage.setItem("token", JSON.stringify(data.token));
			api.defaults.headers.Authorization = `Bearer ${data.token}`;
			setUser(data.user);
			setIsAuth(true);
			toast.success(t("auth.toasts.success"));
			history.push("/tickets");
			setLoading(false);
		} catch (err) {
			toastError(err, t);
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		setLoading(true);

		try {
			await api.delete("/auth/logout");
			setIsAuth(false);
			setUser({});
			localStorage.removeItem("token");
			api.defaults.headers.Authorization = undefined;
			setLoading(false);
			history.push("/login");
		} catch (err) {
			toastError(err, t);
			setLoading(false);
		}
	};

	return { isAuth, user, loading, handleLogin, handleLogout };
};

export default useAuth;
