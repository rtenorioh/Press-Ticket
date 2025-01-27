import React	 from "react";
import { makeStyles } from "@material-ui/core/styles";

import ModalImage from "react-modal-image";

const useStyles = makeStyles(theme => ({
	messageMedia: {
		objectFit: "cover",
		margin: 15,
		width: 160,
		height: 160,
		borderRadius: 10,
	},
}));
 
const ModalImageContatc = ({ imageUrl }) => {
	const classes = useStyles();
	
	return (
		<ModalImage
			className={classes.messageMedia}
			smallSrcSet={imageUrl}
			medium={imageUrl}
			large={imageUrl}
			showRotate="true"
			alt="image"
		/>
	);
};


export default ModalImageContatc;
