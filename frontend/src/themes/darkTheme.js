import { createTheme } from '@mui/material/styles';
import backgroundImageDark from "../assets/backgroundDark.jpg";

const getDarkTheme = (config, locale) =>
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
            components: {
                MuiCssBaseline: {
                    styleOverrides: {
                        body: {
                            backgroundColor: config?.backgroundDefault || "#2E2E3A",
                        },
                    },
                },
            },
            scrollbarStyles: {
                "&::-webkit-scrollbar": {
                    width: "8px",
                    height: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                    boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
                    backgroundColor: config?.scrollbarThumb || "#8A7DCC",
                },
            },
            palette: {
                primary: { main: config?.primaryColor || "#8A7DCC" },
                secondary: { main: config?.secondaryColor || "#CCCCCC" },
                toolbar: { main: config?.toolbarColor || "#8A7DCC" },
                menuItens: { main: config?.menuItens || "#181D22" },
                sub: { main: config?.sub || "#383850" },
                toolbarIcon: { main: config?.toolbarIconColor || "#FFFFFF" },
                divide: { main: config?.divide || "#2E2E3A" },
                background: {
                    default: config?.backgroundDefault || "#2E2E3A",
                    paper: config?.backgroundPaper || "#383850",
                },
                text: {
                    primary: config?.textPrimary || "#FFFFFF",
                    secondary: config?.textSecondary || "#CCCCCC",
                },
            },
            backgroundImage: `url(${config?.backgroundImage || backgroundImageDark})`,
        },
        locale
    );

export default getDarkTheme;
