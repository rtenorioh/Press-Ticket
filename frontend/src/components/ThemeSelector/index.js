import { IconButton } from '@material-ui/core';
import { Brightness4, Brightness7 } from '@material-ui/icons';
import React from 'react';

function ThemeSelector({ toggleTheme }) {
    const themeStorage = localStorage.getItem('theme');

    return (
        <IconButton color="inherit" onClick={toggleTheme} aria-label="Toggle theme">
            {themeStorage === 'light' ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
    );
}

export default ThemeSelector;