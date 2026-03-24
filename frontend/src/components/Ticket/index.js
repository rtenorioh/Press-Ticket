import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EditMessageProvider } from "../../context/EditingMessage/EditingMessageContext";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import ContactDrawer from "../ContactDrawer";
import MessageInput from "../MessageInput/";
import MessagesList from "../MessagesList";
import TicketActionButtons from "../TicketActionButtons";
import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";
import { useTranslation } from "react-i18next";

const drawerWidth = 320;

const Root = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  display: "flex",
  height: "100%",
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius,
}));

const TicketInfoContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  maxWidth: "50%",
  flexBasis: "50%",
  display: "flex",
  alignItems: "center",
  [theme.breakpoints.down('sm')]: {
    maxWidth: "100%",
    flexBasis: "100%",
    order: 1,
  },
}));

const TicketActionButtonsContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  maxWidth: "50%",
  flexBasis: "50%",
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  [theme.breakpoints.down('sm')]: {
    maxWidth: "100%",
    flexBasis: "100%",
    marginBottom: "5px",
    order: 2,
    justifyContent: "center",
  },
}));

const HeaderWrapper = styled('div')(({ theme }) => ({
  display: "flex",
  flexWrap: "nowrap",
  width: "100%",
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down('sm')]: {
    flexDirection: "column",
  },
}));

const MainWrapper = styled(Paper)(({ theme, open }) => ({
  flex: 1,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  borderLeft: "0",
  marginRight: open ? 0 : -drawerWidth,
  transition: theme.transitions.create("margin", {
    easing: open 
      ? theme.transitions.easing.easeOut
      : theme.transitions.easing.sharp,
    duration: open 
      ? theme.transitions.duration.enteringScreen
      : theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  }),
}));

const Ticket = () => {
  const { t } = useTranslation();
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({});
  const [ticket, setTicket] = useState({});
  const [messageContact, setMessageContact] = useState(null);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTicket = async () => {
        try {
          const { data } = await api.get("/tickets/" + ticketId);
          setContact(data.contact);
          setTicket(data);
          setLoading(false);
          
          if (data.status === "open") {
            try {
              await api.post(`/messages/${ticketId}/read`);
            } catch (readError) {
              console.error("Erro ao marcar mensagens como lidas:", readError);
            }
          }
        } catch (err) {
          setLoading(false);
          toastError(err, t);
        }
      };
      fetchTicket();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [ticketId, navigate, t]);


  useEffect(() => {
    const socket = openSocket();

    socket.on("connect", () => {
      socket.emit("joinChatBox", ticketId);
    });

    socket.on("ticket", (data) => {
      const timestamp = new Date().toISOString();
      
      if (data.action === "update") {
        try {
          if (data.ticket && data.ticket.id === parseInt(ticketId)) {
            setTicket(prevTicket => ({
              ...prevTicket,
              ...data.ticket
            }));
          }
        } catch (error) {
          console.error(`[FRONT_TICKET_ERRO][${timestamp}] Erro ao atualizar estado do ticket:`, error);
        }
      }

      if (data.action === "delete") {
        navigate("/tickets");
      }
    });

    socket.on("contact", (data) => {
      const timestamp = new Date().toISOString();
      
      if (data.action === "update") {
        try {
          setContact((prevState) => {
            if (prevState.id === data.contact?.id) {
              return { ...prevState, ...data.contact };
            }
            return prevState;
          });
        } catch (error) {
          console.error(`[FRONT_CONTACT_ERRO][${timestamp}] Erro ao atualizar estado do contato:`, error);
        }
      }
    });

    socket.on("group", (data) => {
      if (data.action === "update") {
        const reloadContact = async () => {
          try {
            const { data: ticketData } = await api.get("/tickets/" + ticketId);
            setContact(ticketData.contact);
          } catch (err) {
            console.error("Erro ao recarregar contato após atualização do grupo:", err);
          }
        };
        reloadContact();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, navigate]);

  const handleDrawerOpen = (messageContactData) => {
    if (ticket.isGroup && messageContactData) {
      setMessageContact(messageContactData);
    } else {
      setMessageContact(null);
    }
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setMessageContact(null);
  };

  const handleTicketAccepted = async () => {
    try {
      const { data } = await api.get("/tickets/" + ticketId);
      setContact(data.contact);
      setTicket(data);
      
      if (data.status === "open") {
        try {
          await api.post(`/messages/${ticketId}/read`);
        } catch (readError) {
          console.error("Erro ao marcar mensagens como lidas:", readError);
        }
      }
    } catch (err) {
      toastError(err, t);
    }
  };

  return (
    <Root id="drawer-container">
      <MainWrapper
        variant="outlined"
        elevation={0}
        open={drawerOpen}
      >
        <TicketHeader loading={loading}>
          <HeaderWrapper>
            <TicketInfoContainer>
              <TicketInfo
                contact={contact}
                ticket={ticket}
                onClick={handleDrawerOpen}
              />
            </TicketInfoContainer>
            <TicketActionButtonsContainer>
              <TicketActionButtons 
                ticket={ticket} 
                onTicketAccepted={handleTicketAccepted}
              />
            </TicketActionButtonsContainer>
          </HeaderWrapper>
        </TicketHeader>
        <ReplyMessageProvider>
          <EditMessageProvider>
            <MessagesList
              ticketId={ticketId}
              isGroup={ticket.isGroup}
              onClick={handleDrawerOpen}
            ></MessagesList>
            <MessageInput ticketStatus={ticket.status} />
          </EditMessageProvider>
        </ReplyMessageProvider>
      </MainWrapper>
      <ContactDrawer
        open={drawerOpen}
        handleDrawerClose={handleDrawerClose}
        contact={contact}
        loading={loading}
        isGroup={ticket.isGroup}
        messageContact={messageContact}
        whatsappId={ticket.whatsappId}
      />
    </Root>
  );
};

export default Ticket;
