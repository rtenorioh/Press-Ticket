import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Ticket from "../../components/Ticket/";
import TicketsManager from "../../components/TicketsManager/";

import Hidden from "@material-ui/core/Hidden";
import { i18n } from "../../translate/i18n";

import defaultLogoTicket from '../../assets/logoTicket.jpg';
import toastError from "../../errors/toastError";
import api from "../../services/api";

const PUBLIC_ASSET_PATH = '/assets/';

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
  const [logo, setLogo] = useState(defaultLogoTicket);
  const themeStorage = localStorage.getItem("theme");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await api.get("/personalizations");
        if (data && data.length > 0) {
          const lightConfig = data.find(themeConfig => themeConfig.theme === "light");
          const darkConfig = data.find(themeConfig => themeConfig.theme === "dark");

          if (themeStorage === "light" && lightConfig?.logoTicket) {
            setLogo(PUBLIC_ASSET_PATH + lightConfig.logoTicket);
          } else if (themeStorage === "dark" && darkConfig?.logoTicket) {
            setLogo(PUBLIC_ASSET_PATH + darkConfig.logoTicket);
          } else {
            setLogo(defaultLogoTicket);
          }
        }
      } catch (err) {
        toastError(err);
      }
    };

    fetchLogo();
  }, [themeStorage]);

  return (
    <div className={classes.chatContainer}>
      <div className={classes.chatPapper}>
        <Grid container spacing={0}>
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
            {ticketId ? (
              <>
                <Ticket />
              </>
            ) : (
              <Hidden only={["sm", "xs"]}>
                <Paper className={classes.welcomeMsg}>
                  <span>
                    <center>
                      <img src={logo} width="50%" alt="" />
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