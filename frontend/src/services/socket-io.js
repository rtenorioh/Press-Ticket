import openSocket from "socket.io-client";
import { getBackendUrl } from "../config";

// Variável para controlar se o socket já foi inicializado
let socketInstance = null;

// Função para obter o socket existente ou criar um novo
const connectToSocket = () => {
    // Se já existe uma instância válida do socket, retorna ela
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

        // Desconecta o socket existente se houver
        if (socketInstance) {
            socketInstance.disconnect();
        }

        // Cria uma nova conexão de socket
        const socket = openSocket(getBackendUrl(), {
            transports: ["websocket"],
            query: {
                token: parsedToken
            },
            reconnection: true,
            reconnectionDelay: 3000,
            reconnectionAttempts: 10,
            forceNew: true,  // Força uma nova conexão
            timeout: 10000
        });

        socket.on("connect", () => {
            console.log("Socket conectado com sucesso");
            
            // Emite evento para sincronizar tickets após conexão
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user && user.id) {
                // Solicita atualização dos tickets do usuário
                socket.emit("getTickets", { userId: user.id });
                
                // Notifica o servidor que o cliente está online
                socket.emit("userStatus", { userId: user.id, status: "online" });
            }
        });

        socket.on("connect_error", (error) => {
            console.error("Erro na conexão do socket:", error.message);
            
            if (error.message.includes("jwt expired") || 
                error.message.includes("invalid token") || 
                error.message.includes("jwt malformed")) {
                console.warn("Problema com o token, desconectando socket");
                socket.disconnect();
                localStorage.removeItem("token");
                window.location.reload();
            }
        });

        socket.on("reconnect", (attemptNumber) => {
            console.log(`Socket reconectado após ${attemptNumber} tentativas`);
            
            // Emite evento para sincronizar tickets após reconexão
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user && user.id) {
                socket.emit("getTickets", { userId: user.id });
            }
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket desconectado:", reason);
            if (reason === "io server disconnect" || 
                reason === "forced close" || 
                reason === "ping timeout") {
                // Tenta reconectar automaticamente
                setTimeout(() => {
                    socket.connect();
                }, 3000);
            }
        });

        // Armazena a instância do socket
        socketInstance = socket;
        return socket;
    } catch (err) {
        console.error("Erro ao conectar socket:", err);
        return null;
    }
};

// Função para forçar uma reconexão do socket
const reconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
    }
    return connectToSocket();
};

// Exporta a função principal e a função de reconexão
export default connectToSocket;
export { reconnectSocket };