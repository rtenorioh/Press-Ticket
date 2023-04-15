import React from "react";

import { Card } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  ticketHeader: {
    display: "flex",
    backgroundColor: theme.palette.background.default,
    flex: "none",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
  },
  bottomButton: {
    position: "relative",
  },
}));

const TicketHeader = ({ loading, children }) => {
  const classes = useStyles();
  const history = useHistory();
  const handleBack = () => {
    history.push("/tickets");
  };

  return (
    <>
      {loading ? (
        <TicketHeaderSkeleton />
      ) : (
        <Card square className={classes.ticketHeader}>
          <ArrowBackIos
            style={{
              backgroundColor: "green",
              padding: 3,
              paddingLeft: "7px",
              alignSelf: "center",
              color: "#FFF",
              borderRadius: "15px",
              left: '8px',
              fontSize: "22px"
            }}
            cursor="pointer"
            className={classes.bottomButton}
            onClick={handleBack}
          />
          {children}
        </Card>
      )}
    </>
  );
};

export default TicketHeader;
