import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import openSocket from "../../services/socket-io";

const useAuth = () => {
	const history = useHistory();
	const { t } = useTranslation();
	const [isAuth, setIsAuth] = useState(false);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState({});

	const handleLogout = () => {
		localStorage.removeItem("token");
		setIsAuth(false);
		setUser({});
		history.push("/login");
	};

	useEffect(() => {
		const checkAuth = async () => {
			const token = localStorage.getItem("token");
			if (token) {
				try {
					const { data } = await api.post("/auth/refresh_token");
					api.defaults.headers.Authorization = `Bearer ${data.token}`;
					localStorage.setItem("token", JSON.stringify(data.token));
					setIsAuth(true);
					setUser(data.user);
				} catch (err) {
					handleLogout();
				}
			}
			setLoading(false);
		};

		checkAuth();
	}, []);

	useEffect(() => {
		let socket;

		const connectSocket = () => {
			socket = openSocket();

			socket.on("connect", () => {
				console.log("Socket connected");
			});

			socket.on("disconnect", () => {
				console.log("Socket disconnected");
				setTimeout(connectSocket, 5000);
			});

			socket.on("userSessionExpired", data => {
				if (data.userId === user.id && localStorage.getItem("token")) {
					handleLogout();
					toast.error(data.message || t("auth.toasts.session_expired"));
				}
			});

			socket.on("userSessionUpdate", data => {
				if (data.userId === user.id) {
					setUser(prevUser => ({
						...prevUser,
						online: data.online
					}));
				}
			});
		};

		if (isAuth) {
			connectSocket();
		}

		return () => {
			if (socket) {
				socket.disconnect();
			}
		};
	}, [user.id, isAuth, t]);

	const handleLogin = async (userData) => {
		try {
			const { data } = await api.post("/auth/login", userData);
			localStorage.setItem("token", JSON.stringify(data.token));
			api.defaults.headers.Authorization = `Bearer ${data.token}`;
			setUser(data.user);
			setIsAuth(true);
			toast.success(t("auth.toasts.success"));
			history.push("/tickets");
		} catch (err) {
			toast.error(t("auth.toasts.error"));
		}
	};

	return { isAuth, user, loading, handleLogin, handleLogout };
};

export default useAuth;
