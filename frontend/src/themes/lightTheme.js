import { createTheme } from '@material-ui/core/styles';
import backgroundImageLight from "../assets/backgroundLight.png";

const getLightTheme = (config, locale) =>
    createTheme(
        {
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
