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
                localStorage.removeItem("user");
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
            auth: {
                token: parsedToken
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: Infinity,
            forceNew: false,
            timeout: 10000
        });

        socket.on("connect", () => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user && user.id) {
                socket.emit("getTickets", { userId: user.id });
                socket.emit("userStatus", { userId: user.id, status: "online" });
                socket.emit("subscribeTicketCounter");
                socket.emit("joinNotification");
            }
        });


        socket.on("connect_error", (error) => {
            console.error(`[SOCKET] Erro de conexão: ${error.message}`);
            
            if (error.message.includes("jwt expired") || 
                error.message.includes("invalid token") || 
                error.message.includes("jwt malformed")) {
                socket.disconnect();
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.dispatchEvent(new CustomEvent("session:expired"));
            }
        });

        socket.on("reconnect", () => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user && user.id) {
                socket.emit("getTickets", { userId: user.id });
                socket.emit("subscribeTicketCounter");
            }
        });
        
        socket.on("disconnect", (reason) => {
            if (reason === 'io server disconnect' || 
                reason === 'forced close' || 
                reason === 'ping timeout') {
                setTimeout(() => socket.connect(), 3000);
            } else if (reason === 'transport error' || reason === 'transport close') {
                setTimeout(() => socket.connect(), 1000);
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