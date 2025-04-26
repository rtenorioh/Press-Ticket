import { Button, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import React from "react";

const StyledButton = styled(Button)({
	position: "relative",
});

const ButtonProgress = styled(CircularProgress, {
	shouldForwardProp: (prop) => prop !== 'spinnerColor'
})(({ theme, spinnerColor }) => ({
	color: spinnerColor || theme.palette.primary.main,
	position: "absolute",
	top: "50%",
	left: "50%",
	marginTop: -12,
	marginLeft: -12,
}));

const ButtonWithSpinner = ({
	loading,
	children,
	spinnerSize = 24,
	spinnerColor = null,
	ariaLabel = "Loading...",
	...rest
}) => {
	return (
		<StyledButton
			disabled={loading}
			aria-busy={loading}
			aria-label={loading ? ariaLabel : undefined}
			{...rest}
		>
			{children}
			{loading && (
				<ButtonProgress
					size={spinnerSize}
					spinnerColor={spinnerColor}
				/>
			)}
		</StyledButton>
	);
};

ButtonWithSpinner.propTypes = {
	loading: PropTypes.bool.isRequired,
	children: PropTypes.node.isRequired,
	spinnerSize: PropTypes.number,
	spinnerColor: PropTypes.string,
	ariaLabel: PropTypes.string,
};

export default ButtonWithSpinner;
