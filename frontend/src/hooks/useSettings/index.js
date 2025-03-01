import { useEffect, useState } from 'react';
import api from '../../services/api';

const useSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                setSettings(data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };

        fetchSettings();
    }, []);

    const getSetting = (key) => {
        const setting = settings.find(s => s.key === key);
        return setting ? setting.value : null;
    };

    return { settings, getSetting, loading };
};

export default useSettings;