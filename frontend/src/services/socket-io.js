import openSocket from "socket.io-client";
import { getBackendUrl } from "../config";

let socket = null;
let reconnectTimer = null;

const connectToSocket = () => {
    // Se já existe uma conexão, retorna ela
    if (socket && socket.connected) {
        return socket;
    }

    // Se existe um socket mas não está conectado, tenta reconectar
    if (socket) {
        socket.connect();
        return socket;
    }

    // Limpa timer de reconexão anterior se existir
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    const token = localStorage.getItem("token");
    if (!token) return null;

    socket = openSocket(getBackendUrl(), {
        transports: ["websocket"],
        query: {
            token: JSON.parse(token),
        },
        reconnection: false,
        timeout: 20000
    });

    socket.on("connect", () => {
        console.log("Socket Connected");
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.id) {
            socket.emit("userStatus", {
                userId: user.id,
                online: true
            });
        }
    });

    socket.on("disconnect", (reason) => {
        console.log("Socket Disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
        console.error("Socket Connect Error:", error);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export default connectToSocket;