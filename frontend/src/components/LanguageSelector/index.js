import { IconButton, Menu, MenuItem, Tooltip } from "@material-ui/core";
import React, { useState } from "react";
import Flag from "react-world-flags";
import i18n from "../../translate/i18n";

const LanguageSelector = () => {
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
                >
                    <Flag
                        code={languages.find((lang) => lang.code === currentLanguage)?.flag || "BR"}
                        style={{ width: 24, height: 24, borderRadius: "50%" }}
                    />
                </IconButton>
            </Tooltip>
            <Menu
                id="language-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                getContentAnchorEl={null}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                {languages.map((language) => (
                    <MenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        disabled={disabledLanguages.includes(language.code)}
                    >
                        <Flag
                            code={language.flag}
                            style={{ width: 24, height: 24, marginRight: 8 }}
                        />
                        {language.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default LanguageSelector;
