import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles((theme) => ({
	headerContainer: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(0, 1, 1, 1),
	},
}));

const MainHeader = ({ children }) => {
	const classes = useStyles();

	return <div className={classes.headerContainer}>{children}</div>;
};

export default MainHeader;
