import React from "react";

import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";

const BackdropStyled = styled('div')(({ theme, open }) => ({
	zIndex: theme.zIndex.drawer + 1,
	color: "#fff",
	display: open ? "flex" : "none",
	position: "fixed",
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	alignItems: "center",
	justifyContent: "center",
	backgroundColor: "rgba(0, 0, 0, 0.5)"
}));

const BackdropLoading = ({ open = true, color = "inherit", ariaLabel = "Loading..." }) => {
	return (
		<BackdropStyled open={open} aria-label={ariaLabel}>
			<CircularProgress color={color} />
		</BackdropStyled>
	);
};

export default BackdropLoading;
