import openSocket from "socket.io-client";
import { getBackendUrl } from "../config";

let socketInstance = null;
let healthCheckInterval = null;
let lastPongTime = Date.now();
let isSocketHealthy = true;

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
            const tokenData = JSON.parse(atob(parsedToken.split('.')[1]));
            if (tokenData.exp * 1000 < Date.now()) {
                console.warn("Token expirado, socket não será inicializado");
                localStorage.removeItem("token");
                window.location.reload();
                return null;
            }
        } catch (err) {
            console.error("Erro ao verificar expiração do token");
            return null;
        }

        if (socketInstance) {
            socketInstance.disconnect();
        }
        
        const socket = openSocket(getBackendUrl(), {
            transports: ["polling", "websocket"],
            query: {
                token: parsedToken
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: Infinity,
            forceNew: false,
            timeout: 10000
        });

        socket.on("connect", () => {
            const timestamp = new Date().toISOString();
            
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user && user.id) {
                socket.emit("getTickets", { userId: user.id });
                socket.emit("userStatus", { userId: user.id, status: "online" });
                socket.emit("subscribeTicketCounter");
                socket.emit("joinNotification");
            } else {
                console.warn(`[FRONT_SOCKET_NO_USER][${timestamp}] Não foi possível sincronizar tickets: usuário não encontrado no localStorage`);
            }
        });

        socket.onAny((eventName, ...args) => {
            const timestamp = new Date().toISOString();
            
            if (eventName === "appMessage") {
                console.log(`[FRONT_SOCKET_EVENT][${timestamp}] ========== appMessage RECEBIDO ==========`);
                console.log(`[FRONT_SOCKET_EVENT][${timestamp}] Payload completo:`, JSON.stringify(args, null, 2));
                
                if (args[0]) {
                    console.log(`[FRONT_SOCKET_EVENT][${timestamp}] Action:`, args[0].action);
                    console.log(`[FRONT_SOCKET_EVENT][${timestamp}] Ticket ID:`, args[0].ticket?.id);
                    console.log(`[FRONT_SOCKET_EVENT][${timestamp}] LastMessage:`, args[0].ticket?.lastMessage);
                    console.log(`[FRONT_SOCKET_EVENT][${timestamp}] UnreadMessages:`, args[0].ticket?.unreadMessages);
                }
                console.log(`[FRONT_SOCKET_EVENT][${timestamp}] =============================================`);
            } else if (eventName !== "ping" && eventName !== "pong") {
                console.log(`[FRONT_SOCKET_EVENT][${timestamp}] Evento: ${eventName}`, args);
            }
        });

        socket.on("connect_error", (error) => {
            console.error(`[SOCKET] ❌ ERRO DE CONEXÃO:`, error.message);
            console.error(`[SOCKET] Tipo de erro:`, error.type);
            console.error(`[SOCKET] Stack:`, error?.stack || 'Sem stack disponível');
            
            if (error.message.includes("jwt expired") || 
                error.message.includes("invalid token") || 
                error.message.includes("jwt malformed")) {
                console.warn(`[SOCKET] ⚠️ Token inválido ou expirado. Fazendo logout...`);
                socket.disconnect();
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        });

        socket.on("reconnect", (attemptNumber) => {
            const timestamp = new Date().toISOString();
            
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user && user.id) {
                socket.emit("getTickets", { userId: user.id });
                socket.emit("subscribeTicketCounter");
            } else {
                console.warn(`[FRONT_SOCKET_RESYNC_FAILED][${timestamp}] Não foi possível resincronizar tickets após reconexão: usuário não encontrado`);
            }
        });
        
        socket.on("disconnect", (reason) => {
            console.warn(`[SOCKET] ⚠️ DESCONECTADO! Motivo: ${reason}`);
        
            if (reason === 'transport error' || reason === 'transport close') {
                console.warn(`[SOCKET] Erro de transporte. Tentando reconectar...`);
            }
            
            if (reason === 'io server disconnect') {
                console.warn(`[SOCKET] Servidor fechou a conexão. Reconectando...`);
                setTimeout(() => socket.connect(), 1000);
            }
        });

        socket.on("disconnect", (reason) => {
            console.warn("Socket desconectado:", reason);
            if (reason === "io server disconnect" || 
                reason === "forced close" || 
                reason === "ping timeout") {
                setTimeout(() => {
                    socket.connect();
                }, 3000);
            }
        });

        startHealthCheck(socket);
        
        socketInstance = socket;
        return socket;
    } catch (err) {
        console.error("Erro ao conectar socket:", err);
        return null;
    }
};

const startHealthCheck = (socket) => {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
    }
    
    socket.on("pong", () => {
        lastPongTime = Date.now();
        isSocketHealthy = true;
    });
    
    healthCheckInterval = setInterval(() => {
        socket.emit("ping");
        
        const now = Date.now();
        if (now - lastPongTime > 15000) {
            isSocketHealthy = false;
            
            if (socket && !socket.connected) {
                socket.connect();
            }
        }
    }, 10000);
};

const reconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
    }
    return connectToSocket();
};

export default connectToSocket;
export { reconnectSocket };