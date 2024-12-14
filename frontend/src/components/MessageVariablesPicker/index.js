import { Chip, makeStyles } from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";
import useMessageVariables from "../../hooks/useMessageVariables";
import OutlinedDiv from "../OutlinedDiv";

const useStyles = makeStyles((theme) => ({
    chip: {
        margin: theme.spacing(0.5),
        cursor: "pointer",
    },
}));

const MessageVariablesPicker = ({ onClick, disabled, customVariables = [] }) => {
    const classes = useStyles();
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
                <Chip
                    key={msgVar.value}
                    onMouseDown={(e) => handleClick(e, msgVar.value)}
                    label={msgVar.name}
                    size="small"
                    className={classes.chip}
                    color="primary"
                />
            ))}
        </OutlinedDiv>
    );
};

export default MessageVariablesPicker;
