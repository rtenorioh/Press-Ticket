import { Button, Divider, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
	container: {
		minWidth: "250px",
		display: "flex",
		flexDirection: "column",
	},
	imageContainer: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: theme.spacing(2),
	},
	image: {
		width: "100px",
		cursor: "pointer",
		borderRadius: theme.shape.borderRadius,
		boxShadow: theme.shadows[1],
	},
	description: {
		margin: theme.spacing(1, 2),
		color: theme.palette.text.primary,
		wordBreak: "break-word",
	},
	button: {
		marginTop: theme.spacing(1),
	},
}));

const LocationPreview = ({ image, link, description }) => {
	const classes = useStyles();

	const handleLocation = async () => {
		try {
			if (link) {
				window.open(link, "_blank", "noopener, noreferrer");
			}
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<div className={classes.container}>
			<div className={classes.imageContainer}>
				<img
					src={image || "/placeholder-image.png"}
					alt={description || "Localização"}
					className={classes.image}
					onClick={handleLocation}
				/>
			</div>
			{description && (
				<Typography variant="subtitle1" className={classes.description}>
					{description.split("\\n").map((line, index) => (
						<span key={index}>
							{line}
							<br />
						</span>
					))}
				</Typography>
			)}
			<Divider />
			<Button
				fullWidth
				color="primary"
				variant="contained"
				onClick={handleLocation}
				disabled={!link}
				className={classes.button}
			>
				Visualizar
			</Button>
		</div>
	);
};

LocationPreview.propTypes = {
	image: PropTypes.string,
	link: PropTypes.string,
	description: PropTypes.string,
};

LocationPreview.defaultProps = {
	image: null,
	link: null,
	description: "",
};

export default LocationPreview;
