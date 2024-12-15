import { makeStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";

const useStyles = makeStyles((theme) => ({
  tag: {
    padding: "1px 5px",
    borderRadius: "3px",
    fontSize: "0.8em",
    fontWeight: "bold",
    color: "#FFF",
    marginRight: "5px",
    marginBottom: "3px",
    whiteSpace: "nowrap",
    backgroundColor: (props) => props.backgroundColor || "#000",
  },
}));

const ContactTag = ({ tag }) => {
  const classes = useStyles({ backgroundColor: tag.color });

  return (
    <div
      className={classes.tag}
      aria-label={`Tag: ${tag.name}`}
    >
      {tag.name?.toUpperCase() || "UNKNOWN"}
    </div>
  );
};

ContactTag.propTypes = {
  tag: PropTypes.shape({
    name: PropTypes.string.isRequired,
    color: PropTypes.string,
  }).isRequired,
};

export default ContactTag;
