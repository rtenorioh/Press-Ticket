import { IconButton, Tooltip } from "@material-ui/core";
import { FileCopyOutlined } from "@material-ui/icons";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const CopyToClipboard = ({ content, color = "inherit" }) => {
  const { t } = useTranslation();
  const [tooltipMessage, setTooltipMessage] = useState(
    t("copyToClipboard.copy")
  );

  const handleCopyToClipboard = async () => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(content);
        setTooltipMessage(t("copyToClipboard.copied"));
      } catch (err) {
        setTooltipMessage(t("copyToClipboard.failed"));
      }
    } else {
      setTooltipMessage(t("copyToClipboard.notSupported"));
    }
  };

  const handleCloseTooltip = () => {
    setTooltipMessage(t("copyToClipboard.copy"));
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
        aria-label={t("copyToClipboard.ariaLabel")}
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
