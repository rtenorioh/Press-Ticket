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

    const [userInactive, setUserInactive] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (userInactive) {
                setLoading(false);
                return;
            }

            const tokenStr = localStorage.getItem("token");
            if (tokenStr) {
                try {
                    const token = JSON.parse(tokenStr);
                    api.defaults.headers.Authorization = `Bearer ${token}`;
                    
                    try {
                        const userStr = localStorage.getItem("user");
                        if (userStr) {
                            const storedUser = JSON.parse(userStr);
                            setUser(storedUser);
                            setIsAuth(true);
                        }
                    } catch (parseErr) {
                        console.error("Erro ao carregar usuário do localStorage:", parseErr);
                    }

                    const { data } = await api.post("/auth/refresh_token");
                    api.defaults.headers.Authorization = `Bearer ${data.token}`;
                    localStorage.setItem("token", JSON.stringify(data.token));
                    localStorage.setItem("user", JSON.stringify(data.user));
                    setIsAuth(true);
                    setUser(data.user);
                } catch (err) {
                    if (err.response && err.response.data && err.response.data.error === "ERR_USER_INACTIVE") {
                        setUserInactive(true);
                        markUserAsInactive();

                        toast.error(t("backendErrors.ERR_USER_INACTIVE") || "Este atendente está desativado!", {
                            autoClose: 10000,
                            onClose: () => {
                                navigate("/login");
                            }
                        });

                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        setIsAuth(false);
                        setUser({});

                        delete api.defaults.headers.Authorization;
                    } else {
                        console.error("Erro ao atualizar token:", err);
                        handleLogout();
                    }
                }
            }
            setLoading(false);
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

    return { isAuth, user, loading, handleLogin, handleLogout };
};

export default useAuth;
