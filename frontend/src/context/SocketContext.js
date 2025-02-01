import React, { createContext, useContext, useEffect, useState } from 'react';
import openSocket from '../services/socket-io';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const newSocket = openSocket();

        if (newSocket) {
            newSocket.on('connect', () => {
                console.log('Socket conectado globalmente');
                setConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket desconectado globalmente');
                setConnected(false);
            });

            setSocket(newSocket);
        }

        return () => {
            if (newSocket) {
                // Removemos apenas os listeners, não desconectamos
                newSocket.off('connect');
                newSocket.off('disconnect');
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket deve ser usado dentro de um SocketProvider');
    }
    return context;
};
