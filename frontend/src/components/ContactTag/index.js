import React from "react";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(theme => ({
  tag: {
    padding: "1px 5px",
    borderRadius: "3px",
    fontSize: "0.8em",
    fontWeight: "bold",
    color: "#FFF",
    marginRight: "5px",
    marginBottom: "3px",
    whiteSpace: "nowrap",
  }
}));

const ContactTag = ({ tag }) => {
  const classes = useStyles();

  return (
    <div className={classes.tag} style={{ backgroundColor: tag.color }}>
      {tag.name.toUpperCase()}
    </div>
  )
}

export default ContactTag;