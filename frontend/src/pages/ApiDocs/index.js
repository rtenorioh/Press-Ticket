import { styled } from "@mui/material/styles";
import React from "react";

const Root = styled('div')(({ theme }) => ({
	display: "flex",
	alignItems: "stretch",
	padding: theme.spacing(1),
	height: 'calc(100vh - 80px)',
	overflow: 'hidden'
}));

const StyledIframe = styled('iframe')({
	border: 'none',
	width: '100%',
	height: '100%',
	minHeight: '600px'
});

const ApiDocs = () => {
	const back = process.env.REACT_APP_BACKEND_URL;
	const endapi = "/api-docs";
	const urlapi = back.concat(endapi);

	return (
		<Root>
			<StyledIframe 
				title="Documentação da API" 
				src={urlapi}
				allow="fullscreen"
			/>
		</Root>
	);
};

export default ApiDocs;
