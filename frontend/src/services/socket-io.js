import openSocket from "socket.io-client";
import { getBackendUrl } from "../config";

let socket = null;
let reconnectTimer = null;

const connectToSocket = () => {
    try {
        if (socket && socket.connected) {
            return socket;
        }

        if (socket) {
            return socket;  
        }

        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("Token não encontrado, socket não será inicializado");
            return null;
        }

        let parsedToken;
        try {
            parsedToken = JSON.parse(token);
        } catch (err) {
            console.error("Erro ao fazer parse do token:", err);
            return null;
        }

        socket = openSocket(getBackendUrl(), {
            transports: ["websocket"],
            query: {
                token: parsedToken,
            },
            reconnection: true,
            reconnectionDelay: 10000,       
            reconnectionDelayMax: 30000,     
            reconnectionAttempts: 3,         
            timeout: 20000
        });

        socket.on("connect", () => {
            console.log("Socket Connected");
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
            
            try {
                const userStr = localStorage.getItem("user");
                if (!userStr) return;
                
                const user = JSON.parse(userStr);
                if (user && user.id) {
                    socket.emit("userStatus", {
                        userId: user.id,
                        online: true
                    });
                }
            } catch (err) {
                console.error("Erro ao processar dados do usuário:", err);
            }
        });

        socket.on("connect_error", (error) => {
            console.error("Erro na conexão do socket:", error);
            if (socket) {
                socket.disconnect();
            }
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket Disconnected:", reason);
            if (reason === "io server disconnect" || reason === "forced close") {
                if (socket) {
                    socket.disconnect();
                }
            }
        });

        return socket;
    } catch (err) {
        console.error("Erro ao conectar socket:", err);
        return null;
    }
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
};

export default connectToSocket;