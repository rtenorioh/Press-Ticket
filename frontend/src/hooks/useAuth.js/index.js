import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSocket } from "../../context/SocketContext";
import toastError from "../../errors/toastError";
import api, { markUserAsInactive } from "../../services/api";
import { showLoading } from "../../utils/showLoading";

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

    const [userInactive, setUserInactive] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (userInactive) {
                setLoading(false);
                return;
            }

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
                    if (err.response && err.response.data && err.response.data.error === "ERR_USER_INACTIVE") {
                        setUserInactive(true);
                        markUserAsInactive();

                        toast.error(t("backendErrors.ERR_USER_INACTIVE") || "Este atendente está desativado!", {
                            autoClose: 10000,
                            onClose: () => {
                                history.push("/login");
                            }
                        });

                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        setIsAuth(false);
                        setUser({});

                        delete api.defaults.headers.Authorization;
                    } else {
                        handleLogout();
                    }
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [handleLogout, userInactive, t, history]);

    useEffect(() => {

        if (isAuth && user.id) {

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
    }, [user.id, isAuth, t, handleLogout, socket]);

    const handleLogin = async (userData) => {
        try {
            const { data } = await api.post("/auth/login", userData);
            localStorage.setItem("token", JSON.stringify(data.token));
            localStorage.setItem("user", JSON.stringify(data.user));
            api.defaults.headers.Authorization = `Bearer ${data.token}`;
            setUser(data.user);
            setIsAuth(true);
            toast.success(t("auth.toasts.success"));
            const finishLoading = showLoading();
            setTimeout(() => {
                finishLoading();
                history.push("/tickets");
            }, 1500);
        } catch (err) {
            toastError(err, t);
        }
    };

    return { isAuth, user, loading, handleLogin, handleLogout };
};

export default useAuth;