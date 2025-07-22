import openSocket from "socket.io-client";
import { getBackendUrl } from "../config";

// Variável para controlar se o socket já foi inicializado
let socketInstance = null;
let healthCheckInterval = null;
let lastPongTime = Date.now();
let isSocketHealthy = true;

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
        const timestamp = new Date().toISOString();
        console.log(`[FRONT_SOCKET_INIT][${timestamp}] Iniciando conexão com socket.io em ${getBackendUrl()}`);
        
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
            const timestamp = new Date().toISOString();
            console.log(`[FRONT_SOCKET_CONNECT][${timestamp}] Socket conectado com sucesso. ID: ${socket.id}`);
            
            // Emite evento para sincronizar tickets após conexão
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user && user.id) {
                console.log(`[FRONT_SOCKET_SYNC][${timestamp}] Solicitando sincronização de tickets para o usuário ${user.id}`);
                // Solicita atualização dos tickets do usuário
                socket.emit("getTickets", { userId: user.id });
                
                // Notifica o servidor que o cliente está online
                console.log(`[FRONT_SOCKET_STATUS][${timestamp}] Notificando status online para o usuário ${user.id}`);
                socket.emit("userStatus", { userId: user.id, status: "online" });
                
                // Inscreve-se no canal de contadores de tickets
                console.log(`[FRONT_SOCKET_COUNTER][${timestamp}] Inscrevendo no canal de contadores de tickets`);
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
            
            // Emite evento para sincronizar tickets após reconexão
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user && user.id) {
                console.log(`[FRONT_SOCKET_RESYNC][${timestamp}] Resincronizando tickets após reconexão para o usuário ${user.id}`);
                socket.emit("getTickets", { userId: user.id });
                
                // Reinscreve-se no canal de contadores de tickets
                console.log(`[FRONT_SOCKET_COUNTER_RECONNECT][${timestamp}] Reinscrevendo no canal de contadores de tickets`);
                socket.emit("subscribeTicketCounter");
            } else {
                console.warn(`[FRONT_SOCKET_RESYNC_FAILED][${timestamp}] Não foi possível resincronizar tickets após reconexão: usuário não encontrado`);
            }
        });
        
        socket.on("disconnect", (reason) => {
            const timestamp = new Date().toISOString();
            console.log(`[FRONT_SOCKET_DISCONNECT][${timestamp}] Socket desconectado. Motivo: ${reason}`);
            
            // Verifica se a desconexão foi por erro de transporte
            if (reason === 'transport error' || reason === 'transport close') {
                console.warn(`[FRONT_SOCKET_TRANSPORT_ERROR][${timestamp}] Erro de transporte detectado. Tentando reconectar...`);
            }
            
            // Verifica se o servidor fechou a conexão
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
                // Tenta reconectar automaticamente
                setTimeout(() => {
                    socket.connect();
                }, 3000);
            }
        });

        // Inicia verificação de saúde da conexão
        startHealthCheck(socket);
        
        // Armazena a instância do socket
        socketInstance = socket;
        return socket;
    } catch (err) {
        console.error("Erro ao conectar socket:", err);
        return null;
    }
};

// Função para iniciar verificação periódica de saúde da conexão socket
const startHealthCheck = (socket) => {
    // Limpa intervalo anterior se existir
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
    }
    
    // Configura evento de pong para atualizar timestamp
    socket.on("pong", () => {
        lastPongTime = Date.now();
        isSocketHealthy = true;
        console.log(`[FRONT_SOCKET_HEALTH][${new Date().toISOString()}] Pong recebido, conexão saudável`);
    });
    
    // Inicia verificação periódica
    healthCheckInterval = setInterval(() => {
        // Envia ping para o servidor
        socket.emit("ping");
        
        // Verifica se o último pong foi recebido há mais de 15 segundos
        const now = Date.now();
        if (now - lastPongTime > 15000) {
            isSocketHealthy = false;
            console.warn(`[FRONT_SOCKET_HEALTH][${new Date().toISOString()}] Conexão socket possivelmente inativa. Último pong: ${new Date(lastPongTime).toISOString()}`);
            
            // Tenta reconectar se o socket não estiver conectado
            if (socket && !socket.connected) {
                console.warn(`[FRONT_SOCKET_HEALTH][${new Date().toISOString()}] Tentando reconectar socket inativo...`);
                socket.connect();
            }
        }
    }, 10000); // Verifica a cada 10 segundos
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