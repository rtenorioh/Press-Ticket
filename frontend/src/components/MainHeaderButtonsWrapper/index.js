import { styled } from "@mui/material/styles";
import React from "react";

const HeaderButtonsWrapperDiv = styled('div')(({ theme }) => ({
	display: "flex",
	marginLeft: "auto",
	alignItems: "center",
	justifyContent: "center",
	gap: theme.spacing(2),
	"& > *": {
		margin: 0,
	},
	[theme.breakpoints.down('sm')]: {
		gap: theme.spacing(1),
	}
}));

const HeaderButtonsWrapper = ({ children }) => {
	return <HeaderButtonsWrapperDiv>{children}</HeaderButtonsWrapperDiv>;
};

export default HeaderButtonsWrapper;
