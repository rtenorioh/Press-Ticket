import { styled } from "@mui/material/styles";
import React from "react";

const HeaderContainer = styled('div')(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	padding: theme.spacing(0, 1, 1, 1),
}));

const MainHeader = ({ children }) => {
	return <HeaderContainer>{children}</HeaderContainer>;
};

export default MainHeader;
