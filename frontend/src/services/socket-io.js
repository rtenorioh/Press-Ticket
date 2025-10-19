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
            } else {
                console.warn(`[FRONT_SOCKET_NO_USER][${timestamp}] Não foi possível sincronizar tickets: usuário não encontrado no localStorage`);
            }
        });

        socket.on("connect_error", (error) => {
            const timestamp = new Date().toISOString();
            console.error(`[FRONT_SOCKET_CONNECT_ERROR][${timestamp}] Erro na conexão do socket:`, error.message);
            console.error(`[FRONT_SOCKET_CONNECT_ERROR_STACK][${timestamp}] Stack de erro:`, error?.stack || 'Sem stack disponível');
            
            if (error.message.includes("jwt expired") || 
                error.message.includes("invalid token") || 
                error.message.includes("jwt malformed")) {
                console.warn(`[FRONT_SOCKET_TOKEN_ERROR][${timestamp}] Problema com o token JWT detectado: ${error.message}. Desconectando socket e redirecionando.`);
                socket.disconnect();
                localStorage.removeItem("token");
                window.location.reload();
            }
        });

        socket.on("reconnect", (attemptNumber) => {
            const timestamp = new Date().toISOString();
            console.log(`[FRONT_SOCKET_RECONNECT][${timestamp}] Socket reconectado com sucesso após ${attemptNumber} tentativa(s). ID: ${socket.id}`);
            
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user && user.id) {
                console.log(`[FRONT_SOCKET_RESYNC][${timestamp}] Resincronizando tickets após reconexão para o usuário ${user.id}`);
                socket.emit("getTickets", { userId: user.id });
                
                console.log(`[FRONT_SOCKET_COUNTER_RECONNECT][${timestamp}] Reinscrevendo no canal de contadores de tickets`);
                socket.emit("subscribeTicketCounter");
            } else {
                console.warn(`[FRONT_SOCKET_RESYNC_FAILED][${timestamp}] Não foi possível resincronizar tickets após reconexão: usuário não encontrado`);
            }
        });
        
        socket.on("disconnect", (reason) => {
            const timestamp = new Date().toISOString();
        
            if (reason === 'transport error' || reason === 'transport close') {
                console.warn(`[FRONT_SOCKET_TRANSPORT_ERROR][${timestamp}] Erro de transporte detectado. Tentando reconectar...`);
            }
            
            if (reason === 'io server disconnect') {
                console.warn(`[FRONT_SOCKET_SERVER_DISCONNECT][${timestamp}] Servidor fechou a conexão. Tentando reconectar manualmente...`);
                socket.connect();
            }
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket desconectado:", reason);
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