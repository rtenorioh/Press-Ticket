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
                        console.log('Socket conectado');
                        setConnected(true);
                    });

                    globalSocket.on('disconnect', () => {
                        console.log('Socket desconectado');
                        setConnected(false);
                    });

                    globalSocket.on('error', (error) => {
                        console.error('Erro no socket:', error);
                        if (error.message?.includes('insufficient resources')) {
                            globalSocket.disconnect();
                            setTimeout(() => {
                                globalSocket = null;
                                socketRef.current = null;
                            }, 5000);
                        }
                    });

                    globalSocket.on('reconnect_attempt', () => {
                        console.log('Tentativa de reconexão do socket');
                    });
                }
            } catch (err) {
                console.error("Erro ao inicializar socket:", err);
                globalSocket = null;
            }
        }

        socketRef.current = globalSocket;

        return () => {
            // Não desconecta o socket global no cleanup
            socketRef.current = null;
        };
    }, []);

    const getSocket = () => {
        return socketRef.current;
    };

    return {
        socket: getSocket(),
        connected,
        // Função utilitária para emitir eventos com tratamento de erro
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
        // Função utilitária para ouvir eventos com tratamento de erro
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
        // Função utilitária para remover listeners com tratamento de erro
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
