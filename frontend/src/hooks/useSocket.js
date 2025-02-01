import { useEffect, useRef } from 'react';
import openSocket from '../services/socket-io';

const useSocket = () => {
    const socketRef = useRef(null);

    useEffect(() => {
        // Inicializa o socket apenas se ainda não existir
        if (!socketRef.current) {
            socketRef.current = openSocket();
        }

        // Cleanup function
        return () => {
            // Não desconecta o socket ao desmontar o componente
            // Apenas limpa os listeners específicos se necessário
        };
    }, []); // Executa apenas uma vez na montagem inicial

    return socketRef.current;
};

export default useSocket;
