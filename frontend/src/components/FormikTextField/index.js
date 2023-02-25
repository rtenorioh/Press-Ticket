import React from "react";
import { TextField } from "@material-ui/core";
import { Field } from "formik";

const FormikTextField = ({
  name,
  values,
  touched,
  errors,
  isSubmitting,
  loading,
  ...rest
}) => {
  return (
    <Field
      as={TextField}
      name={name}
      error={touched[name] && Boolean(errors[name])}
      helperText={touched[name] && errors[name]}
      {...rest}
    />
  );
};

export default FormikTextField;