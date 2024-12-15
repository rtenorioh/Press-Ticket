import { createTheme } from '@material-ui/core/styles';
import backgroundImageDark from "../assets/backgroundDark.jpg";

const getDarkTheme = (config, locale) =>
    createTheme(
        {
            overrides: {
                MuiCssBaseline: {
                    "@global": {
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
