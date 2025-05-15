import React from "react";

import { Card, styled, IconButton, useMediaQuery, useTheme, Box } from "@mui/material";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";

const TicketHeaderCard = styled(Card)(({ theme }) => ({
  display: "flex",
  backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : "#ffffff",
  flex: "none",
  borderBottom: "none",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.08)",
  borderRadius: "12px 12px 0 0",
  padding: theme.spacing(1),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  },
  [theme.breakpoints.down("sm")]: {
    flexWrap: "wrap",
    padding: theme.spacing(0.5, 0.5, 1, 0.5),
  },
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(0.5),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.primary.main,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.grey[200],
    transform: "scale(1.05)",
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
          <BackButton color="primary" onClick={handleBack} size={isMobile ? "small" : "medium"}>
            <ArrowBackIosIcon fontSize={isMobile ? "small" : "medium"} />
          </BackButton>
          {children}
        </TicketHeaderCard>
      )}
    </>
  );
};

export default TicketHeader;
