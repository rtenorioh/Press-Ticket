import { Button, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";

const useStyles = makeStyles(theme => ({
	button: {
		position: "relative",
	},
	buttonProgress: {
		color: props => props.spinnerColor || theme.palette.primary.main,
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
}));

const ButtonWithSpinner = ({
	loading,
	children,
	spinnerSize = 24,
	spinnerColor = null,
	ariaLabel = "Loading...",
	...rest
}) => {
	const classes = useStyles({ spinnerColor });

	return (
		<Button
			className={classes.button}
			disabled={loading}
			aria-busy={loading}
			aria-label={loading ? ariaLabel : undefined}
			{...rest}
		>
			{children}
			{loading && (
				<CircularProgress
					size={spinnerSize}
					className={classes.buttonProgress}
				/>
			)}
		</Button>
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
