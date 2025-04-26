import React from "react";
import { TextField } from "@mui/material";

const InputComponent = ({ inputRef, ...other }) => <div {...other} />;

const OutlinedDiv = ({
  InputProps,
  children,
  InputLabelProps,
  label,
  ...other
}) => {
  return (
    <TextField
      {...other}
      variant="outlined"
      label={label}
      multiline
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      InputProps={{
        inputComponent: InputComponent,
        ...InputProps
      }}
      inputProps={{ children: children }}
    />
  );
};

export default OutlinedDiv;
