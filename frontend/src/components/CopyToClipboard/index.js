import { IconButton, Tooltip } from "@material-ui/core";
import { FileCopyOutlined } from "@material-ui/icons";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { i18n } from "../../translate/i18n";

const CopyToClipboard = ({ content, color = "inherit" }) => {
  const [tooltipMessage, setTooltipMessage] = useState(
    i18n.t("copyToClipboard.copy")
  );

  const handleCopyToClipboard = async () => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(content);
        setTooltipMessage(i18n.t("copyToClipboard.copied"));
      } catch (err) {
        setTooltipMessage(i18n.t("copyToClipboard.failed"));
      }
    } else {
      setTooltipMessage(i18n.t("copyToClipboard.notSupported"));
    }
  };

  const handleCloseTooltip = () => {
    setTooltipMessage(i18n.t("copyToClipboard.copy"));
  };

  return (
    <Tooltip
      arrow
      onClose={handleCloseTooltip}
      placement="top"
      title={tooltipMessage}
    >
      <IconButton
        size="small"
        onClick={handleCopyToClipboard}
        aria-label={i18n.t("copyToClipboard.ariaLabel")}
      >
        <FileCopyOutlined fontSize="small" color={color} />
      </IconButton>
    </Tooltip>
  );
};

CopyToClipboard.propTypes = {
  content: PropTypes.string.isRequired,
  color: PropTypes.string,
};

export default CopyToClipboard;
