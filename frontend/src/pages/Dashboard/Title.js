import React from "react";
import Typography from "@material-ui/core/Typography";

const Title = props => {
	return (
		<Typography variant="h3" style={{fontWeight:"500", fontSize:"18px"}} color="primary" gutterBottom>
			{props.children}
		</Typography>
	);
};

export default Title;
