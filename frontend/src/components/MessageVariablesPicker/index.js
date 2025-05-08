import { Chip, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import useMessageVariables from "../../hooks/useMessageVariables";

const StyledChip = styled(Chip)(({ theme }) => ({
    margin: theme.spacing(0.5),
    cursor: "pointer",
    borderRadius: "16px",
    fontWeight: "medium",
    transition: "all 0.2s ease",
    "&:hover": {
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        transform: "translateY(-1px)",
    },
    "&.MuiChip-colorPrimary": {
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
    }
}));

const VariablesContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
}));

const VariablesHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontWeight: 500,
}));

const MessageVariablesPicker = ({ onClick, disabled, customVariables = [] }) => {
    const msgVars = useMessageVariables(customVariables);
    const { t } = useTranslation();

    const handleClick = (e, value) => {
        e.preventDefault();
        if (disabled) return;
        onClick(value);
    };

    return (
        <Box sx={{ mt: 1, mb: 2 }}>
            <VariablesHeader variant="subtitle2">
                {t("messageVariablesPicker.label")}
            </VariablesHeader>
            <VariablesContainer
                sx={{
                    opacity: disabled ? 0.7 : 1,
                    pointerEvents: disabled ? "none" : "auto",
                }}
            >
                {msgVars.map((msgVar) => (
                    <StyledChip
                        key={msgVar.value}
                        onMouseDown={(e) => handleClick(e, msgVar.value)}
                        label={msgVar.name}
                        size="small"
                        color="primary"
                        variant="filled"
                    />
                ))}
            </VariablesContainer>
        </Box>
    );
};

export default MessageVariablesPicker;
