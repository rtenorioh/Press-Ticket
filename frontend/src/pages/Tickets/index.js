import Grid from "@mui/material/Grid";

import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getImageUrl } from '../../helpers/imageHelper';
import Ticket from "../../components/Ticket/";
import TicketsManager from "../../components/TicketsManager/";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const ChatContainer = styled('div')(({ theme }) => ({
  flex: 1,
  height: `calc(97% - 48px)`,
  overflowY: "hidden",
  margin: theme.spacing(1),
}));

const ChatPapper = styled('div')(({ theme }) => ({
  display: "flex",
  height: "100%",
}));

const WelcomeMsg = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  justifyContent: "space-evenly",
  alignItems: "center",
  height: "100%",
  textAlign: "center",
}));

const Chat = () => {
  const { t } = useTranslation();
  const { ticketId } = useParams();
  const [logo, setLogo] = useState(null);
  const themeStorage = localStorage.getItem("theme");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await api.get("/personalizations");
        if (data && data.length > 0) {
          const lightConfig = data.find(themeConfig => themeConfig.theme === "light");
          const darkConfig = data.find(themeConfig => themeConfig.theme === "dark");

          if (themeStorage === "light" && lightConfig?.logoTicket) {
            setLogo(lightConfig.logoTicket);
          } else if (themeStorage === "dark" && darkConfig?.logoTicket) {
            setLogo(darkConfig.logoTicket);
          } else {
            setLogo(null);
          }
        }
      } catch (err) {
        toastError(err);
      }
    };

    fetchLogo();
  }, [themeStorage]);

  return (
    <ChatContainer>
      <ChatPapper>
        <Grid container spacing={0}>
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              display: "flex",
              height: "100%",
              flexDirection: "column",
              overflowY: "hidden",
              ...(ticketId && { display: { xs: "none", sm: "flex" } })
            }}
          >
            <TicketsManager />
          </Grid>
          <Grid item xs={12} md={8} sx={{ display: "flex", height: "100%", flexDirection: "column" }}>
            {ticketId ? (
              <>
                <Ticket />
              </>
            ) : (
              <WelcomeMsg sx={{ display: { xs: 'none', sm: 'none', md: 'flex' } }}>
                <span>
                  <center>
                    <img src={getImageUrl(logo)} width="50%" alt="logo" />
                  </center>
                  {t("chat.noTicketMessage")}
                </span>
              </WelcomeMsg>
            )}
          </Grid>
        </Grid>
      </ChatPapper>
    </ChatContainer>
  );
};

export default Chat;
