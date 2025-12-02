import { createTheme } from '@mui/material/styles';
import backgroundImageLight from "../assets/backgroundLight.png";

const getLightTheme = (config, locale) =>
    createTheme(
        {
            typography: {
                fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
                fontSize: 12,
                h1: { fontSize: '2rem', fontWeight: 600 },
                h2: { fontSize: '1.75rem', fontWeight: 600 },
                h3: { fontSize: '1.5rem', fontWeight: 600 },
                h4: { fontSize: '1.25rem', fontWeight: 600 },
                h5: { fontSize: '1.125rem', fontWeight: 600 },
                h6: { fontSize: '1rem', fontWeight: 600 },
                subtitle1: { fontSize: '0.875rem' },
                subtitle2: { fontSize: '0.8125rem' },
                body1: { fontSize: '0.875rem' },
                body2: { fontSize: '0.8125rem' },
                button: { fontSize: '0.8125rem', fontWeight: 500 },
                caption: { fontSize: '0.75rem' },
                overline: { fontSize: '0.75rem' }
            },
            scrollbarStyles: {
                "&::-webkit-scrollbar": {
                    width: "8px",
                    height: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                    boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
                    backgroundColor: config?.scrollbarThumb || "#E5E5E5",
                },
            },
            palette: {
                primary: { main: config?.primaryColor || "#5C4B9B" },
                secondary: { main: config?.secondaryColor || "#D5C6F0" },
                toolbar: { main: config?.toolbarColor || "#5C4B9B" },
                menuItens: { main: config?.menuItens || "#FFFFFF" },
                sub: { main: config?.sub || "#F7F7F7" },
                toolbarIcon: { main: config?.toolbarIconColor || "#FFFFFF" },
                divide: { main: config?.divide || "#E0E0E0" },
                background: {
                    default: config?.backgroundDefault || "#FFFFFF",
                    paper: config?.backgroundPaper || "#F7F7F7",
                },
                text: {
                    primary: config?.textPrimary || "#000000",
                    secondary: config?.textSecondary || "#333333",
                },
            },
            backgroundImage: `url(${config?.backgroundImage || backgroundImageLight})`,
        },
        locale
    );

export default getLightTheme;
