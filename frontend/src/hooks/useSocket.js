import { useEffect, useRef, useState } from 'react';
import openSocket from '../services/socket-io';

let globalSocket = null;

export const useSocket = () => {
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!globalSocket) {
            try {
                globalSocket = openSocket();
                if (globalSocket) {
                    globalSocket.on('connect', () => {
                        setConnected(true);
                    });

                    globalSocket.on('disconnect', (reason) => {
                        setConnected(false);
                    });

                    globalSocket.on('error', (error) => {
                        const timestamp = new Date().toISOString();
                        console.error(`[FRONT_SOCKET_ERROR][${timestamp}] Erro no socket:`, error);
                        console.error(`[FRONT_SOCKET_ERROR_STACK][${timestamp}] Stack de erro:`, error?.stack || 'Sem stack disponível');
                        
                        if (error.message?.includes('insufficient resources')) {
                            console.warn(`[FRONT_SOCKET_RESOURCE_ERROR][${timestamp}] Erro de recursos insuficientes detectado. Desconectando e reiniciando socket em 5 segundos.`);
                            globalSocket.disconnect();
                            setTimeout(() => {
                                globalSocket = null;
                                socketRef.current = null;

                            }, 5000);
                        }
                    });

                    globalSocket.on('reconnect_attempt', (attemptNumber) => {
                        const timestamp = new Date().toISOString();
                        console.log(`[FRONT_SOCKET_RECONNECT][${timestamp}] Tentativa #${attemptNumber} de reconexão do socket`);
                    });
                    
                    globalSocket.on('reconnect', (attemptNumber) => {
                        const timestamp = new Date().toISOString();
                        console.log(`[FRONT_SOCKET_RECONNECTED][${timestamp}] Socket reconectado com sucesso após ${attemptNumber} tentativa(s). ID: ${globalSocket.id}`);
                    });
                    
                    globalSocket.on('reconnect_error', (error) => {
                        const timestamp = new Date().toISOString();
                        console.error(`[FRONT_SOCKET_RECONNECT_ERROR][${timestamp}] Erro na tentativa de reconexão:`, error);
                    });
                    
                    globalSocket.on('reconnect_failed', () => {
                        const timestamp = new Date().toISOString();
                        console.error(`[FRONT_SOCKET_RECONNECT_FAILED][${timestamp}] Falha em todas as tentativas de reconexão do socket.`);
                    });
                }
            } catch (err) {
                console.error("Erro ao inicializar socket:", err);
                globalSocket = null;
            }
        }

        socketRef.current = globalSocket;

        return () => {
            socketRef.current = null;
        };
    }, []);

    const getSocket = () => {
        return socketRef.current;
    };

    return {
        socket: getSocket(),
        connected,
        emit: (event, data) => {
            try {
                const socket = getSocket();
                if (socket && socket.connected) {
                    socket.emit(event, data);
                    return true;
                }
                return false;
            } catch (err) {
                console.error(`Erro ao emitir evento ${event}:`, err);
                return false;
            }
        },
        on: (event, callback) => {
            try {
                const socket = getSocket();
                if (socket) {
                    socket.on(event, callback);
                    return true;
                }
                return false;
            } catch (err) {
                console.error(`Erro ao adicionar listener para ${event}:`, err);
                return false;
            }
        },
        off: (event, callback) => {
            try {
                const socket = getSocket();
                if (socket) {
                    socket.off(event, callback);
                    return true;
                }
                return false;
            } catch (err) {
                console.error(`Erro ao remover listener para ${event}:`, err);
                return false;
            }
        }
    };
};
