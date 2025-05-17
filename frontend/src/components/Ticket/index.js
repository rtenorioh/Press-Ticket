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

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTicket = async () => {
        try {
          const { data } = await api.get("/tickets/" + ticketId);
          setContact(data.contact);
          setTicket(data);
          setLoading(false);
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

    socket.on("connect", () => socket.emit("joinChatBox", ticketId));

    socket.on("ticket", (data) => {
      if (data.action === "update") {
        setTicket(data.ticket);
      }

      if (data.action === "delete") {
        toast.success("Ticket deleted sucessfully.");
        navigate("/tickets");
      }
    });

    socket.on("contact", (data) => {
      if (data.action === "update") {
        setContact((prevState) => {
          if (prevState.id === data.contact?.id) {
            return { ...prevState, ...data.contact };
          }
          return prevState;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, navigate]);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
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
      />
    </Root>
  );
};

export default Ticket;
