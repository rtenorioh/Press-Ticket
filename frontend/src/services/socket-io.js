import openSocket from "socket.io-client";
import { getBackendUrl } from "../config";

const connectToSocket = () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("Token não encontrado, socket não será inicializado");
            return null;
        }

        // Tenta fazer o parse do token
        let parsedToken;
        try {
            parsedToken = JSON.parse(token);
        } catch (err) {
            console.error("Token inválido no localStorage");
            return null;
        }

        // Verifica se o token está expirado
        try {
            const tokenData = JSON.parse(atob(parsedToken.split('.')[1]));
            if (tokenData.exp * 1000 < Date.now()) {
                console.warn("Token expirado, socket não será inicializado");
                return null;
            }
        } catch (err) {
            console.error("Erro ao verificar expiração do token");
            return null;
        }

        const socket = openSocket(getBackendUrl(), {
            transports: ["websocket"],
            query: {
                token: parsedToken
            },
            reconnection: true,
            reconnectionDelay: 5000,
            reconnectionAttempts: 5,
            forceNew: false,
            timeout: 10000
        });

        socket.on("connect", () => {
            console.log("Socket conectado com sucesso");
        });

        socket.on("connect_error", (error) => {
            console.error("Erro na conexão do socket:", error.message);
            
            if (error.message.includes("jwt expired") || 
                error.message.includes("invalid token") || 
                error.message.includes("jwt malformed")) {
                console.warn("Problema com o token, desconectando socket");
                socket.disconnect();
                localStorage.removeItem("token"); // Remove o token inválido
                window.location.reload(); // Força um reload para limpar o estado
            }
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket desconectado:", reason);
            if (reason === "io server disconnect" || 
                reason === "forced close" || 
                reason === "ping timeout") {
                socket.disconnect();
            }
        });

        return socket;
    } catch (err) {
        console.error("Erro ao conectar socket:", err);
        return null;
    }
};

export default connectToSocket;