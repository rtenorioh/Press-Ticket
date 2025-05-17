import React from "react";

import { Card, styled, IconButton, useMediaQuery, useTheme, Tooltip } from "@mui/material";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";

const TicketHeaderCard = styled(Card)(({ theme }) => ({
  display: "flex",
  backgroundColor: theme.palette.background.paper,
  flex: "none",
  borderBottom: "none",
  boxShadow: theme.shadows[2],
  borderRadius: "12px 12px 0 0",
  padding: theme.spacing(1),
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: theme.palette.primary.main,
    transition: "background-color 0.3s ease",
  },
  "&:hover::before": {
    background: theme.palette.primary.dark,
  },
  [theme.breakpoints.down("sm")]: {
    flexWrap: "wrap",
    padding: theme.spacing(0.5, 0.5, 1, 0.5),
  },
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(0.5),
  padding: theme.spacing(1),
  borderRadius: "50%",
  backgroundColor: "transparent",
  color: theme.palette.primary.main,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "scale(1.05)",
    color: theme.palette.primary.dark,
  },
  "&:active": {
    transform: "scale(0.95)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),
  },
}));

const TicketHeader = ({ loading, children }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const handleBack = () => {
    navigate("/tickets");
  };

  return (
    <>
      {loading ? (
        <TicketHeaderSkeleton />
      ) : (
        <TicketHeaderCard square elevation={0}>
          <Tooltip title="Voltar para a lista de tickets" arrow placement="right">
            <BackButton color="primary" onClick={handleBack} size={isMobile ? "small" : "medium"}>
              <ArrowBackIosIcon fontSize={isMobile ? "small" : "medium"} />
            </BackButton>
          </Tooltip>
          {children}
        </TicketHeaderCard>
      )}
    </>
  );
};

export default TicketHeader;
