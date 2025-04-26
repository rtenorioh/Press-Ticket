import { Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import useMessageVariables from "../../hooks/useMessageVariables";
import OutlinedDiv from "../OutlinedDiv";

const StyledChip = styled(Chip)(({ theme }) => ({
    margin: theme.spacing(0.5),
    cursor: "pointer",
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
        <OutlinedDiv
            margin="dense"
            fullWidth
            label={t("messageVariablesPicker.label")}
            disabled={disabled}
        >
            {msgVars.map((msgVar) => (
                <StyledChip
                    key={msgVar.value}
                    onMouseDown={(e) => handleClick(e, msgVar.value)}
                    label={msgVar.name}
                    size="small"
                    color="primary"
                />
            ))}
        </OutlinedDiv>
    );
};

export default MessageVariablesPicker;
