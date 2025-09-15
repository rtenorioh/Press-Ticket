import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Slide,
} from "@mui/material";
import {
  Close as CloseIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";

const ForwardingBarContainer = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1300,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1, 2),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: theme.shadows[8],
}));

const ForwardingBar = ({ 
  isVisible, 
  selectedCount, 
  onClose, 
  onForward 
}) => {
  const { t } = useTranslation();

  return (
    <Slide direction="up" in={isVisible} mountOnEnter unmountOnExit>
      <ForwardingBarContainer elevation={8}>
        <Box display="flex" alignItems="center">
          <IconButton
            color="inherit"
            onClick={onClose}
            size="small"
            sx={{ mr: 1 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="body1" fontWeight="medium">
            {selectedCount} {selectedCount === 1 
              ? t("forwardMessages.selectedCount") 
              : t("forwardMessages.selectedCountPlural")
            }
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          color="secondary"
          startIcon={<SendIcon />}
          onClick={onForward}
          disabled={selectedCount === 0}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "inherit",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            },
            "&:disabled": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "rgba(255, 255, 255, 0.5)",
            }
          }}
        >
          {t("forwardMessages.forwardButton")}
        </Button>
      </ForwardingBarContainer>
    </Slide>
  );
};

export default ForwardingBar;
