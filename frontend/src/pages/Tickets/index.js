import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { styled, useTheme } from "@mui/material/styles";
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
  height: `calc(100% - 48px)`,
  overflowY: "hidden",
  margin: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const ChatPapper = styled('div')(({ theme }) => ({
  display: "flex",
  height: "100%",
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
}));

const WelcomeMsg = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  textAlign: "center",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  boxShadow: "none",
  gap: theme.spacing(3),
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

  const theme = useTheme();

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
              borderRight: `1px solid ${theme.palette.divider}`,
              ...(ticketId && { display: { xs: "none", sm: "flex" } })
            }}
          >
            <TicketsManager />
          </Grid>
          <Grid 
            item 
            xs={12} 
            md={8} 
            sx={{ 
              display: "flex", 
              height: "100%", 
              flexDirection: "column",
              backgroundColor: theme.palette.background.paper,
            }}>
            {ticketId ? (
              <>
                <Ticket />
              </>
            ) : (
              <WelcomeMsg sx={{ display: { xs: 'none', sm: 'none', md: 'flex' } }}>
                {logo && (
                  <img 
                    src={getImageUrl(logo)} 
                    style={{ 
                      maxWidth: "60%", 
                      maxHeight: "180px", 
                      objectFit: "contain",
                      marginBottom: "16px",
                      filter: theme => theme.palette.mode === 'dark' ? 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' : 'drop-shadow(0 0 8px rgba(0,0,0,0.1))'
                    }} 
                    alt="logo" 
                  />
                )}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 500, 
                    color: theme => theme.palette.text.secondary,
                    maxWidth: "80%",
                    lineHeight: 1.5
                  }}
                >
                  {t("chat.noTicketMessage")}
                </Typography>
              </WelcomeMsg>
            )}
          </Grid>
        </Grid>
      </ChatPapper>
    </ChatContainer>
  );
};

export default Chat;
