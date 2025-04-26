import React from "react";

import { Card, Button, styled } from "@mui/material";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";

const TicketHeaderCard = styled(Card)(({ theme }) => ({
  display: "flex",
  backgroundColor: theme.palette.background.default,
  flex: "none",
  borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
  [theme.breakpoints.down("sm")]: {
    flexWrap: "wrap",
  },
}));

const TicketHeader = ({ loading, children }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/tickets");
  };

  return (
    <>
      {loading ? (
        <TicketHeaderSkeleton />
      ) : (
        <TicketHeaderCard square>
          <Button color="primary" onClick={handleBack}>
            <ArrowBackIosIcon />
          </Button>
          {children}
        </TicketHeaderCard>
      )}
    </>
  );
};

export default TicketHeader;
