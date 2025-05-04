import openSocket from "socket.io-client";
import { getBackendUrl } from "../config";

let socketInstance = null;

const connectToSocket = () => {
    if (socketInstance && socketInstance.connected) {
        return socketInstance;
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("Token não encontrado, socket não será inicializado");
            return null;
        }

        let parsedToken;
        try {
            parsedToken = JSON.parse(token);
        } catch (err) {
            console.error("Token inválido no localStorage");
            return null;
        }

        try {
            const tokenData = JSON.parse(atob(parsedToken.split('.')[ 1 ]));
            if (tokenData.exp * 1000 < Date.now()) {
                console.warn("Token expirado, socket não será inicializado");
                return null;
            }
        } catch (err) {
            console.error("Erro ao verificar expiração do token");
            return null;
        }

        if (socketInstance) {
            socketInstance.disconnect();
        }
        socketInstance = openSocket(getBackendUrl(), {
            transports: ["websocket", "polling"],
            query: {
                token: parsedToken
            },
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionAttempts: 10,
            forceNew: true,
            timeout: 20000
        });

        socketInstance.on("connect", () => {
            console.log("Socket conectado com sucesso");
            const event = new CustomEvent('socketConnected');
            window.dispatchEvent(event);
            if (localStorage.getItem('forceReloadTickets') === 'true') {
                localStorage.removeItem('forceReloadTickets');
                window.location.reload();
            }
        });

        socketInstance.on("connect_error", (error) => {
            console.error("Erro na conexão do socket:", error.message);
            if (error.message.includes("jwt expired") || 
                error.message.includes("invalid token") || 
                error.message.includes("jwt malformed")) {
                console.warn("Problema com o token, desconectando socket");
                socketInstance.disconnect();
                localStorage.removeItem("token");
                window.location.reload();
            } else {
                setTimeout(() => {
                    if (socketInstance) {
                        socketInstance.connect();
                    }
                }, 3000);
            }
        });

        socketInstance.on("disconnect", (reason) => {
            console.log("Socket desconectado:", reason);           
            const event = new CustomEvent('socketDisconnected', { detail: { reason } });
            window.dispatchEvent(event);
            localStorage.setItem('forceReloadTickets', 'true');
            if (reason === "io server disconnect" || 
                reason === "forced close" || 
                reason === "ping timeout") {
                setTimeout(() => {
                    if (socketInstance) {
                        console.log("Tentando reconectar socket após desconexão:", reason);
                        socketInstance.connect();
                    }
                }, 3000);
            }
        });

        return socketInstance;
    } catch (err) {
        console.error("Erro ao conectar socket:", err);
        return null;
    }
};

export default connectToSocket;