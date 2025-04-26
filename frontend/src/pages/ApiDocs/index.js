import { styled } from "@mui/material/styles";
import React from "react";

const Root = styled('div')(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	padding: theme.spacing(1)
}));

const ApiDocs = () => {
	const back = process.env.REACT_APP_BACKEND_URL;
	const endapi = "/api-docs";
	const urlapi = back.concat(endapi);

	return (
		<Root>
			<iframe title="Doc da API" src={urlapi} height='500' width='100%' frameBorder="0" />
		</Root>
	);
};

export default ApiDocs;
