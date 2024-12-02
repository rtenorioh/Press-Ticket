import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles((theme) => ({
	headerButtonsWrapper: {
		display: "flex",
		marginLeft: "auto",
		"& > *": {
			margin: theme.spacing(1),
		},
	},
}));

const HeaderButtonsWrapper = ({ children }) => {
	const classes = useStyles();

	return <div className={classes.headerButtonsWrapper}>{children}</div>;
};

export default HeaderButtonsWrapper;
