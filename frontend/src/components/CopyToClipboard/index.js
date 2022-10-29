import React, { useState } from "react";
import { 
  IconButton, 
  Tooltip 
} from "@material-ui/core";
import { FileCopyOutlined } from "@material-ui/icons";
import { i18n } from "../../translate/i18n";

const CopyToClipboard = ({ content, color }) => {
  const [tooltipMessage, setTooltipMessage] = useState(
    i18n.t("copyToClipboard.copy")
  );

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setTooltipMessage(i18n.t("copyToClipboard.copied"));
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
      <IconButton size="small" onClick={handleCopyToClipboard}>
        <FileCopyOutlined fontSize="small" color={color} />
      </IconButton>
    </Tooltip>
  );
};

export default CopyToClipboard;