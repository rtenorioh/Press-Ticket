import React from "react";
import { useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import TicketsManager from "../../components/TicketsManager/";
import Ticket from "../../components/Ticket/";

import { i18n } from "../../translate/i18n";
import Hidden from "@material-ui/core/Hidden";

import logo from "../../assets/Logo_circle.png";

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    flex: 1,
    // backgroundColor: "#eee",
    // padding: theme.spacing(4),
    height: `calc(97% - 48px)`,
    overflowY: "hidden",
    margin: theme.spacing(1),
  },

  chatPapper: {
    // backgroundColor: "red",
    display: "flex",
    height: "100%",
  },

  contactsWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflowY: "hidden",
  },
  contactsWrapperSmall: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflowY: "hidden",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  messagessWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
  },
  welcomeMsg: {
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: "100%",
    textAlign: "center",
  },
  ticketsManager: {},
  ticketsManagerClosed: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
}));

const Chat = () => {
  const classes = useStyles();
  const { ticketId } = useParams();

  return (
    <div className={classes.chatContainer}>
      <div className={classes.chatPapper}>
        <Grid container spacing={0}>
          {/* <Grid item xs={4} className={classes.contactsWrapper}> */}
          <Grid
            item
            xs={12}
            md={4}
            className={
              ticketId ? classes.contactsWrapperSmall : classes.contactsWrapper
            }
          >
            <TicketsManager />
          </Grid>
          <Grid item xs={12} md={8} className={classes.messagessWrapper}>
            {/* <Grid item xs={8} className={classes.messagessWrapper}> */}
            {ticketId ? (
              <>
                <Ticket />
              </>
            ) : (
              <Hidden only={["sm", "xs"]}>
                <Paper className={classes.welcomeMsg}>
                  {/* <Paper square variant="outlined" className={classes.welcomeMsg}> */}
                  <span>
                    <center>
                      <img src={logo} width="50%" alt=""/>
                    </center>
                    {i18n.t("chat.noTicketMessage")}
                    </span>
                </Paper>
              </Hidden>
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Chat;