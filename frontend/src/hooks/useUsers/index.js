import { useEffect, useState } from 'react';
import api from '../../services/api';

const useUsers = () => {
    const [users, setUsers] = useState({ count: 0, online: 0, records: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/users');
                const filteredUsers = data.users.filter(user => user.profile !== 'masteradmin');
                const onlineUsers = filteredUsers.filter(user => user.online === true).length;

                setUsers({
                    count: filteredUsers.length,
                    online: onlineUsers,
                    records: filteredUsers
                });
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };

        fetchUsers();
    }, []);

    return { ...users, loading };
};

export default useUsers;