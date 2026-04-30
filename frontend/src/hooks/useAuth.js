import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSocket } from "../context/SocketContext";
import toastError from "../errors/toastError";
import api, { markUserAsInactive } from "../services/api";

const useAuth = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});
    const { socket } = useSocket();

    const [sessionExpired, setSessionExpired] = useState(false);

    const handleLogout = useCallback(async () => {
        try {
            await api.delete("/auth/logout");
        } catch (err) {
            console.error("Erro ao fazer logout:", err);
        }
        
        if (socket) {
            socket.emit("logout");
            socket.disconnect();
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuth(false);
        setUser({});
        navigate("/login");
    }, [navigate, socket]);

    const handleSessionExpiredConfirm = useCallback(async () => {
        setSessionExpired(false);
        await handleLogout();
    }, [handleLogout]);

    useEffect(() => {
        const onSessionExpired = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            delete api.defaults.headers.Authorization;
            setIsAuth(false);
            setUser({});
            setLoading(false);
            setSessionExpired(true);
            navigate("/login");
        };
        window.addEventListener("session:expired", onSessionExpired);
        return () => window.removeEventListener("session:expired", onSessionExpired);
    }, [navigate]);

    useEffect(() => {
        if (!socket) return;
        const onUserSessionExpired = (data) => {
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            if (storedUser.id && String(data.userId) === String(storedUser.id)) {
                setSessionExpired(true);
            }
        };
        socket.on("userSessionExpired", onUserSessionExpired);
        return () => socket.off("userSessionExpired", onUserSessionExpired);
    }, [socket]);

    const [userInactive, setUserInactive] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (userInactive) {
                setLoading(false);
                return;
            }

            const tokenStr = localStorage.getItem("token");
            if (!tokenStr) {
                setIsAuth(false);
                setLoading(false);
                return;
            }

            try {
                const token = JSON.parse(tokenStr);
                api.defaults.headers.Authorization = `Bearer ${token}`;

                const { data } = await api.post("/auth/refresh_token");
                api.defaults.headers.Authorization = `Bearer ${data.token}`;
                localStorage.setItem("token", JSON.stringify(data.token));
                localStorage.setItem("user", JSON.stringify(data.user));
                setIsAuth(true);
                setUser(data.user);
                setLoading(false);
            } catch (err) {
                if (err?.response?.data?.error === "ERR_USER_INACTIVE") {
                    setUserInactive(true);
                    markUserAsInactive();

                    toast.error(t("backendErrors.ERR_USER_INACTIVE") || "Este atendente está desativado!", {
                        autoClose: 10000,
                        onClose: () => {
                            navigate("/login");
                        }
                    });
                } else if (err?.response?.data?.error === "ERR_SESSION_EXPIRED") {
                    console.log("Sessão expirada detectada no checkAuth");
                }

                localStorage.removeItem("token");
                localStorage.removeItem("user");
                delete api.defaults.headers.Authorization;
                setIsAuth(false);
                setUser({});
                setLoading(false);
            }
        };

        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogin = async (userData) => {
        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", userData);
            localStorage.setItem("token", JSON.stringify(data.token));
            localStorage.setItem("user", JSON.stringify(data.user));
            api.defaults.headers.Authorization = `Bearer ${data.token}`;
            setUser(data.user);
            setIsAuth(true);
            toast.success(t("auth.toasts.success"));
            navigate("/tickets");
            setLoading(false);
        } catch (err) {
            toastError(err);
            setLoading(false);
        }
    };

    return { isAuth, user, loading, handleLogin, handleLogout, sessionExpired, handleSessionExpiredConfirm };
};

export default useAuth;
