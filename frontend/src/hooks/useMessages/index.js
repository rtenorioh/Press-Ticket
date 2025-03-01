import { useEffect, useState } from 'react';
import api from '../../services/api';
import useAuth from '../useAuth.js';

const useMessages = () => {
    const [messages, setMessages] = useState({ sent: 0, received: 0 });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                let endpoint = '/messages/count';

                if (user?.profile === 'admin') {

                } else if (user?.id) {
                    endpoint += `?userId=${user?.id}`;
                }

                const { data } = await api.get(endpoint);

                if (Array.isArray(data) && data.length > 0) {
                    const messageCount = data[0];
                    setMessages({
                        sent: messageCount.send || 0,
                        received: messageCount.receive || 0
                    });
                }
            } catch (err) {
                console.error(err);
                setMessages({ sent: 0, received: 0 });
            }
            setLoading(false);
        };

        fetchMessages();
    }, [user]);

    return { ...messages, loading };
};

export default useMessages;