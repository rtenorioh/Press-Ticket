import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import React, { useEffect, useState } from 'react';

function ThemeSelector({ toggleTheme }) {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
        }
    }, []);

    const renderThemeIcon = theme === 'light' ? <Brightness7Icon /> : <Brightness4Icon />;

    return (
        <IconButton
            color="inherit"
            onClick={() => {
                if (typeof toggleTheme === 'function') {
                    toggleTheme();
                    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
                } else {
                    console.error('toggleTheme não é uma função');
                }
            }}
            aria-label="Toggle theme"
        >
            {renderThemeIcon}
        </IconButton>
    );
}

export default ThemeSelector;
