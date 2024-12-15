import { IconButton } from '@material-ui/core';
import { Brightness4, Brightness7 } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';

function ThemeSelector({ toggleTheme }) {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
        }
    }, []);

    const renderThemeIcon = theme === 'light' ? <Brightness7 /> : <Brightness4 />;

    return (
        <IconButton
            color="inherit"
            onClick={() => {
                toggleTheme();
                setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
            }}
            aria-label="Toggle theme"
        >
            {renderThemeIcon}
        </IconButton>
    );
}

export default ThemeSelector;
