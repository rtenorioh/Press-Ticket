import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
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
          
          // Marcar mensagens como lidas ao abrir o ticket
          const timestamp = new Date().toISOString();
          console.log(`[FRONT_MARK_READ][${timestamp}] Marcando mensagens do ticket ${ticketId} como lidas`);
          
          try {
            await api.post(`/messages/${ticketId}/read`);
            console.log(`[FRONT_MARK_READ_SUCCESS][${timestamp}] Mensagens do ticket ${ticketId} marcadas como lidas com sucesso`);
          } catch (readError) {
            console.error(`[FRONT_MARK_READ_ERROR][${timestamp}] Erro ao marcar mensagens como lidas:`, readError);
          }
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchTicket();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [ticketId, navigate]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("connect", () => {
      const timestamp = new Date().toISOString();
      console.log(`[FRONT_TICKET_CONNECT][${timestamp}] Socket conectado, entrando no chatbox do ticket: ${ticketId}`);
      socket.emit("joinChatBox", ticketId);
    });

    socket.on("ticket", (data) => {
      const timestamp = new Date().toISOString();
      console.log(`[FRONT_TICKET_EVENTO][${timestamp}] Evento de ticket recebido: Ação=${data.action}, TicketId=${data.ticket?.id || data.ticketId}`);
      
      if (data.ticket) {
        console.log(`[FRONT_TICKET_DETALHES][${timestamp}] Detalhes do ticket:`, {
          id: data.ticket.id,
          status: data.ticket.status,
          queueId: data.ticket.queueId,
          userId: data.ticket.userId,
          unreadMessages: data.ticket.unreadMessages,
          lastMessage: data.ticket.lastMessage?.substring(0, 30)
        });
      }
      
      if (data.action === "update") {
        console.log(`[FRONT_TICKET_UPDATE][${timestamp}] Atualizando dados do ticket ${data.ticket.id} no componente Ticket`);
        try {
          setTicket(data.ticket);
          console.log(`[FRONT_TICKET_STATE][${timestamp}] Estado do ticket atualizado com sucesso`);
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
      console.log(`[FRONT_CONTACT_EVENTO][${timestamp}] Evento de contato recebido: Ação=${data.action}, ContactId=${data.contact?.id}`);
      
      if (data.action === "update") {
        console.log(`[FRONT_CONTACT_UPDATE][${timestamp}] Atualizando dados do contato ${data.contact?.id} no componente Ticket`);
        try {
          setContact((prevState) => {
            if (prevState.id === data.contact?.id) {
              console.log(`[FRONT_CONTACT_STATE][${timestamp}] Estado do contato atualizado com sucesso`);
              return { ...prevState, ...data.contact };
            }
            return prevState;
          });
        } catch (error) {
          console.error(`[FRONT_CONTACT_ERRO][${timestamp}] Erro ao atualizar estado do contato:`, error);
        }
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
              <TicketActionButtons ticket={ticket} />
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
      />
    </Root>
  );
};

export default Ticket;
