import { IconButton, Menu, MenuItem, Tooltip, Typography, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useState } from "react";
import Flag from "react-world-flags";
import i18n from "../../translate/i18n";
import { useTranslation } from "react-i18next";

const StyledFlag = styled(Flag)(({ theme }) => ({
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.2)",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease",
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1, 2),
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-selected": {
        backgroundColor: `${theme.palette.primary.light}30`,
        "&:hover": {
            backgroundColor: `${theme.palette.primary.light}40`,
        },
    },
}));

const LanguageSelector = () => {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);
    const currentLanguage = i18n.language;

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleLanguageChange = (language) => {
        i18n.changeLanguage(language)
            .then(() => console.log("Idioma alterado com sucesso:", language))
            .catch((err) => console.error("Erro ao alterar idioma:", err));
        localStorage.setItem("i18nextLng", language);
        handleCloseMenu();
    };

    const languages = [
        { code: "pt", label: "Português", flag: "BR" },
        { code: "en", label: "English", flag: "US" },
        { code: "es", label: "Español", flag: "ES" },
        { code: "fr", label: "Français", flag: "FR" },
        { code: "de", label: "Deutsch", flag: "DE" },
        { code: "it", label: "Italiano", flag: "IT" },
        { code: "zh", label: "中文", flag: "CN" },
        { code: "ja", label: "日本語", flag: "JP" },
        { code: "ru", label: "Русский", flag: "RU" },
        { code: "ar", label: "العربية", flag: "SA" },
        { code: "hi", label: "हिन्दी", flag: "IN" },
        { code: "id", label: "Bahasa Indonesia", flag: "ID" },
    ];

    const disabledLanguages = ["it", "zh", "ja", "ru", "ar", "hi", "id"];

    return (
        <>
            <Tooltip title="Selecionar idioma">
                <IconButton
                    color="inherit"
                    onClick={handleOpenMenu}
                    aria-controls="language-menu"
                    aria-haspopup="true"
                    sx={{
                        padding: 0.5,
                        "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                        }
                    }}
                >
                    <StyledFlag
                        code={languages.find((lang) => lang.code === currentLanguage)?.flag || "BR"}
                        style={{ width: 28, height: 28 }}
                    />
                </IconButton>
            </Tooltip>
            <Menu
                id="language-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        mt: 1,
                        borderRadius: 2,
                        minWidth: 180,
                        overflow: "visible",
                        "&:before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                        },
                    },
                }}
            >
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 500, color: "text.secondary" }}>
                    {t("languageSelector.title")}
                </Typography>
                <Divider />
                {languages.map((language) => (
                    <StyledMenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        disabled={disabledLanguages.includes(language.code)}
                        selected={currentLanguage === language.code}
                    >
                        <StyledFlag
                            code={language.flag}
                            style={{ width: 24, height: 24 }}
                        />
                        <Typography variant="body2" sx={{ ml: 1.5, fontWeight: currentLanguage === language.code ? 600 : 400 }}>
                            {language.label}
                        </Typography>
                    </StyledMenuItem>
                ))}
            </Menu>
        </>
    );
};

export default LanguageSelector;
