import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useSocket } from "../../context/SocketContext";

const useAuth = () => {
    const history = useHistory();
    const { t } = useTranslation();
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});
    const { socket } = useSocket();

    const handleLogout = useCallback(() => {
        if (socket) {
            socket.emit("logout");
            socket.disconnect();
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuth(false);
        setUser({});
        history.push("/login");
    }, [history, socket]);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const { data } = await api.post("/auth/refresh_token");
                    api.defaults.headers.Authorization = `Bearer ${data.token}`;
                    localStorage.setItem("token", JSON.stringify(data.token));
                    localStorage.setItem("user", JSON.stringify(data.user));
                    setIsAuth(true);
                    setUser(data.user);
                } catch (err) {
                    handleLogout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [handleLogout]);

    useEffect(() => {
        let socket;

        if (isAuth && user.id) {
            socket = socket;

            if (socket) {
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
            }
        }

        return () => {
            if (!isAuth && socket) {
                socket.emit("logout");
                socket.disconnect();
            }
        };
    }, [user.id, isAuth, t, handleLogout]);

    const handleLogin = async (userData) => {
        try {
            const { data } = await api.post("/auth/login", userData);
            localStorage.setItem("token", JSON.stringify(data.token));
            localStorage.setItem("user", JSON.stringify(data.user));
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
