import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import React from "react";

const Tag = styled('div', {
  shouldForwardProp: (prop) => prop !== 'backgroundColor'
})(({ backgroundColor, theme }) => ({
  padding: "1px 5px",
  borderRadius: "3px",
  fontSize: "0.8em",
  fontWeight: "bold",
  color: "#FFF",
  marginRight: "5px",
  marginBottom: "3px",
  whiteSpace: "nowrap",
  backgroundColor: backgroundColor || "#000",
}));

const ContactTag = ({ tag }) => {
  return (
    <Tag
      backgroundColor={tag.color}
      aria-label={`Tag: ${tag.name}`}
    >
      {tag.name?.toUpperCase() || "UNKNOWN"}
    </Tag>
  );
};

ContactTag.propTypes = {
  tag: PropTypes.shape({
    name: PropTypes.string.isRequired,
    color: PropTypes.string,
  }).isRequired,
};

export default ContactTag;
